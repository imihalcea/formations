# Implémenter et vérifier

Exécuter les tâches, faire du scénario le test, mesurer ce que la suite vérifie

::: notes
Module 6, 45 min d'exposé, puis TP 6 partie A (65 min, lancée après la section « Scénario et test ») et TP 6 partie B (40 min, lancée en fin de module). Point de départ : l'idée clé du module 5, « Avant `implement`, le développeur relit chaque artefact et corrige à la main les constats fondés », et l'arrivée du TP 5 : `tasks.md` à quatorze tâches, aucune cochée, `validate_booking` rend toujours `None`, 1 test vert. Question laissée ouverte : qui exécute une tâche, et à quoi reconnaît-on qu'elle est faite.
Trente-trois slides, six sections : point de départ, exécuter une tâche, TDD et BDD, scénario et test, couverture et mutants, converger. Les slides 14 à 16 et 23 à 24 se passent vite : chacune est une commande et sa sortie. Quatre démonstrations : la 2 est un shell (rejouable), les 1, 3 et 4 appellent le modèle (`claude-sonnet-4-6` dans les deux outils) et se jouent sur `hello-spec` ou sur une copie du corrigé, jamais sur le `~/bookit/` d'un stagiaire.
Versions : Spec Kit 1.2.2, Claude Code et Open Code v2, pytest-bdd 9.0.0, cosmic-ray 8.7.0 (`formateur/spec-kit.md`, `formateur/fil-rouge.md`). Les citations de prompt sont celles de `templates/commands/implement.md` et `converge.md` au tag v1.2.2, consultées le 23 octobre 2026 ; les jetons de commande (`__SPECKIT_COMMAND_IMPLEMENT__`, `/memory/constitution.md`) sont remplacés à l'installation par `/speckit-implement` ou `/speckit.implement` et par `.specify/memory/constitution.md`.
Vocabulaire : « suite rouge, suite verte » désigne l'état de la suite de tests ; un test seul « échoue » ou « passe ». « Session » désigne la session de l'agent seulement ; cosmic-ray nomme « session » le fichier SQLite d'une passe, nommé ici `mutation.sqlite`.
:::

## Quatorze tâches, aucune cochée {kicker="Point de départ"}

```console
$ grep -c '^- \[ \] T' specs/001-valider-reservation/tasks.md
14
```

| Question | Qui répond |
|---|---|
| qui exécute une tâche | `implement` |
| à quoi reconnaît-on qu'elle est faite | la case cochée, le diff, la suite de tests |
| avant `implement` | le développeur a relu et corrigé les artefacts (module 5) |

::: sources
- Module 5, idée clé « Avant `implement`, le développeur relit chaque artefact et corrige à la main les constats fondés »
- `formateur/fil-rouge.md`, arrivée du TP 5
:::

::: notes
Reprise du module 5 : `analyze` a croisé spécification, plan et tâches, le développeur a relu et commité `tasks.md`. Le plan dit où va le code et avec quoi il se teste, les tâches dans quel ordre (module 5, « Sept exigences, aucun plan »). Reste à les exécuter une à une.
Valeurs du corrigé `tp/tp05/` : quatorze tâches non cochées, une seule ligne de test `1 passed` (le test de fumée, module 3). `validate_booking` du squelette (`fil-rouge/bookit/domain/validate_booking.py`) rend `None` : une demande de 5 minutes un dimanche est acceptée. La durée de `pytest` (`1 passed in 0.xxs`) est omise de la slide.
Poser la deuxième question à la salle avant la réponse : « l'agent dit que c'est fait » ne suffit pas. Réponse attendue : trois preuves lisibles sans l'agent, la case dans `tasks.md`, le diff, la dernière ligne de `pytest`. Les slides 2 à 6 les développent.
:::

## Entrées et sorties d'`implement` {kicker="Exécuter une tâche"}

![implement : le script check-prerequisites.sh, puis les listes de contrôle où une case non cochée arrête la commande sur une question, puis la lecture de tasks.md, plan.md, data-model.md, research.md, quickstart.md et constitution.md, la vérification de .gitignore, l'exécution phase par phase avec le test avant le code, la coche [X] dans tasks.md et un rapport ; la commande s'invoque /speckit-implement sous Claude Code et /speckit.implement sous Open Code](images/06-implement.svg)

::: sources
- [Spec Kit, `templates/commands/implement.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/implement.md)
- `formateur/spec-kit.md` § 4
:::

::: notes
Prompt `implement` 1.2.2, cité au mot près : « Check checklists status », « Create/verify ignore files based on actual project setup », « For completed tasks, make sure to mark the task off as [X] in the tasks file ». Fichiers lus à l'étape 3 : `tasks.md` et `plan.md` (obligatoires), `data-model.md`, `contracts/`, `research.md`, la constitution et `quickstart.md` (s'ils existent). Le prompt vérifie aussi `.specify/extensions.yml` (hooks) ; non représenté.
L'arrêt sur liste de contrôle porte sur les listes de contrôle de `checklists/` (module 4, `checklists/requirements.md` écrite par `specify`), pas sur `tasks.md`. Aucune flèche vers git : le prompt ne contient pas le mot « commit » (slide suivante).
Le schéma n'indique ni `contracts/` (absent de bookit) ni les phases elles-mêmes : l'ordre des phases est celui du `tasks.md` du module 5.
:::

## Quatre règles du prompt `implement` {.facts kicker="Exécuter une tâche"}

- **Liste de contrôle** une case non cochée arrête la commande sur une question
- **Test avant code** les tâches de test s'exécutent avant les tâches de code correspondantes
- **Arrêt au premier échec** une tâche non parallèle qui échoue arrête l'exécution
- **Coche, sans commit** `[X]` dans `tasks.md`, aucune ligne du prompt ne commite

::: sources
- [Spec Kit, `templates/commands/implement.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/implement.md)
:::

::: notes
Citations en entier (prompt `implement` 1.2.2, vérifiées le 23 octobre 2026) : « STOP and ask: "Some checklists have unchecked items. Do you want to proceed with implementation anyway? (yes/no)" » ; « Follow TDD approach: Execute test tasks before their corresponding implementation tasks » ; « Halt execution if any non-parallel task fails » ; « IMPORTANT For completed tasks, make sure to mark the task off as [X] in the tasks file ». Le mot « commit » n'apparaît pas dans le fichier (zéro occurrence).
Le stagiaire commite lui-même après chaque étape (`formateur/fil-rouge.md`, contraintes). Dans les TP, `implement` est limité par l'argument et lancé en session neuve : l'arrêt au premier échec ne protège que l'intérieur d'une exécution.
Piège de l'arrêt sur liste de contrôle : répondre « no » à la question et rester bloqué. La liste de contrôle porte sur la spécification relue au TP 4 ; répondre `yes`.
:::

## `implement` limité à une tâche {kicker="Exécuter une tâche"}

Argument de la commande :

```prompt
Fais seulement T001, puis arrête-toi et rends la main. Ne commence aucune autre tâche.
```

```console
$ git status --short
 M specs/001-valider-reservation/tasks.md
?? tests/test_valider_reservation.py
$ grep -c '^- \[[xX]\]' specs/001-valider-reservation/tasks.md
1
```

::: sources
- [Spec Kit, `templates/commands/implement.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/implement.md)
- Module 5, idée clé « Le format s'écrit une fois dans le template, l'exception dans l'argument »
:::

::: notes
Démonstration 1 (appelle le modèle, `claude-sonnet-4-6`). Prompt : `/speckit-implement Fais seulement T001, puis arrête-toi et rends la main. Ne commence aucune autre tâche.` (ou `/speckit.implement …`). Déroulé : dans `demo-claude` et `demo-opencode` (`hello-spec` des modules 4 et 5, après `tasks` et `analyze` de la démonstration 3 du module 5) ; `git init` et un commit avant, pour lire le diff ; lire les permissions ; `git status --short`, `grep -c '^- \[[xX]\]' specs/*/tasks.md`. Sous Claude Code, la question de l'arrêt sur liste de contrôle (« Voulez-vous continuer l'implémentation quand même ? (oui/non) ») arrive en premier, la liste de contrôle ayant deux cases non cochées : répondre `oui` pour obtenir T001 (en `claude -p`, un second appel avec `--resume`). Résultat attendu : la commande s'arrête après T001 ou enchaîne ; une case cochée ou plusieurs ; `.gitignore` créé ou modifié par l'étape « Project Setup Verification » ; la question de l'arrêt sur liste de contrôle si une liste de contrôle a une case non cochée. Relevé du 23 octobre 2026, `hello-spec` de 23 tâches. Claude Code : une seule tâche exécutée, une case cochée, fichiers touchés `backend/pyproject.toml`, `.gitignore`, `tasks.md` (`backend/` en `??`), 78 s pour les deux appels (38 s jusqu'à la question, 40 s après `oui`), aucun commit. Open Code (`hello-spec` de 56 tâches, `--auto`) : une case cochée sur 56, `.gitignore` et `.env.example` créés, 24 s, et l'agent a commité lui-même (`git add`, `git commit`) : `git status --short` est vide après, et le déroulé « lire le diff » se fait par `git show --stat HEAD`. Open Code ne pose pas la question de l'arrêt sur liste de contrôle. Le TP impose « l'agent ne commite pas » ; l'argument de la démonstration ne l'interdit pas, d'où un prompt à durcir (« Ne commite pas ») si l'on veut un arbre sale. Lecture des permissions dans le menu de la TUI : non rejouable hors TUI, à vérifier sur la VM.
Prompt `implement` : « You **MUST** consider the user input before proceeding (if not empty) » ; la fin de la commande vise la liste entière (« All tasks in tasks.md completed and marked `[X]` »). L'argument la limite ; `git status --short` et le compte des cases disent si la limite a tenu. `git diff --stat` ne liste pas le fichier de test, qui est nouveau et non suivi : `git status --short` le montre.
Le fichier de la tâche est nouveau à T001, d'où `??` ; à partir de T002 il apparaît en ` M`.
:::

## Une session par tâche {.compare kicker="Exécuter une tâche"}

::: claude-code
```console
/clear
/speckit-implement Fais seulement T002 …
```

La session neuve lit d'abord `AGENTS.md`, puis `tasks.md` par la commande.
:::

::: opencode
```console
/new
/speckit.implement Fais seulement T002 …
```

La session neuve lit d'abord `AGENTS.md`, puis `tasks.md` par la commande.
:::

::: sources
- [Claude Code, Best practices, « Manage context aggressively »](https://code.claude.com/docs/en/best-practices)
- [Open Code, TUI](https://opencode.ai/docs/tui/)
- `formateur/equivalences.md`, « Fichier de contexte et mémoire »
:::

::: notes
Claude Code, Best practices : « Use `/clear` frequently between tasks to reset the context window entirely ». Open Code, TUI : `/new`, « Start a new session. Alias: `/clear` » ; le support n'emploie que `/new` sous Open Code, `formateur/equivalences.md` (« Nouvelle conversation ») relevant une commande `/clear` distincte dans le code v2.0.26. La tâche suivante part du disque : `tasks.md` coché, diff commité, sans les choix de la session précédente (module 5, « Une tâche par session »).
Permissions du fil rouge (`fil-rouge/.claude/settings.json`, `fil-rouge/opencode.json`) : `uv run pytest *` et les scripts `.specify/scripts/bash/*` passent sans question dans les deux outils ; chaque écriture est demandée (Claude Code en Manual, `edit` en `ask` sous Open Code). Renvoi au module 1, slide « Permission et session neuve ».
Durée : si une tâche `implement` limitée par l'argument dépasse trois minutes sous `claude-sonnet-4-6`, le TP passe à une session par règle pour REG-02 à REG-05 ; durées à relever au rejeu.
:::

## Relire le diff d'une tâche {kicker="Exécuter une tâche"}

| Tâche | `git status --short`, hors `tasks.md` | Suite de tests : `uv run pytest -q` |
|---|---|---|
| socle de test (T001) | `tests/test_valider_reservation.py` | `1 passed` |
| Test REG-NN | `tests/` seul | `N failed` |
| Code REG-NN | `bookit/domain/validate_booking.py` seul | tous passent |

Une tâche Code qui modifie `tests/` se rejoue depuis `git restore .`.

::: sources
- [Claude Code, Best practices, « Give Claude a way to verify its work »](https://code.claude.com/docs/en/best-practices)
- `tp/fichiers/tasks-template.md`, une paire Test puis Code, fichier interne dont les colonnes tirent la lecture du diff
:::

::: notes
Claude Code, Best practices : « Have Claude show evidence rather than asserting success: the test output, the command it ran and what it returned ». Le `git status --short` (ou `git diff --stat` une fois le fichier suivi) et la dernière ligne de `pytest` se lisent avant le diff complet. La paire Test puis Code du template porte le même fichier de test et le même fichier de code ; `bookit/application` et `bookit/infrastructure` restent intacts depuis le squelette (`git log --oneline -- bookit/application bookit/infrastructure` : un seul commit).
Une tâche Code qui touche `tests/` a réécrit le test au lieu du code : le test ne bouge pas pendant une tâche Code. `git restore .` annule les fichiers suivis ; un fichier nouveau se retire à la main.
Relecture du diff en deux temps (TP 6) : conformité (le bon fichier, refus par valeur de retour, aucune lecture de l'horloge, constitution) puis simplicité (rien de plus que la règle).
:::

## Le développeur vérifie chaque tâche sur `tasks.md`, le diff et `pytest`. {.statement kicker="Exécuter une tâche"}

::: notes
Conclut les slides 2 à 6 : ce que lit et écrit `implement`, ses quatre règles, la limite par l'argument, la session neuve, le diff relu. Ce que « la suite fait foi » suppose : un test écrit avant le code et qui a échoué, sinon un test vert ne prouve rien. C'est l'objet de la section suivante.
:::

## TDD : rouge, vert, remaniement {kicker="TDD et BDD"}

![TDD, test-driven development : un cycle à trois temps. Test : suite rouge, au moins un test échoue (uv run pytest -q, N failed). Code : suite verte, tous les tests passent (N passed). Remaniement : suite verte. Le cycle recommence au comportement suivant](images/06-tdd.svg)

::: sources
- [Fowler, « Test Driven Development », bliki](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- Beck, *Test-Driven Development: By Example*, Addison-Wesley, 2002
:::

::: notes
Définitions du lexique, portées par les étiquettes du schéma : TDD (test-driven development) et suite rouge, suite verte (rouge, au moins un test échoue ; verte, tous passent). Un test seul échoue ou passe.
Fowler, mis à jour le 11 décembre 2023 : « Write a test for the next bit of functionality you want to add. Write the functional code until the test passes. Refactor both new and old code to make it well structured. » ; « It was developed by Kent Beck in the late 1990's as part of Extreme Programming ». Beck, 2002 : référence du cycle rouge, vert, remaniement (livre non consulté en ligne, cité comme référence).
La suite rouge puis verte est la preuve que le test teste quelque chose : un test qui n'a jamais échoué peut ne rien vérifier. Dans les TP, le remaniement est limité : une fonction par règle (plan) et `ruff` en finition.
:::

## BDD : le scénario comme test {kicker="TDD et BDD"}

![BDD, behaviour-driven development : le scénario REG-01 de spec.md puis du fichier valider-reservation.feature, écrits avant le code, lus par pytest-bdd, qui exécute tests/test_valider_reservation.py et validate_booking, écrits au TP 6, jusqu'à la suite](images/06-bdd.svg)

::: sources
- [North, « Introducing BDD », 20 septembre 2006](https://dannorth.net/blog/introducing-bdd/)
- Module 2, slide « Gherkin : Soit, Quand, Alors »
- Module 4, slide « REG-05 en deux scénarios Gherkin »
:::

::: notes
Définition du lexique, portée par l'étiquette du schéma : BDD (behaviour-driven development) fait des scénarios Gherkin des tests exécutés. North, 20 septembre 2006 (paru dans *Better Software*, mars 2006) : « I started to refer to TDD as BDD, or behaviour-driven development » ; premier titre de section : « Test method names should be sentences » ; le modèle « Given some initial context (the givens), When an event occurs, Then ensure some outcomes », mis au point avec l'analyste Chris Matts. En français : Soit, Quand, Alors.
Les scénarios de `spec.md` (TP 4 et 5) et du `.feature` (TP 5) sont ces phrases, écrites avec le responsable produit avant le code ; pytest-bdd les exécute (slide 12). Deux artefacts à gauche existent déjà au début du TP 6, deux à droite s'écrivent pendant le TP.
:::

## TDD et BDD dans bookit {kicker="TDD et BDD"}

| Pratique | Ce qui l'impose dans bookit | Où |
|---|---|---|
| l'ordre : test puis code | la paire Test REG-NN puis Code REG-NN | `tasks.md` |
| la forme du test | le scénario Gherkin | `valider-reservation.feature` |
| le cas à tester | l'exigence et sa borne | `spec.md` |

::: sources
- [Spec Kit, `templates/commands/implement.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/implement.md)
- Module 4, slide « Ce que chaque format fixe »
:::

::: notes
Le prompt `implement` dit « Follow TDD approach: Execute test tasks before their corresponding implementation tasks » ; le mot « TDD » est aussi celui que `tasks` attend au TP 5 (« tests obligatoires »). Le template de tâches de bookit (`tp/fichiers/tasks-template.md`) impose une tâche Test avant chaque tâche Code.
Aucun test n'est écrit hors du `.feature` : un test écrit dans `tests/` seul a une forme que personne n'a relue (slide 25, trou dans les tests).
:::

## Un scénario de refus devient un test qui échoue avant le code. {.statement kicker="TDD et BDD"}

::: notes
Conclut les slides 8 à 10 : le cycle de TDD, le scénario comme test de BDD, ce que chacun impose dans bookit. Comment un scénario en français devient un test Python : section suivante.
:::

## Lier le `.feature` aux tests {kicker="Scénario et test"}

**`scenarios()` : tous les scénarios d'un coup**

```python
from pytest_bdd import scenarios

scenarios("../specs/001-valider-reservation/valider-reservation.feature")
```

Tous les tests naissent rouges, avant le code.

|||

**`@scenario` : un scénario à la fois, retenu par bookit**

```python
from pytest_bdd import scenario

FEATURE = "../specs/001-valider-reservation/valider-reservation.feature"


@scenario(FEATURE, "REG-01, durée de 29 minutes")
def test_reg01_29_minutes(): ...
```

|||

::: sources
- [pytest-bdd, documentation stable](https://pytest-bdd.readthedocs.io/en/stable/)
- [pytest-bdd, changelog 8.0.0](https://pytest-bdd.readthedocs.io/en/stable/#changelog)
:::

::: notes
pytest-bdd, documentation stable : `scenarios('features')` lie tous les scénarios trouvés ; `scenarios()` accepte plusieurs chemins, fichiers `.feature` ou dossiers (reformulation, la phrase exacte de la documentation n'est pas revérifiée) ; `@scenario('publish_article.feature', 'Publishing the article')` lie un scénario nommé à une fonction. Changelog 8.0.0 : « Added localization support. The language of the feature file can be specified using the *# language: <language>* directive » : `# language: fr` est accepté depuis 8.0.0 ; pytest-bdd 9.0.0 (30 septembre 2026) est installé par `uv sync` dans le fil rouge. Mots-clés français reconnus (Cucumber, Gherkin languages, `fr`) : Fonctionnalité, Scénario ou Exemple, Soit (ou Étant donné), Quand (ou Lorsque), Alors, Et, Mais.
Pourquoi `@scenario` pour bookit : avec `scenarios()`, les dix-neuf scénarios seraient liés dès T001, la suite serait rouge sur tous les refus et les tâches Test REG-NN n'auraient rien à faire ; la paire Test puis Code perdrait son sens. Avec `@scenario`, T001 laisse la suite verte, Test REG-01 lie quatre scénarios, Code REG-01 les fait passer.
Le bloc `scenarios()` est un exemple inventé, écarté pour bookit. La constante `FEATURE` et la liaison `@scenario` sont citées du corrigé `tp/tp06/tests/test_valider_reservation.py` (testé sous Python 3.14, 26 tests verts).
:::

## Une définition d'étape par phrase {kicker="Scénario et test"}

Une définition d'étape est une fonction Python liée à une phrase du `.feature`.

| Mot-clé | Définition d'étape |
|---|---|
| Soit | une fixture (`now`) |
| Quand | l'appel de `validate_booking`, résultat en fixture |
| Alors | un `assert` sur `None` ou sur `.code` |

Une fixture est une valeur que pytest fournit à un test ou à une étape.

::: sources
- [pytest-bdd, documentation stable](https://pytest-bdd.readthedocs.io/en/stable/)
:::

::: notes
Définition du lexique, portée par l'en-tête du tableau : une définition d'étape est une fonction Python liée par `parsers.parse` à une phrase Soit, Quand ou Alors du `.feature` ; `target_fixture` fait d'une étape Soit une fixture que les étapes suivantes reçoivent. pytest-bdd : `parsers.parse` « replaces regular expressions for step parameters with a readable syntax like `{param:Type}` » ; « special parameter target_fixture exists in the given decorator ».
Le `.feature` du TP 5 a sept formes de phrase pour dix-neuf scénarios : `Soit l'instant courant fixé au …`, `Quand une demande vise la salle {A ou B} le …`, la même suivie de « , jugée deux fois », `Et la salle A réservée le …`, `Alors la demande est acceptée`, `Alors la demande est refusée avec le code {code}`, `Alors la demande est acceptée les deux fois`. Les trois définitions de la slide suivante donnent le modèle des quatre autres.
:::

## Trois définitions d'étape {kicker="Scénario et test"}

```python file="../tp/tp06/tests/test_valider_reservation.py" lines="37-49"
```

::: sources
- [pytest-bdd, documentation stable](https://pytest-bdd.readthedocs.io/en/stable/)
:::

::: notes
Une définition par mot-clé : `@given` fixe l'instant courant et le range dans la fixture `now`, `@when` appelle `validate_booking` et range la décision dans `resultat`, `@then` la compare. Changelog pytest-bdd, 4.0.0 : « Given step is no longer a fixture » ; 6.0.0 : « Step arguments are no longer fixtures ». Sans `target_fixture`, le résultat de `Quand` n'arrive pas à `Alors`.
Bloc cité du corrigé `tp/tp06/tests/test_valider_reservation.py`. Les quatre autres définitions du corrigé : `Et la salle A réservée le …` (range le créneau dans la fixture `salles`, qui porte les ressources A et B), la demande suivie de « , jugée deux fois » (rend la liste des deux décisions), `Alors la demande est refusée avec le code {code}` et `Alors la demande est acceptée les deux fois`.
:::

## T001 : la suite reste verte {kicker="Scénario et test"}

```python file="../tp/tp06/tests/test_valider_reservation.py" lines="10-10"
```

```console
$ grep -c '^@\(given\|when\|then\)' tests/test_valider_reservation.py
7
$ uv run pytest -q
1 passed
$ grep -c '@scenario' tests/test_valider_reservation.py
0
```

::: sources
- `tp/fichiers/tasks-template.md`, phase « socle de test »
- Module 5, slide « Tâches : le template de bookit »
:::

::: notes
T001 écrit le fichier de test avec les définitions d'étape et la constante `FEATURE` (ligne 10 du corrigé), sans lier aucun scénario : la suite reste verte à 1 test (le test de fumée) et chaque tâche Test REG-NN s'appuie sur ce socle. Les sept définitions correspondent aux sept formes de phrase du `.feature` ; les `@given`, `@when` et `@then` du corrigé sont aux lignes 37 à 73, après `MOIS`, `lire_instant`, `lire_creneau` et la fixture `salles`. Valeurs après T001 : `1 passed`, aucun `@scenario` (à confirmer au rejeu). Le code produit par l'agent varie.
Piège : l'agent lie tous les scénarios par `scenarios()` ; le `grep -c '@scenario'` à `0` ne le voit pas, `grep -c 'scenarios(' tests/test_valider_reservation.py` doit aussi donner `0`. Valeurs à confirmer au rejeu.
:::

## Test REG-01 : quatre scénarios liés {kicker="Scénario et test"}

```python file="../tp/tp06/tests/test_valider_reservation.py" lines="77-90"
```

::: sources
- `tp/tp05/specs/001-valider-reservation/valider-reservation.feature`, quatre scénarios REG-01
:::

::: notes
La tâche Test REG-01 lie les quatre scénarios de la durée par `@scenario`, une fonction `test_…` par scénario, au corps vide : le comportement est dans les définitions d'étape. Bloc cité du corrigé. Les noms de fonctions de l'agent diffèrent : à relever au rejeu.
:::

## Test REG-01 : deux échecs attendus {kicker="Scénario et test"}

```console
$ uv run pytest -q
FAILED tests/test_valider_reservation.py::test_reg01_29_minutes
FAILED tests/test_valider_reservation.py::test_reg01_4_h_01
2 failed, 3 passed
```

::: sources
- `tp/tp05/specs/001-valider-reservation/valider-reservation.feature`, quatre scénarios REG-01
:::

::: notes
`validate_booking` rend `None` : les deux scénarios acceptés (30 minutes, 4 heures pile) passent, les deux refusés (10h29, 14h01) échouent, plus le test de fumée : `2 failed, 3 passed`. La suite est rouge, et les deux échecs nomment les durées de 29 minutes et de 4 heures 1 : le test teste quelque chose. Noms de tests et ligne finale à relever au rejeu.
Piège : l'agent « corrige » `validate_booking.py` pour faire passer la suite ; la tâche Test ne modifie pas `bookit/`. Quatre réussites au lieu de deux échecs : les titres liés ne sont pas ceux de REG-01, comparer avec `grep 'Scénario: REG-01' specs/001-valider-reservation/valider-reservation.feature`.
:::


## Code REG-01 : une fonction {kicker="Scénario et test"}

```python file="../tp/tp06/bookit/domain/validate_booking.py" lines="5-13"
```

::: sources
- `tp/tp05/specs/001-valider-reservation/plan.md`, une règle par fonction
- Module 5, slide « Le COMMENT de `validate_booking` »
:::

::: notes
La tâche Code REG-01 ajoute une fonction interne et l'appel dans `validate_booking` ; le diff ne touche que le fichier du domaine, la suite repasse au vert à cinq tests. Le plan du TP 5 fixait « une règle par fonction interne » ; le diff le montre. Le refus se rend par valeur (`InvalidBooking("duration")`), jamais par exception (ADR 1) ; aucune lecture de l'horloge.
Montée de la suite pendant le TP : 1, 5, 17, 20 tests de T001 à T014 ; `uv run pytest -q --collect-only | tail -1` donne `20 tests collected` en fin de partie A. Le diff de la tâche Code REG-01 sur le corrigé (12 insertions, 2 suppressions) est celui de la slide « suite verte » ; celui de l'agent diffère, à relever au rejeu.
Le code est un exemple de la forme attendue ; celui de l'agent diffère par les noms et le style.
Bloc cité du corrigé `tp/tp06/bookit/domain/validate_booking.py` : les constantes et `_check_duration`. À ce stade `validate_booking` n'appelle que `_check_duration` ; le corrigé final enchaîne les cinq règles par `or`.
:::

## Code REG-01 : suite verte {kicker="Scénario et test"}

```console
$ git diff --stat HEAD -- bookit tests
 bookit/domain/validate_booking.py | 14 ++++++++++++--
 1 file changed, 12 insertions(+), 2 deletions(-)
$ uv run pytest -q
5 passed
```

::: sources
- `tp/tp05/specs/001-valider-reservation/plan.md`, une règle par fonction
:::

::: notes
Le diff ne touche que le fichier du domaine et la suite passe de 1 à 5 tests. Montée de la suite pendant le TP : 1, 5, 17, 20 tests de T001 à T014. Valeurs à relever au rejeu.
:::

## Le dimanche, sans scénario {kicker="Scénario et test"}

```markdown file="../tp/tp05/specs/001-valider-reservation/spec.md" lines="189-189"
```

| Cas | Scénario | Test |
|---|---|---|
| samedi 6 juin | `REG-02, samedi` | passe |
| 7h59 | `REG-02, début à 7h59` | passe |
| dimanche 7 juin | aucun scénario | aucun test pour le dire |

::: sources
- `tp/tp05/specs/001-valider-reservation/spec.md`, REG-02
- `tp/fichiers/regles-metier.md`, REG-02
- Module 2, slide « EARS, une phrase à mots-clés »
:::

::: notes
Le `.feature` du TP 5 teste le samedi et aucun scénario ne nomme le dimanche : à dessein (`formateur/fil-rouge.md`). La suite verte prouve dix-neuf scénarios et rien sur ce jour, que le code traite ou non. Vérification : `grep -c dimanche specs/001-valider-reservation/valider-reservation.feature` donne `0`.
L'exigence REG-02 de `spec.md` dit « du lundi au vendredi » : le dimanche est refusé par l'exigence, pas par un scénario. Le code de référence écrit `booking.start.weekday() >= 5` ; le samedi suffit à le faire exécuter, ce qui prépare la slide sur la couverture.
:::

## Dix-neuf scénarios verts ne disent rien d'un cas qu'aucun ne nomme. {.statement kicker="Scénario et test"}

::: notes
Conclut les slides 12 à 17 : liaison par `@scenario`, définitions d'étape, socle, paire Test puis Code, cas sans scénario. La partie A du TP 6 exécute les quatorze tâches ; la section suivante cherche les cas sans test par la mutation.
:::

## Partie A : implémenter `validate_booking` {.tp duration="65 min" kicker="TP 6"}

Exécuter les quatorze tâches de `tasks.md` avec `implement`, une par session. Cinq commits faits à la main.

::: notes
Point de départ : arrivée du TP 5 (14 commits, `tasks.md` à quatorze tâches non cochées, `valider-reservation.feature` à dix-neuf scénarios, `plan.md`, `.specify/templates/tasks-template.md` modifié, `validate_booking` rend `None`, 1 test vert). Arrivée : 19 commits, `git status --short` vide, `tests/test_valider_reservation.py` (définitions d'étape et dix-neuf `@scenario`), `bookit/domain/validate_booking.py` (une fonction par règle), `tasks.md` tout coché, suite verte à 20 tests, `bookit/application` et `bookit/infrastructure` intacts.
Durées prévues : 9 min pour le socle, 8 pour Test REG-01, 9 pour Code REG-01, 24 pour REG-02 à REG-05, 10 pour les tâches restantes et le `curl`, 5 de débrief. Durées, permissions et nombres de tours : à relever au rejeu, dans les deux outils.
Débrief, deux questions : ce que le `git diff --stat` d'une tâche Code a montré et ce qui a bougé hors du fichier attendu ; pourquoi T012 et T013 passent sans tâche Code (les règles sont déjà enchaînées dans l'ordre).
Pièges : laisser `implement` enchaîner les tâches ; accepter une tâche Code qui modifie `tests/` ; commiter une suite rouge par oubli de la tâche Code, ou ne pas commiter l'échec de REG-01 ; laisser `.gitignore` ou `pyproject.toml` modifiés par `implement` ; répondre « no » à l'arrêt sur liste de contrôle et rester bloqué.
Non rejouable hors TUI : la question « Do you want to proceed » posée en session (le rejeu met la réponse dans l'argument), à vérifier sur la VM.
:::

### Socle de test

Dans `~/bookit`, lancer l'outil et invoquer `implement` limité à la tâche T001. L'argument interdit à l'agent d'enchaîner la tâche suivante.

::: claude-code
```console
$ claude
```
:::

::: opencode
```console
$ opencode
```
:::

::: claude-code
```prompt
/speckit-implement Fais seulement T001, le socle de test, puis arrête-toi et rends la main : écris `tests/test_valider_reservation.py` avec une constante `FEATURE` vers `specs/001-valider-reservation/valider-reservation.feature` et les définitions d'étape pytest-bdd des phrases du fichier, sans lier aucun scénario ; lance `uv run pytest -q` ; coche T001. Ne commence aucune autre tâche, ne modifie rien d'autre.
```
:::

::: opencode
```prompt
/speckit.implement Fais seulement T001, le socle de test, puis arrête-toi et rends la main : écris `tests/test_valider_reservation.py` avec une constante `FEATURE` vers `specs/001-valider-reservation/valider-reservation.feature` et les définitions d'étape pytest-bdd des phrases du fichier, sans lier aucun scénario ; lance `uv run pytest -q` ; coche T001. Ne commence aucune autre tâche, ne modifie rien d'autre.
```
:::

Quitter par `/exit`. `git diff` ne montre pas un fichier non suivi : `git status --short` liste `tasks.md` modifié et le fichier de test en `??`. Ajouter tout, lire le diff, puis commiter.

```console
$ git status --short
$ git add -A
$ git diff --cached --stat
$ git commit -m "TP 6 : socle de test"
```

::: attendu
```console
$ uv run pytest -q
1 passed
$ grep -c '@scenario' tests/test_valider_reservation.py
0
$ grep -c '^- \[[xX]\]' specs/001-valider-reservation/tasks.md
1
$ git log --oneline | wc -l
15
```
Avant le commit, `git status --short` donne ` M specs/001-valider-reservation/tasks.md` puis `?? tests/test_valider_reservation.py`. Sortie provisoire, à relever au rejeu.
:::

::: indice
`implement` enchaîne T002 : `git restore . && git clean -fd tests`, puis relancer dans une session neuve avec « Fais seulement T001 » en tête. La question « Some checklists have unchecked items. Do you want to proceed with implementation anyway? (yes/no) » : répondre `yes`, la liste de contrôle porte sur la spécification relue au TP 4. `.gitignore` modifié par `implement` (motifs Python) : `git checkout -- .gitignore`, le squelette les contient déjà. Le fichier lie tous les scénarios par `scenarios()` : demander de la retirer, « T001 ne lie aucun scénario ».
:::

### Test REG-01

Session neuve : relancer l'outil, puis invoquer `implement` limité à T002. Lire la sortie de `pytest` : deux scénarios échouent et leurs noms citent les durées de 29 minutes et de 4 heures 1.

::: claude-code
```console
$ claude
```
:::

::: opencode
```console
$ opencode
```
:::

::: claude-code
```prompt
/speckit-implement Fais seulement T002, Test REG-01, puis arrête-toi : lie par `@scenario(FEATURE, "<titre>")` les quatre scénarios dont le titre commence par `REG-01` dans `tests/test_valider_reservation.py`, une fonction `test_…` par scénario ; lance `uv run pytest -q`, deux scénarios doivent échouer ; ne modifie pas `bookit/` ; coche T002.
```
:::

::: opencode
```prompt
/speckit.implement Fais seulement T002, Test REG-01, puis arrête-toi : lie par `@scenario(FEATURE, "<titre>")` les quatre scénarios dont le titre commence par `REG-01` dans `tests/test_valider_reservation.py`, une fonction `test_…` par scénario ; lance `uv run pytest -q`, deux scénarios doivent échouer ; ne modifie pas `bookit/` ; coche T002.
```
:::

Quitter par `/exit`, puis commiter la suite rouge.

```console
$ git add -A
$ git commit -m "TP 6 : REG-01 en échec"
```

::: attendu
```console
$ uv run pytest -q | tail -1
2 failed, 3 passed
$ git diff --stat HEAD~1 -- bookit
$ grep -c '^- \[[xX]\]' specs/001-valider-reservation/tasks.md
2
$ git log --oneline | wc -l
16
```
Sortie provisoire, à relever au rejeu.
:::

::: indice
L'agent « corrige » `validate_booking.py` pour faire passer la suite : `git restore bookit`, puis relancer avec « ne modifie pas `bookit/` » en tête. Quatre réussites au lieu de deux échecs : les titres liés ne sont pas ceux de REG-01, comparer avec `grep 'Scénario: REG-01' specs/001-valider-reservation/valider-reservation.feature`. Erreur de collecte sur une phrase sans définition d'étape : la phrase du `.feature` et le `parsers.parse` diffèrent d'un caractère, les aligner à la main.
:::

### Code REG-01

Session neuve, `implement` limité à T003. Relire le diff en deux temps : conformité, puis simplicité.

::: claude-code
```console
$ claude
```
:::

::: opencode
```console
$ opencode
```
:::

::: claude-code
```prompt
/speckit-implement Fais seulement T003, Code REG-01, puis arrête-toi : écris la règle de durée dans `bookit/domain/validate_booking.py`, une fonction interne appelée par `validate_booking`, comme `plan.md` le fixe ; lance `uv run pytest -q`, tout doit passer ; ne modifie pas `tests/` ; coche T003.
```
:::

::: opencode
```prompt
/speckit.implement Fais seulement T003, Code REG-01, puis arrête-toi : écris la règle de durée dans `bookit/domain/validate_booking.py`, une fonction interne appelée par `validate_booking`, comme `plan.md` le fixe ; lance `uv run pytest -q`, tout doit passer ; ne modifie pas `tests/` ; coche T003.
```
:::

Quitter par `/exit`, puis commiter.

```console
$ git add -A
$ git commit -m "TP 6 : REG-01 vert"
```

::: attendu
```console
$ uv run pytest -q | tail -1
5 passed
$ git diff --stat HEAD~1 -- bookit tests | tail -1
 1 file changed, 12 insertions(+), 2 deletions(-)
$ git diff --stat HEAD~1 -- tests
$ git log --oneline | wc -l
17
```
Sortie provisoire, à relever au rejeu.
:::

::: indice
Critères du diff. Conformité : seul `validate_booking.py` change, le refus est une valeur de retour `InvalidBooking("duration")`, aucune lecture de l'horloge. Simplicité : une fonction, deux constantes, rien de plus que REG-01. L'agent écrit les cinq règles d'un coup : `git restore bookit`, puis relancer avec « seulement REG-01, la durée ». L'agent lève une exception : la constitution l'interdit (ADR 1), le dire dans un second prompt de la même session, « rends `InvalidBooking("duration")` ». L'agent touche `tests/` : `git restore tests`, le test ne bouge pas pendant une tâche Code.
:::

### REG-02 à REG-05

Huit tâches, T004 à T011, une session par tâche. Le premier lancement suit le `/exit` de l'étape précédente ; entre deux tâches, vider la fenêtre de contexte. Seuls le numéro, la règle et le nombre d'échecs attendus changent. Après chaque tâche, lire `git status --short` (le bon fichier, et lui seul, avec `tasks.md`) et la dernière ligne de `pytest`. Un seul commit à la fin.

::: claude-code
```console
$ claude
```

Entre deux tâches :

```console
/clear
```
:::

::: opencode
```console
$ opencode
```

Entre deux tâches :

```console
/new
```
:::

Argument de T004, puis de T005.

::: claude-code
```prompt
/speckit-implement Fais seulement T004, Test REG-02, puis arrête-toi : lie par `@scenario(FEATURE, "<titre>")` les cinq scénarios dont le titre commence par `REG-02` dans `tests/test_valider_reservation.py`, une fonction `test_…` par scénario ; lance `uv run pytest -q`, trois scénarios doivent échouer ; ne modifie pas `bookit/` ; coche T004.
```

```prompt
/speckit-implement Fais seulement T005, Code REG-02, puis arrête-toi : écris la règle des horaires dans `bookit/domain/validate_booking.py`, une fonction interne appelée par `validate_booking` après la règle précédente, comme `plan.md` le fixe ; lance `uv run pytest -q`, tout doit passer ; ne modifie pas `tests/` ; coche T005.
```
:::

::: opencode
```prompt
/speckit.implement Fais seulement T004, Test REG-02, puis arrête-toi : lie par `@scenario(FEATURE, "<titre>")` les cinq scénarios dont le titre commence par `REG-02` dans `tests/test_valider_reservation.py`, une fonction `test_…` par scénario ; lance `uv run pytest -q`, trois scénarios doivent échouer ; ne modifie pas `bookit/` ; coche T004.
```

```prompt
/speckit.implement Fais seulement T005, Code REG-02, puis arrête-toi : écris la règle des horaires dans `bookit/domain/validate_booking.py`, une fonction interne appelée par `validate_booking` après la règle précédente, comme `plan.md` le fixe ; lance `uv run pytest -q`, tout doit passer ; ne modifie pas `tests/` ; coche T005.
```
:::

Argument de T006, puis de T007.

::: claude-code
```prompt
/speckit-implement Fais seulement T006, Test REG-03, puis arrête-toi : lie par `@scenario(FEATURE, "<titre>")` les deux scénarios dont le titre commence par `REG-03` dans `tests/test_valider_reservation.py`, une fonction `test_…` par scénario ; lance `uv run pytest -q`, un scénario doit échouer ; ne modifie pas `bookit/` ; coche T006.
```

```prompt
/speckit-implement Fais seulement T007, Code REG-03, puis arrête-toi : écris la règle du préavis dans `bookit/domain/validate_booking.py`, une fonction interne appelée par `validate_booking` après la règle précédente, comme `plan.md` le fixe ; lance `uv run pytest -q`, tout doit passer ; ne modifie pas `tests/` ; coche T007.
```
:::

::: opencode
```prompt
/speckit.implement Fais seulement T006, Test REG-03, puis arrête-toi : lie par `@scenario(FEATURE, "<titre>")` les deux scénarios dont le titre commence par `REG-03` dans `tests/test_valider_reservation.py`, une fonction `test_…` par scénario ; lance `uv run pytest -q`, un scénario doit échouer ; ne modifie pas `bookit/` ; coche T006.
```

```prompt
/speckit.implement Fais seulement T007, Code REG-03, puis arrête-toi : écris la règle du préavis dans `bookit/domain/validate_booking.py`, une fonction interne appelée par `validate_booking` après la règle précédente, comme `plan.md` le fixe ; lance `uv run pytest -q`, tout doit passer ; ne modifie pas `tests/` ; coche T007.
```
:::

Pour les quatre tâches restantes, T008 à T011, reprendre ces arguments en changeant la tâche, le numéro de règle, le nombre de scénarios, le nom de la règle (« de l'horizon », « du chevauchement ») et le nombre d'échecs.

| Tâches | Règle | Scénarios à lier | Échecs de la tâche de test |
|---|---|---|---|
| T004, T005 | REG-02, horaires | 5 | 3 (7h59, 20h01, samedi) |
| T006, T007 | REG-03, préavis | 2 | 1 (1 heure 59) |
| T008, T009 | REG-04, horizon | 2 | 1 (62 jours) |
| T010, T011 | REG-05, chevauchement | 3 | 1 (créneau chevauchant) |

Quitter par `/exit`, puis commiter.

```console
$ git add -A
$ git commit -m "TP 6 : REG-02 à REG-05"
```

::: attendu
```console
$ uv run pytest -q | tail -1
17 passed
$ grep -c '^- \[[xX]\]' specs/001-valider-reservation/tasks.md
11
$ git log --oneline -- bookit/application bookit/infrastructure | wc -l
1
$ git log --oneline | wc -l
18
```
Sortie provisoire, à relever au rejeu.
:::

::: indice
Manque de temps : à partir de REG-03, une session par règle (Test puis Code dans la même session, « lance la suite après le test, elle doit échouer, puis écris le code »), en gardant le `git status --short` entre les deux. Une tâche Test ne donne aucun échec : les règles précédentes refusent déjà le cas (REG-06), vérifier le code du refus dans la sortie et avancer. Suite rouge après une tâche Code : relancer la session avec la ligne `FAILED` dans l'argument.
:::

### Tâches restantes et `curl`

Session neuve, `implement` limité à T012, T013 et T014 : les tâches Test REG-06 et REG-07 lient leurs trois scénarios. Quitter, puis relancer l'API du TP 3 dans un second terminal et envoyer la demande du TP 3 : l'API la refuse.

::: claude-code
```console
$ claude
```
:::

::: opencode
```console
$ opencode
```
:::

::: claude-code
```prompt
/speckit-implement Fais seulement T012, T013 et T014, puis arrête-toi : T012 et T013 lient par `@scenario(FEATURE, "<titre>")` les deux scénarios dont le titre commence par `REG-06` et celui dont le titre commence par `REG-07`, sans modifier `bookit/` ; lance `uv run pytest -q` et rends la sortie ; T014 lance `uv run ruff check` et `uv run ruff format --check` et corrige ce qu'ils signalent ; coche T012, T013 et T014.
```
:::

::: opencode
```prompt
/speckit.implement Fais seulement T012, T013 et T014, puis arrête-toi : T012 et T013 lient par `@scenario(FEATURE, "<titre>")` les deux scénarios dont le titre commence par `REG-06` et celui dont le titre commence par `REG-07`, sans modifier `bookit/` ; lance `uv run pytest -q` et rends la sortie ; T014 lance `uv run ruff check` et `uv run ruff format --check` et corrige ce qu'ils signalent ; coche T012, T013 et T014.
```
:::

Quitter par `/exit`. Dans un second terminal, lancer l'API.

```console
$ cd ~/bookit && uv run uvicorn bookit.infrastructure.api:app
```

Depuis le premier terminal, recréer la demande du TP 3 et l'envoyer deux fois, puis une troisième fois pour lire le corps de la réponse. La base `bookit.db` du TP 3 contient déjà ce créneau : la demande est refusée dès le premier envoi. Arrêter ensuite l'API par Ctrl+C et supprimer `demande.json`.

```console
$ lundi=$(date -d 'next monday' +%F)
$ printf '{"start": "%sT10:00:00", "end": "%sT11:00:00"}' $lundi $lundi > demande.json
$ url=http://127.0.0.1:8000/resources/salle-a/bookings
$ curl -s -o /dev/null -w '%{http_code}\n' -H 'Content-Type: application/json' -d @demande.json $url
$ curl -s -o /dev/null -w '%{http_code}\n' -H 'Content-Type: application/json' -d @demande.json $url
$ curl -s -H 'Content-Type: application/json' -d @demande.json $url
$ rm demande.json
```

Commiter.

```console
$ git add -A
$ git commit -m "TP 6 : tâches restantes"
```

::: attendu
```console
$ uv run pytest -q | tail -1
20 passed
$ grep -c '^- \[ \]' specs/001-valider-reservation/tasks.md
0
$ uv run ruff check
All checks passed!
$ git status --short | wc -l
0
$ git log --oneline | wc -l
19
```
Les trois envois de `curl` répondent `422`, `422` puis `{"detail":{"code":"overlap"}}`. Sortie provisoire, à relever au rejeu.
:::

::: indice
Les tâches Test T012 et T013 passent d'emblée : les règles sont déjà enchaînées dans l'ordre, aucune tâche Code ne suit. T012 ou T013 « attendent » un échec et écrivent du code : `git restore bookit`, REG-06 et REG-07 se vérifient sur le code des cinq premières règles. Le premier envoi répond `201` : `bookit.db` a été supprimée ou le lundi suivant a changé depuis le TP 3, le deuxième envoi répond alors `422`. `ruff format --check` échoue : `uv run ruff format`, puis commiter.
:::

### Corrigé {.corrige}

Le domaine, avec une fonction par règle appelée dans l'ordre REG-01 à REG-05.

```python file="../tp/tp06/bookit/domain/validate_booking.py"
```

Les définitions d'étape et la fixture du fichier de test ; les liaisons `@scenario` suivent, une par scénario.

```python file="../tp/tp06/tests/test_valider_reservation.py" lines="1-74"
```

Vérification : `uv run pytest -q` rend `26 passed` à l'état de fin de partie B (20 tests à la fin de partie A, six scénarios ajoutés par la partie B), `uv run ruff check` et `uv run ruff format --check` ne signalent rien.

## Couverture : les lignes exécutées {kicker="Couverture et mutants"}

```console
$ uv run --with pytest-cov pytest -q --cov=bookit/domain --cov-report=term-missing
Name                                Stmts   Miss  Cover   Missing
bookit/domain/validate_booking.py      35      0   100%
$ grep -c dimanche specs/001-valider-reservation/valider-reservation.feature
0
```

Sur 31 000 suites de tests Java, la corrélation entre couverture et détection des fautes est faible à modérée.

::: sources
- [coverage.py, documentation](https://coverage.readthedocs.io/)
- [pytest-cov, documentation, Reporting](https://pytest-cov.readthedocs.io/en/latest/reporting.html)
- [uv, `uv run --with`](https://docs.astral.sh/uv/reference/cli/#uv-run)
- [Inozemtseva et Holmes, « Coverage Is Not Strongly Correlated with Test Suite Effectiveness », ICSE 2014](https://cs.ubc.ca/~rtholmes/papers/icse_2014_inozemtseva.pdf)
:::

::: notes
Définition du lexique, portée par le titre et l'en-tête du rapport : la couverture est la part du code exécutée par les tests. coverage.py : « Coverage measurement is typically used to gauge the effectiveness of tests ». pytest-cov : `--cov=<paquet>` mesure un paquet, la page Reporting de pytest-cov donne `--cov-report=term-missing` et sa colonne `Missing` en exemple, sans les définir ; la lecture « lignes non exécutées » est celle du formateur. `uv run --with` : « Run with the given packages installed », dans un environnement éphémère qui n'ajoute rien au projet.
Démonstration 2 (shell, rejouable). Dans `demo-bookit-a`, copie du corrigé à l'état de fin de partie A (superposition de `tp/tp06/` sans les scénarios de la passe 2, ou `git checkout` du commit « TP 6 : tâches restantes » du rejeu) : la commande de la slide, puis `grep -c dimanche specs/001-valider-reservation/valider-reservation.feature`. Résultat attendu : `validate_booking.py` à 100 %, colonne `Missing` vide, et `0` au `grep` : toutes les lignes exécutées, le dimanche sans test. Les six scénarios à retirer pour revenir à la fin de partie A (du `.feature`, de `spec.md` et de `tests/`) : `REG-02, dimanche` ; `REG-04, 60 jours pile` ; `REG-04, 60 jours et 1 minute` ; `REG-05, créneau entièrement après` ; `REG-05, créneau entièrement avant` ; `REG-05, créneau jointif avant` (tableau de la passe 1 de `tp/fichiers/mutation.md`). Relevé sur ce corrigé (23 octobre 2026, Python 3.14.4, rejoué sous les deux outils, identique) : `validate_booking.py  35  0  100%`, 20 tests verts, moins de 1 s ; le rapport liste aussi `models.py`, `ports.py` et `__init__.py`, à 100 %. `--with` a installé pytest-cov 7.1.0 et coverage 7.17.0.
Pourquoi 100 % avec le dimanche non testé : `weekday() >= 5` s'exécute pour le samedi. Une ligne exécutée n'est pas une ligne vérifiée. Inozemtseva et Holmes : 31 000 suites générées pour cinq systèmes Java jusqu'à 724 000 lignes, efficacité mesurée par mutation testing ; « low to moderate correlation between coverage and effectiveness when the number of test cases in the suite is controlled for » ; conclusion : la couverture sert à repérer les parties sous-testées, pas de cible de qualité. Prix ACM SIGSOFT Distinguished Paper 2014, ICSE Most Influential Paper 2024.
:::

## Tests générés : quatre mesures {.figures kicker="Couverture et mutants"}

- **75 %** compilent sans erreur
- **57 %** passent de façon fiable
- **25 %** augmentent la couverture
- **73 %** acceptés en production

TestGen-LLM, Meta, 2024

::: sources
- [Alshahwan et al., « Automated Unit Test Improvement using Large Language Models at Meta », arXiv:2402.09171, 14 février 2024](https://arxiv.org/abs/2402.09171)
:::

::: notes
Résumé de l'article, cité : « 75% of TestGen-LLM's test cases built correctly, 57% passed reliably, and 25% increased coverage » ; « with 73% of its recommendations being accepted for production deployment by Meta software engineers ». Les trois premiers chiffres portent sur Instagram Reels et Stories, le quatrième sur les test-a-thons Instagram et Facebook (détail à relire dans l'article avant de le citer en salle). Les filtres s'enchaînent avant toute proposition au développeur : le test compile, passe de façon fiable, augmente la couverture.
Lecture : un test généré se vérifie comme un code généré, et « augmente la couverture » ne dit pas ce que le test vérifie. Ce chiffre prépare la slide sur le mutation testing.
:::

## Mutation testing : le code modifié {kicker="Couverture et mutants"}

![Mutation testing : modifier le code, relancer la suite. Le code d'origine de validate_booking.py, weekday() >= 5, passe par un opérateur, ReplaceComparisonOperator_GtE_Eq, qui produit un mutant, weekday() == 5 ; la suite de tests relancée, uv run pytest -q tests, classe le mutant : tué si un test échoue, survivant si la suite passe, incompétent si le code plante](images/06-mutation.svg)

::: sources
- [cosmic-ray, « Theory »](https://cosmic-ray.readthedocs.io/en/latest/theory.html)
- [cosmic-ray, « Concepts »](https://cosmic-ray.readthedocs.io/en/latest/concepts.html)
- [Petrović et Ivanković, « State of Mutation Testing at Google », ICSE SEIP 2018](https://research.google/pubs/state-of-mutation-testing-at-google/)
:::

::: notes
Définitions du lexique, portées par les étiquettes du schéma : mutation testing (modification automatique du code pour vérifier qu'un test échoue ; outil cosmic-ray) et mutant (une version modifiée du code ; tué, survivant, incompétent). cosmic-ray, « Theory » : « If your test suite fails, then we say that your tests “killed” (i.e. detected) the mutant » ; « If your test suite passes, however, we say that the mutant has “survived” » ; « If the changes cause your code to simply crash, then we say the mutant is “incompetent” » ; un survivant indique que « your test suite is not adequately checking the code that was changed ». « Concepts » : « An *operator* in Cosmic Ray is a class that represents a specific type of mutation ».
Un opérateur par mutant : `>=` devient `==`, `30` devient `31`, `and` devient `or`. Cosmic-ray 8.7.0 compte 213 opérateurs (`cosmic-ray operators`, relevé du 22 octobre 2026), en familles `ReplaceBinaryOperator`, `ReplaceComparisonOperator`, `NumberReplacer`, `ReplaceAndWithOr`, `AddNot`, `ZeroIterationForLoop`. Google : 6 000 ingénieurs ; la mutation porte sur environ 30 % des diffs dont la couverture d'instructions est calculée (« about 30% of all diffs across Google that have statement coverage calculated »), non sur tous les diffs ; la mutation « subsumes a number of other coverage criteria ».
:::

## cosmic-ray : la configuration {kicker="Couverture et mutants"}

```toml file="../tp/fichiers/cosmic-ray.toml"
```

Le filtre écarte les annotations `X | None`, que Python 3.14 n'évalue plus.

::: sources
- [cosmic-ray, « Filters »](https://cosmic-ray.readthedocs.io/en/latest/how-tos/filters.html)
- [Python 3.14, « What's new », annotations](https://docs.python.org/3/whatsnew/3.14.html)
- `tp/fichiers/cosmic-ray.toml`
:::

::: notes
Le filtre existe à cause des annotations : sur le corrigé, 66 des 73 survivants d'une passe sans filtre remplacent le `|` de `InvalidBooking | None` par un autre opérateur (`core/ReplaceBinaryOperator_BitOr_*`). Python 3.14 n'évalue plus les annotations à la définition (« no longer evaluated eagerly », What's new) : aucun test ne peut les tuer. Le fichier fourni les exclut par `[cosmic-ray.filters.operators-filter]`, `exclude-operators` (expressions régulières, doc « Filters »).
Configuration : `module-path` pointe `validate_booking.py` seul, `models.py` n'étant que des dataclasses (ses mutants seraient incompétents ou équivalents). `pythonpath = ["."]` dans `[tool.pytest.ini_options]` est indispensable, `test-command` s'exécutant depuis la racine. `timeout` : un test de mutant plus long est tué et le mutant marqué incompétent (« Concepts »). `mutation.sqlite` reste hors du dépôt (`.gitignore`).
:::

## Les commandes de cosmic-ray {kicker="Couverture et mutants"}

```console
$ uv add --dev cosmic-ray==8.7.0
$ uv run cosmic-ray baseline cosmic-ray.toml
$ uv run cosmic-ray init cosmic-ray.toml mutation.sqlite
$ uv run cr-filter-operators mutation.sqlite cosmic-ray.toml
$ uv run cosmic-ray exec cosmic-ray.toml mutation.sqlite
$ uv run cr-report mutation.sqlite --surviving-only
```

Une passe enchaîne `init`, `exec` et `cr-report` sur le code et les tests du moment.

::: sources
- [cosmic-ray, « Tutorial: The basics »](https://cosmic-ray.readthedocs.io/en/latest/tutorials/intro/index.html)
- [cosmic-ray, « Filters »](https://cosmic-ray.readthedocs.io/en/latest/how-tos/filters.html)
- `cosmic-ray --help`, `cosmic-ray baseline --help`, `cr-report --help` (8.7.0)
:::

::: notes
Les commandes dans l'ordre : `baseline` (la suite passe sur le code intact ; « Runs a baseline execution that executes the test suite over unmutated code ») ; `init` (liste les mutants dans `mutation.sqlite`) ; `cr-filter-operators` (marque comme ignorés les mutants des opérateurs exclus) ; `exec` (chaque mutant est appliqué puis testé) ; `cr-report --surviving-only`. Tutoriel : « it's important to make sure that the test suite passes in the absence of any mutations », sinon les résultats sont inutilisables ; sans `baseline`, une suite qui échoue à la collecte compte tous les mutants tués.
`cr-filter-operators` se lance après `init` et avant `exec`, et le rapport compte les mutants ignorés dans `total jobs`. Il reste sept survivants, tous de vrais trous. Passe : un cycle `init`, `exec`, `cr-report` ; le suivi par passe est dans `mutation.md`.
cosmic-ray appelle « session » le fichier SQLite d'une passe, mot réservé ici à la session de l'agent. `init` refuse d'écraser un fichier existant (« Use --force to overwrite »). Syntaxe relevée dans `--help` 8.7.0. Durée d'`exec` sur le corrigé : environ une minute (126 mutants testés, poste de préparation) ; à relever au rejeu.
:::

## Le rapport : survivants et diff {kicker="Couverture et mutants"}

```console
$ uv run cr-report mutation.sqlite --show-diff --surviving-only
…
bookit/domain/validate_booking.py core/ReplaceComparisonOperator_GtE_Eq 0
worker outcome: WorkerOutcome.NORMAL, test outcome: TestOutcome.SURVIVED
=== DIFF ===
-    if booking.start.weekday() >= 5:
+    if booking.start.weekday() == 5:
…
total jobs: 192
complete: 192 (100.00%)
surviving mutants: 7 (3.65%)
```

::: sources
- [cosmic-ray, « Tutorial: The basics »](https://cosmic-ray.readthedocs.io/en/latest/tutorials/intro/index.html)
- `cr-report --help` (8.7.0)
:::

::: notes
`--show-diff` ajoute le diff de chaque mutant, `--surviving-only` filtre les survivants. Sortie abrégée : le `[job-id]`, les en-têtes `--- a/` et `+++ b/` et les lignes de contexte sont omis. Relevé sur le corrigé de la partie A (Python 3.14.4, 23 octobre 2026) : 192 mutants, 66 ignorés par le filtre, 119 tués, 7 survivants, tous des trous : `weekday() >= 5` devenu `== 5` (le dimanche est accepté et aucun test ne le voit) ; `start > now + MAX_HORIZON` devenu `>=` et `days=60` devenu `days=61` (le 60e jour n'est jamais jugé, les scénarios sont à 59 et 62 jours) ; quatre dans `_check_overlap` (`booking.start < confirmed.end` devenu `!=`, `confirmed.start < booking.end` devenu `!=`, `is not` et `<=` : une demande entièrement après, entièrement avant, ou jointive avant la réservation confirmée). Le survivant du dimanche est le sixième du rapport, pas le premier.
Les survivants dépendent du code produit : sur le code d'un stagiaire le nombre et la forme changent, le classement se juge.
:::

## Classer un survivant {kicker="Couverture et mutants"}

| Sorte | Critère | Action | Exemple |
|---|---|---|---|
| trou dans les tests | un cas change la décision | scénario ajouté à `spec.md` et au `.feature` | le dimanche |
| mutant équivalent | aucune entrée ne distingue le mutant du code | ligne dans `mutation.md` (fichier de suivi) | une garde `end <= start` avant REG-01 (illustration) |

::: sources
- [cosmic-ray, « Theory »](https://cosmic-ray.readthedocs.io/en/latest/theory.html)
:::

::: notes
Définitions du lexique, portées par les lignes du tableau : trou dans les tests (un comportement observable change et aucun scénario ne le voit ; se comble par un scénario dans `spec.md` et le `.feature`, jamais dans `tests/` seul) et mutant équivalent (aucun comportement observable ne change ; aucun test ne peut le tuer ; noté dans `mutation.md` avec sa raison). cosmic-ray, « Theory » : un survivant signifie « either a) you need more or better tests or b) you've got code which you don't need ».
Exemple d'équivalent (illustration) : une garde `end <= start` placée avant REG-01 ; une fin avant le début dure moins de 30 minutes, REG-01 rend déjà `duration` : muter la garde ne change aucune décision. Le terme « mutant équivalent » vient de la littérature (Jia et Harman, IEEE TSE 2011) : l'article n'a pas pu être consulté en ligne, la définition de la slide est celle du lexique, sans citation. Détecter l'équivalence est indécidable en général ; un classement « équivalent » se justifie par une raison écrite.
Consigne pédagogique du formateur, non tirée de la page « Theory » : un survivant classé équivalent parce qu'il est dur à tuer est un trou ; l'équivalence se justifie par une raison écrite.
Le scénario ajouté entre dans la spécification d'abord, puis dans le `.feature` et la liaison `@scenario` ; un test seul dans `tests/` a une forme que personne n'a relue.
:::

## L'agent propose, le développeur classe {kicker="Couverture et mutants"}

```prompt
Voici la sortie de `uv run cr-report mutation.sqlite --show-diff --surviving-only`. Pour chaque survivant, dis s'il est un mutant équivalent ou un trou dans les tests, et pour un trou, écris le scénario manquant en Gherkin français, titre `REG-NN, …`, dans la forme de `specs/001-valider-reservation/valider-reservation.feature`. Ne modifie aucun fichier.
```

| Survivant | Proposition de l'agent (illustration) | Décision |
|---|---|---|
| `weekday() >= 5` devient `== 5` | trou ; scénario `REG-02, dimanche, refusée` | retenu |
| `start > now + MAX_HORIZON` devient `>=` | trou ; scénario `REG-04, 60 jours pile` | à juger |

::: sources
- [Claude Code, Best practices, « Avoid common failure patterns »](https://code.claude.com/docs/en/best-practices)
- Module 5, idée clé « Avant `implement`, le développeur relit chaque artefact et corrige à la main les constats fondés »
:::

::: notes
Démonstration 3 (appelle le modèle). Prompt : celui de la slide, avec la sortie de `cr-report --show-diff --surviving-only` collée. Déroulé : dans `demo-bookit-a`, après `uv add --dev cosmic-ray==8.7.0`, `baseline`, `init`, `exec` ; session neuve ; lire la réponse : pour chaque survivant, la sorte et le scénario proposé ; `git status --short` après. Résultat attendu : le survivant `weekday() >= 5` devenu `== 5` classé trou, scénario `REG-02, dimanche, refusée` proposé en Gherkin français ; les autres survivants du corrigé classés ; aucun fichier modifié. Relevé du 23 octobre 2026 : 192 mutants, 7 survivants (3,65 %), `exec` en 61 s (Claude Code) et 82 s (Open Code). Claude Code : les 7 classés trous, aucun équivalent, six scénarios proposés (`REG-02, dimanche` ; `REG-04, 60 jours pile` ; `REG-04, 61 jours à l'avance` ; trois `REG-05`), chacun tuant bien les mutants attribués, titres différents de ceux du corrigé ; réponse en 262 s (3 tours, 0,46 USD) ; aucun fichier modifié. Open Code : 28 s ; le dimanche classé trou, mais trois survivants de `_check_overlap` classés équivalents à tort (deux `!=`, un `is not`, justifiés par un raisonnement faux : ce sont trois trous du corrigé) ; quatre scénarios proposés, dont une première version avec une date fausse (60e jour un samedi) corrigée dans la même réponse, d'où deux blocs Gherkin ; aucun fichier modifié. Ces survivants classés équivalents à tort illustrent la vigilance ci-dessus. Open Code : le premier appel après une période d'inactivité peut se figer (service à redémarrer), à prévoir avant la session.
Claude Code, Best practices : « The trust-then-verify gap … Always provide verification (tests, scripts, screenshots). If you can't verify it, don't ship it. » Même partage qu'au module 5 pour `analyze` : l'agent propose, le développeur juge. Le tableau est une illustration jusqu'au relevé. Vigilance : l'agent classe volontiers « équivalent » un survivant difficile à tuer ; demander une entrée qui distingue le mutant du code (dimanche 7 juin 2026, 10h00 à 11h00).
Après décision, le scénario entre dans `spec.md`, le `.feature` et une liaison `@scenario` ; la passe 2 (`rm mutation.sqlite`, `init`, `exec`) confirme.
:::

## Le développeur classe chaque survivant et comble les trous par un scénario. {.statement kicker="Couverture et mutants"}

::: notes
Conclut les slides 20 à 27 : couverture, chiffres de Meta, mutation testing, commandes, rapport, classement, proposition de l'agent. Le scénario ajouté change la spécification, et le code doit lui rester conforme : section suivante.
:::

## Entrées et sorties de `converge` {kicker="Converger"}

![converger : ramener le code et les artefacts à l'accord. converge lit spec.md, plan.md, tasks.md, constitution.md et le code présent ; elle classe chaque écart, missing, partial, contradicts, unrequested ; deux issues : Converged, tasks.md intact octet pour octet, ou une phase Convergence, tâches T015 ajoutées en fin de tasks.md, que implement exécute. La commande s'invoque /speckit-converge sous Claude Code et /speckit.converge sous Open Code](images/06-converge.svg)

::: sources
- [Spec Kit, `templates/commands/converge.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/converge.md)
- `formateur/spec-kit.md` § 4
:::

::: notes
Définition du lexique, portée par l'étiquette du schéma : converger, c'est ramener le code et les artefacts à l'accord ; `converge` mesure l'écart entre le code et `spec.md`, `plan.md`, `tasks.md`, ajoute les tâches manquantes en fin de `tasks.md`, `implement` les exécute, jusqu'à « Converged ».
Prompt `converge` 1.2.2, cité au mot près (consulté le 23 octobre 2026) : « Close the gap between what a feature's specification, plan, and tasks call for and what the codebase currently implements » ; « no git, no branch comparison, no history » ; « APPEND-ONLY, NEVER REWRITE » ; types d'écart `missing`, `partial` (« the work exists but does not yet fully satisfy the requirement »), `contradicts`, `unrequested` ; « MUST leave `tasks.md` **byte-for-byte unchanged** » sans écart ; « ✅ Converged » suivi de « the implementation satisfies the spec, plan, and tasks » ; « This command MUST run only after `/speckit-implement` has run ». Elle n'écrit que `tasks.md` : ni `spec.md`, ni `plan.md`, ni le code. Phase ajoutée : `## Phase N: Convergence`, N étant le plus haut numéro de phase plus un, identifiants de tâche à la suite du plus haut.
Le dépôt source écrit `__SPECKIT_COMMAND_IMPLEMENT__` ; le fichier déposé par `specify init` porte `/speckit-implement` ou `/speckit.implement`.
:::

## `converge` sur bookit : trois cas {kicker="Converger"}

| État du dépôt (illustration) | Réponse de `converge` | `tasks.md` |
|---|---|---|
| après la partie A | « ✅ Converged » | inchangé (`md5sum` égal) |
| scénario du dimanche dans `spec.md`, sans `@scenario` | `T015 [REG-02] Test : lier le scénario « REG-02, dimanche » (partial)` | phase ajoutée |
| garde `end <= start` dans le code, sans exigence | `T015 Revoir ou retirer la garde (unrequested)` | phase ajoutée |

Chaque tâche ajoutée se traite comme les quatorze premières : une session, un diff relu, un commit.

::: sources
- [Spec Kit, `templates/commands/converge.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/converge.md)
:::

::: notes
Démonstration 4 (appelle le modèle). Prompt : `/speckit-converge` (ou `/speckit.converge`), sans argument, trois fois. Déroulé : dans `demo-bookit-b`, copie du corrigé complet (fin de partie B, tout coché) : `md5sum specs/*/tasks.md`, `converge`, `md5sum` de nouveau ; puis le scénario du dimanche retiré de `tests/` seulement (sa liaison `@scenario` supprimée, `spec.md` et `.feature` gardés), `converge`, `tail -5 specs/*/tasks.md` ; puis `git restore .`, une garde `if booking.end <= booking.start: return InvalidBooking("duration")` ajoutée en tête de `validate_booking`, `converge`, `tail -5 specs/*/tasks.md`. Résultat attendu : première passe « ✅ Converged », `md5sum` identique ; deuxième : une phase « Convergence » avec une tâche qui cite REG-02 ; troisième : une tâche `unrequested`, ou rien si l'agent juge la garde couverte par REG-01.
Relevé du 23 octobre 2026. Claude Code (« Convergé » en français) : passe 1, 97 s, `md5sum` identique (`6f47190a…`), « Aucun écart détecté » (l'agent annonce 26 scénarios, nombre de tests pytest ; le `.feature` en compte 25) ; passe 2, 81 s : « Phase 10 : Convergence », `T015 [REG-02] Test : lier le scénario « REG-02, dimanche » … per US2/REG-02 (partial)`, type `partial` et non `missing` ; passe 3, 154 s : `T015 Revoir ou retirer la garde … per plan.md : structure decision (unrequested)`, formulation hors du format strict. Les tâches portent T015 car celles du corrigé vont jusqu'à T014. Total environ 332 s, 1,47 USD. Open Code : passe 1, 32 s, intact, « La feature est entièrement convergée » ; passe 2, 34 s : l'agent ne voit pas l'absence du test du dimanche, annonce 25 tests passés, n'ajoute aucune phase et a reformaté `tests/test_valider_reservation.py` hors de son rôle ; passe 3, 29 s : « aucun écart », garde non mentionnée, `tasks.md` inchangé. Écart entre outils : la tâche de la passe 2 n'apparaît que sous Claude Code ; sous Open Code, à vérifier à la main dans la TUI. Sous Open Code, `.specify/` est ignoré par git et le corrigé ne livre ni scripts ni commandes : les prendre dans `hello-spec`.
Format d'une tâche ajoutée (prompt 1.2.2) : `- [ ] T042 <imperative description> per <source-ref> (<gap-type>)` ; la commande recommande ensuite `/speckit-implement` pour les exécuter. Le tableau reprend le relevé sous Claude Code.
:::

## `converge` mesure l'écart, `implement` le ferme, tâche par tâche. {.statement kicker="Converger"}

::: notes
Conclut les slides 29 et 30. La partie B du TP 6 enchaîne mutation testing, classement des survivants, scénario ajouté, passe 2 ; `converge` n'y est pas lancée par les stagiaires : le formateur la joue en démonstration 4, hors de leur dépôt, parce que sur un dépôt conforme elle ne produit rien et que le TP n'a pas de temps pour un écart artificiel.
:::

## Partie B : mutation testing {.tp duration="40 min" kicker="TP 6"}

Mesurer la suite de la partie A par mutation testing, puis combler les trous trouvés. Deux commits faits à la main.

::: notes
Point de départ : arrivée de la partie A. Arrivée : 21 commits, `git status --short` vide, `cosmic-ray.toml` à la racine, `pyproject.toml` et `uv.lock` avec cosmic-ray, `mutation.sqlite` ignoré, `specs/001-valider-reservation/mutation.md` à deux passes, le scénario du dimanche dans `spec.md`, le `.feature` et `tests/`, suite verte à 21 tests au moins.
Durées prévues : 12 min pour la passe 1, 20 pour le classement et la passe 2, 5 de débrief, 3 de marge. Durées d'`exec` et nombres relevés au rejeu, dans les deux outils : à relever.
Débrief, deux questions : quels survivants ont été classés équivalents, et par quelle raison ; pourquoi le scénario entre dans `spec.md` avant le `.feature` et les tests.
Pièges : tuer un survivant par un test écrit dans `tests/` seul ; classer équivalent ce qui est dur à tuer ; lancer `exec` sans `baseline` ; commiter `mutation.sqlite` ; citer le score sans la liste des survivants. Le nombre de mutants et les survivants changent avec le code du stagiaire : le classement se juge, le score ne se compare pas.
:::

### Passe 1

Dans `~/bookit`, installer cosmic-ray, copier la configuration et le fichier de suivi fournis, ignorer la base de la passe, puis lancer la première passe. Ne pas toucher au code pendant `exec`.

```console
$ uv add --dev cosmic-ray==8.7.0
$ cp ~/fichiers/cosmic-ray.toml .
$ cp ~/fichiers/mutation.md specs/001-valider-reservation/
$ echo mutation.sqlite >> .gitignore
$ uv run cosmic-ray baseline cosmic-ray.toml
$ uv run cosmic-ray init cosmic-ray.toml mutation.sqlite
$ uv run cr-filter-operators mutation.sqlite cosmic-ray.toml
$ uv run cosmic-ray exec cosmic-ray.toml mutation.sqlite
$ uv run cr-report mutation.sqlite --show-diff --surviving-only
```

Reporter dans la section « Passe 1 » de `mutation.md` le nombre de mutants, de mutants filtrés, de tués et de survivants, puis une ligne par survivant : fonction et diff. Les trois dernières lignes de `uv run cr-report mutation.sqlite` donnent `total jobs` (filtrés compris) et `surviving mutants`. Garder cette dernière ligne dans un fichier hors du dépôt, pour la comparer à la passe 2. Commiter, `mutation.sqlite` exclu.

```console
$ uv run cr-report mutation.sqlite | tail -1 > ~/survivants-passe1.txt
$ git status --short
$ git add -A
$ git commit -m "TP 6 : mutation, passe 1"
```

::: attendu
```console
$ uv run cosmic-ray --version
8.7.0
$ uv run cr-report mutation.sqlite | tail -3 | grep -c 'surviving mutants'
1
$ git status --short | wc -l
0
$ git log --oneline | wc -l
20
```
Sur le corrigé, `uv run cr-report mutation.sqlite | tail -3` donne `total jobs: 192`, `complete: 192 (100.00%)`, `surviving mutants: 7 (3.65%)` : ces nombres changent avec le code produit à la partie A. Le survivant `weekday() >= 5` devenu `== 5` figure dans le rapport dès que le code compare `weekday()` à 5. Sortie provisoire, à relever au rejeu.
:::

::: indice
`exec` compte tous les mutants tués en quelques secondes : la suite échoue à la collecte, relancer `baseline` et lire son erreur (`pythonpath` dans `pyproject.toml`, chemin du `.feature`). `exec` dure plus de dix minutes : un `timeout` trop court passe des mutants en « incompetent », vérifier `uv run cr-report mutation.sqlite --show-pending`. Aucun survivant : le code a d'autres comparaisons que la référence, lire `uv run cr-report mutation.sqlite --all-mutations | grep -c KILLED`, puis passer à l'étape suivante avec le seul scénario du dimanche. `cr-filter-operators` oublié : des dizaines de survivants remplacent le `|` d'une annotation, relancer `rm mutation.sqlite`, `init`, le filtre et `exec`.
:::

### Classement et passe 2

Session neuve, avec le prompt suivant suivi de la sortie de `uv run cr-report mutation.sqlite --show-diff --surviving-only`, collée en dessous. Lire chaque proposition et la juger : un survivant classé équivalent doit l'être par une raison, non parce qu'il est difficile à tuer.

::: claude-code
```console
$ claude
```
:::

::: opencode
```console
$ opencode
```
:::

```prompt
Voici la sortie de `uv run cr-report mutation.sqlite --show-diff --surviving-only`. Pour chaque survivant, dis s'il est un mutant équivalent ou un trou dans les tests, et pour un trou, écris le scénario manquant en Gherkin français, titre `REG-NN, …`, dans la forme de `specs/001-valider-reservation/valider-reservation.feature`. Ne modifie aucun fichier.
```

Second prompt, dans la même session : l'agent écrit les scénarios retenus, dans la spécification d'abord.

```prompt
Ajoute les scénarios retenus : dans `specs/001-valider-reservation/spec.md` sous l'exigence concernée, dans `valider-reservation.feature` à la suite des scénarios de la même exigence, et leur liaison `@scenario` dans `tests/test_valider_reservation.py` ; ne modifie pas `bookit/`.
```

Quitter par `/exit`, puis lancer la passe 2 et reporter les nombres dans la section « Passe 2 » de `mutation.md`, avec la raison de chaque survivant gardé.

```console
$ uv run pytest -q
$ rm mutation.sqlite
$ uv run cosmic-ray baseline cosmic-ray.toml
$ uv run cosmic-ray init cosmic-ray.toml mutation.sqlite
$ uv run cr-filter-operators mutation.sqlite cosmic-ray.toml
$ uv run cosmic-ray exec cosmic-ray.toml mutation.sqlite
$ uv run cr-report mutation.sqlite --surviving-only
$ git add -A
$ git commit -m "TP 6 : trous comblés, passe 2"
```

::: attendu
```console
$ grep -q dimanche specs/001-valider-reservation/valider-reservation.feature && echo ok
ok
$ grep -q dimanche specs/001-valider-reservation/spec.md && echo ok
ok
$ uv run pytest -q | tail -1 | grep -c passed
1
$ n1=$(sed 's/.*: \([0-9]*\) .*/\1/' ~/survivants-passe1.txt)
$ n2=$(uv run cr-report mutation.sqlite | tail -1 | sed 's/.*: \([0-9]*\) .*/\1/')
$ test "$n2" -lt "$n1" && echo ok
ok
$ git diff HEAD~1 --stat -- bookit
$ git log --oneline | wc -l
21
```
Le corrigé ajoute six scénarios (dimanche, 60 jours pile, 60 jours et 1 minute, trois créneaux de REG-05) : `26 passed` et `surviving mutants: 0 (0.00%)`, contre 7 à la passe 1. Une autre classification donne d'autres nombres, avec au moins le scénario du dimanche et moins de survivants qu'à la passe 1. Sortie provisoire, à relever au rejeu.
:::

::: indice
L'agent écrit un test dans `tests/` sans scénario dans `spec.md` ni le `.feature` : `git restore tests`, le trou se comble dans la spécification d'abord. L'agent classe le dimanche « équivalent » : lui demander une entrée qui distingue le mutant du code (dimanche 7 juin 2026, 10h00 à 11h00). Le scénario ajouté échoue : le code accepte le dimanche, c'est un vrai trou, ajouter le code à la main dans la même session (« corrige `_check_hours` pour refuser le dimanche »). `init` refuse d'écraser : `rm mutation.sqlite` d'abord. Un scénario de 60 jours pile exige un instant courant dont le soixantième jour tombe un jour de semaine (vendredi 29 mai 2026 à 9h00 pour le mardi 28 juillet).
:::

### Corrigé {.corrige}

Le suivi des deux passes, dans `specs/001-valider-reservation/mutation.md`.

```markdown file="../tp/tp06/specs/001-valider-reservation/mutation.md"
```

Le scénario du dimanche, tel qu'il entre dans le `.feature`.

```gherkin file="../tp/tp06/specs/001-valider-reservation/valider-reservation.feature" lines="49-53"
```

Vérification : `uv run pytest -q` rend `26 passed`, `uv run cr-report mutation.sqlite | tail -1` rend `surviving mutants: 0 (0.00%)` après la passe 2.

## Glossaire : tests {kicker="Glossaire"}

- **TDD** : test écrit avant le code
- **Suite rouge, verte** : au moins un test échoue, tous passent
- **BDD** : scénarios Gherkin exécutés comme tests

|||

- **Définition d'étape** : fonction liée à une phrase du `.feature`
- **Fixture** : valeur que pytest fournit à un test ou à une étape
- **Couverture** : part du code exécutée par les tests

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation : TDD, suite rouge et suite verte, BDD, définition d'étape, fixture, couverture.
:::

## Glossaire : mutants {kicker="Glossaire"}

- **Mutation testing** : code modifié pour vérifier qu'un test échoue
- **Mutant** : version modifiée du code, tuée, survivante ou incompétente
- **Trou dans les tests** : survivant qu'aucun scénario ne voit

|||

- **Mutant équivalent** : survivant sans effet observable
- **Converger** : ramener code et artefacts à l'accord

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation : mutation testing, mutant (tué, survivant ou incompétent), trou dans les tests, mutant équivalent, converger.
:::
