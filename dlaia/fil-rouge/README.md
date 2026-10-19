# bookit

Réservation de ressources. Architecture hexagonale : `bookit/domain` (modèles, ports, règle `validate_booking`), `bookit/application` (cas d'usage `request_booking`), `bookit/infrastructure` (API FastAPI, dépôt SQLite, horloge système).

```console
$ uv sync
$ uv run pytest -q
$ uv run ruff check
$ uv run ruff format --check
$ uv run uvicorn bookit.infrastructure.api:app --reload
```

La documentation interactive de l'API est servie sur http://127.0.0.1:8000/docs. La base est le fichier `bookit.db`, ou celui désigné par la variable d'environnement `BOOKIT_DB`.

```console
$ curl -X POST http://127.0.0.1:8000/resources/salle-a/bookings \
    -H 'Content-Type: application/json' \
    -d '{"start": "2026-11-02T10:00:00", "end": "2026-11-02T11:00:00"}'
```
