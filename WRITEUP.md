# Bazarcheh take-home write-up

The real problem is operational trust: Sara needs a queue that identifies serious unanswered messages before and after their response promise, plus aggregate metrics that are not inflated by resends. The dashboard is therefore Persian/RTL and treats the business calendar as product logic, not display formatting.

I used the stated calendar: Tehran time, Saturday–Wednesday 09:00–17:00, and the supplied 1405 Jalali holidays. The browser recalculates remaining business minutes every minute so the list stays current without a new upload or LLM cost. A duplicate is the same normalized non-empty message body from the same customer; earliest receipt is canonical. `BZ-` references are found from the field or body and support Persian/Arabic digits.

The starter had several material issues, found by tracing the README rules through the API/UI and exercising the existing tests: Docker set the SLA to 24 rather than 2; SLA math used UTC, Monday–Friday, and no holidays; only already-overdue messages appeared in the attention list; drafts were prefetched despite the quota rule; UI time ignored business hours; and message HTML was injected with `dangerouslySetInnerHTML`. The fixes centralize calendar arithmetic, expose API detail fields without changing the CLI schema, remove prefetching, implement the complete queue, and render text safely.

I cut charts and speculative filtering: they add surface area but do not improve the core escalation decision in a four-hour exercise. The LLM is optional for classification because deterministic rules preserve availability; in production I would evaluate a labelled, multilingual holdout by per-category precision/recall and manually audit low-confidence cases before enabling LLM classification broadly.

For drafts, customer content is explicitly labelled untrusted in the system prompt, generation is click-only, failures return a blocked response, and output is rejected if it mentions money, compensation, amounts, dates, or guarantees. Sara can edit the text; approval only copies it, never sends it.
