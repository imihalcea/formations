# Sortie de référence, démonstration 1

Statut : observé au rejeu du 25 octobre 2026 (`claude -p` sur Claude Code 2.1.310, `opencode run` sur Open Code v2.0.32, `claude-sonnet-4-6`). Non observé : TUI des deux outils, impasse avec le shim `sans-gh` sous Open Code.

## Réponse observée (Claude Code)

> Issue #1 : Un ticket fermé accepte encore des commentaires. `POST /tickets/{id}/comments` répond 201 et enregistre le commentaire même quand le ticket est `closed` (attendu : 409 avec un message nommant le statut). Reproduit sur `main` : la vérification du statut est absente à l'ajout du commentaire. Test : `test_add_comment_on_closed_ticket_returns_409`.

Sous Open Code : trois lignes (201 sur ticket `closed`, reproduit sur `main`, vérification absente) et le même test. Sous Claude Code la réponse a tenu en quatre paragraphes avec l'ancien prompt.

## Observé

| Élément | Claude Code | Open Code |
|---|---|---|
| Outils appelés | `Bash git remote -v`, `ToolSearch`, `mcp__github__list_issues`, `mcp__github__issue_read` (`get_comments`, `issue_number: 1`) | `read`, `execute` (`list_mcp_resources`), `shell git remote -v`, `execute` : `search` puis `tools.github.list_issues`, `search` puis `tools.github.issue_read` (`get_comments`) |
| `issue_read` avec `method: get` | non appelé (le corps vient de `list_issues`) | non appelé |
| Durée, coût | 16 s, 5 tours, 0,079 USD (3 appels au total avec l'ancien overlay) | 19 s, 7 étapes, 0,085 USD (`--standalone`) |
| Fenêtre | `/context` avant 26,9k tokens, après 41,0k ; MCP tools chargés 478 puis 1,6k ; définitions différées 19k puis 17,8k (chiffres du poste, MCP et skills personnels inclus) | pas de `/context` ; entrée par étape 12 146 avant le premier appel d'outil, 21 794 après la dernière |
| `git status` | seul l'overlay (`.claude/settings.json`, `.mcp.json`, `opencode.json`) | seul l'overlay |
| En-tête statique `Authorization` | accepté, `status: connected`, 46 outils `mcp__github__*` | accepté en `--standalone` |
| Invite d'approbation du serveur de projet | aucune en `-p` | sans objet |

Écarts du rejeu : sans `list_issues` ni `get_me` dans l'`allow`, Claude Code est bloqué (refus en `-p`, invite en interactif) ; sans `--standalone`, Open Code ne voit pas `GITHUB_TOKEN` et contourne par `curl`.

## Repli

Texte de l'issue et de ses commentaires : `../issue/`. En direct : `gh issue view 1 --json title,comments` dans la copie de travail.
