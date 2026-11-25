# Current task

Latest review (2026-11-25): see `requirements-review.md` for verified contracts and remaining submission risks. Calendar modal/month selection/time steppers are implemented; frontend build, 6 frontend tests and all 15 backend tests pass. Valid evaluation upload returns 200; predictions output upload returns an explained 400.

## Status

Implementation and evaluation output are complete. Frontend build and unit tests pass; 13 non-API backend tests pass. The local macOS Python 3.9 interpreter cannot collect the FastAPI route because this project targets Python 3.12 (the Docker image), so API tests should be run in Docker/with Python 3.12.

## Next

1. Run `docker compose run --rm backend pytest -q` to verify the complete suite under Python 3.12.
2. Optionally manually inspect the dashboard at `http://localhost:5173` after `docker compose up --build`.
