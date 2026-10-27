# Démonstration 4 : orchestrateur

Slide « Démonstration : livrer une spécification ». L'orchestrateur répartit exploration, tests, implémentation et vérification de la spécification 002. Branche `main` (spécification 002 écrite dans `specs/002-responsable-priorite-haute/`, code absent, 37 tests verts).

## Préalables

Claude Code 2.1.310 ou Open Code v2.0.32 ; `gh`, `docker`, `uv`. Démonstration la plus longue et la plus coûteuse du module : la lancer une fois, sans doublon.

## Préparation

```
demos/04-orchestrateur/session.sh <session>
```

Copie de session sur `main`. Overlay : `opencode.json` avec `default_agent: "orchestrateur"` (sans serveur MCP, donc sans jeton), pour que la TUI d'Open Code démarre sur l'orchestrateur. Les cinq agents (`orchestrateur`, `explorateur`, `testeur`, `implementeur`, `verificateur`) viennent du dépôt. `opencode debug agents` liste l'orchestrateur en mode `primary`.

## Déroulé

1. Ouvrir les instructions fixes : `.claude/agents/orchestrateur.md` ou `.opencode/agents/orchestrateur.md` (cinq étapes).
2. Lancer l'orchestrateur comme agent principal.
   - Claude Code : `claude --agent orchestrateur --model claude-sonnet-5-5`
   - Open Code : `opencode` en TUI (agent par défaut de l'overlay). `opencode run --agent orchestrateur` rend la main après 16 s, quand les trois explorations partent en `background: true`, alors que l'orchestration continue dans le démon (357 s en tout) : ne pas l'utiliser pour la séance.
   - Claude Code : en `claude -p`, le processus est resté bloqué 20 min après le résultat final (observé une fois) ; jouer en interactif. Compter 18 min et 4,49 USD au rejeu, avec un plafond de 5 USD presque atteint ; `maxTurns` du testeur (30) et de l'implémenteur (40) atteints au premier passage.
3. Prompt exact :

   ```
   Livre la spécification 002 en suivant tes étapes.
   ```

4. Observer : explorations lancées dans le même tour (Claude Code : 1 isolée, puis 3 ; Open Code : 3) ; tests rouges du testeur ; implémentation ; vérifications par série de trois ; remarque renvoyée à l'implémentation.
5. `make test`, puis le coût total (`/usage` sous Claude Code, coût affiché sous Open Code) et le nombre de sous-agents lancés.

## Résultat attendu

Au rejeu du 25 octobre 2026 : 71 tests verts sous Claude Code (37 de départ, 34 ajoutés) et 70 sous Open Code (33 ajoutés) ; 13 fichiers modifiés sous Claude Code (10 de code et migration, 3 de tests), 11 sous Open Code. Annoncer « 70 ou 71 tests » et « 11 ou 13 fichiers » : le nombre dépend de l'agent. La branche livrée de référence (61 tests) touche 12 fichiers par rapport à `main` : neuf de code et de documentation (`README.md`, routeur et schémas HTTP, migration Alembic `20260907_0002_ticket_assignee.py`, dépôt et table Postgres, `application/tickets.py`, `domain/errors.py`, `domain/ticket.py`) et trois de tests. Résultat observé : `reference/sortie-reference.md`.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Agent principal | `claude --agent orchestrateur` | `default_agent` de `opencode.json`, ou `--agent` en `run` |
| Sous-agents lançables | `tools: Agent(explorateur, testeur, implementeur, verificateur), Read, Bash` | règle `subagent` de `permissions` |
| Parallélisme | trois explorateurs dans le même message, effectif ; 18 sous-agents au total | trois `subagent` dans le même tour (`background: true`), effectif ; 11 sessions enfant ; plafond de dix actifs probable, non confirmé |
| Imbrication | deux niveaux joués (le sous-agent lance l'explorateur) ; `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` la coupe ; trois niveaux non vérifiés | refusée par défaut (« Subagent depth limit reached (1) ») |
| Périmètre d'écriture | hook `PreToolUse` `guard-path.sh` | règles `permission.edit` du fichier de l'agent |

## Repli

Passer sur la branche livrée dans la copie de travail : `git checkout origin/feat/responsable-priorite-haute-done` (61 tests, `make test`), et dérouler le diff (`git diff main..HEAD --stat`). Sortie de référence : `reference/sortie-reference.md`.

## Remise à zéro

`demos/01-commun/reset.sh <session>` ; si l'orchestrateur a commité (il ne le doit pas), `git reset --hard origin/main`.

## Port 5432 déjà pris et base de test

Si un autre projet `tickets-api` tient le port 5432 (conteneur `tickets-api-db-1`), `make db-up` échoue. Arrêter l'autre conteneur avant la séance. L'orchestrateur ajoute une migration Alembic (`assignee`) : la base de test partagée reste à la révision `0002` après la démonstration et fait échouer les démonstrations suivantes (14 erreurs alembic au rejeu). Utiliser une base dédiée à la démonstration, ou `alembic downgrade` sur `main`, avant la démonstration 5.

## Non observé au rejeu

Déroulé en TUI (Claude Code et Open Code), hook `guard-path.sh` des sous-agents (absent du flux), invites de permission interactives (prévoir `--permission-mode acceptEdits` sous Claude Code si elles ralentissent la salle), imbrication sur trois niveaux.
