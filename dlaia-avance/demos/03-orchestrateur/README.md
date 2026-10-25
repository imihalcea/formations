# Démonstration 3 : orchestrateur

Slide « Démonstration : livrer une spécification ». L'orchestrateur répartit exploration, tests, implémentation et vérification de la spécification 002. Branche `main` (spécification 002 écrite dans `specs/002-responsable-priorite-haute/`, code absent, 37 tests verts).

## Préalables

Claude Code 2.1.310 ou Open Code v2.0.32 ; `gh`, `docker`, `uv`. Démonstration la plus longue et la plus coûteuse du module : la lancer une fois, sans doublon.

## Préparation

```
demos/03-orchestrateur/session.sh <session>
```

Copie de session sur `main`. Overlay : `opencode.json` avec `default_agent: "orchestrateur"` (sans serveur MCP, donc sans jeton), pour que la TUI d'Open Code démarre sur l'orchestrateur. Les cinq agents (`orchestrateur`, `explorateur`, `testeur`, `implementeur`, `verificateur`) viennent du dépôt. `opencode debug agents` liste l'orchestrateur en mode `primary`.

## Déroulé

1. Ouvrir les instructions fixes : `.claude/agents/orchestrateur.md` ou `.opencode/agents/orchestrateur.md` (cinq étapes).
2. Lancer l'orchestrateur comme agent principal.
   - Claude Code : `claude --agent orchestrateur --model claude-sonnet-4-6`
   - Open Code : `opencode` (agent par défaut de l'overlay), ou `opencode run --agent orchestrateur "<prompt>"` en non interactif
3. Prompt exact :

   ```
   Livre la spécification 002 en suivant tes étapes.
   ```

4. Observer : trois explorations dans le même tour ; tests rouges du testeur ; implémentation ; trois vérifications ; éventuelle remarque renvoyée à l'implémentation.
5. `make test`, puis le coût total (`/usage` sous Claude Code, coût affiché sous Open Code) et le nombre de sous-agents lancés.

## Résultat attendu

61 tests verts (37 de départ, 24 ajoutés). La branche livrée de référence touche 12 fichiers par rapport à `main` : neuf de code et de documentation (`README.md`, routeur et schémas HTTP, migration Alembic `20260907_0002_ticket_assignee.py`, dépôt et table Postgres, `application/tickets.py`, `domain/errors.py`, `domain/ticket.py`) et trois de tests. Résultat observé : `reference/sortie-reference.md`, à relever.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Agent principal | `claude --agent orchestrateur` | `default_agent` de `opencode.json`, ou `--agent` en `run` |
| Sous-agents lançables | `tools: Agent(explorateur, testeur, implementeur, verificateur), Read, Bash` | règle `subagent` de `permissions` |
| Parallélisme | 20 sous-agents simultanés par défaut | à relever (trois appels `subagent` dans le même tour ?) |
| Imbrication | trois niveaux, `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` | refusée par défaut (« Subagent depth limit reached (1) ») |
| Périmètre d'écriture | hook `PreToolUse` `guard-path.sh` | règles `permission.edit` du fichier de l'agent |

## Repli

Passer sur la branche livrée dans la copie de travail : `git checkout origin/feat/responsable-priorite-haute-done` (61 tests, `make test`), et dérouler le diff (`git diff main..HEAD --stat`). Sortie de référence : `reference/sortie-reference.md`.

## Remise à zéro

`demos/01-commun/reset.sh <session>` ; si l'orchestrateur a commité (il ne le doit pas), `git reset --hard origin/main`.

## À relever

Nombre réel de sous-agents, parallélisme effectif, coût et durée, comportement de l'imbrication, permissions demandées en session interactive (prévoir `--permission-mode acceptEdits` sous Claude Code si les invites ralentissent la salle).
