# Personnaliser Spec Kit, planifier, découper

Imposer le format de l'équipe, borner le plan, découper en tâches

::: notes
Module 5, 45 min d'exposé, puis TP 5 (60 min). Point de départ : l'idée clé du module 4, « REG-01 à REG-07, relues et versionnées, sont l'entrée de `plan` », et l'arrivée du TP 4 : `spec.md` à sept exigences, `.specify/templates/spec-template.md` modifié en place et commité, aucun `plan.md`. Les notes du module 4 annonçaient trois points que ce module développe : une commande Spec Kit est un prompt et un template versionnés, le plan porte le COMMENT sous contrôle de la constitution, les tâches sont des incréments vérifiables séparément. Question laissée ouverte : qui décide du COMMENT, c'est-à-dire où va le code, avec quoi il se teste, dans quel ordre.
Vingt-six slides avant le TP, cinq sections : point de départ, commande et template, planifier, découper, analyser. Trois démonstrations : la première est un shell (rejouable), les deux autres appellent le modèle (`claude-sonnet-4-6` dans les deux outils) et se jouent sur `hello-spec`, jamais sur bookit, pour ne pas jouer le TP à la place des stagiaires. Elles supposent les démonstrations 2 et 3 du module 4 jouées (spécification de la liste de courses clarifiée) ; à défaut, rejouer d'abord `/speckit-specify une liste de courses partagée entre colocataires` (ou `/speckit.specify …`).
Versions : Spec Kit 1.2.2, Claude Code et Open Code v2 (`formateur/spec-kit.md`). Les citations de prompt sont celles des fichiers déposés par `specify init` 1.2.2, relevés le 19 et le 22 octobre 2026, dont les jetons de commande (`{SCRIPT}`, `__SPECKIT_COMMAND_TASKS__`) sont remplacés à l'installation.
:::

## Sept exigences, aucun plan {kicker="Point de départ"}

```console
$ ls specs/001-valider-reservation
checklists  spec.md
```

| Question du COMMENT | Artefact qui répond | Fichier qui le cadre | État |
|---|---|---|---|
| où va le code | `plan.md` | `plan-template.md` | absent |
| avec quoi il se teste | `plan.md` | `plan-template.md` | absent |
| dans quel ordre | `tasks.md` | `tasks-template.md` | absent |

::: sources
- Module 2, slide « Le QUOI et le COMMENT »
- Module 4, slide « Une règle, trois lectures possibles »
:::

::: notes
Source du dépôt du TP 4 : trajectoire du fil rouge, arrivée du TP 4 (`formateur/fil-rouge.md`). Reprise du module 4 : la dernière idée clé disait que REG-01 à REG-07 sont l'entrée de `plan`. Le dépôt du TP 4 contient la spécification et sa liste de contrôle (`checklists/`), rien de plus. Trois questions relèvent du COMMENT (module 2) et aucun artefact n'y répond encore : c'est l'objet du module.
`validate_booking` rend toujours `None` ; 9 commits, 1 test vert (le test de fumée).
Poser la question à la salle avant la troisième ligne : si l'agent écrit le code maintenant, qui décide du fichier, du test, de l'ordre ? Réponse attendue : l'agent, seul (module 4, « Une règle, trois lectures possibles » : ce qu'un artefact laisse ouvert, l'agent le tranche).
:::

## Le template, fichier du dépôt {kicker="Point de départ"}

```console
$ ls .specify/templates
checklist-template.md  constitution-template.md  plan-template.md  spec-template.md  tasks-template.md
```

```console
$ git log --oneline -- .specify/templates
<hash> TP 4 : brief et fichier à trous
<hash> TP 3 : Spec Kit et ADR
```

Un template est le gabarit Markdown d'un artefact Spec Kit, versionné dans `.specify/templates/`.

::: sources
- [Spec Kit, `docs/reference/presets.md` v1.2.2, « File resolution »](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/presets.md)
:::

::: notes
Définition du lexique, portée par la phrase sous le tableau. Le « fichier à trous » du module 2 et du TP 4 est un template : le mot arrive ici parce que ce module traite de leur personnalisation. À partir de cette slide, « template » seul.
`presets.md` 1.2.2, « File resolution » : « Spec Kit core » est `.specify/templates/`, et c'est le seul niveau de la pile que bookit utilise. Le fil rouge n'installe ni preset ni extension et n'a pas de dossier `overrides/` (`formateur/spec-kit.md` § 6).
Preuve que le fichier est un fichier de dépôt comme un autre : `git log --oneline -- .specify/templates` montre deux lignes (relevé du 23 octobre 2026 sur le bookit du TP 4) : « TP 4 : brief et fichier à trous » et « TP 3 : Spec Kit et ADR », le commit du TP 3 ayant déposé les templates ; hashes propres à chaque dépôt. Sous Open Code, à relever sur la VM (pas de dépôt bookit sur le poste de relevé). `git diff` du TP 4 a montré la modification.
`checklist-template.md` et `constitution-template.md` complètent la liste ; `constitution` a servi au TP 3, `checklist` n'est pas employée dans la formation.
:::

## Chaque commande lit son template {kicker="Point de départ"}

| Template | Commande qui le lit | Artefact écrit |
|---|---|---|
| `spec-template.md` | `specify` | `spec.md` |
| `plan-template.md` | `plan` | `plan.md` |
| `tasks-template.md` | `tasks` | `tasks.md` |

::: sources
- [Spec Kit, `docs/guides/customization.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/guides/customization.md)
- [Spec Kit, `templates/commands/plan.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/plan.md)
- [Spec Kit, `templates/commands/tasks.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/tasks.md)
- Module 4, slide « Exigences REG-NN dès le brouillon »
:::

::: notes
`specify` a lu `spec-template.md` au TP 4 (module 4) ; `plan` et `tasks` lisent les deux autres de la même façon : `setup-plan.sh` copie `plan-template.md` dans `plan.md`, `setup-tasks.sh` renvoie le contenu de `tasks-template.md` à la commande. `constitution` lit `constitution-template.md` (TP 3). `customization.md` 1.2.2 : « Templates are resolved when needed, using the first match by default » ; dans bookit, le premier et seul niveau est `.specify/templates/`. Le lien des commandes aux templates vient des prompts `plan` (« Load IMPL_PLAN template (already copied) ») et `tasks` (« Use TASKS_TEMPLATE_CONTENT (from the JSON output above) as the structure »), que `customization.md` ne nomme pas. Modifier ces fichiers change l'artefact que la commande écrit ; modifier le prompt de la commande change sa procédure.
:::

## Le template d'un artefact se règle avant la commande qui l'écrit. {.statement kicker="Point de départ"}

::: notes
Conclut les deux slides : le dépôt n'a ni `plan.md` ni `tasks.md`, et les gabarits de ces artefacts sont déjà là, versionnés. La section suivante ouvre le fichier d'une commande pour voir ce qu'il contient et ce qui se personnalise.
:::

## Prompt, script, template {kicker="Commande et template"}

![Le fichier speckit-plan/SKILL.md, avec son frontmatter et son prompt où figure $ARGUMENTS, étiqueté argument : le texte tapé après la commande ; il appelle le script setup-plan.sh --json, qui copie plan-template.md dans specs/001-…/plan.md ; l'agent remplit ce template](images/05-commande.svg)

::: sources
- [Spec Kit, `templates/commands/plan.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/plan.md)
- [Claude Code, Skills, « Pass arguments to skills »](https://code.claude.com/docs/en/skills)
- [Open Code, Commands](https://opencode.ai/docs/commands/)
:::

::: notes
Définition du lexique, portée par l'étiquette du schéma : l'argument est le texte qui suit la commande à l'invocation, substitué à `$ARGUMENTS` dans le prompt. Il fixe ce qu'un appel impose, là où le template fixe le format de l'artefact. « Sans argument » est la forme de l'énoncé du TP 4.
Le fichier de commande (`.claude/skills/speckit-plan/SKILL.md`) : un bloc `## User Input` qui contient `$ARGUMENTS`, puis « You **MUST** consider the user input before proceeding (if not empty) » (source : prompt `plan`, vérifié). Étape 1 du prompt déposé : « Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, FEATURE_DIR, BRANCH » ; dans le dépôt source du prompt la ligne porte `{SCRIPT}`, remplacé par le chemin à `specify init`. Étape 2 : « Read FEATURE_SPEC and `.specify/memory/constitution.md`. Load IMPL_PLAN template (already copied) ». Le script ne copie le template que si `plan.md` est absent (`formateur/spec-kit.md` § 6) : pour voir l'effet d'un template modifié sur un plan existant, supprimer `plan.md`.
Claude Code, Skills : « Both you and Claude can pass arguments when invoking a skill. Arguments are available via the `$ARGUMENTS` placeholder » ; sans placeholder dans le contenu, Claude Code ajoute `ARGUMENTS: <valeur>` à la fin. Open Code, Commands : « Pass arguments to commands using the `$ARGUMENTS` placeholder ».
`specify` n'appelle aucun script (l'agent copie lui-même le template, module 4) ; `plan` et `tasks` en appellent un chacun (`setup-plan.sh`, `setup-tasks.sh`, qui renvoie le contenu du template résolu dans `TASKS_TEMPLATE_CONTENT`).
Trois fichiers, tous versionnés : la commande, le script, le template.
Frontmatter : l'en-tête YAML entre deux lignes `---` en tête du fichier de commande (nom, description, options de l'outil). Définition du lexique, portée par l'étiquette du schéma.
`/memory/constitution.md` : le prompt du dépôt source (tag v1.2.2, ligne 64) écrit ce chemin sans `.specify` ; `specify init` le remplace dans le fichier déposé par `.specify/memory/constitution.md`, comme il remplace `{SCRIPT}` par le chemin du script. Deuxième remplacement, après celui des jetons de commande.
:::

## `plan` : deux fichiers, deux frontmatters {.compare kicker="Commande et template"}

::: claude-code
```console
$ head -11 .claude/skills/speckit-plan/SKILL.md | grep -E '^[a-z-]+:' | cut -d: -f1
name
description
argument-hint
compatibility
metadata
user-invocable
disable-model-invocation
```

:::

::: opencode
```console
$ head -11 .opencode/commands/speckit.plan.md | grep -E '^[a-z]+:' | cut -d: -f1
description
handoffs
```

:::

::: sources
- [Claude Code, Skills, « Frontmatter reference »](https://code.claude.com/docs/en/skills)
- [Open Code, Commands](https://opencode.ai/docs/commands/)
:::

::: notes
Démonstration 1 (shell, rejouable, aucun appel au modèle). La slide montre les noms de champs ; `head -12` des deux fichiers montre le frontmatter complet (valeurs de `description`, `handoffs` avec ses `label`, `agent`, `prompt`, `send`). Dans `demo-claude` et `demo-opencode` initialisés au module 3 : `head -12 demo-claude/.claude/skills/speckit-plan/SKILL.md`, `head -11 demo-opencode/.opencode/commands/speckit.plan.md`, `diff <(tail -n +13 demo-claude/.claude/skills/speckit-plan/SKILL.md) <(tail -n +12 demo-opencode/.opencode/commands/speckit.plan.md)`, `grep -n 'setup-plan.sh\|constitution.md' demo-claude/.claude/skills/speckit-plan/SKILL.md`, `ls demo-claude/.specify/templates`, `grep -n 'Tests are OPTIONAL' demo-claude/.specify/templates/tasks-template.md demo-claude/.claude/skills/speckit-tasks/SKILL.md`. Résultat relevé le 23 octobre 2026 (Claude Code 2.1.309, Open Code 2.0.32, Spec Kit 1.2.2) : deux frontmatters différents (sept champs côté Claude Code, `description` et `handoffs` côté Open Code) ; le `diff` des corps rend le code 1 et deux différences, les lignes 20 et 72 du skill, la même phrase sur les hooks (« replace dots (`.`) with hyphens (`-`) ») ; `setup-plan.sh --json` ligne 60 et `constitution.md` ligne 62 du skill (lignes 58 et 60 de la commande Open Code) ; cinq templates ; deux occurrences de « Tests are OPTIONAL » : `tasks-template.md` ligne 12, `speckit-tasks/SKILL.md` ligne 145 (ligne 143 de `speckit.tasks.md` côté Open Code).
Frontmatters relevés le 22 octobre 2026 sur les fichiers déposés par `specify init` 1.2.2 : sous Claude Code, `disable-model-invocation: false` par défaut (valeur `true` seulement avec `--integration-options="--no-model-invocation"`, `formateur/spec-kit.md` § 1). Claude Code, Skills : « All fields are optional. Only `description` is recommended » ; `argument-hint` : indication d'autocomplétion des arguments ; `disable-model-invocation` : empêche Claude de charger le skill de lui-même ; `user-invocable` : `false` le masque du menu `/`. Open Code, Commands : « The markdown file name becomes the command name » (`speckit.plan.md` donne `/speckit.plan`), champs documentés `description`, `agent`, `model`, `subtask` ; `handoffs` n'en fait pas partie.
Le corps du prompt est identique ; seul l'en-tête change. Seules les parties communes sont comparées : le corps. Les skills Claude Code contiennent la phrase sur la construction des commandes de hooks à deux endroits (lignes 20 et 72).
:::

## Trois endroits pour personnaliser {kicker="Commande et template"}

| Ce qu'on fixe | Où | Exemple bookit |
|---|---|---|
| le format de l'artefact | `.specify/templates/<nom>-template.md` | exigences REG-NN en EARS, tests obligatoires |
| ce qu'un appel impose | l'argument de la commande | « domaine seul, pytest-bdd, aucun contrat d'API » |
| la procédure | le prompt de la commande | inchangé |

::: sources
- [Spec Kit, `docs/guides/customization.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/guides/customization.md)
- [Spec Kit, `docs/reference/presets.md` v1.2.2, « File resolution »](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/presets.md)
- [Spec Kit, `templates/commands/plan.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/plan.md)
- [Spec Kit, `templates/commands/tasks.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/tasks.md)
:::

::: notes
Règle de partage, règle du support et non de la documentation Spec Kit : `customization.md` décrit la résolution des templates, pas ce partage ; les prompts `plan` et `tasks` montrent qu'ils lisent le template pour le format et `$ARGUMENTS` pour l'appel. Ce qui vaut pour chaque artefact de l'équipe s'écrit une fois dans le template ; ce qui vaut pour cet appel passe par l'argument ; la procédure (étapes de la commande, ordre des phases, Constitution Check) reste dans le prompt, que bookit ne modifie pas.
Hors périmètre, à dire seulement si la question vient. `customization.md` 1.2.2 : « Templates are resolved when needed, using the first match by default » ; ordre : surcharges locales du projet (`.specify/templates/overrides/`), presets installés, extensions installées, puis « Spec Kit core » (`.specify/templates/`). « Commands are different: installing extensions or presets materializes command files into the active integration's directory » : modifier `overrides/` suffit pour un template, pas pour une commande. `presets.md`, section d'exemple : « For files neither provides, the core default is used ». `specify preset resolve <nom>` montre quel fichier gagne. Le fil rouge modifie le cœur en place (décision du 22 octobre 2026) : ni `overrides/`, ni preset, ni extension.
Au TP 4, le template de la spécification est modifié en place ; au TP 5, celui des tâches ; l'argument sert pour `plan` (domaine seul) et pour `tasks` (tests obligatoires, ordre des phases).
:::

## Le format s'écrit une fois dans le template, l'exception dans l'argument. {.statement kicker="Commande et template"}

::: notes
Conclut les trois slides : la commande est un fichier, un script et un template ; les deux outils lisent le même prompt sous deux frontmatters ; trois endroits pour personnaliser. La section suivante lance `plan` avec un template inchangé et un argument qui ferme les dérives.
:::

## Entrées et sorties de `plan` {kicker="Planifier"}

![plan lit spec.md, constitution.md et plan-template.md, et écrit plan.md, research.md en phase 0, data-model.md et quickstart.md en phase 1, contracts/ en pointillés si le projet expose une interface ; tasks.md, écrit par tasks, reste hors de la commande](images/05-plan.svg)

::: sources
- [Spec Kit, `templates/commands/plan.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/plan.md)
:::

::: notes
Phase 0 et phase 1 : les deux temps de `plan` dans son prompt, la recherche qui lève les inconnues, puis la conception des artefacts. Prompt `plan` 1.2.2, cité au mot près : « Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION) », « Phase 1: Generate data-model.md, contracts/, quickstart.md », « Define interface contracts (if project has external interfaces) », « Skip if project is purely internal (build scripts, one-off tools, etc.) », « Command ends after Phase 1 design ». `tasks.md` appartient à `tasks`.
Dans le corrigé du TP 5, `research.md` (décisions et alternatives écartées), `data-model.md` (entités du domaine), `quickstart.md` (test de fumée) sont relus à l'étape 3 sans slide dédiée. bookit expose déjà une API : sans argument, `plan` voit une « interface exposée » et crée `contracts/` (slide « `plan` sans argument : trois dérives »).
:::

## Les cinq sections de `plan-template.md` {kicker="Planifier"}

| Ligne | Section | Ce que `plan` y écrit |
|---|---|---|
| 9 | Summary | l'exigence principale et l'approche |
| 13 | Technical Context | langage, dépendances, stockage, tests |
| 39 | Constitution Check | une ligne par principe de la constitution |
| 45 | Project Structure | l'arbre des fichiers à créer |
| 106 | Complexity Tracking | les violations justifiées, sinon vide |

::: sources
- [Spec Kit, `templates/plan-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/plan-template.md)
:::

::: notes
Numéros de ligne relevés par `grep -n '^## ' .specify/templates/plan-template.md` sur le fichier déposé par `specify init` 1.2.2 (113 lignes). Les cinq sections sont celles que `plan` remplit, dans l'ordre ; un template personnalisé les garde. Technical Context, liste partielle des neuf champs : Language/Version, Primary Dependencies, Storage, Testing, Target Platform, Project Type, Performance Goals, Constraints, Scale/Scope. Project Structure propose trois options de structure de code à élaguer. Les deux sections qui bornent le plan, Constitution Check et Complexity Tracking, ont la slide suivante.
:::

## Le Constitution Check de `plan` {kicker="Planifier"}

`plan-template.md`

```markdown
## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]
```

Le Constitution Check est la section de `plan.md` où `plan` confronte le plan à la constitution.

::: sources
- [Spec Kit, `templates/plan-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/plan-template.md)
- Module 3, slide « Qui relit la constitution ensuite »
:::

::: notes
Constitution Check : contrôle de la constitution que `plan` remplit dans `plan.md`, une ligne par principe ; définition du lexique, portée par le titre. Dans bookit, aucune ligne de Complexity Tracking. Bloc suivant sur la slide « Un principe enfreint arrête `plan` ». Le template impose la section avant la phase 0 (lignes 39 à 43 du fichier déposé) ; le prompt dit « Fill Constitution Check section from constitution », « Evaluate gates (ERROR if violations unjustified) » et « Re-evaluate Constitution Check post-design ». Complexity Tracking (ligne 106 et suivantes) : « Fill ONLY if Constitution Check has violations that must be justified ». Un principe enfreint se justifie dans ce tableau, sinon la commande s'arrête en erreur.
C'est la constitution 1.0.1 du TP 3 qui borne le plan : sept principes, dont les quatre de structure (I à IV) et les trois de workflow (V à VII). L'agent écrit en général une ligne par principe, respecté ou enfreint ; relevé au rejeu du TP 5, sous les deux outils : sept lignes, de I à VII, toutes respectées, « aucune violation ». Sous Claude Code le `plan.md` produit n'a plus de section Complexity Tracking (0 occurrence) ; sous Open Code elle est présente et vide (« non applicable »). Sur un projet à constitution vierge (démonstration 2 sous Claude Code), le Constitution Check tient en un paragraphe ; avec la constitution de Bookit en version 1.0.0 à cinq principes (`hello-spec` sous Open Code), c'est un tableau de cinq lignes avec une colonne Status et un « Gate result », et l'agent signale une déviation sur le principe I. Le Constitution Check reprend la relecture à trois questions du TP 3, faite cette fois sur un plan.
:::

## Un principe enfreint arrête `plan` {kicker="Planifier"}

Prompt de `plan`

```text
Evaluate gates (ERROR if violations unjustified)
```

`plan-template.md`, section Complexity Tracking

```text
| Violation | Why Needed | Simpler Alternative Rejected Because |
```

Un principe enfreint sans justification arrête la commande.

::: sources
- [Spec Kit, `templates/commands/plan.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/plan.md)
- [Spec Kit, `templates/plan-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/plan-template.md)
:::

::: notes
Le prompt dit « Evaluate gates (ERROR if violations unjustified) » et « Re-evaluate Constitution Check post-design ». Une violation se justifie dans le tableau de Complexity Tracking, que le template réserve à ce cas, sinon la commande s'arrête en erreur. Dans bookit, aucune ligne de Complexity Tracking.
:::

## `plan` sans argument : trois dérives {kicker="Planifier"}

| Dérive (illustration) | Où elle apparaît | Ce que l'argument ferme dans bookit |
|---|---|---|
| pile et stockage choisis seuls | Technical Context | « Python 3.14, uv, aucune dépendance nouvelle » |
| une API que personne n'a demandée | `contracts/` | « aucun contrat, API et stockage inchangés » |
| des tests hors du domaine | Project Structure | « domaine seul, pytest-bdd sur le `.feature` » |

::: sources
- [Spec Kit, `templates/commands/plan.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/plan.md)
- [Spec Kit, `templates/plan-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/plan-template.md)
- Module 4, slide « Une règle, trois lectures possibles »
:::

::: notes
Démonstration 2 (appelle le modèle). Slide : « `plan` sans argument ». Prompt : `/speckit-plan` (ou `/speckit.plan`), sans argument. Déroulé : dans `~/hello-spec/` (ou `demo-claude` et `demo-opencode`), après les démonstrations 2 et 3 du module 4 (liste de courses, spécification clarifiée) ; lire les permissions (`setup-plan.sh`, écritures dans `specs/`) ; `ls specs/*/`, `ls specs/*/contracts`, `sed -n '/Technical Context/,/Constitution Check/p' specs/*/plan.md`, `grep -c 'NEEDS CLARIFICATION' specs/*/plan.md`. Résultat attendu et relevé (23 octobre 2026, `claude-sonnet-4-6`) : `plan.md`, `research.md`, `data-model.md`, `quickstart.md` et un `contracts/` avec une API inventée ; Technical Context rempli avec une pile, un stockage et des objectifs de performance choisis seuls ; aucun `tasks.md` ; `NEEDS CLARIFICATION` : 0.
Claude Code (`hello-spec`, constitution vierge) : 19 tours, 150 s, 0,61 USD ; `contracts/rest-api.md` et `contracts/websocket.md` ; pile Python 3.14, FastAPI 0.115, SQLAlchemy 2.x, SQLite par logement, frontend HTML/JS servi par FastAPI (non demandé) ; Performance Goals : propagation des changements < 5 s, ajout d'un article < 30 s ; Scale/Scope : 2 à 6 colocataires, 10 à 200 articles. Permissions : `setup-plan.sh` autorisé ; les refus viennent des commandes `rtk` du hook de la machine de relevé, absentes de la VM.
Open Code (`hello-spec`, constitution de Bookit 1.0.0) : 18 tours, 141 s, 0,40 USD ; `contracts/api.md` ; pile Python 3.12, FastAPI 0.111, SQLAlchemy 2 async, React 18, PostgreSQL 16 ; Performance Goals : REST ≤ 200 ms p95, diffusion WebSocket ≤ 2 s ; Scale/Scope : 2 à 10 membres, environ 100 foyers. Fiabilité : deux erreurs de transport Bedrock sur trois essais pendant la génération ; prévoir un repli à l'oral. Autres relevés Open Code à faire sur la VM (relevé arrêté, pas de Bedrock sur le poste).
Le tableau reste une illustration : la troisième dérive (tests hors du domaine) n'a pas été observée. Technical Context du template, neuf champs : Language/Version, Primary Dependencies, Storage, Testing, Target Platform, Project Type, Performance Goals, Constraints, Scale/Scope ; le prompt dit « Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION") ».
Lien avec le module 4 : une exigence qui laisse un point ouvert est tranchée par l'agent ; ici c'est le COMMENT que la spécification ne dit pas. La colonne de droite est l'argument du TP 5.
:::

## Le COMMENT de `validate_booking` {kicker="Planifier"}

| Question | Réponse du plan | Fixée par |
|---|---|---|
| où va le code | `bookit/domain/validate_booking.py` | principe IV de la constitution |
| avec quoi il se teste | pytest-bdd sur `valider-reservation.feature` | l'argument |
| dans quel ordre | REG-01 à REG-05, puis REG-06 et REG-07 | REG-06 |

::: sources
- Constitution 1.0.1 de bookit, principe IV
- Module 4, slide « Une règle, trois lectures possibles »
:::

::: notes
Réponses aux trois questions du point de départ. Source du tableau : l'arbre Source Code de la section Project Structure du plan du corrigé (`tp/tp05/specs/001-valider-reservation/plan.md`, lignes 64 et 65, deux fichiers) et la trajectoire du fil rouge, TP 5 (`formateur/fil-rouge.md`) ; Technical Context (pile, pytest-bdd, aucune dépendance nouvelle) et Constitution Check (une ligne par principe) se lisent dans le même fichier.
Principe IV (constitution 1.0.1) : « Chaque fichier a sa couche » ; une règle métier s'écrit dans `bookit/domain/validate_booking.py`. Tests : l'argument du TP 5 nomme `tests/test_valider_reservation.py`, lié au `.feature`. Ordre : REG-06 dit que le code de refus est celui de la première règle enfreinte dans l'ordre REG-01 à REG-05, donc le code appelle les règles dans cet ordre ; REG-06 et REG-07 n'ont pas de code de refus propre et se vérifient par un test sur le code des cinq premières.
Débrief du TP : d'où vient chaque réponse du plan ? La bonne réponse est toujours un principe, une exigence ou l'argument ; sinon c'est un choix de l'agent à relire.
:::

## Relecture du plan : trois points {kicker="Planifier"}

| Point | Question | Où regarder |
|---|---|---|
| constitution | une ligne par principe, aucune violation à justifier | `## Constitution Check` |
| structure | deux fichiers, aucun module nouveau, API et stockage intacts | `## Project Structure` |
| contexte technique | pytest-bdd nommé, aucun `NEEDS CLARIFICATION` | `## Technical Context` |

```console
$ grep -c 'NEEDS CLARIFICATION' specs/001-valider-reservation/plan.md
0
```

::: sources
- [Spec Kit, `templates/plan-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/plan-template.md)
- Module 3, TP 3, étape de relecture de la constitution
:::

::: notes
Règle du support : les trois points sont ceux du formateur ; `NEEDS CLARIFICATION` s'appuie sur le prompt `plan` (« mark unknowns as "NEEDS CLARIFICATION" »). Le plan se relit comme la constitution au TP 3 : trois questions, chacune vérifiable sur le fichier. Une réponse négative se corrige à la main avant le commit ; l'agent ne se relit pas lui-même. Idée du module 2 (« Le développeur exprime l'intention, conçoit et vérifie ; l'agent produit ») : la conception est relue par le développeur.
Valeur `0` du `grep` : confirmée au rejeu du TP 5 sous les deux outils. Un `NEEDS CLARIFICATION` restant signale une question que le plan n'a pas tranchée : la trancher dans l'argument ou à la main, jamais la laisser pour `tasks`.
Points d'attention : `quickstart.md` lance parfois `uvicorn` et un `curl` ; c'est le test de fumée, à conserver, mais aucune règle ne se teste par l'API.
:::

## Chaque décision du plan vient d'un principe, d'une exigence ou de l'argument. {.statement kicker="Planifier"}

::: notes
Conclut les cinq slides : entrées et sorties de `plan`, le Constitution Check, les dérives sans argument, le COMMENT de `validate_booking`, la relecture en trois points. Le plan dit quoi écrire et avec quoi ; la section suivante le découpe en tâches que chaque session peut vérifier seule.
:::

## Le format d'une tâche {kicker="Découper"}

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
CORRECT: - [ ] T014 [US1] Implement UserService in src/services/user_service.py
```

| Élément | Rôle |
|---|---|
| `- [ ]` | case à cocher par `implement` |
| `T001` | ordre d'exécution |
| `[P]` | fichiers différents, aucune dépendance |
| `[US1]` | étiquette de regroupement des tâches, absente du template de bookit |
| chemin de fichier | ce que la session ouvre et ce que le diff touche |

::: sources
- [Spec Kit, `templates/commands/tasks.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/tasks.md)
:::

::: notes
Source complémentaire : `formateur/spec-kit.md` § 4. Prompt `tasks` 1.2.2, cité au mot près : « Every task MUST strictly follow this format », `- [ ] [TaskID] [P?] [Story?] Description with file path` ; « [P] marker: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks) » ; étiquette `[US1]` pour les phases de user story seulement. Exemples du prompt : `- [ ] T014 [US1] Implement UserService in src/services/user_service.py` (CORRECT) et `- [ ] T001 [US1] Create model` « (missing file path) » (WRONG). Le prompt refuse donc une tâche sans chemin de fichier. Les symboles de coche des exemples sont omis sur la slide.
Le chemin fait la tâche vérifiable seule : la session ouvre ce fichier, le diff ne touche que lui. La vérification de chaque tâche arrive avec le template de bookit (slide « Tâches : le template de bookit »). `implement` coche la case `[X]` au fur et à mesure (`formateur/spec-kit.md` § 4). Le prompt impose aussi « Tasks MUST be organized by user story » : le template de bookit le remplace par une organisation par exigence.
:::

## Tests facultatifs par défaut {kicker="Découper"}

| Emplacement | Ligne d'origine (traduite) |
|---|---|
| `tasks-template.md`, ligne 12 | les tests sont facultatifs, à inclure sur demande explicite de la spécification |
| prompt `tasks`, ligne 145 | aucune tâche de test sans demande explicite de la spécification ou de l'utilisateur |

Le template de bookit remplace la ligne 12 : une tâche Test précède chaque tâche Code.

::: sources
- [Spec Kit, `templates/tasks-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/tasks-template.md)
- [Spec Kit, `templates/commands/tasks.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/tasks.md)
- Template de tâches de bookit (`tasks-template.md`)
:::

::: notes
Sources complémentaires : `formateur/spec-kit.md` § 4 et § 8, `tp/fichiers/tasks-template.md`. Numéros de ligne : 147 dans le dépôt v1.2.2 de `templates/commands/tasks.md`, 145 dans le fichier déposé par `specify init` (les jetons du dépôt sont remplacés à l'installation). Relevé : `grep -n -o 'Tests are OPTIONAL' .specify/templates/tasks-template.md .claude/skills/speckit-tasks/SKILL.md` rend `tasks-template.md:12` et `speckit-tasks/SKILL.md:145`. Les deux lignes en entier, sur les fichiers déposés par `specify init` 1.2.2. Ligne 12 de `tasks-template.md` : « **Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification. » Ligne 145 du prompt : « **Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach. » Même consigne dans les deux : aucune tâche de test sans demande explicite dans la spécification ou dans l'argument.
Démonstration 3, première partie (appelle le modèle). Prompt : `/speckit-tasks` (ou `/speckit.tasks`) sans argument. Déroulé : même `hello-spec`, après la démonstration 2 ; lire les permissions (`setup-tasks.sh`, écriture de `tasks.md`) ; `grep -c '^- \[ \]' specs/*/tasks.md`, `grep -ci 'test' specs/*/tasks.md`, `grep -n '^## Phase' specs/*/tasks.md`. Résultat attendu : `tasks.md` organisé par user story ; tâches de test seulement si la constitution du projet impose le test d'abord. Relevé du 23 octobre 2026 (`claude-sonnet-4-6`). Claude Code (`hello-spec`, constitution vierge) : 16 tours, 140 s, 0,51 USD, 23 tâches, 7 phases (Setup, Fondations, quatre user stories, Polish), aucune tâche de test (7 lignes contiennent « test » : dépendances pytest, un test d'intégration des fondations, quatre critères « Test indépendant USn »), titres de phase en français ; permissions : `bash .specify/scripts/bash/setup-tasks.sh --json` refusé deux fois (le préfixe `bash ` et la redirection `2>&1` ne correspondent pas à `Bash(.specify/scripts/bash/*)`), l'agent lit les fichiers et écrit `tasks.md`. Open Code (`hello-spec`, constitution de Bookit 1.0.0, Test-First) : 11 tours, 84 s, 0,33 USD, 80 tâches en 7 phases, 49 lignes contenant « test », une section « Tests for User Story N » par phase : avec un principe de test imposé, `tasks` génère des tâches de test même sans argument.
Le TP 6 exige, pour chaque règle, un test qui échoue avant son code (module 6) : le template fourni au TP 5 le dit.
:::

## Tâches : le template de bookit {kicker="Découper"}

```markdown file="../tp/fichiers/tasks-template.md" lines="12-20"
```

::: sources
- Template de tâches de bookit (`tasks-template.md`)
- [Spec Kit, `templates/commands/tasks.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/tasks.md)
:::

::: notes
Source complémentaire : `formateur/spec-kit.md` § 4. Le bloc cite l'en-tête du fichier fourni `tp/fichiers/tasks-template.md` (lignes 12 à 20 : tests obligatoires, organisation par exigence, format de la tâche). Le fichier remplace `.specify/templates/tasks-template.md` en place (`cp`, `git diff`), comme `spec-template.md` au TP 4. Il garde le frontmatter ; une phase par exigence avec Test REG-NN puis Code REG-NN, Test seule pour REG-06 et REG-07 (pas de code de refus propre), une finition (ruff, test de fumée, `tasks.md` coché) ; la section Dependencies est réduite à « chaque paire dans l'ordre des règles, aucun `[P]` à l'intérieur d'une paire ». Sortie de `git diff --stat HEAD~1 -- .specify/templates/` : `1 file changed, 51 insertions(+), 188 deletions(-)` (confirmée au rejeu sous les deux outils).
Prompt `tasks` : « Use TASKS_TEMPLATE_CONTENT (from the JSON output above) as the structure » ; `setup-tasks.sh` renvoie le template résolu, donc le fichier modifié. Le prompt dit aussi « Tasks MUST be organized by user story » : l'argument du TP redit l'organisation par exigence, les tests obligatoires, la consigne « une tâche Test avant chaque tâche Code » que le prompt associe aux tâches de test, et une phase par exigence. Le rejeu a toujours joué template et argument ensemble : leur effet séparé n'est pas éprouvé.
:::

## Le socle de test {kicker="Découper"}

```markdown file="../tp/fichiers/tasks-template.md" lines="34-43"
```

Le socle de test est la tâche T001 : le fichier de test sans scénario lié, sur lequel chaque tâche Test s'appuie.

::: sources
- Template de tâches de bookit (`tasks-template.md`)
:::

::: notes
Définition du lexique, portée par la phrase sous le bloc : le socle de test est la tâche T001 de `tasks.md`, le fichier `tests/test_valider_reservation.py` et ses fonctions pytest-bdd, sans scénario lié, tests existants inchangés (le module 6 détaille pytest-bdd). « Harnais » reste réservé au logiciel qui entoure le modèle (module 1).
Le bloc cite les lignes 34 à 43 du fichier fourni : la phase 1, puis la phase 2 de REG-01 avec sa paire Test et Code. Chaque exigence suit le même modèle ; REG-06 et REG-07 n'ont que la tâche Test.
:::

## Une tâche par session {kicker="Découper"}

![Trois sessions à la suite. Session 1 : instructions fixes, AGENTS.md et la tâche T002 Test REG-01 ; uv run pytest -q échoue ; commit. La fenêtre est vidée. Session 2 : T003 Code REG-01 ; la suite passe ; commit. La fenêtre est vidée. Session 3 : T004 Test REG-02](images/05-session.svg)

::: sources
- [Claude Code, Best practices, « Manage context aggressively »](https://code.claude.com/docs/en/best-practices)
- [Open Code, TUI, commande `/new`](https://opencode.ai/docs/tui/)
- Module 1, slide « Permission et session neuve »
:::

::: notes
Le bloc « instructions fixes, `AGENTS.md` » du schéma reprend le schéma du module 4, sans source propre. Chaque tâche commence dans une fenêtre de contexte vide et finit par un commit : la session qui écrit le test de REG-01 se ferme avant celle qui écrit son code, pour que l'agent ne lise que la tâche, son fichier et sa vérification. Les blocs de la fenêtre sont ceux du schéma du module 4 (« `AGENTS.md`, lu à chaque session »).
Claude Code, Best practices : « Use `/clear` frequently between tasks to reset the context window entirely » ; mode d'échec « The kitchen sink session » : « `/clear` between unrelated tasks » ; « Once the spec is complete, start a fresh session to execute it. The new session has clean context focused entirely on implementation ». Open Code, TUI : `/new`, « Start a new session », alias `/clear`. Équivalence : `/clear` sous Claude Code, `/new` sous Open Code (`formateur/equivalences.md`, « Nouvelle conversation »).
Lien avec le module 1 : l'agent ne connaît que sa fenêtre de contexte ; ce que la session précédente a appris reste dans le dépôt, c'est-à-dire dans le code, les tests et `tasks.md`. Module 7 : l'unité de travail reprend cette frontière. Le TP 6 applique le découpage : T001, puis Test REG-01 et Code REG-01 en deux sessions.
:::

## Chaque commit clôt une tâche vérifiée ; la session suivante repart du dépôt. {.statement kicker="Découper"}

::: notes
Conclut les quatre slides : le format d'une tâche, les tests facultatifs par défaut, le template de bookit, une tâche par session. Avant d'implémenter, une dernière commande relit les trois artefacts ensemble : section suivante.
:::

## `analyze` croise spécification, plan, tâches {kicker="Analyser"}

![analyze lit spec.md, plan.md et tasks.md et produit un rapport à l'écran, en lecture seule, sans écrire de fichier ; constitution.md, reliée par une flèche distincte, sert de référence ; six passes : A duplication, B ambiguïté, C sous-spécification, D alignement avec la constitution, E couverture, F incohérence](images/05-analyze.svg)

::: sources
- [Spec Kit, `templates/commands/analyze.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/analyze.md)
- Module 2, slide « Quatre commandes de vérification »
:::

::: notes
Définition du lexique, portée par l'étiquette du schéma : l'analyse est la passe `/speckit-analyze` de cohérence entre spécification, plan et tâches, la constitution en référence.
Prompt `analyze` 1.2.2, cité au mot près : « STRICTLY READ-ONLY: Do not modify any files » ; « This command MUST run only after `/speckit-tasks` has successfully produced a complete `tasks.md` » (jeton `__SPECKIT_COMMAND_TASKS__` dans le dépôt, remplacé à l'installation) ; passes A Duplication Detection, B Ambiguity Detection, C Underspecification, D Constitution Alignment, E Coverage Gaps, F Inconsistency. Script appelé : `check-prerequisites.sh --json --require-spec --require-tasks --include-tasks` ; il échoue si `.specify/feature.json` manque.
La constitution est « non-negotiable » dans l'analyse : un conflit n'est ni dilué ni ignoré (slide suivante). Le prompt inventorie les exigences par `FR-###` et `SC-###` : bookit numérote REG-NN. Au rejeu du TP 5, ce constat ne s'est pas produit sous Claude Code (couverture 7/7) ; sous Open Code, `analyze` signale REG-06 et REG-07 « sans tâche Code », ce que le template prévoit (constats à écarter).
:::

## Le rapport d'analyse {kicker="Analyser"}

| ID | Catégorie | Sévérité | Emplacement | Résumé (illustration) | Recommandation |
|---|---|---|---|---|---|
| E1 | Couverture | Élevée | `tasks.md` | REG-07 sans tâche | ajouter Test REG-07 |
| F1 | Incohérence | Moyenne | `plan.md` | `tests/unit/` cité, absent de `tasks.md` | aligner le plan |

```text
Would you like me to suggest concrete remediation edits for the top N issues?
```

::: sources
- [Spec Kit, `templates/commands/analyze.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/analyze.md)
:::

::: notes
Format du rapport dans le prompt 1.2.2 : « Specification Analysis Report », tableau ID / Category / Severity / Location(s) / Summary / Recommendation, avec des identifiants préfixés par une lettre de catégorie (lettres du prompt : A Duplication, B Ambiguity, C Underspecification, D Constitution Alignment, E Coverage Gaps, F Inconsistency, comme sur le schéma ; au relevé la lettre ne suit pas toujours la passe et le jeu varie d'une session à l'autre ; la slide traduit catégories et sévérités, le rapport reste en anglais : Coverage Gap, Inconsistency, HIGH, MEDIUM) ; puis « Coverage Summary Table » (Requirement Key, Has Task?, Task IDs, Notes ; sous Claude Code la colonne « Has Task? » est absente), « Constitution Alignment Issues », « Unmapped Tasks », « Metrics » (Total Requirements, Total Tasks, Coverage %, Ambiguity Count, Duplication Count, Critical Issues Count), un bloc Next Actions, puis « Would you like me to suggest concrete remediation edits for the top N issues? (Do NOT apply them automatically.) ». Sévérités : CRITICAL « Violates constitution MUST, missing core spec artifact, or requirement with zero coverage that blocks baseline functionality », HIGH, MEDIUM, LOW. Le tableau de la slide est une illustration sur bookit.
Démonstration 3, seconde partie (appelle le modèle). Prompt : dans une session neuve, `/speckit-analyze` (ou `/speckit.analyze`) sans argument. Déroulé : même `hello-spec`, après `tasks` ; lire le rapport ; répondre « non » à la proposition de remédiation ; vérifier qu'aucun fichier n'a changé (`ls -l specs/*/` avant et après ; `hello-spec` n'est pas un dépôt git). Résultat attendu : un rapport avec le tableau des constats, le tableau de couverture, les métriques, la question de remédiation, aucun fichier modifié.
Relevé du 23 octobre 2026 (`claude-sonnet-4-6`). Claude Code : 6 tours, 103 s, 0,28 USD, aucun refus ; rapport en français, 7 constats (1 HIGH : FR-011 encore ouvert dans la spécification après `plan` ; 4 MEDIUM ; 2 LOW), aucun CRITICAL, couverture des FR 100 %, tableau de couverture sans colonne « Has Task? », question finale sur « les findings B1 et F1 » (pas « top N ») ; fichiers inchangés (horodatages identiques avant et après), la réponse « non » n'a pas été jouée (mode non interactif). Open Code (constitution de Bookit 1.0.0) : 62 s, 12 étapes, 0,26 USD, 15 constats (2 CRITICAL, deux violations de la constitution ; 5 HIGH ; 6 MEDIUM ; 2 LOW), tableau de couverture de 19 lignes, aucune tâche sans exigence, question finale sur « the top issues (C1, C2, U2, F1) » ; fichiers inchangés (sommes md5 identiques) ; un premier essai est resté bloqué plus de 14 min sans sortie. Message d'`analyze` sans `.specify/feature.json` : à relever sur la VM.
Au TP 5 : l'indice couvre les constats d'`analyze` à écarter : sept exigences « sans tâche » parce qu'il cherche `FR-###` (lire la colonne Task IDs), et REG-06 et REG-07 « sans tâche Code » (voulu par le template).
:::

## Analyser avant d'implémenter {kicker="Analyser"}

![Le workflow : specify, clarify optionnelle, point de contrôle review-spec, plan, point de contrôle review-plan, tasks, analyze optionnelle, un commit de tasks.md relu comme point de contrôle, puis implement](images/05-workflow.svg)

Une tâche fausse coûte une session ; une exigence sans tâche se découvre après `implement`.

::: sources
- [Spec Kit, `docs/reference/workflows.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/workflows.md)
- Fichier de workflow déposé par `specify init` 1.2.2 (`.specify/workflows/speckit/workflow.yml`)
- Module 2, slide « Point de contrôle : `type: gate` »
:::

::: notes
Source complémentaire : `formateur/spec-kit.md` § 7. `workflows.md` 1.2.2 : un `gate` est une étape qui « pause[s] for human approval before continuing » ; dans le workflow livré, les points de contrôle suivent `specify` (`review-spec`) et `plan` (`review-plan`) ; aucun entre `tasks` et `implement`. `analyze` n'est pas dans le fichier de workflow, comme `clarify` : `specify init` les décrit comme optionnelles (encadré « Enhancement Skills », `analyze` après `tasks` et avant `implement`, relevé dans les notes du module 2).
Dans les TP, les commandes s'invoquent une à une : le point de contrôle est le commit de `tasks.md` relu, avec le message qui note les constats ignorés. Même schéma que celui du module 4, avec `analyze` ajoutée.
:::

## Avant `implement`, le développeur relit chaque artefact et corrige à la main les constats fondés. {.statement kicker="Analyser"}

::: notes
Conclut les trois slides : `analyze` croise spécification, plan et tâches ; le rapport propose et n'applique pas ; elle se place avant `implement`. Le TP 5 enchaîne le `.feature`, `plan`, la relecture, le template, `tasks` et `analyze` ; le TP 6 ouvre sur `implement`.
:::

## TP 5 : planifier et découper {.tp duration="60 min" kicker="TP 5"}

Arrivée : cinq commits faits à la main, `specs/001-valider-reservation/` avec `plan.md`, `research.md`, `data-model.md`, `quickstart.md` et `tasks.md` de quatorze tâches, aucune case cochée. L'agent ne commite pas.

::: notes
Point de départ : arrivée du TP 4 (9 commits, `spec.md` à sept exigences REG-01 à REG-07, `checklists/requirements.md`, `.specify/feature.json` présent et ignoré, `.specify/templates/spec-template.md` modifié, 1 test vert). Arrivée : 14 commits, `git status --short` vide, `specs/001-valider-reservation/` avec `valider-reservation.feature`, `spec.md` réaligné, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `tasks.md` sans case cochée, `.specify/templates/tasks-template.md` modifié, 1 test vert, `validate_booking` rend toujours `None`. Ligne « TP 5 » de la trajectoire (`formateur/fil-rouge.md`).
Durées prévues : 8 min pour les scénarios, 10 min pour le plan, 5 min pour sa relecture, 5 min pour le template de tâches, 10 min pour les tâches (5 min de commande, 5 min de relecture), 8 min pour l'analyse, 5 min de débrief, 9 min de marge.
Durées de commande relevées au rejeu du 23 octobre 2026 (`claude -p` et `opencode run`, hors TUI, enchaînement depuis l'arrivée du TP 4). Claude Code : scénarios 2 min 13 (13 tours, 0,62 USD) ; plan 2 min 14 (23 tours, 0,75 USD) ; tâches 1 min 27 (16 tours, 0,40 USD) ; analyse 2 min 05 (12 tours, 0,39 USD) ; total 2,16 USD. Open Code : scénarios 37 s (5 tours, 0,19 USD) ; plan 61 s (10 tours, 0,26 USD) ; tâches 28 s (5 tours, 0,11 USD) ; analyse 44 s (5 tours, 0,09 USD) ; total 0,65 USD. Les durées en TUI sont plus longues (lecture des permissions) : à relever sur la VM.
Valeurs du corrigé (`tp/tp05/`) : 19 scénarios dans le `.feature` et dans `spec.md` (8 acceptés sous la première User Story, 8 refusés sous la deuxième, 3 sous la troisième), 7 exigences, `plan.md` sans `NEEDS CLARIFICATION`, sans `contracts/`, Constitution Check à sept lignes (une par principe), Complexity Tracking vide ; `tasks.md` à 14 tâches (T001 socle de test, cinq paires Test et Code, deux tâches Test seules, une finition). `git diff --stat` du template de tâches : 1 file changed, 51 insertions(+), 188 deletions(-) (confirmé au rejeu, deux outils). `grep -c 'REG-NN'` sur le template fourni : 5.
Valeurs observées : 10, 11, 12, 13, puis 14 commits aux étapes 1, 2, 3, 4 et 6 ; `tasks.md` à 14 tâches, neuf phases, organisées par exigence, 7 tâches Test et 5 tâches Code, aucun `[P]`, sous les deux outils ; analyse : 4 constats sous Claude Code (1 HIGH, 1 MEDIUM, 2 LOW, couverture 7/7), 9 sous Open Code (1 HIGH sur les bornes de REG-04, 5 MEDIUM dont REG-06 et REG-07 « sans tâche Code », 3 LOW). Le constat HIGH de Claude Code visait une contradiction de `spec.md` (« Bornes exclusives : 30 min exactement acceptée ») héritée d'un `spec.md` divergent du corrigé du TP 4 : fondé, corrigé à la main. `plan.md` : sous Claude Code, pas de section Complexity Tracking ; sous Open Code, l'arbre du plan présente le `.feature` « à créer » alors qu'il existe depuis l'étape 1 (corrigé à la main à l'étape 3).
Écarts du corrigé avec le plan : REG-04 est encadrée à 59 et 62 jours (le 60e jour tombe un samedi, voir le module 4) ; la tâche Test se repère par `\[REG-0[1-7]\] Test`, la forme du template (`[REG-01] Test :`), et non par `Test REG-0N` ; la description d'une tâche cite son chemin avec « dans », non « in ».
`contracts/` n'est apparu sous aucun des deux outils avec l'argument du TP ; Constitution Check à sept lignes sous les deux. À relever sur la VM, en TUI : permissions réelles, durées, message d'`analyze` si `.specify/feature.json` manque (non éprouvé).
Permissions : `claude -p` refuse sans demander les commandes hors allowlist. L'agent a appelé `bash .specify/scripts/bash/setup-plan.sh --json` et `setup-tasks.sh --json` avec le préfixe `bash `, que `Bash(.specify/scripts/bash/*)` du `settings.json` du fil rouge ne couvre pas : refus, puis l'agent a écrit les artefacts directement, résultat conforme sans que le script ait tourné. En TUI, la demande de permission s'affiche ; à vérifier sur la VM si le préfixe `bash ` redemande une autorisation (l'indice du plan dit déjà de l'accorder). Le message « Ignoring 2 permissions.allow entries… this workspace has not been trusted » n'apparaît qu'en `-p` : la boîte de confiance de la TUI active l'allowlist.
Débrief, deux questions : ce que le plan a tranché que la spécification ne disait pas, et d'où vient chaque réponse (un principe, une exigence ou l'argument) ; pourquoi REG-06 et REG-07 n'ont pas de tâche Code (elles se vérifient par un test sur le code des cinq premières règles).
Pièges : laisser `contracts/` ; accepter un plan qui touche `api.py` ou le dépôt SQLite ; lancer `tasks` sans le template ni l'argument, d'où des tâches sans test ; laisser `analyze` appliquer ses corrections ; cocher une case de `tasks.md` avant le TP 6 ; commiter un `plan.md` qui garde une option « Web application » ou `src/`.
Non rejouable hors TUI, à vérifier sur la VM : le message d'`analyze` quand `.specify/feature.json` manque (« missing prerequisite » attendu, non éprouvé) et la proposition de remédiation d'`analyze` en fin de rapport (le rejeu la lit dans la sortie) ; sous Open Code 2.0.32, `opencode run` n'expanse pas `/speckit.plan`, `/speckit.tasks` ni `/speckit.analyze` (voir le module 4) : le rejeu envoie le texte de la commande avec l'argument. Un essai de `/speckit.plan …` collé tel quel dans `opencode run` a été pris pour une demande d'implémentation (code écrit, aucun `plan.md`) : ce défaut tient au mode non interactif, le stagiaire travaille en TUI. Ne pas lancer deux `opencode run` en parallèle sur le même service.
:::

### Scénarios Gherkin

Copier le fichier de scénarios dans le dossier de la fonctionnalité, puis le lire.

```console
$ cd ~/bookit
$ cp ~/fichiers/valider-reservation.feature specs/001-valider-reservation/
$ cat specs/001-valider-reservation/valider-reservation.feature
```

Lancer l'outil et envoyer ce prompt, tel quel. Il aligne les scénarios de `spec.md` sur le fichier.

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
Dans specs/001-valider-reservation/spec.md, remplace le contenu de chaque bloc gherkin par des scénarios de specs/001-valider-reservation/valider-reservation.feature, recopiés tels quels, sans le titre Fonctionnalité. Garde tous les titres de section, leurs priorités et leurs sous-sections (Why this priority, Independent Test, Acceptance Scenarios) : n'en supprime, n'en renomme et n'en ajoute aucun. Range chaque scénario dans le bloc de la section dont le titre décrit son cas (demande acceptée, demande refusée), classés par REG-NN. Les scénarios REG-06 et REG-07 vont dans le dernier bloc gherkin de la section User Scenarios & Testing. Les dix-neuf scénarios doivent figurer dans spec.md. Ne change ni les exigences ni les autres sections ; ne touche à aucun autre fichier.
```

Quitter par `/exit`, lire le diff, puis commiter.

```console
$ git diff --stat
$ git add -A
$ git commit -m "TP 5 : scénarios Gherkin"
```

::: attendu
```console
$ grep -c '^  Scénario:' specs/001-valider-reservation/valider-reservation.feature
19
$ grep -c 'Scénario:' specs/001-valider-reservation/spec.md
19
$ grep -cE '^\*\*REG-0[1-7]\*\*' specs/001-valider-reservation/spec.md
7
$ git log --oneline | wc -l
10
```
:::

::: indice
L'agent réécrit une exigence : `git checkout -- specs/001-valider-reservation/spec.md`, puis relancer dans une session neuve avec la phrase « ne change ni les exigences ni les autres sections » en tête du prompt. Le compte de scénarios diffère de 19 : un scénario a été fusionné ou dédoublé, comparer les titres `REG-NN, …` des deux fichiers avec `grep 'Scénario:'`.
:::

### Plan

Lancer l'outil dans `~/bookit` et invoquer `plan` avec cet argument, tel quel. Lire chaque demande de permission avant de l'accepter : `setup-plan.sh` est le script du dépôt, les écritures vont dans `specs/`.

::: claude-code
```console
$ claude
```

```prompt
/speckit-plan Domaine seul : la règle s'écrit dans bookit/domain/validate_booking.py, rien d'autre ne change dans bookit/. Tests pytest-bdd dans tests/test_valider_reservation.py, liés à specs/001-valider-reservation/valider-reservation.feature. Aucun contrat d'API, aucun fichier dans contracts/ : l'API et le stockage sont inchangés. Python 3.14 géré par uv, aucune dépendance nouvelle. Une règle par fonction interne, appelées dans l'ordre REG-01 à REG-05.
```
:::

::: opencode
```console
$ opencode
```

```prompt
/speckit.plan Domaine seul : la règle s'écrit dans bookit/domain/validate_booking.py, rien d'autre ne change dans bookit/. Tests pytest-bdd dans tests/test_valider_reservation.py, liés à specs/001-valider-reservation/valider-reservation.feature. Aucun contrat d'API, aucun fichier dans contracts/ : l'API et le stockage sont inchangés. Python 3.14 géré par uv, aucune dépendance nouvelle. Une règle par fonction interne, appelées dans l'ordre REG-01 à REG-05.
```
:::

Quand la commande a terminé, quitter par `/exit` et commiter le plan tel quel : il se relit à l'étape suivante.

```console
$ git add -A
$ git commit -m "TP 5 : plan"
```

::: attendu
```console
$ ls specs/001-valider-reservation
checklists  data-model.md  plan.md  quickstart.md  research.md  spec.md  valider-reservation.feature
$ test -e specs/001-valider-reservation/contracts; echo $?
1
$ grep -c 'NEEDS CLARIFICATION' specs/001-valider-reservation/plan.md
0
$ git log --oneline | wc -l
11
```
:::

::: indice
`contracts/` est créé malgré l'argument : le supprimer et retirer sa mention de `plan.md`. Le plan propose de modifier `api.py` ou le dépôt SQLite : relancer dans une session neuve en mettant la phrase « rien d'autre ne change » en tête de l'argument. `setup-plan.sh` demande une permission avec un chemin absolu : l'accorder, c'est le script du dépôt. `plan.md` existait déjà d'un essai précédent : le supprimer, `setup-plan.sh` ne recopie le template que si le fichier est absent. L'outil est resté ouvert depuis l'étape précédente : `/clear` (Claude Code) ou `/new` (Open Code) avant la commande.
:::

### Relecture du plan

Relire `plan.md` en trois points. Corriger à la main dans l'éditeur.

- Constitution Check : une ligne par principe, aucune violation à justifier (Complexity Tracking vide, ou absent du plan).
- Project Structure : deux fichiers, `bookit/domain/validate_booking.py` et `tests/test_valider_reservation.py`, aucun module nouveau.
- Technical Context : pytest-bdd nommé, aucun `NEEDS CLARIFICATION`.

Parcourir ensuite `research.md`, `data-model.md` et `quickstart.md` et retirer ce qui contredit le plan. Le commit marque la relecture, même sans correction.

```console
$ git diff --stat
$ git add -A
$ git commit --allow-empty -m "TP 5 : plan relu"
```

::: attendu
```console
$ grep -c '^## Constitution Check' specs/001-valider-reservation/plan.md
1
$ grep -q 'bookit/domain/validate_booking.py' specs/001-valider-reservation/plan.md && grep -q 'tests/test_valider_reservation.py' specs/001-valider-reservation/plan.md && echo ok
ok
$ grep -qi 'pytest-bdd' specs/001-valider-reservation/plan.md && echo ok
ok
$ grep -c 'NEEDS CLARIFICATION' specs/001-valider-reservation/plan.md
0
$ git log --oneline | wc -l
12
```
:::

::: indice
Le Constitution Check cite un principe comme « N/A » : écrire la ligne, respecté et pourquoi. Project Structure garde une option « Web application » ou `src/` : remplacer par l'arbre réel du dépôt. `quickstart.md` lance `uvicorn` et un `curl` : conserver, c'est le test de fumée, mais retirer tout scénario qui passe par l'API pour tester une règle. L'arbre de Project Structure présente `valider-reservation.feature` comme « à créer » : il existe depuis l'étape 1, corriger la ligne.
:::

### Template de tâches

Remplacer le template des tâches par le fichier fourni, en place, comme le template de la spécification au TP 4. Lire le diff, puis le fichier : une phase pour le socle de test, une phase par exigence avec une tâche Test avant sa tâche Code, deux exigences sans tâche Code, une finition.

```console
$ cp ~/fichiers/tasks-template.md .specify/templates/
$ git diff --stat
$ git diff
$ git add -A
$ git commit -m "TP 5 : template de tâches"
```

::: attendu
```console
$ grep -c 'Tests are OPTIONAL' .specify/templates/tasks-template.md
0
$ grep -c 'REG-NN' .specify/templates/tasks-template.md
5
$ git diff --stat HEAD~1 -- .specify/templates/ | tail -1
 1 file changed, 51 insertions(+), 188 deletions(-)
$ git log --oneline | wc -l
13
```
:::

::: indice
`git diff --stat` ne montre rien : le fichier est mal placé, son nom est `tasks-template.md` et son dossier `.specify/templates/`, sans sous-dossier. `specify init` relancé par erreur réécrit le fichier : le reprendre de `~/fichiers/`.
:::

### Tâches

Lancer l'outil dans `~/bookit` et invoquer `tasks` avec cet argument, tel quel. Le prompt de `tasks` ne produit des tâches de test que si l'argument les demande.

::: claude-code
```console
$ claude
```

```prompt
/speckit-tasks Tests obligatoires : une tâche Test avant chaque tâche Code. Suis le template, une phase par exigence REG-01 à REG-07 dans cet ordre, une tâche Test REG-NN puis une tâche Code REG-NN par exigence à code de refus, une tâche Test seule pour REG-06 et REG-07, T001 le socle de test ; fichiers tests/test_valider_reservation.py et bookit/domain/validate_booking.py seulement, aucun [P] entre le test et le code d'une même exigence.
```
:::

::: opencode
```console
$ opencode
```

```prompt
/speckit.tasks Tests obligatoires : une tâche Test avant chaque tâche Code. Suis le template, une phase par exigence REG-01 à REG-07 dans cet ordre, une tâche Test REG-NN puis une tâche Code REG-NN par exigence à code de refus, une tâche Test seule pour REG-06 et REG-07, T001 le socle de test ; fichiers tests/test_valider_reservation.py et bookit/domain/validate_booking.py seulement, aucun [P] entre le test et le code d'une même exigence.
```
:::

Quitter par `/exit` et relire `tasks.md` : T001 le socle de test, cinq paires Test et Code, deux tâches Test seules, une finition, un chemin de fichier exact par tâche, aucune case cochée. Corriger à la main. Aucun commit à cette étape : l'analyse suit.

::: attendu
```console
$ grep -c '^- \[ \] T' specs/001-valider-reservation/tasks.md
14
$ grep -c '^- \[[xX]\]' specs/001-valider-reservation/tasks.md
0
$ grep -cE '\[REG-0[1-7]\] Test' specs/001-valider-reservation/tasks.md
7
$ grep -cE '\[REG-0[1-5]\] Code' specs/001-valider-reservation/tasks.md
5
```
:::

::: indice
Les tâches sont groupées par parcours (User Story 1, 2) : le prompt de la commande impose cette organisation, relancer dans une session neuve avec « ignore l'organisation par user story, suis le template » en tête de l'argument. Une tâche cite `tests/unit/` ou `src/` : corriger le chemin à la main. Un `[P]` entre Test REG-01 et Code REG-01 : le retirer, même fichier de test, même fichier de code. REG-06 ou REG-07 reçoit une tâche Code : la supprimer, le template ne leur donne qu'une tâche Test. L'outil est resté ouvert depuis l'étape précédente : `/clear` (Claude Code) ou `/new` (Open Code) avant la commande.
:::

### Analyse

Lancer l'outil dans `~/bookit` et invoquer `analyze` sans argument. Lire le rapport : tableau des constats, tableau de correspondance entre exigences et tâches, métriques. Répondre « non » à la proposition de corriger les constats, quitter par `/exit`, puis corriger à la main, dans l'artefact fautif, les constats fondés. Les constats écartés se notent dans le message du commit.

::: claude-code
```console
$ claude
```

```prompt
/speckit-analyze
```
:::

::: opencode
```console
$ opencode
```

```prompt
/speckit.analyze
```
:::

```console
$ git add -A
$ git commit -m "TP 5 : tâches relues" -m "Constats écartés : ..."
```

::: attendu
```console
$ git status --short | wc -l
0
$ git log --oneline | wc -l
14
$ uv run pytest -q | grep -o '^[0-9]* passed'
1 passed
$ grep -c '^- \[ \] T' specs/001-valider-reservation/tasks.md
14
```
:::

::: indice
`analyze` signale les sept exigences REG-NN comme sans tâche parce qu'il cherche `FR-###` : lire la colonne Task IDs du tableau de correspondance, les tâches Test REG-NN couvrent chaque exigence, constat à écarter. `analyze` signale REG-06 et REG-07 « sans tâche Code » : voulu, le template ne leur donne qu'une tâche Test, constat à écarter. `analyze` propose d'ajouter des tâches de performance ou de journalisation (Success Criteria) : refuser, hors périmètre. L'outil est resté ouvert depuis l'étape précédente : `/clear` (Claude Code) ou `/new` (Open Code) avant la commande.
:::

### Corrigé {.corrige}

```markdown file="../tp/tp05/specs/001-valider-reservation/tasks.md"
```

Quatorze tâches, aucune case cochée. Vérification : `grep -c '^- \[ \] T'` rend `14`, `grep -c '^- \[[xX]\]'` rend `0`.

## Glossaire : template, argument, socle, analyse {kicker="Glossaire"}

- **Template** : gabarit Markdown d'un artefact Spec Kit, versionné dans `.specify/templates/`
- **Argument** : texte qui suit la commande Spec Kit à l'invocation, substitué à `$ARGUMENTS` dans son prompt

|||

- **Socle de test** : tâche T001 de `tasks.md`, le fichier de test sans scénario lié, sur lequel chaque tâche Test s'appuie
- **Analyse** : passe `/speckit-analyze` de cohérence entre spécification, plan et tâches, la constitution en référence

::: sources
- [Spec Kit, `templates/commands/plan.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/plan.md)
- [Spec Kit, `templates/commands/analyze.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/analyze.md)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation.
:::
