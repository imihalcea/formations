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
   Délègue à l'explorateur l'exploration de tout ce qui touche aux commentaires d'un ticket. Question : où vérifier le statut du ticket avant d'ajouter un commentaire ? Affiche son rapport tel quel.
   ```

4. Montrer la session du sous-agent (le panneau d'agents sous Claude Code, la session enfant sous Open Code).
5. Rapport reçu, tel quel.
6. Fenêtre après, puis relevé des tokens lus par le sous-agent et reçus par l'agent principal (tableau de la slide « Le rapport remplace les fichiers lus »).

## Résultat attendu

Rapport d'une dizaine de lignes au format des instructions fixes du sous-agent (fichiers lus, faits avec fichier et ligne, écarts). Les fichiers à nommer : `src/tickets/application/comments.py` (`AddComment.execute`, qui appelle `Comment.write`) et `src/tickets/domain/ticket.py` (`Comment.write`, où le correctif de la branche `-done` ajoute `ensure_accepts_comments`). Le point de vérification du statut est donc dans le domaine, appelé depuis le cas d'usage. Résultat observé : `reference/rapport-reference.md`, à relever.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Fichier | `.claude/agents/explorateur.md`, `tools: Read, Grep, Glob`, `maxTurns: 25` | `.opencode/agents/explorateur.md`, `mode: subagent`, `steps: 25`, `permissions` |
| Invocation | langage naturel, ou `@"explorateur (agent)"` | le modèle choisit d'après `description` (outil `subagent`) |
| Mesure | `/context` | coût affiché ; pas de commande équivalente documentée |

## Repli

`reference/rapport-reference.md` : rapport enregistré (à relever). À défaut, ouvrir `src/tickets/application/comments.py` et `src/tickets/domain/ticket.py` et lire la réponse à voix haute.

## Remise à zéro

`demos/01-commun/reset.sh <session>`. L'explorateur ne modifie rien : `git status` doit être propre.

## À relever

Tokens lus et reçus ; forme d'appel qui fonctionne dans chaque agent de code (`@` ou langage naturel) ; rapport réel.
