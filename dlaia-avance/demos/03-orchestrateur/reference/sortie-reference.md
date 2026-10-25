# Sortie de référence, démonstration 3

Statut : observé au rejeu du 25 octobre 2026 (`claude -p --agent orchestrateur`, `opencode run --agent orchestrateur`, `claude-sonnet-4-6`). Non observé : TUI, hook `guard-path.sh`, imbrication sur trois niveaux.

| Mesure | Agent de code seul | Orchestrateur Claude Code | Orchestrateur Open Code |
|---|---|---|---|
| Sous-agents lancés | 0 | 18 (5 explorateurs, 3 testeurs, 4 implémenteurs, 6 vérificateurs) | 11 sessions enfant (3 explorateurs, 3 testeur/implémenteur, 2 relances, 3 vérificateurs) plus 1 appel sur une session existante |
| Lancement parallèle de l'étape 1 | sans objet | oui, mais 1 explorateur isolé puis 3 dans le même message | oui, 3 dans le même tour (`background: true`) |
| Passages de vérification | sans objet | 2 séries de trois (3 annoncés) | 1 série de trois, aucun finding |
| `make test` final | non relevé | 71 passed ; lint propre | 70 passed ; lint vert |
| Fichiers modifiés | non relevé | 13 (10 de code et migration, 3 de tests) | 11 (migration `20261025_0002_add_assignee_to_tickets.py` comprise) |
| Coût | non relevé | 4,49 USD | 2,40 USD (orchestrateur 0,42 ; enfants 1,98) |
| Durée | non relevé | 18 min | 357 s |

Rapport de l'étape 5 : le compte rendu de l'agent n'est pas fiable pour les chiffres (Open Code annonce 26 tests ajoutés pour 33 réels ; Claude Code annonce 3 passes pour 2 jouées). Relever les chiffres par `make test` et `git diff --stat`.

Particularités : sous Claude Code, `maxTurns` atteint par le testeur (30) et l'implémenteur (40) au premier passage, 17 refus `Bash` du poste (commandes composées, hook `rtk`), un implémenteur a refusé un correctif contraire aux tests, le processus `-p` est resté bloqué après le résultat. Sous Open Code, `run` rend la main après 16 s ; 70 tests dont 33 ajoutés, aucune branche ni commit.
