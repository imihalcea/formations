# Démonstration 1 : MCP GitHub, lire une issue

Slide « Démonstration : lire une issue ». Un serveur MCP GitHub lit une issue et ses commentaires, sans copier-coller. Branche `fix/ticket-ferme-commentaires` (deux tests rouges).

## Préalables

- Claude Code 2.1.310 et Open Code v2.0.32 (`claude --version`, `opencode --version`).
- `gh` connecté (`gh auth status`), `docker`, `uv`.
- `GITHUB_TOKEN` : un jeton GitHub (PAT) qui lit les issues de la copie de session. `export GITHUB_TOKEN=$(gh auth token)` suffit sur le poste de démonstration. Ne jamais l'écrire dans un fichier.
- Un seul outil pour la journée : suivre la colonne choisie.

## Préparation

```
export GITHUB_TOKEN=$(gh auth token)
demos/01-mcp-github/session.sh <session>
```

Crée ou reprend `~/travail/tickets-api-<session>` sur la branche de la démonstration, copie l'overlay (`.mcp.json`, `opencode.json` en forme v2, `.claude/settings.json`), lance la base, puis crée l'issue (deux commentaires) dans la copie de session. La référence ne reçoit jamais d'issue.

Contrôle : `make check` dans ce dossier (JSON valide, scripts), puis dans la copie de travail `make test` (deux échecs attendus).

Montrer l'état de départ (slide « Une information hors du dépôt ») : lancer l'agent avec le shim qui cache `gh`.

```
cd ~/travail/tickets-api-<session>
PATH="$HOME/formations/dlaia-avance/demos/01-commun/sans-gh:$PATH" claude --model claude-sonnet-4-6
```

Sous Open Code : même `PATH`, `opencode` sans option de modèle (le modèle est dans `opencode.json`). Le démon d'arrière-plan d'Open Code v2 (`opencode serve --service`) n'hérite pas de l'environnement du shell : sans `GITHUB_TOKEN`, le serveur MCP échoue (`Authorization header is badly formatted`) et l'agent contourne par `curl`. Avec `opencode run`, ajouter `--standalone` ; en TUI, vérifier `opencode mcp list` avant la séance (`✓ github`), non observé en TUI.

## Déroulé

1. Ouvrir `.mcp.json` (Claude Code) ou `opencode.json` (Open Code) : URL distante, en-tête `Authorization`, jeton lu dans l'environnement.
2. Lister les outils chargés. Claude Code : approuver le serveur du projet à la demande d'approbation, puis `/mcp`. Open Code : `/mcps` dans la TUI.
3. Relever la fenêtre avant : `/context` (Claude Code ; aucune commande équivalente documentée sous Open Code, noter le coût du premier tour).
4. Prompt exact :

   ```
   Avec le serveur MCP github, sans gh ni curl, lis l'issue n° 1 du dépôt <propriétaire>/tickets-api-<session> et ses commentaires. Résume le bug en trois lignes exactement et nomme le test qui devrait le couvrir. Ne modifie rien.
   ```

   Remplacer `<propriétaire>/tickets-api-<session>` par le dépôt de la copie de session (`gh repo view --json nameWithOwner -q .nameWithOwner`). Sans dépôt ni numéro, l'agent cherche l'issue par `get_me` et `list_issues`.

5. Appels observés : `list_issues` (le corps de l'issue), puis `issue_read` avec `method: get_comments`. `issue_read` avec `method: get` n'a pas été appelé : écrire « lis l'issue avec `issue_read` » dans le prompt pour l'obtenir, non vérifié. Noms d'outils : `mcp__github__issue_read`, `mcp__github__list_issues` (Claude Code ; `get_issue` n'existe pas) ; sous Open Code v2, outil `execute` en code mode : `tools.github.issue_read({...})`, `search({query, namespace})` pour découvrir les outils ; `github_issue_read` est la forme des règles de permission.
6. Comparer avec `gh issue view 1 --json title,comments` dans un autre terminal (sans le shim). `gh issue view --comments` échoue avec gh 2.46.0 (`GraphQL: Projects (classic) is being deprecated`).
7. Relever la fenêtre après, puis `git status` (propre).

## Résultat attendu

Résumé exact du bug (un ticket fermé accepte des commentaires), test nommé (`test_add_comment_on_closed_ticket_returns_409` ou `test_closed_ticket_refuses_comments`), aucun fichier modifié hors overlay. Résultat observé au rejeu du 25 octobre 2026 : `reference/sortie-reference.md`.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Déclaration | `.mcp.json`, `${GITHUB_TOKEN}` | `opencode.json`, `mcp.servers.github`, `{env:GITHUB_TOKEN}` |
| Approbation du serveur | demande d'approbation à la première session ; en `claude -p`, aucune demande (`claude mcp list` annonce `Pending approval`) | aucune |
| Permissions de l'overlay | `allow` sur `mcp__github__issue_read`, `list_issues` et `get_me`, `ask` sur les trois outils d'écriture | tableau `permissions` : `github_*` en `ask`, puis `github_issue_read`, `github_list_issues` et `github_get_me` en `allow` (la dernière règle correspondante l'emporte) |
| Liste des serveurs | `/mcp`, `claude mcp list` | `/mcps` |

Le dépôt de référence déclare le serveur d'Open Code en forme v1 (`mcp.github`, `enabled`, `permission`) ; l'overlay le remplace par la forme v2 (`mcp.servers`, sans `enabled`, `permissions`). `opencode debug config` décode l'overlay sans erreur.

## Repli

0. `gh issue create` échoue à la préparation : lire `issue/issue.md` et les deux commentaires (`issue/commentaire-1.md`, `issue/commentaire-2.md`), puis dérouler la démonstration à partir de `reference/sortie-reference.md`.
1. Réseau ou jeton en défaut : `reference/sortie-reference.md` (sortie enregistrée de l'appel) et le texte de l'issue dans `issue/`.
2. Puis `gh issue view --comments` en direct.

## Remise à zéro

```
demos/01-commun/reset.sh <session>
```

Annule l'overlay et toute modification. L'issue reste dans la copie de session ; la relancer n'en crée pas de seconde.

## Port 5432 déjà pris

Si un autre projet `tickets-api` tient le port 5432 (conteneur `tickets-api-db-1`), `make db-up` échoue et `session.sh` s'arrête. Arrêter l'autre conteneur (`docker ps`, `docker stop tickets-api-db-1`) avant la séance : un seul `tickets-api-*` à la fois.

## Non observé au rejeu

Impasse avec le shim `sans-gh` (étape 0 jouée sous Claude Code seulement : l'agent tente `gh`, `curl` puis `python3`), invite d'approbation du serveur de projet, `/mcp` et `/mcps` (TUI), invite `ask` sous Open Code (`--auto` l'écarte), `/context` sur un profil vierge (les chiffres du rejeu incluent les MCP et skills du poste).
