---
description: Add a route to the rooms API, with its test
argument-hint: <METHOD> <path> <what the route returns>
disable-model-invocation: true
---

Add this route to the rooms API: $ARGUMENTS
Existing routes:
!`grep -n "@router" rooms/routes.py`

1. Declare the route in `rooms/routes.py`, logic in `rooms/`, SQL in `rooms/repository.py`.
2. Declare the response schema in `rooms/schemas.py`.
3. Test it in `tests/test_routes.py` with the `client` fixture.
4. Run `uv run pytest -q` and fix the code until every test passes.
