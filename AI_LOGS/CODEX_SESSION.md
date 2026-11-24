# Codex implementation log

## 2026-11-24

Task: complete the Bazarcheh support-triage take-home challenge.

Key decisions made during the session:

- Treated Tehran business hours and the supplied Jalali 1405 holidays as authoritative SLA inputs.
- Preserved the minimal nightly CLI schema while exposing richer API-only detail for the dashboard.
- Avoided LLM prefetching and blocked unsafe/unavailable draft responses.
- Used deterministic keyword classification when no configured OpenAI-compatible endpoint is available.
- Added a Persian RTL UI with self-hosted Peyda FaNum, accessible drag/drop upload, custom reference-time fields, responsive layout and loading skeletons.

Verification performed:

- `npm run build` passed.
- `npm test` passed (5 tests).
- 13 backend unit tests passed under the available host runtime.
- `predictions.csv` was produced for all 314 evaluation messages using the export timestamp in `data/EXPORT_INFO.txt`.

Known environment limitation: Docker Compose is installed, but its Colima daemon was not running, so a local Docker startup could not be independently verified in this session.
