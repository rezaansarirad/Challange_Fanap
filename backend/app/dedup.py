"""Duplicate detection: the same customer resending the same text."""
from __future__ import annotations

import re
import unicodedata

import pandas as pd

_WHITESPACE = re.compile(r"\s+")
PERSIAN_NORMALIZATION = str.maketrans({"ي": "ی", "ك": "ک", "ى": "ی"})


def normalize_body(text: str) -> str:
    """Canonical form of a message body used for duplicate comparison.

    Applies Unicode NFC composition, collapses runs of whitespace (spaces,
    tabs, newlines) to a single space, trims, and lower-cases.
    """
    text = unicodedata.normalize("NFC", text or "").translate(PERSIAN_NORMALIZATION)
    text = _WHITESPACE.sub(" ", text)
    return text.strip().lower()


def dedup_key(customer_id: str, body: str) -> str:
    normalized = normalize_body(body)
    # An empty body is not evidence that two customers sent the same message.
    return f"{(customer_id or '').strip()}|{normalized}" if normalized else ""


def mark_duplicates(df: pd.DataFrame) -> pd.Series:
    """Return a Series (aligned to ``df``) with the canonical message_id for
    duplicates and ``None`` for canonical messages.

    The earliest received message in each group is canonical; ties keep file
    order.
    """
    keys = [dedup_key(c, b) for c, b in zip(df["customer_id"], df["body"])]
    order = df.assign(_key=keys, _pos=range(len(df))).sort_values(
        ["received_at", "_pos"], kind="stable"
    )

    canonical_for_key: dict[str, str] = {}
    duplicate_of: dict[int, str | None] = {}
    for idx, key, message_id in zip(order.index, order["_key"], order["message_id"]):
        if key and key in canonical_for_key:
            duplicate_of[idx] = canonical_for_key[key]
        elif key:
            canonical_for_key[key] = message_id
            duplicate_of[idx] = None
        else:
            duplicate_of[idx] = None

    return pd.Series([duplicate_of[i] for i in df.index], index=df.index, dtype=object)
