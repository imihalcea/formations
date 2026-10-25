# Dépôt de démonstration tickets-api

Référence : `imihalcea/tickets-api` (privé), API FastAPI de tickets, configurée pour Claude Code et Open Code. Chaque session travaille sur une copie créée par `session.sh` ; la référence ne reçoit ni issue ni pull request.

## Session

```
demos/00-tickets-api/session.sh <session> [dossier de travail]
```

Crée `imihalcea/tickets-api-<session>` avec toutes les branches, puis le clone dans `~/travail/tickets-api-<session>`. Idempotent. Variable `REFERENCE` pour changer de dépôt de référence.

Avant de jouer : `make db-up`, `make test` (37 tests verts sur `main`), `uv sync`.

## Configuration des deux outils sur `main`

| Élément | Claude Code | Open Code |
|---|---|---|
| Contexte | `CLAUDE.md` (importe `AGENTS.md`) | `AGENTS.md` |
| Modèle | `.claude/settings.json` : `claude-sonnet-4-6` | `opencode.json` : `amazon-bedrock/eu.anthropic.claude-sonnet-4-6` |
| Sous-agents | `.claude/agents/` | `.opencode/agents/` |
| Commande | `.claude/commands/fix-until-green.md` | `.opencode/commands/fix-until-green.md` |
| MCP | `.mcp.json` (Playwright) | `opencode.json` (GitHub) ; Playwright à ajouter pour la démonstration MCP et IHM |
| Périmètre d'écriture par agent | hook `PreToolUse` `.claude/hooks/guard-path.sh` | règles `permission.edit` du fichier de l'agent |

## Branches

| Branche | Contenu | Démonstration |
|---|---|---|
| `main` | spec 001 livrée, 37 tests verts | point de départ |
| `fix/ticket-ferme-commentaires` | ticket fermé qui accepte des commentaires, deux tests rouges ; `-done` corrigée ; `-sdk` et `-sdk-done` pour la boucle SDK | module 1 |
| `feat/responsable-priorite-haute-done` | spec 002 livrée, 61 tests | module 1 (orchestrateur), base de deux branches `demo/` |
| `feat/front` | front minimal sur `/ui` : un bandeau `position: fixed` recouvre le bouton « Ajouter » à 1280x720, l'API répond 201 et les tests passent | module 1, MCP et IHM |
| `demo/revue-defauts` | quatre défauts plantés : jeton en clair (`notifications.py`), routeur qui écrit en base (`routers/tickets.py`), retrait du responsable accepté sur un ticket `high`, route sans test ; jeton factice dans `tests/conftest.py` pour le faux positif | module 2 |
| `demo/hook-harnais` | copie de la branche de correction, deux tests rouges | module 3, hook du harnais |
| `demo/build-casse` | colonne `assignee` dans `tables.py` sans migration, 19 tests en erreur `UndefinedColumn` | module 3, analyse d'échec |

Les branches `demo/*` sont des squelettes : les règles de revue, les workflows et les hooks s'ajoutent avec les plans des modules 2 et 3.
