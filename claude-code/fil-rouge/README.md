# salles

API de réservation des salles de réunion.

```console
$ uv sync
$ uv run python -m salles.exemple      # remplit salles.db avec des données d'exemple
$ uv run uvicorn salles.main:app --reload
$ uv run pytest
```

La documentation interactive de l'API est servie sur http://127.0.0.1:8000/docs. La base est le fichier `salles.db`, ou celui que désigne la variable d'environnement `SALLES_DB`.
