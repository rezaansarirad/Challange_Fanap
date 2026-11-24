"""Client for an OpenAI-compatible chat-completions endpoint."""
from __future__ import annotations

import json
from dataclasses import dataclass

import httpx

from .config import CATEGORIES, Settings

SYSTEM_PROMPT = (
    "You classify customer support messages for Bazarcheh, an Iranian online shop. "
    "Messages may be in Persian, English or Finglish. "
    f"Allowed categories: {', '.join(CATEGORIES)}. "
    "Allowed severities: low, medium, high. "
    'Reply with JSON only, for example: {"category": "delivery", "severity": "medium"}'
)


@dataclass(frozen=True)
class MessageToClassify:
    message_id: str
    subject: str
    body: str


@dataclass(frozen=True)
class Classification:
    category: str
    severity: str | None


class LLMClient:
    def __init__(self, settings: Settings) -> None:
        if not settings.llm_base_url:
            raise ValueError("LLM_BASE_URL is not configured")
        self._url = settings.llm_base_url.rstrip("/") + "/chat/completions"
        self._model = settings.llm_model
        self._headers = {"Content-Type": "application/json"}
        if settings.llm_api_key:
            self._headers["Authorization"] = f"Bearer {settings.llm_api_key}"
        self._timeout = settings.llm_timeout_seconds

    def _complete(self, client: httpx.Client, message: MessageToClassify) -> str:
        payload = {
            "model": self._model,
            "temperature": 0,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"message_id: {message.message_id}\n"
                        f"subject: {message.subject}\n"
                        f"body: {message.body}"
                    ),
                },
            ],
        }
        response = client.post(self._url, json=payload, headers=self._headers)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    def complete_text(self, system_prompt: str, prompt: str) -> str:
        payload = {
            "model": self._model,
            "temperature": 0.3,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        }
        with httpx.Client(timeout=self._timeout) as client:
            response = client.post(self._url, json=payload, headers=self._headers)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

    def classify(self, messages: list[MessageToClassify]) -> dict[str, Classification]:
        """Classify each message with one request per message.

        Returns a mapping message_id -> Classification for the messages that
        produced a usable answer.
        """
        results: dict[str, Classification] = {}
        with httpx.Client(timeout=self._timeout) as client:
            for message in messages:
                text = self._complete(client, message)
                try:
                    data = json.loads(text)
                except json.JSONDecodeError:
                    continue
                category = str(data.get("category", "")).strip().lower()
                if category not in CATEGORIES:
                    category = "other"
                severity = data.get("severity")
                results[message.message_id] = Classification(
                    category=category,
                    severity=str(severity).lower() if severity else None,
                )
        return results
