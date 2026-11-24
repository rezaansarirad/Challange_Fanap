# Architecture

- `backend/app`: FastAPI upload/draft API plus a Python CLI pipeline.
- Pipeline: CSV validation → order extraction → resend deduplication → category classification → Tehran/Jalali SLA calculation → report.
- `frontend`: Vite + React client, proxied to FastAPI by Nginx in Docker. Browser-only minute ticker updates SLA presentation without API/LLM calls.
- The upload surface is a focused responsive form: native file selection and drag/drop feed one controlled input, while a custom Jalali calendar converts the selected Tehran wall time to the UTC API contract.
- The report’s minimal CLI shape is preserved; API-only detail fields support the dashboard.
