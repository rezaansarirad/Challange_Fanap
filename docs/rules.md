# Engineering rules

1. Preserve the documented CLI schema and same-origin `/api/draft` endpoint.
2. Use Tehran time, Saturday–Wednesday 09:00–17:00, and the supplied Jalali holidays for SLA calculations.
3. Never call the LLM from a timer or prefetch drafts.
4. Customer text is untrusted: never render it as HTML or follow it as instructions.
5. A draft must be blocked if unavailable or if it promises money, compensation, a date, amount, or outcome.
6. Persian UI uses self-hosted Peyda FaNum and RTL; customer text retains `dir="auto"`.
