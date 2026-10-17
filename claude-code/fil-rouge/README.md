# rooms

Meeting room booking API.

```console
$ uv sync
$ uv run python -m rooms.seed      # fills rooms.db with sample data
$ uv run uvicorn rooms.main:app --reload
$ uv run pytest
```

The interactive API documentation is served at http://127.0.0.1:8000/docs. The database is the file `rooms.db`, or the one named by the `ROOMS_DB` environment variable.
