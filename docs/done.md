# Completed work

## 2026-11-24

- Added persistent project documentation and challenge-specific engineering rules.
- Corrected the Docker SLA setting from 24 to 2 business hours.
- Reworked business calendar handling for Asia/Tehran, Saturday–Wednesday hours, and all supplied 1405 holidays.
- Added full high-severity unanswered attention list, live minute-based ordering/countdown, secure draft controls, Persian RTL UI and self-hosted Peyda FaNum.
- Removed eager draft prefetching and unsafe HTML injection in message rendering.
- Added Persian/Arabic order-digit normalization and safer duplicate behavior for empty bodies.
- Generated `predictions.csv` from `eval_messages.csv` at its supplied export time (314 message rows).
- Verified `npm run build`, `npm test` (5 tests), and 13 non-API Python tests. Full API collection requires the repository's Docker Python 3.12 because the host interpreter is Python 3.9.
- Refined Persian copy, added accessible drag-and-drop CSV selection, replaced the native date-time field with styled UTC fields, and added design-consistent loading skeletons.
