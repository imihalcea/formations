# CLAUDE.md

API REST de réservation de salles (FastAPI, SQLite de la bibliothèque standard), gérée par uv.

## Commandes

- `uv run pytest -q` : tests, à lancer avant chaque commit
- `uv run ruff check .` et `uv run ruff format .` : lint et formatage
- `uv run python -m rooms.seed` : données de démonstration dans `rooms.db`
- `uv run uvicorn rooms.main:app --reload` : API sur le port 8000

## Workflow

- Écrire le test d'abord, vérifier qu'il échoue, puis implémenter.
- Commits directs sur `main`, un commit par fonctionnalité avec ses tests.

## Décisions

- Montants en centimes entiers : jamais de flottant stocké ni renvoyé.
- Dates en heure locale sans fuseau horaire (`NaiveDatetime`) : une réunion hebdomadaire garde son heure au changement d'heure.
- Une écriture de plusieurs lignes se fait dans une seule transaction, un seul bloc `with connection:`.
- Une règle métier enfreinte lève `BookingError`, renvoyée en 409 `{"error": "..."}`.

## Interdits

- Ne jamais modifier `rooms/seed.py` sans accord : ses montants sont déjà facturés.
- Ne pas corriger l'arrondi de `pricing.py` : décision métier en attente.
