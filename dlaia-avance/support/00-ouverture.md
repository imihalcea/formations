# Ouverture

## Développement logiciel assisté par l'IA {.title kicker="Ouverture"}

Journée avancée, module complémentaire.

::: notes
Journée complémentaire et facultative de la formation Développement logiciel assisté par l'IA. Accueil, tour de table : dépôts sur lesquels l'agent est déjà utilisé, ce qui a résisté.
Aucun TP aujourd'hui : le formateur joue des démonstrations, la salle observe et pose des questions.
Rappeler que le support suppose la formation initiale acquise : agent, harnais, spécification, Spec Kit ne sont pas réexpliqués.
:::

## Acquis de la formation initiale {kicker="Ouverture"}

| Élément en place | Ce qu'il apporte |
|---|---|
| Agent | un modèle dans une boucle d'outils : il lit, exécute, relit, jusqu'au résultat |
| Harnais | le logiciel autour du modèle : agent, outils, permissions, affichage |
| Spécification | l'intention écrite et versionnée, avant le code |

La journée traite des limitations qui résistent malgré ces trois éléments.

::: notes
Pas de rappel de cours : trois lignes pour fixer le point de départ commun. Définitions du lexique de la formation initiale.
Si quelqu'un n'a pas suivi la formation initiale : renvoyer à son support, modules 1 à 3 (agent et harnais : module 1, spécification : module 3).
« Agent » seul jusqu'à la slide 3, « agent de code » dès la slide 4.
:::

## Programme {.agenda kicker="Ouverture"}

::: notes
Lecture de la slide : les modules dans l'ordre où ils sont joués. Chaque module se joue en démonstrations, le module 4 en démonstration facultative.
Les titres de module sont annoncés ici, définis dans leur module : ne rien expliquer maintenant.
:::

## Définition d'une limitation {kicker="Limitations"}

![Deux barres : le code produit dépasse la ligne de limitation, le code relu l'atteint sans la franchir](images/00-limitation.svg)

Une limitation est ce que l'IA ne dépasse pas seule, même avec une methode comme SDD et un harnais.

::: notes
Un défaut de prompt ou de méthode se corrige sans changer d'outil ; une limitation subsiste une fois spécification et harnais en place.
Le mot est choisi pour la suite de la journée : on ne dit ni plafond, ni goulot, ni blocage.
Le schéma est une illustration. Archétype repris au module 2 : l'agent produit plus de code que l'équipe n'en relit.
:::

## Quatre modules, quatre limitations a dépasser {kicker="Limitations"}

| Limitation | Module |
|---|---|
| l'agent de code seul n'a que ses outils d'origine | 1 Automatiser plus loin |
| une seule fenêtre de contexte et une seule passe | 1 Automatiser plus loin |
| l'agent de code produit plus de code que l'équipe n'en relit | 2 Revue de code automatisée |
| l'agent de code peut contourner une règle que rien ne vérifie | 3 Hooks et pipeline |
| le code du dépôt quitte le poste à chaque appel du modèle | 4 Modèles locaux |

::: notes
Classement du support, pas une source externe. Les termes de chaque colonne droite sont définis dans leur module : ne pas entrer dans le détail.
Lecture : une ligne, une limitation, un module qui y répond.
:::

## Le dépôt tickets-api {.compare kicker="Matériel"}

tickets-api est le dépôt de démonstration commun aux modules 1 à 3 : une API de tickets en Python (FastAPI).

::: claude-code
| Élément | Fichier |
|---|---|
| Fichier de contexte | `CLAUDE.md` |
| Configuration du modèle | `.claude/settings.json` |
| Dossier de configuration | `.claude/` |
:::

::: opencode
| Élément | Fichier |
|---|---|
| Fichier de contexte | `AGENTS.md` |
| Configuration du modèle | `opencode.json` |
| Dossier de configuration | `.opencode/` |
:::

::: sources
- `demos/00-tickets-api/README.md`
:::

::: notes
Dépôt commun aux modules 1 à 3 (module 4 : démonstration facultative, décidée à son plan). Dépôt d'origine `imihalcea/tickets-api`, privé. `CLAUDE.md` importe `AGENTS.md` : une seule source de contexte pour les deux agents de code.
Les sous-agents, serveurs MCP et hooks du dépôt sont présentés dans leur module.
Les 37 tests sont verts sur `main`. Préalables d'une session : `make db-up`, `make test` (37 verts), `uv sync`. Détail dans le runbook.
Branche de départ : chaque démonstration commence sur une branche de tickets-api. Exemples vérifiés par `gh api` le 25 octobre 2026 : module 1 `fix/ticket-ferme-commentaires`, `feat/responsable-priorite-haute-done`, `feat/front` ; module 2 `demo/revue-defauts` ; module 3 `demo/hook-harnais`, `demo/build-casse`. Liste partielle : les autres démonstrations des modules 1 à 3 partent de `main`, le module 4 n'a pas de branche. Les branches `demo/*` sont des squelettes complétés aux plans des modules 2 et 3. Les variantes `-done` et `-sdk` servent de repli.
Copie de travail : `~/demos/00-tickets-api/session.sh <identifiant>` crée `imihalcea/tickets-api-<identifiant>` (privé, toutes les branches, copie miroir) puis clone dans `~/travail/tickets-api-<identifiant>`. Idempotent. Prérequis : `gh` connecté. Dans le script, l'argument s'appelle `<session>` ; `<identifiant>` évite le mot « session », réservé à l'agent. Le dépôt d'origine reste intact (aucune issue ni pull request). Une copie par démonstration, supprimable après coup.
:::

## Glossaire : agents et modèle {kicker="Glossaire"}

- **Agent de code** : programme en ligne de commande qui pilote un modèle pour lire, écrire et exécuter du code dans un dépôt
- **Claude Code** : agent de code en ligne de commande d'Anthropic
- **Open Code** : agent de code libre en ligne de commande, version 2

|||

- **Fichier de contexte** : fichier lu par l'agent de code au lancement
- **Claude Sonnet 5.5** : modèle unique de la formation, identifiant `claude-sonnet-5-5`
- **Amazon Bedrock** : service d'Amazon Web Services qui héberge des modèles

::: sources
- [Claude Code, CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Claude Code, Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock)
- [Open Code, Providers](https://opencode.ai/docs/providers/)
- [Open Code, documentation](https://opencode.ai/docs/)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation.
:::

## Glossaire : limitation et matériel {kicker="Glossaire"}

- **Limitation** : ce que l'agent de code ne dépasse pas seul, même avec une spécification et un harnais
- **Démonstration** : exécution commentée, en direct, d'une tâche confiée à l'agent de code
- **tickets-api** : dépôt de démonstration commun aux modules 1 à 3

|||

- **Support** : cours compilé, `dlaia-avance.html`

::: notes
Slide de référence, à ne pas lire en salle.
:::
