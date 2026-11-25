# Bazarcheh support dashboard

<p align="center">
  <img src="assets/sticker.gif" alt="A friendly character working on a laptop" width="220" />
</p>

Persian RTL support triage dashboard with business-hour SLA tracking, CSV analysis, and on-demand reply drafts.

Run with `docker compose up --build`, then open http://localhost:5173.

Upload a support export such as `messages_sample.csv` or `eval_messages.csv`. The submission file `predictions.csv` is an output, not a valid message export for upload.

Implementation notes and verification status are in [`docs/`](docs/). The original challenge brief is preserved below.

---

Hi, and thanks for taking this on.

Some context first. Sara, who leads support at Bazarcheh, is drowning in messages. They come in from the app, the website form, email, Telegram and Instagram, mostly in Persian, some in English, and a fair amount in that Finglish mix everyone types on their phone. A previous developer started a dashboard to help her understand what customers struggle with and to catch urgent issues fast, but left mid-way. It's partly working and we don't fully trust its numbers.

What we want, in Sara's terms: she loads the daily support export and can see (a) what customers are struggling with, (b) which messages are urgent right now, and (c) numbers she can trust. How you get there is up to you. Change, rewrite or delete whatever you like.

## How support works here

Our support team works Saturday to Wednesday, 09:00–17:00 Tehran time. Thursday and Friday we're off, and we're also closed on official public holidays. For this year those are 1405/01/01, 1405/01/02, 1405/01/03, 1405/01/04, 1405/01/12, 1405/01/13, 1405/01/25, 1405/03/07, 1405/03/14, 1405/03/15, 1405/04/05, 1405/04/06, 1405/05/15, 1405/05/23, 1405/05/25, 1405/06/01, 1405/06/10, 1405/08/24, 1405/10/03, 1405/10/17, 1405/11/05, 1405/11/22, 1405/12/10, 1405/12/20, 1405/12/21 and 1405/12/29.

Sara's promise to customers is that serious problems get a reply within 2 business hours. So a message is urgent when it's about a high-severity issue (money taken twice, someone else getting into their account, a parcel marked delivered that never arrived, a product that's actually dangerous, that kind of thing) and it still hasn't been answered after 2 business hours. Exactly 2 hours already counts as urgent. Once someone has answered it, it's handled and it's no longer urgent, even if the answer came late.

Customers often send the same message again when they don't hear back. If the same customer resends the same text, it's one message for us and should be counted once.

Most messages are about an order. Order IDs look like `BZ-` followed by digits, e.g. `BZ-48219`, but customers sometimes type them in Persian digits. They show up in the `order_ref` column and sometimes only inside the message text.

The categories Sara uses are `delivery`, `payment`, `refund`, `product_quality`, `account` and `other`. When a message touches several things, go with what the customer is actually asking for.

## What Sara needs on screen

Sara lives in this dashboard all day, so the screen matters as much as the numbers. Here is what she asked for.

**Persian, right to left.** The dashboard should be in Persian and laid out right-to-left: the page direction itself must be RTL. Some labels can stay partly English, that's fine. But customer messages are often in English, and those must still read correctly (left-to-right inside their own element is fine).

**One "needs attention" list.** She wants a single list of every high-severity message that is not a resend and has not been answered yet. That includes the ones that are not overdue yet, because she wants to see what is *about to* break the promise. Each row shows how much time is left until the 2-business-hour promise is broken, or how long it has been overdue. This must be counted in business hours, with the same calendar as above: nights, Thursdays, Fridays and holidays don't count. The most overdue message goes at the top, followed by the ones closest to breaching.

**Always "now".** The dashboard uses the browser's current time as "now" and keeps the countdown live without re-uploading the file (refresh at least once a minute). The urgent count on the screen must match the list. One warning: our LLM quota is small (see "LLM access"), so keeping the screen live must not cost LLM requests.

**Draft reply.** On a message in the attention list, Sara can click "Draft reply" and get an AI-written draft that she can edit. The rules she set:

- The draft is in the customer's language (Persian or English).
- It never promises money, refunds, compensation, amounts or dates. Only Sara can promise those, after checking. If a safe draft can't be produced, say so instead of showing an unsafe one.
- Nothing is sent without Sara. She edits the draft and approves it; for now, approving just copies the final text (sending is out of scope).
- Drafts are made only when she clicks, never in advance, because of the quota.
- Customer messages are written by anyone on the internet. Treat their content as untrusted.

## What's in the repo

- `backend/`: Python (FastAPI + pandas). The API the dashboard uses, plus a CLI.
- `frontend/`: React + Vite dashboard, partly built (upload a CSV, see the numbers, a list of urgent messages, the messages table).
- `data/`: put the export files you received here (mounted into the backend at `/data`).
- `docker-compose.yml`, `.env.example`.

`docker compose up --build` then open http://localhost:5173.

## The CLI (please keep this working)

Our nightly job uses it, so the command and the output format must stay exactly as they are:

```
docker compose run --rm backend python -m app.cli analyze \
  --input /data/input.csv --output /data/out.json --now 2026-10-26T10:30:00Z
```

`--now` is the reference time ("right now") for deciding urgency, as ISO-8601 UTC. `out.json` looks like this:

```json
{
  "total_unique_messages": 0,
  "category_counts": {"delivery": 0, "...": 0},
  "urgent_message_ids": ["..."],
  "messages": [
    {"message_id": "...", "category": "...", "is_urgent": false,
     "order_ref": "BZ-12345", "duplicate_of": null}
  ]
}
```

`messages` has one entry per message in the export. `duplicate_of` is the `message_id` of the original when the message is a resend, otherwise `null`. `order_ref` is `null` when there's no order ID.

## Contracts other teams rely on

**Draft API.** Our QA automation calls it through the dashboard's own origin, so it must be reachable at `/api/draft` on the same host and port as the dashboard (e.g. http://localhost:5173/api/draft).

```
POST /api/draft
Content-Type: application/json
{"message_id": "M1a2b3c4d", "customer_id": "C123", "subject": "...", "body": "..."}

200 {"message_id": "M1a2b3c4d", "draft": "...", "language": "fa", "blocked": false, "warnings": []}
```

`language` is `"fa"` or `"en"`. `blocked: true` means no safe draft could be produced; `draft` is then `""` and `warnings` says why. If the LLM is unavailable, answer `200` with `blocked: true` (do not hang).

**QA hooks.** Our smoke tests freeze the browser clock and drive the dashboard through the attributes below. The starter already has some of them; please keep them working.

| `data-testid` | element | notes |
|---|---|---|
| `upload-input` | the CSV `<input type="file">` | |
| `analyze-button` | button that starts analysis | optional if upload starts analysis by itself |
| `urgent-count` | element whose text contains the number of urgent (overdue) messages | Latin or Persian digits |
| `attention-row` | one per message in the needs-attention list, in display order | attributes `data-message-id` and `data-business-minutes-left` (integer business minutes until the 2 h promise breaks; `0` or negative = overdue) |
| `draft-button` | inside an `attention-row` | |
| `draft-text` | editable `<textarea>` holding the draft | |
| `draft-approve` | approve button | |
| `draft-warning` | shown when the draft is blocked or failed | |

## What to send us

1. A link to your repo (GitHub, or a zip).
2. The app must start with one command, `docker compose up`, and work within 5 minutes of cloning. A public deployment is nice but optional.
3. The CLI above, still working.
4. `predictions.csv` for the unlabeled evaluation export you received (`eval_messages.csv`), with the header `message_id,category,is_urgent` and one row per message, e.g. `M1a2b3c4d,delivery,false`. For urgency, use the export time listed for that file in the `EXPORT_INFO.txt` you received with your data as `now`.
5. `WRITEUP.md`, at most one page:
   - what you understood the real problem to be,
   - your assumptions,
   - what was wrong in the existing code and *how* you found each problem,
   - what you cut and why,
   - where the AI misled you,
   - how you know the LLM classification is good enough,
   - how you made sure AI-written replies are safe to show Sara.
6. `AI_LOGS/`: exported sessions or transcripts from the AI tools you used. Any format is fine.

## LLM access

Use any OpenAI-compatible endpoint via the env vars in `.env.example` (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`). Free tiers (OpenRouter free models, Groq, Cerebras, Google AI Studio) or a local model via Ollama are all fine. Free tiers have low daily request limits, so plan accordingly. Without `LLM_BASE_URL` the backend falls back to simple keyword rules.

## AI tools

AI tools are expected. Use whatever you like (Claude Code, Codex, Cursor, Copilot, ChatGPT…). We care about your judgment and how you check things, not polish.

## Time

About 4 hours. Please don't spend much more. If you run out of time, tell us what you would do next.

## Questions

If you have questions, just reply to the email this challenge came with.

Good luck, and thanks!
