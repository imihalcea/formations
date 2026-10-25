# Démonstration 4 : boucle jusqu'à la réussite

Slide « Démonstration : boucle de correction ». Une commande personnalisée du dépôt corrige le code jusqu'à ce que les tests passent, sous garde-fous. Branche `fix/ticket-ferme-commentaires` (37 verts, 2 rouges).

## Préalables

Claude Code 2.1.310 ou Open Code v2.0.32 ; `gh`, `docker`, `uv`. La commande se joue en session interactive : `opencode run` n'y développe pas `/fix-until-green` (equivalences.md).

## Préparation

```
demos/04-boucle/session.sh <session>
```

Overlay :

| Fichier | Rôle |
|---|---|
| `.claude/settings.json` | règles `allow` du dépôt, plus `deny` sur `Edit(tests/**)` (slide « Protéger les tests ») |
| `.opencode/agents/implementeur.md` | `implementeur` en forme v2 : `edit` est autorisé, puis refusé sur `tests/*`, `.github/*` et `.opencode/*`. Le joker `*` couvre `/` selon la doc Permissions v2 et la dernière règle correspondante l'emporte. `opencode debug agents` le décode |

La commande personnalisée `fix-until-green` vient du dépôt (`.claude/commands/` ; `.opencode/commands/`, `agent: implementeur`). Contrôle : `make test` dans la copie : `2 failed, 37 passed`, échecs `test_add_comment_on_closed_ticket_returns_409` et `test_closed_ticket_refuses_comments`.

## Déroulé

1. `make test` rouge, deux échecs.
2. Lire la commande : cinq relances au plus (instruction du prompt, donc garde-fou faible).
3. Lancer `claude --model claude-sonnet-4-6` ou `opencode`, puis le prompt exact :

   ```
   /fix-until-green interdire les commentaires sur un ticket fermé
   ```

4. Compter les relances annoncées par l'agent ; montrer un échec persistant puis la réussite s'il se produit.
5. Si l'agent tente de modifier `tests/`, montrer le refus (règle `deny` ; sous Claude Code, noter que `sed -i` par `Bash` échappe à `Edit`).
6. `make test` vert, puis `git diff` lu à voix haute (seul `src/` doit changer).

## Résultat attendu

Tous les tests passent en cinq relances au plus (39 verts). Le correctif de référence tient en six lignes dans `src/tickets/domain/ticket.py` (méthode `ensure_accepts_comments`, appelée par `Comment.write`, erreur `TicketClosed`). Résultat observé : `reference/sortie-reference.md`, à relever.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Commande | `.claude/commands/fix-until-green.md` (délègue à `implementeur`) | `.opencode/commands/fix-until-green.md`, `agent: implementeur` |
| Protection des tests | `deny` `Edit(tests/**)` dans `.claude/settings.json` ; hook `guard-path.sh` du dépôt | `permissions` de l'agent |
| Boucle en une commande | `/goal make test réussit ou stop after 20 turns` (juge modèle, non joué ici) | aucun équivalent documenté |

Attention Claude Code : la règle `deny` globale bloque aussi le testeur de l'orchestrateur ; cet overlay ne sert que cette démonstration.

## Repli

Passer sur `origin/fix/ticket-ferme-commentaires-done` (39 verts) et lire le `git diff` contre la branche de départ. Sortie de référence : `reference/sortie-reference.md`.

## Remise à zéro

`demos/01-commun/reset.sh <session>` (restaure la branche de départ, deux tests rouges).

## À relever

Nombre de relances réel, tentative de contournement des tests (diff réel pour la slide « Un test désactivé masque l'échec »), coût.
