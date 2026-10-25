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

Sous Open Code : même `PATH`, `opencode` sans option de modèle (le modèle est dans `opencode.json`).

## Déroulé

1. Ouvrir `.mcp.json` (Claude Code) ou `opencode.json` (Open Code) : URL distante, en-tête `Authorization`, jeton lu dans l'environnement.
2. Lister les outils chargés. Claude Code : approuver le serveur du projet à la demande d'approbation, puis `/mcp`. Open Code : `/mcps` dans la TUI.
3. Relever la fenêtre avant : `/context` (Claude Code ; aucune commande équivalente documentée sous Open Code, noter le coût du premier tour).
4. Prompt exact :

   ```
   Avec le serveur MCP github, lis l'issue ouverte sur le ticket fermé et ses commentaires. Résume le bug en trois lignes et nomme le test qui devrait le couvrir. Ne modifie rien.
   ```

5. Deux appels attendus : `issue_read` avec `method: get`, puis `get_comments`. Noms d'outils : `mcp__github__issue_read` (Claude Code), `github_issue_read` (Open Code).
6. Comparer avec `gh issue view --comments` dans un autre terminal (sans le shim).
7. Relever la fenêtre après, puis `git status` (propre).

## Résultat attendu

Résumé exact du bug (un ticket fermé accepte des commentaires), test nommé (`test_add_comment_on_closed_ticket_returns_409` ou `test_closed_ticket_refuses_comments`), aucun fichier modifié. Résultat observé : `reference/sortie-reference.md`, à relever.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Déclaration | `.mcp.json`, `${GITHUB_TOKEN}` | `opencode.json`, `mcp.servers.github`, `{env:GITHUB_TOKEN}` |
| Approbation du serveur | demande d'approbation à la première session ; en `claude -p`, aucune demande | aucune |
| Permissions de l'overlay | `allow` sur `mcp__github__issue_read`, `ask` sur les trois outils d'écriture | tableau `permissions` : `github_*` en `ask`, puis `github_issue_read` en `allow` (la dernière règle correspondante l'emporte) |
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

## À relever

Noms d'outils réels, tokens de la fenêtre avant et après (slide « Coût en fenêtre de contexte »), en-tête statique `Authorization` accepté par Claude Code, demande d'approbation du serveur, comportement de `/mcps` sous Open Code.
