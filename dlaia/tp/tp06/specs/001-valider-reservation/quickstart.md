# Quickstart: Valider une demande de réservation

## Tests des règles

```sh
uv run pytest -q
```

Un test par scénario de `specs/001-valider-reservation/valider-reservation.feature`, plus le test de fumée.

## Test de fumée par l'API

```sh
uv run uvicorn bookit.infrastructure.api:app
```

Dans un second terminal :

```sh
curl -s -X POST localhost:8000/resources/salle%20A/bookings \
  -H 'Content-Type: application/json' \
  -d "{\"start\": \"$(date -d 'next monday' +%F)T10:00:00\", \"end\": \"$(date -d 'next monday' +%F)T11:00:00\"}"
```

Résultat attendu : 201 pour une demande conforme, 422 avec `{"detail": {"code": "overlap"}}` pour le même envoi répété.
