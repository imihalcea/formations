# Sortie de référence, démonstration 5

Statut : observé au rejeu du 25 octobre 2026 (`claude -p`, `opencode run`, `claude-sonnet-4-6`, Playwright MCP 0.0.83 avec `--browser chromium --headless`). Les deux captures PNG du dossier (`avant-bandeau.png`, `apres-bandeau.png`) viennent de Chromium headless hors agent de code. Non observé : navigateur avec fenêtre, effet du prompt durci.

| Mesure | Claude Code | Open Code |
|---|---|---|
| Outils Playwright appelés | `browser_resize`, `browser_navigate` (4), `browser_take_screenshot` (5), `browser_fill_form`, `browser_click`, `browser_evaluate` (4) | `browser_resize`, `browser_navigate`, `browser_snapshot` (`boxes: true`), `browser_take_screenshot`, `browser_click`, `browser_run_code_unsafe` |
| Défaut décrit par l'agent | bandeau jaune « Maintenance prévue samedi 20 h... », titre masqué, formulaire rogné | bandeau `0,0,1280,65`, `h1` et formulaire dessous, bouton « Ajouter » rogné |
| Correction CSS | `body { margin: 0; padding-top: 64px; ... }`, `.bandeau` intact (référence : `position: static`) | `main { ...; padding: 72px 16px 32px; }`, bandeau resté fixe |
| Clic sur « Ajouter » | oui (`#ajouter`), ticket « Bug de connexion » ajouté | non (un clic dans le champ titre seulement) |
| Capture finale lue par l'agent | oui, après rechargement de la feuille de style (cache) | oui, après `page.reload` |
| `make test` | 37 passed | 37 passed |
| Diff | `style.css` (2 lignes) | `style.css`, mais aussi `opencode.json` modifié par l'agent et fichiers non suivis (`.playwright-mcp/`, captures) |
| Durée, coût | 155 s, 33 tours, 0,72 USD | 77 s, 37 étapes, 0,415 USD |

Échec initial commun : sans `--browser chromium` ni `install-browser`, `Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome` ; l'agent tente de modifier la configuration (refusé sous Claude Code, fait sous Open Code). Une erreur de console par chargement de page (non lue, probablement `favicon`).
