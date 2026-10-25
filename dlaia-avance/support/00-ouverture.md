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
| Harnais | le logiciel autour du modèle : boucle, outils, permissions, affichage |
| Spécification | l'intention écrite et versionnée, avant le code |

La journée traite ce qui résiste malgré ces trois éléments.

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

## Deux agents de code {kicker="Environnement"}

Un agent de code est un agent en ligne de commande : il pilote un modèle pour lire, écrire et exécuter du code dans un dépôt.

| Agent de code | Commande de lancement | Fichier de contexte |
|---|---|---|
| Claude Code | `claude` | `CLAUDE.md` |
| Open Code | `opencode` | `AGENTS.md` |

Fichier de contexte : lu par l'agent de code au lancement.

::: sources
- [Claude Code, CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Claude Code, How Claude remembers your project](https://code.claude.com/docs/en/memory)
- [Open Code, CLI](https://opencode.ai/docs/cli/)
- [Open Code, Rules](https://opencode.ai/docs/rules/)
:::

::: notes
Les deux agents de code ont la même définition ; seuls la commande et le fichier de contexte diffèrent.
Claude Code lit `AGENTS.md` quand aucun `CLAUDE.md` n'existe, à partir de la v2.1.277 (doc memory). Open Code : la doc (opencode.ai/docs/rules) annonce un repli vers `CLAUDE.md` quand aucun `AGENTS.md` n'existe ; non observé en v2.0.32 (code de découverte, `formateur/equivalences.md`). Dans tickets-api, `CLAUDE.md` importe `AGENTS.md` : une seule source, le repli ne joue pas.
Open Code : « open source AI coding agent » (page d'accueil de la documentation).
Versions relevées sur le poste le 25 octobre 2026 : Claude Code 2.1.310, Open Code v2.0.32. À revérifier avant la séance (`claude --version`, `opencode --version`).
:::

## Claude Sonnet 4.6, modèle unique {kicker="Environnement"}

![Claude Code passe par l'abonnement Anthropic, Open Code par Amazon Bedrock, vers le même modèle claude-sonnet-4-6](images/00-modele-unique.svg)

Sur Amazon Bedrock, l'alias `sonnet` désigne Sonnet 4.5, une version plus ancienne. Les démonstrations imposent l'identifiant complet.

::: sources
- [Claude Code, Model configuration](https://code.claude.com/docs/en/model-config)
- [Open Code, Providers](https://opencode.ai/docs/providers/)
- [Claude Code, Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock)
:::

::: notes
Convention du poste : Claude Code par l'abonnement Anthropic, Open Code par Amazon Bedrock (région eu-west-1). Claude Code sait aussi passer par Bedrock (page Claude Code on Amazon Bedrock) ; le poste n'emploie pas cette voie.
Alias : la documentation dit que les alias suivent « the recommended version for your provider » et changent avec le temps ; `sonnet` désigne Sonnet 4.5 sur Bedrock (page Amazon Bedrock : sans variable de pin, `sonnet` vaut Sonnet 4.5) et un modèle plus récent sur l'API Anthropic. L'identifiant complet fige le modèle.
Tous les appels des démonstrations imposent `claude-sonnet-4-6` en entier, jamais l'alias.
Page providers d'Open Code : authentification Bedrock documentée, identifiant `amazon-bedrock/eu.anthropic.claude-sonnet-4-6` non documenté. Il vient de `opencode.json` de tickets-api, relevé sur le poste.
:::

## Une démonstration {kicker="Environnement"}

Une démonstration est l'exécution commentée, en direct, d'une tâche confiée à l'agent de code.

| Partie | Rôle |
|---|---|
| Prompt | la consigne donnée à l'agent de code |
| Déroulé | les étapes jouées et commentées |
| Résultat attendu | ce que la tâche doit produire |
| Repli | la solution de secours si l'agent dérive |

::: notes
Définition posée avant son premier emploi sur une slide. Aucun TP : la salle observe et pose des questions.
Chaque démonstration a un runbook dans `demos/NN-nom/` ; le prompt, le déroulé, le résultat attendu et le repli sont dans les notes de la slide qui la porte.
:::

## Fixer le modèle {.compare kicker="Environnement"}

::: claude-code
```console
$ claude --model claude-sonnet-4-6
```
:::

::: opencode
```json
{
  "model": "amazon-bedrock/eu.anthropic.claude-sonnet-4-6"
}
```

Fichier `opencode.json`, clé `model`.
:::

::: sources
- [Claude Code, CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Claude Code, Settings](https://code.claude.com/docs/en/settings)
- [Open Code, Models](https://opencode.ai/docs/models/)
- [Open Code, CLI](https://opencode.ai/docs/cli/)
:::

::: notes
Claude Code : l'option `--model` prend l'identifiant complet (exemple de la doc : `claude --model claude-sonnet-5`). Le dépôt tickets-api l'épingle aussi dans `.claude/settings.json`, clé `model` (doc Settings : « "model": "claude-sonnet-5" » en exemple de fichier d'équipe ; contenu vérifié par `gh api` le 25 octobre 2026).
Open Code : la doc annonce `--model`/`-m` sur la TUI, mais `opencode --help` en v2.0.32 ne la montre pas (relevé du 25 octobre 2026). `-m` existe sur `opencode run`, utilisé par le rejeu. Format `provider/model`. Donc modèle fixé par `opencode.json`.
Jamais deux `opencode run` en parallèle. Avant le module 1 : `opencode mcp list` de chauffe.
:::

## Les deux agents de code jouent chaque démonstration sur le même dépôt. {.statement kicker="Environnement"}

::: notes
Conclut la section : seuls la commande, le fichier de contexte et la configuration diffèrent d'un agent de code à l'autre. Les slides ne montrent une variante par outil que là où elles diffèrent.
:::

## Définition d'une limitation {kicker="Limitations"}

![Deux barres : le code produit dépasse la ligne de limitation, le code relu l'atteint sans la franchir](images/00-limitation.svg)

Une limitation est ce que l'agent de code ne dépasse pas seul, même avec une spécification et un harnais.

::: notes
Un défaut de prompt ou de méthode se corrige sans changer d'outil ; une limitation subsiste une fois spécification et harnais en place.
Le mot est choisi pour la suite de la journée : on ne dit ni plafond, ni goulot, ni blocage.
Le schéma est une illustration. Archétype repris au module 2 : l'agent produit plus de code que l'équipe n'en relit.
:::

## Quatre modules, quatre limitations {kicker="Limitations"}

| Limitation | Module |
|---|---|
| l'agent de code n'a que ses outils d'origine, sans rien de plus installé | 1 Automatiser plus loin |
| l'agent de code produit plus de code que l'équipe n'en relit | 2 Revue de code automatisée |
| l'agent de code peut contourner une règle que rien ne vérifie | 3 Hooks et pipeline |
| le code du dépôt quitte le poste à chaque appel du modèle | 4 Modèles locaux |

::: notes
Classement du support, pas une source externe. Les termes de chaque colonne droite sont définis dans leur module : ne pas entrer dans le détail.
Lecture : une ligne, une limitation, un module qui y répond.
:::

## Cas vécus depuis la formation {kicker="Limitations"}

| Artefact ou méthode en place | Ce qui a cassé | Limitation atteinte |
|---|---|---|
| 1 (illustration) | revue des pull requests par l'équipe | l'agent de code produit plus de code que l'équipe n'en relit |
| 2 | | |
| 3 | | |

::: notes
Question posée à la salle : un cas vécu depuis la formation initiale. Une ligne par cas, noter l'artefact ou la méthode en place, ce qui a cassé, puis désigner la limitation par son numéro de module.
Chaque cas cité est renvoyé au module de la limitation correspondante et repris à ce module. Un cas hors des quatre limitations : le noter, le reprendre à la clôture.
Première ligne : illustration inventée, pour montrer le format.
:::

## Les modules 1 à 4 répondent chacun à une limitation. {.statement kicker="Limitations"}

::: notes
Conclut les trois slides : définition, classement, cas de la salle.
Renvoi d'un cas de la salle : demander ce qui a cassé, le rapprocher de la colonne gauche de « Quatre modules, quatre limitations » (outils d'origine : module 1 ; volume à relire : module 2 ; règle contournée : module 3 ; code qui quitte le poste : module 4), puis noter le numéro de module sur la ligne. La suite présente le matériel avec lequel les réponses sont jouées.
:::

## Contenu de l'archive {kicker="Matériel"}

L'archive regroupe le support et les démonstrations.

```console
$ unzip dlaia-avance.zip -d ~
$ ls ~
dlaia-avance.html  demos
```

::: sources
- `template-support/app/scripts/archive.sh` (composition de l'archive)
:::

::: notes
Archive `dlaia-avance.zip`, produite par `npm run dist` : à plat `dlaia-avance.html` (le support) et `demos/`, sans `.venv`, caches, `node_modules` ni base SQLite. Un dossier par démonstration : `demos/NN-nom/` avec runbook (`README.md`) et script de session.
Le support s'ouvre sans serveur dans un navigateur.
:::

## Le dépôt tickets-api {kicker="Matériel"}

tickets-api est le dépôt de démonstration commun aux modules 1 à 3 : une API de tickets en Python (FastAPI).

| Élément | Claude Code | Open Code |
|---|---|---|
| Fichier de contexte | `CLAUDE.md` | `AGENTS.md` |
| Configuration du modèle | `.claude/settings.json` | `opencode.json` |
| Dossier de configuration | `.claude/` | `.opencode/` |

::: sources
- `demos/00-tickets-api/README.md`
:::

::: notes
Dépôt commun aux modules 1 à 3 (module 4 : démonstration facultative, décidée à son plan). Dépôt d'origine `imihalcea/tickets-api`, privé. `CLAUDE.md` importe `AGENTS.md` : une seule source de contexte pour les deux agents de code.
Les sous-agents, serveurs MCP et hooks du dépôt sont présentés dans leur module.
Les 37 tests sont verts sur `main`. Préalables d'une session : `make db-up`, `make test` (37 verts), `uv sync`. Détail dans le runbook.
:::

## Branches de départ {kicker="Matériel"}

Une branche de départ est la branche de tickets-api sur laquelle une démonstration commence.

| Module (exemples) | Branche de départ |
|---|---|
| 1 | `fix/ticket-ferme-commentaires` |
| 1 | `feat/responsable-priorite-haute-done` |
| 1 | `feat/front` |
| 2 | `demo/revue-defauts` |
| 3 | `demo/hook-harnais` |
| 3 | `demo/build-casse` |

::: sources
- `demos/00-tickets-api/README.md`
:::

::: notes
Liste partielle : les autres démonstrations des modules 1 à 3 partent de `main`. Le module 4 n'a pas de branche.
Branches vérifiées par `gh api` le 25 octobre 2026 sur le dépôt d'origine. Les branches `demo/*` sont des squelettes complétés aux plans des modules 2 et 3.
Autres branches existantes : variantes `-done` et `-sdk`, repli de la démonstration concernée.
:::

## Créer la copie de travail {kicker="Matériel"}

Une copie de travail est une copie privée de tickets-api, créée sur GitHub puis clonée. L'identifiant la nomme : `tickets-api-<identifiant>`.

```console
$ ~/demos/00-tickets-api/session.sh <identifiant>
$ ls ~/travail
tickets-api-<identifiant>
```

::: sources
- `demos/00-tickets-api/session.sh`
:::

::: notes
Le script crée `imihalcea/tickets-api-<identifiant>` (privé, toutes les branches, copie miroir) puis clone dans `~/travail/tickets-api-<identifiant>`. Idempotent : un dépôt ou un clone déjà présent est laissé tel quel. Prérequis : `gh` connecté.
Dans le script, l'argument s'appelle `<session>` ; `<identifiant>` sur la slide évite le mot « session », réservé à l'agent.
Le dépôt d'origine reste intact : aucune issue ni pull request n'y est créée. Une copie par démonstration, supprimable après coup.
Après le clone : `make db-up`, `make test` (37 tests verts sur `main`), `uv sync`.
:::

## Chaque démonstration travaille sur sa propre copie de travail. {.statement kicker="Matériel"}

::: notes
Conclut la section : archive, dépôt, branches, copie de travail. La première démonstration ouvre le module 1.
:::

## Glossaire : agents et modèle {kicker="Glossaire"}

- **Agent de code** : programme en ligne de commande qui pilote un modèle pour lire, écrire et exécuter du code dans un dépôt
- **Claude Code** : agent de code en ligne de commande d'Anthropic
- **Open Code** : agent de code libre en ligne de commande, version 2

|||

- **Fichier de contexte** : fichier lu par l'agent de code au lancement
- **Claude Sonnet 4.6** : modèle unique de la formation, identifiant `claude-sonnet-4-6`
- **Alias** : nom court d'un modèle (`sonnet`) dont la version change avec le fournisseur
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
- **Branche de départ** : branche de tickets-api sur laquelle une démonstration commence

|||

- **Copie de travail** : copie privée de tickets-api créée sur GitHub puis clonée, propre à une démonstration
- **Identifiant** : suffixe qui nomme une copie de travail
- **Archive** : `dlaia-avance.zip`, le support et les dossiers `demos/`
- **Support** : cours compilé, `dlaia-avance.html`

::: notes
Slide de référence, à ne pas lire en salle.
:::
