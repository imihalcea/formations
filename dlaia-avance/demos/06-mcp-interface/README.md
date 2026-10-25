# Démonstration 5 : MCP et interface, corriger un bandeau

Slide « Démonstration : corriger un bandeau ». L'agent de code constate le défaut dans le navigateur, le corrige et vérifie le rendu. Branche `feat/front` : front minimal sur `/ui`, bandeau `position: fixed` qui recouvre le formulaire (titre « Tickets » masqué, bouton « Ajouter » rogné), API et tests corrects (37 verts).

## Préalables

Claude Code 2.1.310 ou Open Code v2.0.32 ; `gh`, `docker`, `uv`, `node` et `npx`. Le serveur Playwright se lance par `npx @playwright/mcp@0.0.83` (version testée le 25 octobre 2026, `npm view @playwright/mcp version`) : la première exécution télécharge le paquet. Playwright MCP 0.0.83 cible par défaut le canal `chrome` (Google Chrome système, absent du poste) : l'overlay passe `--browser chromium` et `session.sh` installe le navigateur propre au paquet par `npx @playwright/mcp@0.0.83 install-browser chrome-for-testing` (12 s, 118,6 Mo, `chromium_headless_shell-1247` dans `~/.cache/ms-playwright`). `npx playwright install chromium` ne suffit pas (révision différente de celle attendue par le serveur). Sans cela, le serveur échoue : `Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome`. Options confirmées dans le README de `microsoft/playwright-mcp` : `--headless` (navigateur sans fenêtre, par défaut avec fenêtre), `--isolated` (profil en mémoire), `--viewport-size 1280x720`.

## Préparation

```
demos/06-mcp-interface/session.sh <session>
```

Une seule commande : copie de travail, overlay, installation du navigateur, puis lancement de l'API et du front en arrière-plan sur http://localhost:8000/ui/ (journal `serve.log` et `serve.pid` dans la copie). `make serve` relance l'API au premier plan si besoin.

Overlay : `opencode.json` avec `mcp.servers.playwright` (`type: local`, `command` en tableau, `--browser chromium --headless --isolated`) et une règle `playwright_*` en `allow` (démonstration locale) ; `.claude/settings.json` avec `mcp__playwright` en `allow`. Un `.mcp.json` épingle `@playwright/mcp@0.0.83` (celui de la branche déclare `@latest`) ; `opencode.json` l'épingle aussi. `opencode debug config` décode l'entrée Playwright de l'overlay.

Si le port 5432 est déjà pris par un autre projet `tickets-api` (conteneur `tickets-api-db-1`), `make db-up` échoue et `session.sh` s'arrête avant l'installation du navigateur : arrêter l'autre conteneur avant la séance. L'API et les tests partagent alors une seule base ; ne pas jouer deux démonstrations en parallèle.

Contrôles : `make check` dans ce dossier ; `curl -s -o /dev/null -w "%{http_code}" localhost:8000/ui/` rend 200 ; `make test` dans la copie : 37 verts.

## Déroulé

1. Serveur lancé : Claude Code, approuver le serveur du projet à la demande d'approbation du serveur ; Open Code, aucune approbation. `/mcp` (Claude Code) ou `/mcps` (Open Code) pour lister les outils.
2. Prompt exact :

   ```
   Avec le serveur MCP playwright, ouvre http://localhost:8000/ui/ à 1280x720, saisis un titre dans le champ puis clique sur « Ajouter », constate le défaut d'interface, corrige-le dans la feuille de style et vérifie le rendu par une capture. Ne modifie ni la configuration MCP ni les tests.
   ```

   Au rejeu, l'ancien prompt (sans URL ni « clique sur Ajouter ») a laissé l'agent chercher l'URL par `curl` ; sous Open Code il n'a jamais cliqué sur « Ajouter » et a modifié `opencode.json`. Effet de la formulation ci-dessus non rejoué.

3. Capture initiale : le bandeau jaune recouvre le formulaire. Outils observés : `browser_resize`, `browser_navigate`, `browser_take_screenshot`, `browser_fill_form`, `browser_click`, `browser_evaluate` (Claude Code) ; `browser_resize`, `browser_navigate`, `browser_snapshot`, `browser_take_screenshot`, `browser_click`, `browser_run_code_unsafe` (Open Code). `browser_snapshot` existe sous Claude Code mais l'agent lit la capture à la place. Noms côté agent : `mcp__playwright__browser_navigate` (Claude Code) ; `tools.playwright.browser_navigate` dans l'outil `execute` (Open Code v2, code mode), `playwright_browser_navigate` dans les règles de permission. Sous Open Code, `browser_click` avec `target: "ref=e6"` échoue ; `"#titre"` fonctionne.
4. Correction CSS dans `src/tickets/ui/style.css`. Le défaut vient de `.bandeau` en `position: fixed`. Correctifs réellement produits par l'agent, le bandeau restant fixe : `body { margin: 0; padding-top: 64px; ... }` (Claude Code), `main { ...; padding: 72px 16px 32px; }` (Open Code). Le correctif de référence est `position: static` pour `.bandeau` (repli). Les deux sont valables ; ne pas annoncer une ligne précise à la salle.
5. Capture finale : le formulaire et le bouton « Ajouter » sont visibles et cliquables. Piège du rejeu : la page reste en cache après la correction (deux captures montrent la page non corrigée) ; l'agent recharge la feuille de style par `browser_evaluate` ou `page.reload`.
6. `make test` toujours vert (37), `git diff -- src tests` limité à `src/tickets/ui/style.css`. Ajouter `.playwright-mcp/` (captures et `page-*.yml` écrits par le serveur) au `.gitignore` de la copie ou l'ignorer dans `git status`.

## Résultat attendu

Bouton « Ajouter » cliquable, capture avant et après. Les captures de référence (`reference/avant-bandeau.png`, `reference/apres-bandeau.png`) ont été prises le 25 octobre 2026 avec Chromium headless à 1280x720 sur la branche, sans l'agent de code : elles montrent le défaut et le correctif attendu, pas la sortie de Playwright MCP. Résultat observé : `reference/sortie-reference.md`.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Déclaration | `.mcp.json` du dépôt | `opencode.json`, `mcp.servers.playwright` |
| Approbation | demande d'approbation du serveur en session interactive | aucune |
| Noms d'outils | `mcp__playwright__browser_*` | `tools.playwright.browser_*` (code mode), `playwright_browser_*` pour les règles |
| Permissions | `allow` sur `mcp__playwright` (overlay) | règle `playwright_*` en `allow` (overlay) |

## Repli

0. `npx` ne télécharge pas (réseau coupé) : la veille, lancer une fois `npx @playwright/mcp@0.0.83 --help` pour remplir le cache de npm, qui sert ensuite le paquet sans réseau (à vérifier hors ligne avant la séance) ; sinon passer au point 1.
1. Serveur ou navigateur indisponible : montrer `reference/avant-bandeau.png` et `reference/apres-bandeau.png`, puis appliquer le correctif de référence : `make -C demos/06-mcp-interface patch SESSION=<session>` (`reference/correctif-bandeau.patch`, `position: static` pour `.bandeau`, vérifié par `git apply --check` et par capture).
2. Montrer que `make test` reste vert (37).

## Remise à zéro

D'abord arrêter l'API : `make -C demos/06-mcp-interface stop SESSION=<session>`. Puis `demos/01-commun/reset.sh <session>` (annule l'overlay et la correction CSS).

## Non observé au rejeu

Navigateur avec fenêtre (sans `--headless`), `/mcp` et `/mcps`, invite d'approbation du serveur, durée de démarrage de `npx` au premier lancement, effet du nouveau prompt, clic sur « Ajouter » sous Open Code. Les captures du rejeu Claude Code (avant et après correction) sont disponibles dans `tmp/rejeu/demos-claude-code/journal-01/captures-d6/` pour la slide « Un défaut d'interface ».
