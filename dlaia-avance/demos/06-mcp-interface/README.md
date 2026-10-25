# Démonstration 6 : MCP et interface, corriger un bandeau

Slide « Démonstration : corriger un bandeau ». L'agent de code constate le défaut dans le navigateur, le corrige et vérifie le rendu. Branche `feat/front` : front minimal sur `/ui`, bandeau `position: fixed` qui recouvre le formulaire (titre « Tickets » masqué, bouton « Ajouter » rogné), API et tests corrects (37 verts).

## Préalables

Claude Code 2.1.310 ou Open Code v2.0.32 ; `gh`, `docker`, `uv`, `node` et `npx`. Le serveur Playwright se lance par `npx @playwright/mcp@0.0.83` (version testée le 25 octobre 2026, `npm view @playwright/mcp version`) : la première exécution télécharge le paquet. `session.sh` installe le navigateur (`npx --yes playwright install chromium`) ; le README de Playwright MCP ne documente pas l'installation du navigateur, le navigateur réellement employé est à relever. Options confirmées dans le README de `microsoft/playwright-mcp` : `--headless` (navigateur sans fenêtre, par défaut avec fenêtre), `--isolated` (profil en mémoire), `--viewport-size 1280x720`.

## Préparation

```
demos/06-mcp-interface/session.sh <session>
```

Une seule commande : copie de travail, overlay, installation du navigateur, puis lancement de l'API et du front en arrière-plan sur http://localhost:8000/ui/ (journal `serve.log` et `serve.pid` dans la copie). `make serve` relance l'API au premier plan si besoin.

Overlay : `opencode.json` avec `mcp.servers.playwright` (`type: local`, `command` en tableau, `--headless --isolated`) et une règle `playwright_*` en `allow` (démonstration locale) ; `.claude/settings.json` avec `mcp__playwright` en `allow`. Un `.mcp.json` épingle `@playwright/mcp@0.0.83` (celui de la branche déclare `@latest`) ; `opencode.json` l'épingle aussi. `opencode debug config` décode l'entrée Playwright de l'overlay.

Contrôles : `make check` dans ce dossier ; `curl -s -o /dev/null -w "%{http_code}" localhost:8000/ui/` rend 200 ; `make test` dans la copie : 37 verts.

## Déroulé

1. Serveur lancé : Claude Code, approuver le serveur du projet à la demande d'approbation du serveur ; Open Code, aucune approbation. `/mcp` (Claude Code) ou `/mcps` (Open Code) pour lister les outils.
2. Prompt exact :

   ```
   Avec le serveur MCP playwright, ouvre le front de tickets-api à 1280x720, essaie d'ajouter un ticket, constate le défaut d'interface, corrige-le dans la feuille de style et vérifie le rendu par une capture.
   ```

3. Capture initiale : le bandeau jaune recouvre le formulaire. Outils attendus : `browser_resize` (ou la taille donnée par le prompt), `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_take_screenshot`. Noms côté agent : `mcp__playwright__browser_navigate` (Claude Code), `playwright_browser_navigate` (Open Code).
4. Correction CSS dans `src/tickets/ui/style.css` (règle `.bandeau`).
5. Capture finale : le formulaire et le bouton « Ajouter » sont visibles et cliquables.
6. `make test` toujours vert, `git diff` limité à la feuille de style.

## Résultat attendu

Bouton « Ajouter » cliquable, capture avant et après. Les captures de référence (`reference/avant-bandeau.png`, `reference/apres-bandeau.png`) ont été prises le 25 octobre 2026 avec Chromium headless à 1280x720 sur la branche, sans l'agent de code : elles montrent le défaut et le correctif attendu, pas la sortie de Playwright MCP. Résultat observé : `reference/sortie-reference.md`, à relever.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Déclaration | `.mcp.json` du dépôt | `opencode.json`, `mcp.servers.playwright` |
| Approbation | demande d'approbation du serveur en session interactive | aucune |
| Noms d'outils | `mcp__playwright__browser_*` | `playwright_browser_*` |
| Permissions | `allow` sur `mcp__playwright` (overlay) | règle `playwright_*` en `allow` (overlay) |

## Repli

0. `npx` ne télécharge pas (réseau coupé) : la veille, lancer une fois `npx @playwright/mcp@0.0.83 --help` pour remplir le cache de npm, qui sert ensuite le paquet sans réseau (à vérifier hors ligne avant la séance) ; sinon passer au point 1.
1. Serveur ou navigateur indisponible : montrer `reference/avant-bandeau.png` et `reference/apres-bandeau.png`, puis appliquer le correctif de référence : `make -C demos/06-mcp-interface patch SESSION=<session>` (`reference/correctif-bandeau.patch`, `position: static` pour `.bandeau`, vérifié par `git apply --check` et par capture).
2. Montrer que `make test` reste vert (37).

## Remise à zéro

D'abord arrêter l'API : `make -C demos/06-mcp-interface stop SESSION=<session>`. Puis `demos/01-commun/reset.sh <session>` (annule l'overlay et la correction CSS).

## À relever

Outils Playwright réellement appelés, durée, comportement avec `--headless`, installation du navigateur, capture réelle à substituer à l'illustration de la slide « Un défaut d'interface ».
