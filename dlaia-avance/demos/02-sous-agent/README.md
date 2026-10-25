# Démonstration 2 : sous-agent explorateur

Slide « Démonstration : sous-agent explorateur ». Un sous-agent explore le code des commentaires et rend dix lignes. Branche `fix/ticket-ferme-commentaires`.

## Préalables

Claude Code 2.1.310 ou Open Code v2.0.32, `gh` connecté, `docker`, `uv`. Aucun jeton GitHub nécessaire.

## Préparation

```
demos/02-sous-agent/session.sh <session>
```

Copie de session sur la branche de la démonstration, puis overlay : `.opencode/agents/explorateur.md` en forme v2 (`permissions` en tableau, `edit`, `shell`, `webfetch` et `subagent` refusés ; le dépôt le porte en forme v1, migrée). Le sous-agent de Claude Code (`.claude/agents/explorateur.md`, `tools: Read, Grep, Glob`) est celui du dépôt, sans changement. `opencode debug agents` décode l'overlay : `explorateur`, mode `subagent`, `steps` 25, quatre refus.

## Déroulé

1. Ouvrir le fichier de l'agent (lecture seule) : `.claude/agents/explorateur.md` ou `.opencode/agents/explorateur.md`.
2. Fenêtre avant : `/context` (Claude Code), coût affiché (Open Code).
3. Prompt exact :

   ```
   Délègue à l'explorateur l'exploration de tout ce qui touche aux commentaires d'un ticket. Question : où vérifier le statut du ticket avant d'ajouter un commentaire ? Réponds en recopiant son rapport mot pour mot, sans le reformuler, le mettre en forme ni le commenter, et sans rien ajouter avant ou après.
   ```

4. Montrer la session du sous-agent (le panneau d'agents sous Claude Code, la session enfant sous Open Code).
5. Rapport reçu. Au rejeu, « tel quel » n'a pas été obéi (reformulation, mise en gras, correction d'une phrase) : la formulation ci-dessus durcit la consigne, effet non rejoué.
6. Fenêtre après, puis relevé des tokens lus par le sous-agent et reçus par l'agent principal (tableau de la slide « Le rapport remplace les fichiers lus »).

## Résultat attendu

Rapport au format des instructions fixes du sous-agent (fichiers lus, faits avec fichier et ligne, écarts), de 15 lignes sous Claude Code et 18 sous Open Code au rejeu du 25 octobre 2026 pour une limite de dix : annoncer « une quinzaine de lignes » ou durcir les instructions de l'explorateur. Les fichiers à nommer : `src/tickets/application/comments.py` (`AddComment.execute`, qui appelle `Comment.write`) et `src/tickets/domain/ticket.py` (`Comment.write`, où le correctif de la branche `-done` ajoute `ensure_accepts_comments`). Le point de vérification du statut est donc dans le domaine, appelé depuis le cas d'usage. Résultat observé : `reference/rapport-reference.md`.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Fichier | `.claude/agents/explorateur.md`, `tools: Read, Grep, Glob`, `maxTurns: 25` | `.opencode/agents/explorateur.md`, `mode: subagent`, `steps: 25`, `permissions` |
| Invocation | langage naturel (fonctionne) ; `@"explorateur (agent)"` fonctionne aussi en `-p`, où le `@` est du texte du prompt, la mention interactive est à vérifier à la main | le modèle choisit d'après `description` (outil `subagent`) |
| Mesure | `/context` en séance ; au rejeu, flux de messages (`-p` termine la session) | pas de `/context` ; `opencode session export <id>` donne tokens et coût de la session enfant |
| Outils du sous-agent | `Grep` (2), `Glob` (1), `Read` (3) : `Grep` et `Glob` existent sur ce poste | `grep`, `glob`, `read` ×3 |

## Repli

`reference/rapport-reference.md` : rapport enregistré au rejeu du 25 octobre 2026. À défaut, ouvrir `src/tickets/application/comments.py` et `src/tickets/domain/ticket.py` et lire la réponse à voix haute.

## Remise à zéro

`demos/01-commun/reset.sh <session>`. L'explorateur ne modifie rien : `git status` doit être propre.

## Port 5432 déjà pris

Si un autre projet `tickets-api` tient le port 5432 (conteneur `tickets-api-db-1`), `make db-up` échoue et `session.sh` s'arrête. Arrêter l'autre conteneur avant la séance : un seul `tickets-api-*` à la fois.

## Non observé au rejeu

Panneau d'agents (Claude Code) et session enfant (Open Code) en TUI, mention `@` interactive, `/context` avant et après.
