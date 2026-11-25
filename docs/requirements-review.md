# Requirements review — 2026-11-25

- README reread; `predictions.csv` is a required submission output, not a dashboard input. Confirmed it returns HTTP 400 for missing message columns; UI now explains which input files to use.
- Tested `eval_messages.csv` through the frontend-origin API and the blocked draft contract without an LLM.
- Full backend suite: 15 passed.
- Page root now has `lang=fa` and `dir=rtl`.
- Calendar now uses a modal dialog, explicit confirmation, month grid, RTL navigation and hour/minute steppers. Date conversion uses the runtime Persian calendar.
- Removed the explicit macOS-only Rollup dependency to preserve Linux Docker portability.
- Remaining submission risks: live LLM classification quality has not been measured against a labelled holdout; reply safety uses heuristic checks and needs stronger adversarial coverage; Docker daemon startup has not been verified; AI_LOGS currently contains a summary, not the full exported chat transcript. Do not claim these are verified.
