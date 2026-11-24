# Current task

## Status

Implementation and evaluation output are complete. Frontend build and unit tests pass; 13 non-API backend tests pass. The local macOS Python 3.9 interpreter cannot collect the FastAPI route because this project targets Python 3.12 (the Docker image), so API tests should be run in Docker/with Python 3.12.

## Next

1. Run `docker compose run --rm backend pytest -q` to verify the complete suite under Python 3.12.
2. Optionally manually inspect the dashboard at `http://localhost:5173` after `docker compose up --build`.
