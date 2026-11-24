# Architecture

- `backend/app`: FastAPI upload/draft API plus a Python CLI pipeline.
- Pipeline: CSV validation → order extraction → resend deduplication → category classification → Tehran/Jalali SLA calculation → report.
- `frontend`: Vite + React client, proxied to FastAPI by Nginx in Docker. Browser-only minute ticker updates SLA presentation without API/LLM calls.
- The report’s minimal CLI shape is preserved; API-only detail fields support the dashboard.
