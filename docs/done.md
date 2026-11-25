# Completed work

- Added an explicit demo-template button after draft service failure. It opens an editable Persian/English safe template with a visible non-AI label; the real draft API still returns blocked when the LLM is unavailable.

- Successful CSV analysis now scrolls to and focuses the results section, respecting reduced-motion preferences. A visible results heading clarifies where the output starts.

- Verified eval_messages.csv through frontend-origin API (200, 314 rows/293 unique). CSV selection/drop now starts analysis immediately and announces loading state; added a regression test for automatic submission.

- Calendar dialog polish: removed inherited minimum label widths that caused horizontal overflow, constrained the month grid, made hover labels white, and isolated arrow direction from RTL mirroring.

## GitHub README artwork

- Added the user-provided animated sticker at `assets/sticker.gif` and referenced it with a relative path in README.
- Added local-artifact and secret-file ignore rules before GitHub publication.

## Calendar modal and input contract review

- Added a modal Persian calendar with month selection, RTL month navigation, time steppers and explicit confirmation.
- Tested predictions.csv rejection (400) and eval_messages.csv analysis (200) through the frontend origin. Added Persian guidance for incompatible CSV files.
- Frontend build, 6 frontend tests, and all 15 backend tests pass. See requirements-review.md for outstanding submission risks.

## 2026-11-25

- Fixed malformed reference timestamps: the upload form now sends the complete ISO value unchanged.
- Corrected a missing 79-day offset in Jalali-to-Gregorian conversion and added the missing calendar grid/popover styles.
- Frontend production build and five existing tests pass. Local runtime verification is blocked by sandbox EPERM when binding ports 8000/5173.

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
- Upgraded the dashboard intake layout with clear Persian microcopy, hierarchy tags, a workflow panel, and responsive desktop/tablet/mobile layout rules.
- Removed the non-essential workflow panel after review. Restored a functional calendar/time picker, fixed the click/drag file selection event flow, and made the upload area a focused responsive form.
- Replaced the browser-native date input with a custom Jalali date/time picker. If left untouched, it displays and submits the current Tehran date/time.
