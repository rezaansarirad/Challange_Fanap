# Architecture

- `backend/app`: FastAPI upload/draft API plus a Python CLI pipeline.
- Pipeline: CSV validation → order extraction → resend deduplication → category classification → Tehran/Jalali SLA calculation → report.
- `frontend`: Vite + React client, proxied to FastAPI by Nginx in Docker. Browser-only minute ticker updates SLA presentation without API/LLM calls.
- The upload surface uses a responsive two-column intake layout: a primary file/action area and a compact explanatory workflow panel; it collapses to one column on narrow screens.
- The report’s minimal CLI shape is preserved; API-only detail fields support the dashboard.
