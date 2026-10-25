# Sortie de référence, démonstration 12 (provisoire)

Rejeu du 25 octobre 2026 avec `claude-sonnet-4-6`, sans GitHub : le journal est la sortie locale de `uv run pytest -q` sur `demo/build-casse` (base neuve), rejouée par un faux `gh` avec le préfixe `test  Run make test  `. Le format de colonnes et la longueur du journal de CI chez GitHub sont à relever en séance. Sorties provisoires jusqu'au rejeu à la main.

## Erreur attendue dans le journal

```
E           psycopg.errors.UndefinedColumn: column "assignee" of relation "tickets" does not exist
E           LINE 1: ...ickets (id, title, description, priority, status, assignee, ...
...
19 failed, 42 passed, 2 warnings
```

Local : la sortie complète de `uv run pytest -q` compte 6597 lignes (retraces des 19 échecs), dont 57 occurrences de `UndefinedColumn`.

## Correctif attendu

`reference/20260907_0002_ticket_assignee.py` (`op.add_column("tickets", sa.Column("assignee", sa.String(length=100), nullable=True))`, `down_revision = "0001"`). Avec ce fichier : `61 passed`, `ruff check` et `ruff format --check` verts.

## Relevé

| Point | Claude Code | Open Code |
|---|---|---|
| lignes du journal / passées à l'agent | 6597 / 3000 (216 783 octets) ; chez GitHub : à relever | 6597 / 3000 (210 769 octets) ; chez GitHub : à relever |
| cause nommée, diff plausible | cause juste, migration `20261025_0002_add_assignee_to_tickets.py` (`down_revision = "0001"`, `String(100)`, `nullable=True`, `downgrade` en `drop_column`), applicable | cause juste (`tables.py` ligne 20), diff dans la migration `0001` au lieu d'une `0002` : agent durci |
| tokens, coût | 0,58 USD, 5 tours | non mesuré |
| durée de l'analyse | 15 s | 8 s |
| forme du commentaire | en-tête `Analyse d'échec de l'exécution 4242 (illustration d'automatisation, à relire avant tout correctif)`, puis `**Cause :** tables.py déclare assignee: Mapped[str \| None] (ligne 20), mais la migration 0001 ne crée pas cette colonne …`, puis le diff | en-tête du script, phrase de préambule (désormais interdite), cause avec les deux lignes `UndefinedColumn`, diff |

Le sous-agent devait citer la ligne du journal telle quelle : Claude Code l'a nommée en prose sans la recopier, d'où l'instruction « recopiée telle quelle entre guillemets » ajoutée aux deux agents. Après ces modifications : à rejouer.

## `/fix-until-green` (Claude Code, `claude -p`)

1er essai sans `--allowedTools` : 67 s, 8 refus de permission (`make migrate`, `ls`, `grep`), migration `0002` écrite et non exécutée. 2e essai avec `--allowedTools "Bash(make *)" "Bash(uv run *)"` : 154 s, 0,53 USD, 17 appels d'outils, `Migration créée et appliquée en une relance. make test passe maintenant avec 61 tests verts.` ; `make test` : `61 passed`.
