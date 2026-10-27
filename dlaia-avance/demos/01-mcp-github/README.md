# Démonstration 1 : MCP GitHub, créer des issues

Slide « Démonstration 1 : créer des issues par MCP ». L'agent lance les tests et crée par un serveur MCP GitHub une issue par test en échec. Branche `fix/ticket-ferme-commentaires` (deux tests rouges).

## Préalables

- Claude Code 2.1.310 et Open Code v2.0.32 (`claude --version`, `opencode --version`).
- `gh` connecté (`gh auth status`), `docker`, `uv`.
- `GITHUB_TOKEN` : un jeton GitHub (PAT) qui lit et écrit les issues de la copie de session. `export GITHUB_TOKEN=$(gh auth token)` suffit sur le poste de démonstration. Ne jamais l'écrire dans un fichier.
- Un seul outil pour la journée : suivre la colonne choisie.

## Préparation

```
export GITHUB_TOKEN=$(gh auth token)
demos/01-commun/preparer-session.sh [préfixe]
demos/01-mcp-github/session.sh <session>
```

`preparer-session.sh` (préfixe par défaut jour-mois, ex. `28-10`) crée ou reprend le dépôt de session et `~/travail/tickets-api-<session>`, puis lance base et tests. `session.sh` se place sur la branche de la démonstration et copie l'overlay (`.mcp.json`, `opencode.json` en forme v2, `.claude/settings.json`). Aucune issue n'est créée à la préparation : la démonstration les crée. La référence ne reçoit jamais d'issue.

Contrôle : `make check` dans ce dossier (JSON valide, scripts), puis dans la copie de travail `make test` (deux échecs attendus).

## Déroulé

1. Ouvrir `.mcp.json` (Claude Code) ou `opencode.json` (Open Code) : URL distante, en-tête `Authorization`, jeton lu dans l'environnement.
2. Lister les outils chargés. Claude Code : approuver le serveur du projet à la demande d'approbation, puis `/mcp`. Open Code : `/mcps` dans la TUI.
3. Relever la fenêtre avant : `/context` (Claude Code ; aucune commande équivalente documentée sous Open Code, noter le coût du premier tour).
4. Prompt exact :

   ```
   Lance `make test`. Pour chaque test en échec, crée avec le serveur MCP github, sans gh ni curl, une issue dans le dépôt <propriétaire>/tickets-api-<session> : titre court, comportement constaté, comportement attendu, nom du test. Ne modifie aucun fichier.
   ```

   Remplacer `<propriétaire>/tickets-api-<session>` par le dépôt de la copie de session (`gh repo view --json nameWithOwner -q .nameWithOwner`). Sans le dépôt, l'agent appelle `get_me` pour le deviner.

5. Accepter chaque demande d'autorisation : `issue_write` est en `ask` dans l'overlay. Noms d'outils : `mcp__github__issue_write` (Claude Code) ; sous Open Code v2, outil `execute` en code mode : `tools.github.issue_write({...})`, `github_issue_write` est la forme des règles de permission. Non observé au rejeu.
6. Comparer avec `gh issue list --repo <dépôt> --json number,title` dans un autre terminal.
7. Relever la fenêtre après, puis `git status` (seuls les fichiers de l'overlay).

## Résultat attendu

`make test` : `2 failed, 37 passed`. Deux issues créées, une par test en échec : `test_add_comment_on_closed_ticket_returns_409` (un ticket fermé accepte un commentaire, 201 au lieu de 409) et `test_closed_ticket_refuses_comments`. Aucun fichier modifié hors overlay. Non rejoué avec ce prompt : `reference/sortie-reference.md` décrit l'ancien prompt (lecture d'une issue) et reste à remplacer au rejeu.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Déclaration | `.mcp.json`, `${GITHUB_TOKEN}` | `opencode.json`, `mcp.servers.github`, `{env:GITHUB_TOKEN}` |
| Approbation du serveur | demande d'approbation à la première session ; en `claude -p`, aucune demande (`claude mcp list` annonce `Pending approval`) | aucune |
| Permissions de l'overlay | `allow` sur `mcp__github__issue_read`, `list_issues` et `get_me`, `ask` sur les trois outils d'écriture | tableau `permissions` : `github_*` en `ask`, puis `github_issue_read`, `github_list_issues` et `github_get_me` en `allow` (la dernière règle correspondante l'emporte) |
| Liste des serveurs | `/mcp`, `claude mcp list` | `/mcps` |

Le dépôt de référence déclare le serveur d'Open Code en forme v1 (`mcp.github`, `enabled`, `permission`) ; l'overlay le remplace par la forme v2 (`mcp.servers`, sans `enabled`, `permissions`). `opencode debug config` décode l'overlay sans erreur.

## Repli

Réseau ou jeton en défaut : créer les deux issues avec `gh issue create --repo <dépôt>` (titre et corps repris du résultat attendu).

## Remise à zéro

```
demos/01-commun/reset.sh <session>
```

Annule l'overlay et toute modification. Les issues créées restent dans la copie de session : les fermer (`gh issue close <n> --repo <dépôt>`) avant de rejouer, sinon des doublons s'accumulent.

## Port 5432 déjà pris

Si un autre projet `tickets-api` tient le port 5432 (conteneur `tickets-api-db-1`), `make db-up` échoue et `session.sh` s'arrête. Arrêter l'autre conteneur (`docker ps`, `docker stop tickets-api-db-1`) avant la séance : un seul `tickets-api-*` à la fois.

## Non observé au rejeu

Ce prompt (créations d'issues), l'invite `ask` sur `issue_write`, l'invite d'approbation du serveur de projet, `/mcp` et `/mcps` (TUI), `/context` sur un profil vierge. L'impasse avec le shim `sans-gh` n'est plus jouée dans cette démonstration.
