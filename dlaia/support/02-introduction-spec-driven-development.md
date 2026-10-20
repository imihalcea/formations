# Introduction au Spec Driven Development

Une méthode, une spécification, un outil

::: notes
Module 2, 50 min d'exposé puis TP 1 partie B (30 min). Point de départ : les deux dernières idées clés du module 1 (l'intention écrite avant le code, la méthode et les artefacts qui restent) et le débrief du TP 1 partie A : la v2 couvre les cinq règles, rien ne dit qu'elle est juste. Le module nomme la méthode (Spec Driven Development) et l'outil (Spec Kit). Aucune démonstration n'appelle le modèle : la première commande Spec Kit lancée est `constitution`, au TP 3.
:::

## Deux fonctions produites, aucune preuve qu'elles sont justes {kicker="Du prompt au projet"}

| Critère | v1 | v2 |
|---|---|---|
| règles couvertes | aucune des cinq, domaine d'hôtel inventé | les cinq, dans l'ordre du fichier |
| bornes | aucune borne métier | 30 min, 4 h et 20h00 acceptés |
| codes de refus | aucun, des messages en français | les cinq, en valeur de retour |
| conforme ? | | |

Les trois premières lignes disent ce que chaque fichier contient. La quatrième reste vide : rien n'a été écrit pour la remplir, aucun test ne la tranche.

::: notes
Tableau condensé du corrigé `tp/tp01/echauffement/docs/comparaison.md` (relevé du 20 octobre 2026) ; le corrigé complet est cité par `file=` dans l'énoncé du TP 1 partie A. En salle, partir des tableaux remplis au TP : les lignes diffèrent dans le détail, la quatrième manque partout.
Pourquoi la ligne reste vide : « bornes incluses » dans le prompt v2 ne tranche ni 20h00 pile, ni le samedi, ni deux réservations qui se touchent ; au rejeu sous Claude Code, REG-02 ne bornait que `start < 8h` et `end > 20h`, une demande de 23h00 à 02h00 passait, et le tableau rempli ne le montre pas. Un test l'aurait montré ; aucun n'existe.
Le dossier `~/echauffement/` est jetable : ce qui y a été appris sur le domaine n'est écrit nulle part.
:::

## Ce que le prompt ne porte pas : décisions, emplacement du code, preuve, session suivante {kicker="Du prompt au projet"}

![À gauche le prompt v2 à quatre composants dans une session, qui produit une fonction ; à droite le projet, quatre cases marquées d'un point d'interrogation : décisions non tranchées, emplacement du code, preuve que le code est juste, session suivante](images/02-prompt-projet.svg)

Le prompt v2 tient dans une session et produit une fonction. Le projet a besoin de ce que le prompt ne contient pas : les décisions non tranchées, l'emplacement du code, la preuve qu'il est juste et une session suivante qui retrouve tout cela.

::: notes
Reprend la slide « À la fin de la session, seul le dépôt reste » : la session suivante ne connaît que les fichiers. Ici, un seul fichier reste, le code ; ni les règles qui l'ont produit, ni les choix faits en chemin (20h00 pile accepté par `<=`), ni ce qui a été vérifié.
Décisions non tranchées : les règles métier ne disent rien de 20h00 pile, des jours fériés, de deux réservations qui se touchent à 10h00 ; l'agent a tranché chacune en silence, dans le code, et le prompt suivant ne le saura pas.
Emplacement : la v2 est un fichier isolé ; dans bookit, où va `validate_booking`, à côté de quoi, avec quelles importations ? Rien dans le prompt ne le dit.
Chacune des quatre cases reçoit un artefact dans la suite du module : décisions (ADR, réponses aux questions de `clarify`), emplacement du code (constitution, plan), preuve (scénarios), session suivante (tout cela versionné).
:::

## Un prompt produit une fonction ; un projet demande une intention écrite. {.statement kicker="Du prompt au projet"}

::: notes
Conclut les deux slides précédentes et reprend la dernière idée clé du module 1 : la méthode et les artefacts restent quand le modèle et le harnais changent. Le prompt est l'unité de la session ; l'intention écrite est l'unité du projet. La section suivante donne son nom à la méthode.
:::

## Le Spec Driven Development : la spécification écrite précède et pilote le code {kicker="Le SDD"}

![Suite spécification, versionnée, code, vérifié, avec une flèche de retour : le code est vérifié contre la spécification](images/02-sdd.svg)

Le Spec Driven Development (SDD) met l'intention écrite dans un fichier, la spécification, qui précède et pilote le code. Spec Kit, l'outil de GitHub pour cette méthode, la résume ainsi : « define what and why before deciding how to build it ».

::: sources
- [Spec Kit, README v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/README.md)
- [Spec Kit, `spec-driven.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/spec-driven.md)
- [GitHub Blog, Spec-driven development with AI, 2 septembre 2025](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
:::

::: notes
Même suite que la slide « L'intention écrite, versionnée, vérifiée » : l'intention a reçu un nom (spécification) et un fichier (`spec.md`).
README : « Define what and why before deciding how to build it. » `spec-driven.md` : « The specification becomes the primary artifact. Code becomes its expression ». Blog de GitHub, Den Delimarsky, 2 septembre 2025 : la spécification est « a contract for how your code should behave ».
« Précède et pilote » : précède, parce qu'elle est écrite et commitée avant le code ; pilote, parce que l'agent la lit pour produire le plan, les tâches et le code, et que le code est relu contre elle.
Spec Kit est nommé ici ; son installation et ses commandes viennent dans la section « Spec Kit ».
:::

## Le workflow SDD : une constitution par projet, quatre artefacts par spécification {kicker="Le SDD"}

![Un bloc constitution en amont, puis une frise à quatre étapes : spécification, plan, tâches, code et tests, un fichier sous chaque étape, un repère point de contrôle après chaque étape](images/02-workflow.svg)

Le workflow est la suite ordonnée des étapes du SDD, chacune produisant un artefact versionné. La constitution (les principes du projet) est écrite une fois par projet ; chaque spécification est suivie du plan (les choix techniques qui la réalisent), des tâches (les parts du plan, vérifiables une par une), puis du code et de ses tests.

::: sources
- [GitHub Blog, Spec-driven development with AI, 2 septembre 2025](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Spec Kit, README v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/README.md)
:::

::: notes
README : « Constitution once per project; specify → plan → tasks → implement → converge per feature. » Blog : quatre phases, specify (ce que l'on construit et pourquoi), plan (pile, architecture, contraintes), tasks (petits lots testables séparément), implement (l'agent traite les tâches, le développeur relit des changements ciblés).
Constitution : les principes du projet ; la slide de définition est dans la section « Spec Kit », avec le fichier. Ici, retenir qu'elle est en amont, vaut pour toutes les spécifications et est respectée par chaque plan et chaque diff.
Les quatre losanges, un après chaque étape, sont les points de contrôle, définis sur la slide suivante ; le dernier, après le code, est la relecture du diff et des tests.
Plan et tâches sont définis ici en une ligne ; le module 5 en fait le contenu (plan sous contrôle de la constitution, une tâche par session).
:::

## À chaque point de contrôle, le développeur relit l'artefact et décide {kicker="Le SDD"}

| Point de contrôle | Ce qui est relu | Ce qui est décidé |
|---|---|---|
| après la spécification | `spec.md` | acceptée, corrigée ou refusée |
| après le plan | `plan.md` | conforme aux choix de l'équipe, ou renvoyé |
| après les tâches | `tasks.md` | assez petites pour être vérifiées une par une |
| après le code | le diff et les tests | tests verts, diff conforme à la spécification |

Un point de contrôle est le moment du workflow où le développeur lit l'artefact produit, le corrige ou le refuse, puis le commite avant l'étape suivante.

::: sources
- [GitHub Blog, Spec-driven development with AI, 2 septembre 2025](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Spec Kit, `spec-driven.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/spec-driven.md)
:::

::: notes
Blog : « The process builds in explicit checkpoints for you to critique what's been generated » ; « Crucially, your role isn't just to steer. It's to verify. » `spec-driven.md` : « team-reviewed specifications », et, pour les tests, « Tests are validated and approved by the user » avant tout code.
L'agent produit, le développeur vérifie : même partage que la slide « Avec l'agent, le développeur formule, puis relit » du module 1, répété à chaque étape.
« Puis le commite » : c'est la règle des TP, le stagiaire commite lui-même après chaque étape ; l'agent ne commite pas. Le commit est la trace de la décision.
Dans Spec Kit, le fichier de workflow nomme ces moments `gate` ; la slide « Le workflow speckit » le montre.
:::

## Chaque étape du workflow produit un artefact relu par un humain. {.statement kicker="Le SDD"}

::: notes
Conclut les trois slides de la section : la méthode, ses étapes et ses artefacts, le point de contrôle. La section suivante ouvre le premier artefact, la spécification.
:::

## La spécification : ce que le logiciel doit faire et pourquoi {kicker="La spécification"}

```markdown
# Feature Specification: [FEATURE NAME]

## User Scenarios & Testing *(mandatory)*
## Requirements *(mandatory)*
## Success Criteria *(mandatory)*
## Assumptions
```

La spécification dit ce que le logiciel doit faire et pourquoi, sans dire comment. Le fichier à trous `spec-template.md` de Spec Kit lui impose quatre sections : les parcours utilisateur par priorité et les cas limites, les exigences numérotées, les critères de succès mesurables, les hypothèses.

::: sources
- [Spec Kit, `templates/spec-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/spec-template.md)
:::

::: notes
Titres `##` relevés dans le fichier déposé par `specify init` (`.specify/templates/spec-template.md`, 131 lignes), identifiants et commentaires retirés ; sous-titres omis à l'écran : `### User Story 1 - [Brief Title] (Priority: P1)` à `User Story 3`, `### Edge Cases`, `### Functional Requirements`, `### Key Entities`, `### Measurable Outcomes`.
En-tête du fichier : `**Feature Branch**`, `**Created**`, `**Status**: Draft`, `**Input**`. Sans extension git, `Feature Branch` reçoit le nom du dossier `specs/NNN-nom`.
Chaque story a ses scénarios d'acceptation déjà en `**Given** / **When** / **Then**` : la section « Quatre formats » y revient.
« Fichier à trous » : nom retenu dans ce module pour les fichiers de `.specify/templates/` ; le mot template est défini au module 5, avec les fichiers de `.specify/templates/overrides/`.
:::

## L'exigence : une phrase vérifiable, numérotée {kicker="La spécification"}

| Exigence (illustration) | Vérifiable ? |
|---|---|
| REG-03 : une demande qui commence moins de 2 heures après l'instant courant est refusée avec `lead_time` | oui, un test tranche |
| le système répond vite | non, aucun chiffre |
| la durée maximale est [NEEDS CLARIFICATION: 4 h ou 8 h ?] | la question est posée, rien n'est deviné |

Une exigence est une phrase vérifiable de la spécification, numérotée. Le fichier à trous exige des critères mesurables et marque `[NEEDS CLARIFICATION]` ce que la description ne tranche pas, trois marqueurs au plus.

::: sources
- [Spec Kit, `templates/spec-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/spec-template.md)
- [Spec Kit, `templates/commands/specify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md)
:::

::: notes
Dans bookit, chaque règle métier du module 1 devient une exigence, numérotée REG-NN ; la spécification du TP 4 en ajoute deux (REG-06, REG-07) issues des réponses à `clarify`. Le fichier à trous numérote `FR-001` en `System MUST …` ; le fichier `overrides/spec-template.md` du TP 4 impose REG-NN.
`spec-template.md` : commentaire « ACTION REQUIRED: Define measurable success criteria. These must be technology-agnostic and measurable. » ; exemple `FR-006: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]`.
`specify.md` : « LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total », réservés aux décisions critiques ; les autres inconnues deviennent des hypothèses dans `Assumptions` (« Record reasonable defaults in the Assumptions section »). `spec-driven.md` : « Don't guess: If the prompt doesn't specify something, mark it. »
Vérifiable : un test peut trancher, oui ou non. « Vite » ne se teste pas ; « en moins de 200 ms » se teste, et `specify.md` le classe dans le COMMENT. La question `4 h ou 8 h ?` sera posée par `clarify` au TP 4.
:::

## Le QUOI dans la spécification, le COMMENT dans le plan {kicker="La spécification"}

| QUOI, dans la spécification (illustration) | COMMENT, dans le plan (illustration) |
|---|---|
| une demande refusée rend le code de la première règle enfreinte | `InvalidBooking(code)` en valeur de retour, dans `bookit/domain/` |
| aucun chevauchement sur une même ressource | lecture des réservations de la ressource dans SQLite |
| la décision dépend du seul instant courant fourni | `now` reçu en paramètre de `validate_booking` |
| une demande de plus de 4 heures est refusée avec `duration` | comparaison de `end - start` à `timedelta(hours=4)` dans `validate_booking` |

Le prompt `specify` de Spec Kit impose ce partage : « Focus on WHAT users need and WHY. Avoid HOW to implement (no tech stack, APIs, code structure) ».

::: sources
- [Spec Kit, `templates/commands/specify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md)
- [Spec Kit, `spec-driven.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/spec-driven.md)
:::

::: notes
`specify.md`, « Quick Guidelines » : « Focus on WHAT users need and WHY. » puis « Avoid HOW to implement (no tech stack, APIs, code structure). » ; critères de succès « Technology-agnostic: No mention of frameworks, languages, databases, or tools ».
`spec-driven.md` : « From the PRD, AI generates implementation plans that map requirements to technical decisions » ; « Every technology choice has documented rationale ».
Test rapide pour classer une phrase : si elle change quand on change de langage ou de base, c'est du COMMENT. « Valeur de retour » contre « exception » est un choix technique : il va dans le plan, et dans un ADR (section suivante) parce qu'il engage tout le projet.
Les quatre lignes de gauche viennent des règles métier et du prompt v2 du TP 1 ; celles de droite anticipent le squelette hexagonal présenté au module 3.
:::

## La spécification porte le QUOI ; le plan porte le COMMENT. {.statement kicker="La spécification"}

::: notes
Conclut la section : contenu de la spécification, exigence vérifiable, partage QUOI et COMMENT. La section suivante donne les formats dans lesquels ces phrases s'écrivent.
:::

## Quatre formats se combinent pour écrire l'intention {.facts kicker="Quatre formats"}

- **Markdown structuré** sections titrées et exigences numérotées qui donnent sa structure à `spec.md`
- **ADR** architecture decision record : note qui trace une décision d'architecture, son contexte et ses conséquences
- **EARS** Easy Approach to Requirements Syntax : syntaxe d'exigence en une phrase à mots-clés
- **Gherkin** syntaxe Given, When, Then d'un cas d'exigence, exécutable

::: sources
- [Spec Kit, `templates/spec-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/spec-template.md)
- [Michael Nygard, Documenting Architecture Decisions, 15 novembre 2011](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [Alistair Mavin, EARS](https://alistairmavin.com/ears/)
- [Cucumber, Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
:::

::: notes
Les quatre slides suivantes prennent un format chacune, puis une slide les place dans le dépôt. Aucun des quatre ne remplace les autres : le Markdown structuré donne le cadre, l'ADR trace une décision, EARS écrit une exigence, Gherkin écrit un cas.
Sigles développés ici une fois ; ensuite ADR et EARS seuls.
Les TP 3 à 6 emploient les quatre : ADR au TP 3, EARS et Gherkin au TP 4 par les fichiers `ears` et `gherkin` de `.claude/skills/` fournis, `.feature` exécuté au TP 6.
:::

## L'ADR trace une décision et son pourquoi {kicker="Quatre formats"}

```markdown
# 1. Un refus est une valeur de retour, jamais une exception

Statut : acceptée
Contexte : une demande enfreint souvent une règle ; ce cas est attendu
et l'appelant doit le lire sans interrompre son traitement.
Décision : validate_booking rend None si la demande est acceptée,
sinon InvalidBooking(code).
Conséquences : aucun try autour de l'appel ; chaque code de refus
est une valeur testable ; une exception signale un bogue, jamais un refus.
```

Un ADR tient en cinq parties : titre, contexte (les forces en présence), décision, statut, conséquences. Illustration : le premier ADR de bookit.

::: sources
- [Michael Nygard, Documenting Architecture Decisions, 15 novembre 2011](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
:::

::: notes
Nygard, 15 novembre 2011 : Title (« short noun phrases »), Context (« the forces at play, including technological, political, social, and project local »), Decision (« our response to these forces », « stated in full sentences, with active voice »), Status (« proposed », « accepted »), Consequences (« the resulting context, after applying the decision »).
Règles de tenue : une décision annulée reste dans le dépôt, marquée « superseded » (« we will keep the old one around, but mark it as superseded ») ; « Numbers will not be reused ». Nygard range les ADR dans `doc/arch/adr-NNN.md`, un fichier par décision, numéroté ; bookit retient `docs/adr/` (convention du fil rouge, `formateur/fil-rouge.md`).
L'ADR d'illustration est à aligner sur `tp/fichiers/adr/` quand le module 3 crée les ADR fournis du TP 3 (relevé : le dossier n'existe pas encore).
Pourquoi un ADR et pas une ligne de plan : la décision vaut pour tout le projet, pas pour une spécification ; elle survit aux plans.
:::

## EARS : une exigence en une phrase à mots-clés {kicker="Quatre formats"}

| Patron | Forme de la phrase | Exemple bookit (illustration) |
|---|---|---|
| toujours | The system shall … | bookit SHALL refuser une demande de plus de 4 heures avec le code `duration` |
| sur un événement | When …, the system shall … | WHEN une demande commence moins de 2 heures après l'instant courant, bookit SHALL la refuser avec le code `lead_time` |
| dans un état | While …, the system shall … | WHILE la ressource est déjà réservée aux mêmes heures, bookit SHALL refuser la demande avec le code `overlap` |
| cas indésirable | If …, then the system shall … | IF la demande vise un samedi ou un dimanche, THEN bookit SHALL la refuser avec le code `hours` |

Le mot-clé dit quand l'exigence s'applique ; la phrase se lit seule et se teste.

::: sources
- [Alistair Mavin, EARS](https://alistairmavin.com/ears/)
:::

::: notes
EARS, Easy Approach to Requirements Syntax : Mavin et collègues, Rolls-Royce, en analysant la réglementation de navigabilité d'un calculateur de moteur ; première publication en 2009. Six patrons sur le site : ubiquitous (`The <system name> shall <system response>`), event-driven (`When <trigger>, the <system name> shall <system response>`), state-driven (`While <precondition(s)>, …`), unwanted behaviour (`If <trigger>, then …`), optional feature (`Where <feature is included>, …`) et complex (`While <precondition(s)>, When <trigger>, the <system name> shall <system response>`), qui combine les précédents ; les deux derniers, absents du tableau, servent aux variantes de produit et aux conditions combinées.
Convention du tableau (mots-clés en capitales, phrase en français) : celle du fichier `ears` de `.claude/skills/` fourni au TP 4, à fixer avec le module 4 ; si ce fichier retient une autre forme, aligner cette slide.
Les quatre exemples sont les règles REG-01, REG-03, REG-05 et REG-02 ; « réservée aux mêmes heures » est pris au sens courant, le module 3 définit créneau et réservation confirmée.
Ce que EARS apporte à l'agent : une phrase par exigence, un seul déclencheur, un seul verbe ; moins de place pour une interprétation.
:::

## Gherkin : un scénario en Given, When, Then {kicker="Quatre formats"}

```gherkin
Feature: Valider une demande de réservation

  Scenario: REG-03, préavis inférieur à 2 heures
    Given l'instant courant est le mardi 2 juin 2026 à 9h00
    When une demande vise la salle A de 10h00 à 11h00
    Then la demande est refusée avec le code lead_time

  Scenario: REG-03, préavis de 3 heures
    Given l'instant courant est le mardi 2 juin 2026 à 9h00
    When une demande vise la salle A de 12h00 à 13h00
    Then la demande est acceptée
```

Chaque scénario est un cas d'une exigence (illustration) : Given pose le contexte, When décrit l'action, Then le résultat observable.

::: sources
- [Cucumber, Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [pytest-bdd, documentation](https://pytest-bdd.readthedocs.io/en/stable/)
:::

::: notes
Gherkin Reference : « Given steps are used to describe the initial context of the system », « When steps are used to describe an event, or an action », « Then steps are used to describe an expected outcome, or result » ; chaque pas commence par Given, When, Then, And ou But ; `Scenario` est synonyme de `Example` ; un fichier `.feature` porte une Feature et ses scénarios. Un en-tête `# language: fr` autorise Soit, Quand, Alors ([Cucumber, Gherkin Languages](https://cucumber.io/docs/gherkin/languages/)) ; la convention (mots-clés anglais, phrases en français) est celle du fichier `gherkin` de `.claude/skills/` du TP 4, à confirmer avec le module 4.
pytest-bdd : « implements a subset of the Gherkin language », « does not require a separate runner » ; `@scenario('fichier.feature', 'Titre')` ou `scenarios('dossier')` lient les scénarios à des fonctions pytest. Module 6.
Une exigence, plusieurs scénarios : REG-03 a au moins le cas refusé (1 h de préavis) et le cas accepté (2 h pile, borne tranchée au TP 4).
Le `Then` est observable : un code de refus, pas « le système fonctionne ».
:::

## Où chaque format vit dans le dépôt {kicker="Quatre formats"}

![À gauche l'arbre du dépôt bookit : docs/adr, specs/001-valider-reservation/spec.md avec ses sections Requirements et User Scenarios, le fichier .feature, tests/ ; à droite la règle métier d'un artefact à l'autre : exigence, scénario, test](images/02-formats.svg)

Les ADR vont dans `docs/adr/`, le Markdown structuré dans `spec.md`, les exigences EARS dans sa section `Requirements`, les scénarios dans `User Scenarios & Testing` puis dans un `.feature` exécutable. Une règle métier traverse les trois artefacts : exigence, scénario, test.

::: sources
- [Spec Kit, `templates/spec-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/spec-template.md)
:::

::: notes
`spec-template.md` écrit déjà les scénarios d'acceptation en `**Given** / **When** / **Then**` sous chaque story : le Gherkin du `.feature` en est la copie exécutable.
Trajectoire du fil rouge (`formateur/fil-rouge.md`) : `docs/adr/` au TP 3 ; `specs/001-valider-reservation/spec.md` au TP 4 ; `valider-reservation.feature` au TP 5 ; `tests/test_valider_reservation.py` au TP 6. L'arbre montre l'état final.
Un seul nom pour la règle d'un bout à l'autre : REG-03 dans le tableau des règles, dans `Requirements`, dans le titre du scénario, dans le test. C'est ce qui permet de relire un diff contre la spécification.
:::

## Un format par besoin : structure, décision, exigence, scénario. {.statement kicker="Quatre formats"}

::: notes
Conclut la section : un format par besoin, chacun à sa place dans le dépôt. La section suivante installe l'outil qui déroule le workflow.
:::

## Spec Kit installe les commandes du SDD dans l'agent {kicker="Spec Kit"}

```console
$ uv tool install specify-cli==1.2.2
$ specify version 2>&1 | grep -o 'CLI Version *[0-9.]*'
CLI Version    1.2.2
$ specify init hello-spec --integration claude --script sh
├── ● Check required tools (ok)
├── ● Install integration (Claude Code)
├── ● Constitution setup (copied from template)
├── ● Install bundled workflow (speckit installed)
└── ● Finalize (project ready)
```

Spec Kit est l'outil libre de GitHub, annoncé le 2 septembre 2025 ; la version épinglée est `specify-cli` 1.2.2. `specify init` dépose dans un projet les commandes de l'agent, la constitution et le workflow (journal abrégé).

::: sources
- [GitHub Blog, Spec-driven development with AI, 2 septembre 2025](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Spec Kit, release v1.2.2](https://github.com/github/spec-kit/releases/tag/v1.2.2)
- [PyPI, specify-cli](https://pypi.org/project/specify-cli/)
- [Spec Kit, `docs/install/pypi.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/install/pypi.md)
:::

::: notes
Sortie relevée le 20 octobre 2026 sur le poste de préparation et confirmée au rejeu du TP 1 partie B sous les deux outils (`specify-cli` déjà installé, `uv tool install` répond « is already installed » ; la durée d'un premier téléchargement depuis PyPI reste à relever sur la VM) ; `specify version` affiche un cadre, d'où le `grep`. Journal de `specify init` relevé au rejeu du 20 octobre 2026 (`tmp/rejeu/claude-code/journal-tp01b/etape-02-init.txt`) : neuf lignes, dont « Select coding agent integration (claude) », « Select script type (sh) », « Install shared infrastructure (scripts (sh) + templates) » et « Ensure scripts executable (6 updated) » sont omises à l'écran ; sous Open Code, la ligne d'intégration dit « (OpenCode) ». Les trois lignes gardées amorcent les slides suivantes : constitution, commandes, workflow. Release v1.2.2 publiée le 19 octobre 2026 sur GitHub et sur PyPI. `docs/install/pypi.md` donne la forme épinglée `uv tool install specify-cli==X.Y.Z`.
Releases hebdomadaires : le support cite la version épinglée, les corrigés sont refaits si elle change. `specify self upgrade` reconstruit l'installation depuis GitHub : à ne pas lancer sur la VM.
La release propose aussi `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.2.2`, même exécutable.
Si `specify` est introuvable après l'installation : `uv tool update-shell` puis nouveau terminal, ou `export PATH="$HOME/.local/bin:$PATH"` ; repli prévu dans l'énoncé du TP.
:::

## La constitution : les principes du projet, écrits une fois {kicker="Spec Kit"}

```markdown
# [PROJECT_NAME] Constitution
## Core Principles
### [PRINCIPLE_1_NAME]
[PRINCIPLE_1_DESCRIPTION]
```

Le fichier que `specify init` dépose, à trous.

|||

```markdown
# bookit Constitution
## Core Principles
### I. Un refus est une valeur de retour
Une règle enfreinte rend un code ; une exception signale un bogue.
```

Illustration : un premier principe pour bookit.

|||

La constitution est le fichier `.specify/memory/constitution.md` : les principes du projet, que chaque plan et chaque diff respectent. Un principe est une règle de la constitution.

::: sources
- [Spec Kit, `templates/constitution-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/constitution-template.md)
- [Spec Kit, `templates/commands/constitution.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/constitution.md)
:::

::: notes
`head -8 .specify/memory/constitution.md` relevé le 20 octobre 2026 : copie exacte de `templates/constitution-template.md` (vérifié par `diff`, `formateur/spec-kit.md` § 5), commentaires HTML retirés à l'écran. Suite du fichier : cinq `### [PRINCIPLE_N_NAME]`, deux sections libres, `## Governance`, ligne `**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]`.
Le chemin `.specify/memory/constitution.md` est fixé par le prompt de la commande (`templates/commands/constitution.md` : « You are updating the project constitution at `.specify/memory/constitution.md` »). La commande `constitution` remplit les trous, numérote en semver et écrit un « Sync Impact Report » en commentaire HTML à retirer avant commit ; TP 3.
Le module 3 dit ce qu'est un principe efficace : vérifiable sur un diff. Ici, seule la place du fichier et son état à trous comptent.
Le principe d'illustration reprend l'ADR 1 : la constitution porte la règle, l'ADR porte son pourquoi.
:::

## Des étapes du workflow aux commandes Spec Kit {kicker="Spec Kit"}

| Étape | Commande | Artefact écrit |
|---|---|---|
| constitution | `constitution` | `.specify/memory/constitution.md` |
| spécification | `specify` | `specs/NNN-nom/spec.md` |
| plan | `plan` | `specs/NNN-nom/plan.md` |
| tâches | `tasks` | `specs/NNN-nom/tasks.md` |
| code | `implement` | le code, et `tasks.md` coché |

Une commande Spec Kit est un prompt versionné dans le projet, invoqué `/speckit-<commande>` sous Claude Code et `/speckit.<commande>` sous Open Code.

::: sources
- [Spec Kit, README v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/README.md)
- [Spec Kit, `docs/reference/integrations.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/integrations.md)
- [Spec Kit, `templates/commands/specify.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md), [`plan.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/plan.md), [`tasks.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/tasks.md), [`implement.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/implement.md) v1.2.2
- [Claude Code, Skills](https://code.claude.com/docs/en/skills)
- [Open Code, Commands](https://opencode.ai/docs/commands/)
:::

::: notes
README : « Constitution once per project; specify → plan → tasks → implement → converge per feature. » `integrations.md` : intégration `claude` « installs skills in `.claude/skills` », invocation `/speckit-<command>` ; intégration `opencode`, commandes dans `.opencode/commands`. Doc Claude Code : un skill de projet `.claude/skills/<nom>/SKILL.md` s'invoque `/<nom>`. Doc Open Code : « The markdown file name becomes the command name », `test.md` donne `/test`.
« Prompt versionné » : chaque fichier de commande est un prompt Markdown avec un frontmatter, commité avec le projet ; le module 5 le montre et le personnalise. Artefacts par commande d'après les prompts des commandes (`specify.md` : « Set `SPECIFY_FEATURE_DIRECTORY` to `specs/<directory-name>` » puis copie du fichier à trous dans `spec.md` ; `plan.md`, `tasks.md` et `implement.md` écrivent dans ce dossier) et `formateur/spec-kit.md` § 4 ; `specify` écrit aussi `checklists/requirements.md` et `.specify/feature.json` (local, ignoré par git) ; `plan` écrit aussi `research.md`, `data-model.md`, `quickstart.md`.
Démonstration 3 (à relever sur la VM, non rejouable hors TUI) : les deux TUI côte à côte dans `demo-claude` et `demo-opencode` ; `claude --model claude-sonnet-4-6`, taper `/speckit` sans valider, lire les dix propositions et leur description ; `opencode`, taper `/speckit.`, lire ; Échap puis `/exit` dans les deux. Résultat attendu : dix propositions par outil, descriptions identiques, séparateur différent. Relevé hors TUI le 20 octobre 2026 : dix fichiers de chaque côté, dix `description:` identiques mot pour mot entre `.claude/skills/speckit-*/SKILL.md` et `.opencode/commands/speckit.*.md` (`diff` vide) ; corps des prompts identiques au séparateur près, plus deux lignes propres à Claude Code sur les hooks (« replace dots with hyphens »). À relever à l'essai sur la VM : le texte et l'ordre des propositions, la présence de la description à côté du nom, et si la saisie de `/speckit.` filtre bien la liste sous Open Code. Sous Open Code, Échap est lié à `prompt.autocomplete.hide` ([Open Code, Keybinds](https://opencode.ai/docs/keybinds/), page v1 sans mention de version ; la page v2 répond 404).
Sous Claude Code, sans `--integration-options="--no-model-invocation"`, le modèle peut lancer une commande Spec Kit de lui-même ; décision pour le TP 3 sur l'issue #68.
:::

## Quatre commandes de vérification : clarify, checklist, analyze, converge {kicker="Spec Kit"}

| Commande | Ce qu'elle lit | Ce qu'elle rend |
|---|---|---|
| `clarify` | `spec.md` | jusqu'à cinq questions, réponses consignées dans `spec.md` |
| `checklist` | `spec.md`, `plan.md`, `tasks.md` | une liste de questions sur la qualité des exigences |
| `analyze` | `spec.md`, `plan.md`, `tasks.md` | un rapport d'incohérences, sans rien modifier |
| `converge` | `spec.md`, `plan.md`, `tasks.md`, le code | les tâches manquantes ajoutées à `tasks.md`, jusqu'à « Converged » |

Ces commandes vérifient sans produire d'étape nouvelle. Spec Kit installe dix commandes : cinq d'étape, ces quatre, et `taskstoissues`, dépréciée.

::: sources
- [Spec Kit, README v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/README.md)
- [Spec Kit, `templates/commands/clarify.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/clarify.md), [`checklist.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/checklist.md), [`analyze.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/analyze.md), [`converge.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/converge.md) v1.2.2
- [Spec Kit, `templates/commands/taskstoissues.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/taskstoissues.md)
:::

::: notes
README : « Add clarification, checklists, and consistency analysis when you need extra quality gates » ; « Repeat implement → converge until convergence reports Converged. » Encadrés affichés par `specify init` (relevé du 20 octobre 2026) : « Next Steps » nomme six commandes (`constitution`, `specify`, `plan`, `tasks`, `implement`, `converge`) ; « Enhancement Skills » sous Claude Code, « Enhancement Commands » sous Open Code, classe `clarify`, `analyze` et `checklist` en « optional » : `clarify` avant `plan`, `checklist` après `plan`, `analyze` après `tasks` et avant `implement` ; `taskstoissues` n'apparaît dans aucun encadré, neuf commandes nommées sur dix installées.
Détail, d'après les prompts des commandes (et `formateur/spec-kit.md` § 4) : `clarify` pose une question à la fois (« Present EXACTLY ONE question at a time »), cinq au plus (« Maximum of 5 total questions across the whole session »), et écrit chaque réponse sous `## Clarifications` ; `checklist` lit `spec.md`, `plan.md` et `tasks.md`, écrit `checklists/<domaine>.md` (« Format: `[domain].md` »), des questions sur les exigences (« Is 'prominent display' quantified? »), jamais sur le code, et `implement` s'arrête si une checklist a des cases non cochées ; `analyze` est en lecture seule (« STRICTLY READ-ONLY: Do not modify any files »), six passes, sévérité CRITICAL sur un MUST de la constitution ; `converge` compare le code à la spécification, au plan et aux tâches et ajoute une section `## Phase N: Convergence` à `tasks.md`, « byte-for-byte unchanged » si rien ne manque.
`taskstoissues` : « is deprecated and will be removed in a future minor release. Use the bundled `github` extension instead » ; crée des issues GitHub depuis `tasks.md`. Hors périmètre.
Les TP emploient `clarify` (TP 4), `analyze` (TP 5), `converge` (TP 6).
:::

## Le workflow `speckit` : six étapes installées par `specify init` {kicker="Spec Kit"}

```console
$ specify workflow list

Installed Workflows:

  Full SDD Cycle (speckit) v1.0.1
    Runs specify → plan → tasks → implement with review gates
```

Le fichier `.specify/workflows/speckit/workflow.yml` enchaîne `specify`, `review-spec`, `plan`, `review-plan`, `tasks` et `implement` : quatre commandes et deux points de contrôle.

::: sources
- [Spec Kit, `docs/reference/workflows.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/workflows.md)
- [Spec Kit, `src/specify_cli/integrations/opencode/__init__.py` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/src/specify_cli/integrations/opencode/__init__.py)
- [Open Code v2, CLI](https://opencode.ai/v2/docs/cli/)
:::

::: notes
Sortie relevée le 20 octobre 2026 dans `demo-claude` ; fichier version 1.0.1. `workflows.md` : `specify workflow list` liste les workflows installés ; `specify workflow run speckit -i spec="…"` lance le workflow ; `specify workflow resume <run_id>` reprend un workflow suspendu ou en échec, désigné par son `<run_id>`. Le moteur lance l'outil en ligne de commande hors session interactive ; pour Open Code, l'intégration de Spec Kit 1.2.2 construit `opencode run --command speckit.specify …` (`build_exec_args` dans `specify_cli/integrations/opencode/__init__.py`), option documentée par Open Code v1 et absente d'Open Code v2 : la v2.0.32 répond « Unrecognized flag: --command », et `opencode run "/speckit.specify …"` envoie le texte brut au modèle sans développer la commande. `specify workflow run` est donc inutilisable avec Open Code v2 ; ne pas le lancer en démonstration.
Démonstration 2 (shell, rejouable) : dans `demo-claude`, `specify workflow list`, puis `cat .specify/workflows/speckit/workflow.yml` ; montrer les six étapes et les deux `type: gate`. Résultat observé le 20 octobre 2026 sous les deux outils : sortie identique au bloc console, six étapes, `grep -c 'type: gate'` donne 2, fichier identique dans `demo-claude` et `demo-opencode`, moins d'une seconde. La commande se lance depuis le projet initialisé : hors d'un dossier contenant `.specify/`, elle répond « Error: Not a Spec Kit project (no .specify/ directory) ». Dans `workflow.yml`, les étapes s'écrivent `command: speckit.specify` avec le point quelle que soit l'intégration ; `requires.integrations.any` cite `claude` et `opencode`.
Les TP restent sur les commandes invoquées une à une dans l'outil : chaque point de contrôle est alors une décision du stagiaire.
:::

## Le point de contrôle du workflow : `type: gate`, approuver ou rejeter {kicker="Spec Kit"}

```yaml
- id: review-spec
  type: gate
  message: "Review the generated spec before planning."
  options: [approve, reject]
  on_reject: abort
```

Un point de contrôle suspend le workflow jusqu'à `approve` ou `reject` ; un rejet arrête le workflow. Le workflow livré en place un avant le plan et un avant les tâches, aucun entre `tasks` et `implement`.

::: sources
- [Spec Kit, `docs/reference/workflows.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/workflows.md)
:::

::: notes
Extrait relevé le 20 octobre 2026 dans `.specify/workflows/speckit/workflow.yml` (`grep -c 'type: gate'` donne 2), reproduit à l'identique au rejeu sous les deux outils. Le second point de contrôle est `review-plan`, message « Review the plan before generating tasks. » `workflows.md` : les deux `gate` offrent `approve` et `reject`, `on_reject: abort` dans les deux cas.
Lien avec la slide « À chaque point de contrôle, le développeur relit l'artefact et décide » : le fichier nomme `gate` ce que le support nomme point de contrôle. Le workflow livré n'en met aucun avant `implement` ; les énoncés des TP en ajoutent un, le stagiaire relit `tasks.md` et le commite avant de lancer `implement`.
:::

## Ce que `specify init` dépose {.compare kicker="Spec Kit"}

::: claude-code
```console
$ specify init hello-spec --integration claude --script sh
$ ls -A hello-spec
.claude  .specify
```

Dix commandes dans `.claude/skills/speckit-<commande>/SKILL.md`, invoquées `/speckit-<commande>`.
:::

::: opencode
```console
$ specify init hello-spec --integration opencode --script sh
$ ls -A hello-spec
.opencode  .specify
```

Dix commandes dans `.opencode/commands/speckit.<commande>.md`, invoquées `/speckit.<commande>`.
:::

::: sources
- [Spec Kit, `docs/reference/integrations.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/integrations.md)
- [Spec Kit, `docs/reference/core.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/core.md)
:::

::: notes
Relevé du 20 octobre 2026 sur le poste de préparation, confirmé au rejeu sous les deux outils ; avec les deux outils dans le `PATH`, `specify init` affiche « Check required tools (ok) » sans `--ignore-agent-tools`, option utile seulement sur un poste sans l'outil ; `ls -A` sans la couleur du terminal. Dans les deux cas : aucun dépôt git (`git status` répond « fatal: not a git repository (or any of the parent directories): .git »), aucune branche, aucun `AGENTS.md`. `core.md` : « Git repository initialization and branching are managed by the git extension, which is not installed by default. » ; options `--integration`, `--script sh|ps|py`, `--here`, `--force`, `--ignore-agent-tools`.
Message « Agent Folder Security » affiché par `specify init` : conseille d'ajouter `.claude/` ou `.opencode/` au `.gitignore` ; pour les TP, les commandes se versionnent, ignorer ce conseil.
Démonstration 1 (shell, rejouable) : dans un dossier jetable hors de tout dépôt git (sur la VM, `~` convient ; à l'intérieur d'un dépôt, `git status` rend l'état du dépôt parent), `specify init demo-claude --integration claude --script sh`, `specify init demo-opencode --integration opencode --script sh`, `ls -A` des deux, `ls demo-claude/.claude/skills`, `ls demo-opencode/.opencode/commands`, `git status`, `head -12 demo-claude/.claude/skills/speckit-specify/SKILL.md`. Attendu : `.claude .specify` et `.opencode .specify` ; dix noms de chaque côté, identiques au séparateur près (`analyze`, `checklist`, `clarify`, `constitution`, `converge`, `implement`, `plan`, `specify`, `tasks`, `taskstoissues`) ; « fatal: not a git repository » ; un frontmatter `name: "speckit-specify"`, `description: …`, `metadata.source: "templates/commands/specify.md"`, `disable-model-invocation: false`, qui montre que la commande est un prompt versionné. Côté Open Code, `head -12 demo-opencode/.opencode/commands/speckit.specify.md` montre un frontmatter réduit à `description` et `handoffs` (vers `speckit.plan` et `speckit.clarify`), sans `name` ni `disable-model-invocation`. Résultat observé le 20 octobre 2026 sous les deux outils : conforme en tout point, moins d'une seconde par `init`, encadrés « Agent Folder Security » et « Next Steps » affichés.
Sur `~/bookit/` déjà extrait, au TP 3 : `specify init --here --force …`, les fichiers existants sont conservés.
:::

## Le dossier `.specify/` et le dossier `specs/` {kicker="Spec Kit"}

![Deux arbres : .specify/ avec memory/constitution.md, scripts/bash/, templates/ et workflows/speckit/workflow.yml, plus le dossier de commandes de l'outil ; specs/001-nom/ avec spec.md, plan.md, tasks.md](images/02-specify.svg)

`.specify/` porte la constitution, les scripts, les cinq fichiers à trous et le workflow. `specs/NNN-nom/` est créé par la commande `specify` et reçoit `spec.md`, `plan.md` et `tasks.md` ; aucune branche n'est créée, spécifications et code vivent sur `main`.

::: sources
- [Spec Kit, `docs/reference/core.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/core.md)
- [Spec Kit, `templates/commands/specify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md)
:::

::: notes
Relevé du 20 octobre 2026 (`find .specify -maxdepth 2 -type d`) : `integrations/`, `memory/`, `scripts/bash/`, `templates/`, `workflows/speckit/` ; six scripts (`common.sh`, `check-prerequisites.sh`, `create-new-feature.sh`, `resolve-template.sh`, `setup-plan.sh`, `setup-tasks.sh`) ; cinq fichiers à trous (`constitution`, `spec`, `plan`, `tasks`, `checklist`). Détail dans `formateur/spec-kit.md` § 2.
`core.md` : `.specify/.gitignore` exclut l'état local (`feature.json`, `extensions/*/local-config.yml`) ; constitution, fichiers à trous et scripts se partagent. Relevé du fichier déposé : il exclut aussi `integrations/packages/`. `specify.md` : copie du fichier à trous dans `SPECIFY_FEATURE_DIRECTORY/spec.md`, chemin persisté dans `.specify/feature.json` ; numérotation séquentielle `NNN` d'après `specs/`.
Pas de branche : sans extension git, `specify` crée le dossier et reste sur la branche courante ; le champ `Feature Branch` de `spec.md` reçoit le nom du dossier. Aucune slide sur la branche par feature, par décision du plan.
Démonstration 1, suite : `find .specify -maxdepth 2 -type d` et `ls .specify/templates` dans `demo-claude`. Résultat observé le 20 octobre 2026 : huit lignes pour `find` (`.specify` et sept sous-dossiers), cinq fichiers à trous, six scripts ; `ls -A .specify` ajoute `.gitignore`, `init-options.json` et `integration.json`. Entre `demo-claude` et `demo-opencode`, `.specify/` diffère par `integration.json` (`invoke_separator`), `init-options.json`, les manifestes, et par le séparateur écrit dans trois fichiers à trous et deux scripts (`/speckit-x` contre `/speckit.x`) ; un corrigé partagé entre les deux outils en tient compte.
:::

## Chaque étape devient une commande et la relecture reste au développeur. {.statement kicker="Spec Kit"}

::: notes
Conclut la section : installation, constitution, commandes d'étape et de vérification, workflow et ses points de contrôle, ce qui est déposé. Renvoie à l'idée clé « Chaque étape du workflow produit un artefact relu par un humain » : l'outil automatise la production, pas la relecture. Le TP 1 partie B installe l'outil et visite ce qu'il dépose, sans lancer de commande.
:::

## TP 1, partie B : installer Spec Kit et visiter un projet initialisé {.tp duration="30 min" kicker="TP 1"}

Installer Spec Kit à la version épinglée, initialiser un projet jetable `~/hello-spec/` pour son outil, remplir une grille de visite de ce qui a été déposé, puis retrouver les commandes dans l'outil sans en lancer aucune. Aucun commit : `~/hello-spec/` est un dossier jetable sans dépôt git, et `~/bookit/` n'est pas touché.

::: notes
Point de départ : arrivée de la partie A (`~/bookit/` et `~/fichiers/` extraits, intacts). Arrivée : `specify version` répond 1.2.2, `~/hello-spec/` contient `.specify/` et le dossier de commandes de l'outil, `~/hello-spec/visite.md` rempli, `~/bookit/` toujours sans `.git`. Aucun appel au modèle : aucune permission à lire.
Durées : 5 min d'installation, 5 min d'initialisation, 10 min de visite, 5 min dans l'outil, 5 min de débrief. Les étapes 1 à 3 sont rejouables en shell ; les quatre `attendu` ont été confirmés au rejeu du 20 octobre 2026 sous les deux outils (1 min au total, aucun appel au modèle : étape 1 instantanée avec `specify-cli` déjà installé, étape 2 en une seconde, grille de l'étape 3 remplie en 20 s environ). L'étape 4 n'est pas rejouable hors TUI : le nombre de propositions (dix), leur ordre et la présence de la description à côté du nom sont à relever sur la VM dans les deux outils, et sous Open Code vérifier que la saisie de `/speckit.` filtre la liste des commandes.
Débrief, deux questions : quelles commandes correspondent aux artefacts du workflow et lesquelles n'en produisent aucun (`constitution`, `specify`, `plan`, `tasks`, `implement` écrivent un artefact ; `clarify`, `checklist`, `analyze`, `converge` vérifient ; `taskstoissues` est dépréciée) ; que manque-t-il à `hello-spec` pour lancer `specify` (rien, mais le projet est vide et sa constitution à trous : le TP 3 initialise bookit et écrit la constitution d'abord).
Pièges : lancer une commande Spec Kit « pour voir » (répondre « stop », quitter, `rm -rf ~/hello-spec/specs`) ; initialiser dans `~/bookit/` au lieu de `~/hello-spec/` (`rm -rf ~/bookit/.specify ~/bookit/.claude ~/bookit/.opencode` remet l'état de départ, le TP 3 refait l'initialisation avec `--here --force`) ; suivre le conseil « Agent Folder Security » et ignorer `.claude/` ou `.opencode/` (les commandes se versionnent) ; lancer `specify self upgrade` (la version doit rester 1.2.2).
À vérifier sur la VM : accès à PyPI pour `uv tool install` ; `~/.local/bin` dans le `PATH` après l'installation.
:::

### Installer Spec Kit

Installer `specify-cli` à la version épinglée, puis vérifier la version.

```console
$ uv tool install specify-cli==1.2.2
$ specify version 2>&1 | grep -o 'CLI Version *[0-9.]*'
```

::: attendu
```console
$ specify version 2>&1 | grep -o 'CLI Version *[0-9.]*'
CLI Version    1.2.2
```
:::

::: indice
`specify` introuvable après l'installation : `uv tool update-shell`, puis ouvrir un nouveau terminal ; ou, dans le terminal courant, `export PATH="$HOME/.local/bin:$PATH"`.
:::

### Initialiser hello-spec

Se placer dans le répertoire personnel, initialiser le projet jetable pour son outil, puis lister ce qui a été déposé et compter les commandes.

::: claude-code
```console
$ cd ~
$ specify init hello-spec --integration claude --script sh
$ ls -A hello-spec
.claude  .specify
$ ls hello-spec/.claude/skills | wc -l
10
```
:::

::: opencode
```console
$ cd ~
$ specify init hello-spec --integration opencode --script sh
$ ls -A hello-spec
.opencode  .specify
$ ls hello-spec/.opencode/commands | wc -l
10
```
:::

Lire le résumé affiché : l'encadré « Next Steps » nomme six commandes et l'encadré suivant trois commandes optionnelles ; la dixième, `taskstoissues`, n'est nommée nulle part. L'encadré « Agent Folder Security » conseille d'ignorer le dossier de l'outil dans git ; ce conseil ne s'applique pas ici, les commandes se versionnent avec le projet.

::: attendu
```console
$ ls -d ~/hello-spec/.specify
/home/…/hello-spec/.specify
```

Le dossier de l'outil, à côté de `.specify/`, contient dix commandes.
:::

::: indice
`specify init` s'arrête parce que l'outil est signalé absent du `PATH` : ajouter `--ignore-agent-tools` à la commande.
:::

### Visiter le dossier

Créer `~/hello-spec/visite.md` avec cette grille et remplir la colonne « Réponse » depuis `~/hello-spec`, une commande par ligne : la commande de son outil pour la première, puis `ls .specify/templates`, `head -5 .specify/memory/constitution.md`, `ls .specify/scripts/bash/`, `specify workflow list` suivi de `grep -c 'type: gate' .specify/workflows/speckit/workflow.yml`, et `git status` suivi de `ls AGENTS.md`.

::: claude-code
Première ligne : `ls .claude/skills`.
:::

::: opencode
Première ligne : `ls .opencode/commands`.
:::

```markdown
| Question | Réponse |
|---|---|
| Où sont les dix commandes, invoquées comment ? | |
| Combien de fichiers à trous, lesquels ? | |
| État de la constitution ? | |
| Quel script copie le fichier à trous du plan ? | |
| Workflow installé, nombre de points de contrôle ? | |
| Ce que `specify init` n'a pas fait ? | |
```

::: attendu
```console
$ grep -c '^| ' ~/hello-spec/visite.md
7
$ grep -c 'type: gate' ~/hello-spec/.specify/workflows/speckit/workflow.yml
2
```

Sept lignes : l'en-tête et les six questions, chacune avec sa réponse.
:::

::: indice
`git status` répond « fatal: not a git repository » : c'est la réponse attendue, à écrire dans la grille. Pour l'invocation des commandes, le nom du dossier ou du fichier donne le nom tapé après `/`.
:::

### Compléter `/speckit` sans lancer

Se placer dans `~/hello-spec`, lancer l'outil, taper le début du nom des commandes sans valider, lire les propositions et leur description, puis fermer la liste et quitter. Aucune commande n'est lancée.

::: claude-code
```console
$ cd ~/hello-spec
$ claude --model claude-sonnet-4-6
```

Taper `/speckit` sans appuyer sur Entrée : la liste des commandes installées apparaît. Lire les propositions et leur description. Appuyer deux fois sur Échap pour effacer la saisie, puis quitter par `/exit`.
:::

::: opencode
```console
$ cd ~/hello-spec
$ cp ~/bookit/opencode.json .
$ opencode
```

Taper `/speckit.` sans appuyer sur Entrée : la liste des commandes installées apparaît. Lire les propositions et leur description. Échap ferme la liste, Ctrl+C efface la saisie, puis quitter par `/exit`.
:::

::: attendu
```console
$ ls ~/hello-spec/specs
ls: cannot access '/home/…/hello-spec/specs': No such file or directory
$ ls -d ~/bookit/.git
ls: cannot access '/home/…/bookit/.git': No such file or directory
```

Aucune commande lancée : pas de dossier `specs/`. `~/bookit/` n'a pas été touché.
:::

::: indice
Rien ne s'affiche après `/` : `/help` liste les commandes disponibles. Une commande lancée par erreur : répondre « stop », quitter par `/exit`, puis `rm -rf ~/hello-spec/specs`.
:::

### Corrigé {.corrige}

Grille remplie le 20 octobre 2026 avec Spec Kit 1.2.2, pour les deux outils, avec la commande de chaque ligne en colonne du milieu :

```markdown file="../tp/tp01/hello-spec/visite.md"
```

## Glossaire : la méthode {kicker="Glossaire"}

- **Spec Driven Development** : méthode où une spécification écrite précède et pilote le plan, les tâches et le code
- **Workflow** : suite ordonnée des étapes du SDD, chacune produisant un artefact relu par un humain
- **Point de contrôle** : moment du workflow où le développeur relit l'artefact produit et l'approuve ou le refuse

|||

- **Spécification** : ce que le logiciel doit faire et pourquoi, sans dire comment ; fichier `spec.md`
- **Exigence** : une phrase vérifiable de la spécification, numérotée REG-NN dans bookit

::: sources
- [Spec Kit, README v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/README.md)
- [GitHub Blog, Spec-driven development with AI, 2 septembre 2025](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation.
:::

## Glossaire : les artefacts {kicker="Glossaire"}

- **QUOI et COMMENT** : partage entre la spécification (QUOI) et le plan (COMMENT)
- **Plan** : artefact `plan.md` : le COMMENT, les choix techniques qui réalisent la spécification
- **Tâche** : ligne de `tasks.md` : une part du plan, réalisable et vérifiable seule

|||

- **Constitution** : fichier `.specify/memory/constitution.md` : les principes du projet, que chaque plan et chaque diff respectent
- **Principe** : une règle de la constitution
- **Fichier à trous** : fichier de `.specify/templates/` dont les sections entre crochets sont remplies par une commande Spec Kit

::: sources
- [Spec Kit, README v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/README.md)
- [Spec Kit, `templates/constitution-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/constitution-template.md)
- [Spec Kit, `templates/commands/specify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::

## Glossaire : les formats et l'outil {kicker="Glossaire"}

- **Markdown structuré** : sections titrées et exigences numérotées qui donnent sa structure à `spec.md`
- **ADR** : note qui trace une décision d'architecture, son contexte et ses conséquences
- **EARS** : syntaxe d'exigence en une phrase à mots-clés (WHEN, IF, SHALL)
- **Gherkin** : syntaxe de scénario Given, When, Then, exécutable avec pytest-bdd

|||

- **Scénario** : un cas d'une exigence écrit en Gherkin : contexte, action, résultat
- **Spec Kit** : outil de GitHub qui installe dans l'agent les commandes du Spec Driven Development
- **Commande Spec Kit** : prompt versionné, invoqué `/speckit-x` sous Claude Code et `/speckit.x` sous Open Code

::: sources
- [Michael Nygard, Documenting Architecture Decisions, 15 novembre 2011](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [Alistair Mavin, EARS](https://alistairmavin.com/ears/)
- [Cucumber, Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Spec Kit, `docs/reference/integrations.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/integrations.md)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::
