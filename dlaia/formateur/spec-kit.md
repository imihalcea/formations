# Spec Kit 1.2.2 : relevé des fichiers déposés et des prompts

Relevé daté du 19 octobre 2026. Version épinglée : `specify-cli` 1.2.2, publiée le même jour (release `v1.2.2` sur GitHub, disponible sur PyPI). Relevé effectué sur un poste Linux avec Claude Code 2.1.303 et Open Code v2.0.26, dans des dossiers jetables initialisés par les commandes ci-dessous. Les releases de Spec Kit sont hebdomadaires : refaire ce relevé si la version épinglée change.

Sources consultées (dépôt `github/spec-kit` au tag `v1.2.2`, documentation officielle des deux outils) :

- https://github.com/github/spec-kit/releases/tag/v1.2.2 (notes de version, commande d'installation)
- https://pypi.org/project/specify-cli/ (version 1.2.2 publiée)
- https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/core.md (`specify init`, variables d'environnement, extension git non installée par défaut)
- https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/integrations.md (intégrations `claude` et `opencode`, option `--no-model-invocation`, répertoires de commandes)
- https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/presets.md (section « File resolution » : ordre de résolution, stratégies de composition)
- https://github.com/github/spec-kit/blob/v1.2.2/docs/guides/customization.md (surcharge locale contre preset contre extension)
- https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/artifacts.md (`specify artifact`)
- https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/workflows.md (workflows, étapes `gate`)
- https://github.com/github/spec-kit/blob/v1.2.2/docs/install/pypi.md (installation épinglée par `uv tool install specify-cli==X.Y.Z`)
- https://github.com/github/spec-kit/blob/v1.2.2/src/specify_cli/integrations/claude/__init__.py et `opencode/__init__.py` (code des deux intégrations)
- https://code.claude.com/docs/en/skills (emplacement des skills, invocation `/name`, champs `disable-model-invocation`, `user-invocable`, `argument-hint`, `$ARGUMENTS`)
- https://opencode.ai/docs/commands/ (emplacement `.opencode/commands/`, invocation `/nom`, `$ARGUMENTS`, champs de frontmatter)

## 1. Installation et initialisation

Installation vérifiée depuis PyPI :

```sh
uv tool install specify-cli==1.2.2
specify version        # CLI Version 1.2.2
```

La release GitHub propose la forme équivalente `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.2.2`. Les deux donnent le même exécutable `specify`. `specify self upgrade` reconstruit l'installation depuis GitHub : ne pas l'utiliser sur la VM, la version doit rester épinglée.

Initialisation vérifiée pour les deux outils :

```sh
specify init bookit --integration claude --script sh
specify init bookit --integration opencode --script sh
```

Options relevées dans `specify init --help` et utiles à la formation :

| Option | Effet vérifié |
|---|---|
| `--here` ou `.` | Initialise dans le répertoire courant. Sur un répertoire non vide, demande confirmation ; `--force` la saute et fusionne (les fichiers existants, dont `AGENTS.md`, sont conservés). C'est le cas du stagiaire qui initialise `~/bookit/` déjà extrait. |
| `--script sh` | Dépose les scripts dans `.specify/scripts/bash/`. Sans l'option, un terminal interactif demande le type de script. |
| `--non-interactive` | Aucune question, valeurs par défaut. Sans `--integration`, l'intégration par défaut est `copilot`. |
| `--integration-options="--no-model-invocation"` | Intégration `claude` seulement : écrit `disable-model-invocation: true` dans les dix skills. Claude Code ne lance alors un skill Spec Kit que sur invocation explicite `/speckit-<commande>` et ne charge pas leurs descriptions dans son contexte. Sans l'option, la valeur est `false` et Claude Code peut déclencher un skill de lui-même. L'option est enregistrée dans `.specify/integration.json` (`raw_options`, `parsed_options`). |
| `--ignore-agent-tools` | Saute la vérification de présence de l'outil (`claude` ou `opencode` dans le `PATH`). |

`specify init` ne touche pas à git : il ne crée ni dépôt ni branche. La création de branche appartient à l'extension `git`, absente par défaut (`specify extension list` : « No extensions installed »). Le stagiaire reste donc sur `main`, ce qui convient aux TP.

Depuis la version 1.2.2, `specify init` écrit un message « Agent Folder Security » qui recommande d'ajouter `.claude/` ou `.opencode/` au `.gitignore`. Pour la formation, les skills et commandes doivent être commités : ignorer ce conseil.

## 2. Arborescence déposée

Fichiers déposés par `specify init`, identiques pour les deux outils sauf le dossier de commandes :

```text
.specify/
├── .gitignore                       # ignore feature.json et l'état local des extensions
├── init-options.json                # ai, integration, script, feature_numbering, speckit_version
├── integration.json                 # intégration par défaut, invoke_separator ("-" ou ".")
├── integrations/
│   ├── claude.manifest.json         # ou opencode.manifest.json : SHA-256 des fichiers de commandes
│   └── speckit.manifest.json        # SHA-256 des scripts, templates et .gitignore
├── memory/
│   ├── constitution.md              # copie vierge du template, à remplir par /speckit-constitution
│   └── .constitution-template.json  # SHA-256 du template d'origine
├── scripts/bash/
│   ├── common.sh                    # résolution du projet, de la feature, des templates (942 lignes)
│   ├── check-prerequisites.sh       # vérifie spec/plan/tasks, renvoie FEATURE_DIR et AVAILABLE_DOCS
│   ├── create-new-feature.sh        # numérote et crée specs/NNN-nom/ (appelé par l'extension git)
│   ├── resolve-template.sh          # résout un template à travers la pile de surcharges
│   ├── setup-plan.sh                # copie plan-template dans specs/NNN-nom/plan.md
│   └── setup-tasks.sh               # renvoie le contenu de tasks-template résolu
├── templates/
│   ├── constitution-template.md     # 50 lignes
│   ├── spec-template.md             # 131 lignes
│   ├── plan-template.md             # 113 lignes
│   ├── tasks-template.md            # 252 lignes
│   └── checklist-template.md        # 45 lignes
└── workflows/
    ├── workflow-registry.json
    └── speckit/workflow.yml         # workflow « Full SDD Cycle » avec deux gates
```

Claude Code : dix skills `.claude/skills/speckit-<commande>/SKILL.md`. Open Code : dix commandes `.opencode/commands/speckit.<commande>.md`. Aucun fichier de contexte (`CLAUDE.md`, `AGENTS.md`) n'est écrit ; le fil rouge garde son seul `AGENTS.md`.

Six scripts sont rendus exécutables à l'initialisation. Les scripts sont identiques entre les deux outils à un détail près : les messages d'erreur citent la commande dans la forme de l'outil (`/speckit-plan` contre `/speckit.plan`), d'où des SHA-256 différents dans `speckit.manifest.json`.

Fichier d'état local : `.specify/feature.json` contient `{"feature_directory": "specs/NNN-nom"}`. Il est écrit par `/speckit-specify` et lu par toutes les commandes suivantes pour retrouver la feature courante. Il est ignoré par git (`.specify/.gitignore`, vérifié avec `git check-ignore`). Conséquence pour les TP : après un clone ou une suppression du fichier, les commandes échouent avec « Feature directory not found. Set SPECIFY_FEATURE_DIRECTORY or run the specify command to create .specify/feature.json. » ; le stagiaire qui travaille sur une seule copie du projet n'est pas concerné.

## 3. Noms d'invocation dans chaque outil

| | Claude Code | Open Code |
|---|---|---|
| Intégration `specify init` | `--integration claude` | `--integration opencode` |
| Emplacement | `.claude/skills/speckit-<commande>/SKILL.md` | `.opencode/commands/speckit.<commande>.md` |
| Invocation | `/speckit-<commande>` | `/speckit.<commande>` |
| `invoke_separator` dans `integration.json` | `-` | `.` |
| Arguments | `$ARGUMENTS` | `$ARGUMENTS` |

Les noms sont confirmés par trois sources concordantes : le message « Next Steps » affiché par `specify init`, le code des intégrations (`registrar_config`), et la documentation de chaque outil. Claude Code lit les skills de projet dans `.claude/skills/<nom>/SKILL.md` et les expose comme `/<nom>` ; Open Code lit les commandes de projet dans `.opencode/commands/` et expose chaque fichier `x.md` comme `/x`. L'intégration Open Code de Spec Kit déclare aussi `.opencode/command/` (singulier) comme emplacement hérité, absent de la documentation Open Code actuelle.

Frontmatter généré, Claude Code (exemple de `speckit-specify`) :

```yaml
---
name: "speckit-specify"
description: "Create or update the feature specification from a natural language feature description."
argument-hint: "Describe the feature you want to specify"
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/specify.md"
user-invocable: true
disable-model-invocation: false
---
```

Frontmatter généré, Open Code (même commande) :

```yaml
---
description: Create or update the feature specification from a natural language feature description.
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
  - label: Clarify Spec Requirements
    agent: speckit.clarify
    prompt: Clarify specification requirements
    send: true
---
```

Le champ `handoffs` (présent sur `constitution`, `specify`, `clarify`, `plan`, `tasks`) et le champ `tools` de `taskstoissues` ne figurent pas parmi les champs de frontmatter documentés par Open Code (`description`, `agent`, `model`, `subtask`) ; ils sont sans effet dans Open Code.

Le corps des prompts est identique entre les deux outils, au séparateur près dans les mentions de commandes. Les skills Claude Code contiennent une ligne supplémentaire : « When constructing command invocations from hook command names, replace dots (`.`) with hyphens (`-`). » (un hook d'extension nommé `speckit.git.commit` s'invoque `/speckit-git-commit`).

## 4. Les dix commandes

Toutes les commandes commencent par un bloc `## User Input` avec `$ARGUMENTS`, puis un bloc de vérification des hooks d'extension (`.specify/extensions.yml`, clés `hooks.before_<commande>` et `hooks.after_<commande>`), sans effet tant qu'aucune extension n'est installée.

| Commande | Script appelé | Lit | Écrit | Arrêts humains |
|---|---|---|---|---|
| `constitution` | `resolve-template.sh constitution-template --json` | constitution existante, README | `.specify/memory/constitution.md` | demande si l'entrée est ambiguë ; date de ratification inconnue → `TODO(...)` |
| `specify` | aucun | `spec-template` résolu, constitution | `specs/NNN-nom/spec.md`, `specs/NNN-nom/checklists/requirements.md`, `.specify/feature.json` | jusqu'à 3 questions `[NEEDS CLARIFICATION]` posées en bloc avec tableau d'options |
| `clarify` | `check-prerequisites.sh --json --paths-only` | spec.md, constitution | spec.md (section `## Clarifications`, `### Session AAAA-MM-JJ`), `checklists/requirements.md` | jusqu'à 5 questions, une à la fois, avec recommandation |
| `plan` | `setup-plan.sh --json` | spec.md, constitution, plan.md (template copié) | plan.md, research.md, data-model.md, quickstart.md, contracts/ | aucun ; ERROR si le Constitution Check échoue sans justification |
| `tasks` | `setup-tasks.sh --json` | plan.md, spec.md, artefacts de design, constitution | tasks.md | aucun |
| `analyze` | `check-prerequisites.sh --json --require-spec --require-tasks --include-tasks` | spec.md, plan.md, tasks.md, constitution | rien (lecture seule) | propose des remédiations sans les appliquer |
| `checklist` | `check-prerequisites.sh --json --template checklist-template` | spec.md, plan.md, tasks.md | `checklists/<domaine>.md` | jusqu'à 3 questions de cadrage, 2 de plus au besoin |
| `implement` | `check-prerequisites.sh --json --require-tasks --include-tasks` | tasks.md, plan.md, artefacts, constitution, checklists | code, fichiers `.gitignore` et équivalents, tasks.md (cases cochées `[X]`) | STOP si une checklist a des items non cochés |
| `converge` | `check-prerequisites.sh --json --require-spec --require-tasks --include-tasks` | spec.md, plan.md, tasks.md, constitution, code | tasks.md (ajout d'une section `## Phase N: Convergence`) | aucun |
| `taskstoissues` | `check-prerequisites.sh --json --require-tasks --include-tasks` | tasks.md, remote git | issues GitHub par MCP | dépréciée ; affiche un avertissement et renvoie vers l'extension `github` |

Détail par commande, utile pour les démonstrations et les corrigés.

**constitution.** Résout `constitution-template` par le script (surcharges, presets, extensions, puis cœur), charge la constitution existante pour conserver ses valeurs, remplace chaque jeton `[ALL_CAPS]`. Numérote la version en semver (MAJOR pour un principe retiré ou redéfini, MINOR pour un principe ajouté, PATCH pour une reformulation), date en ISO. Écrit un « Sync Impact Report » en commentaire HTML en tête de fichier, prévu pour être retiré avant commit. Propose un message de commit. Le prompt classe toute demande d'implémentation en « deferred intent » et refuse de toucher au code. Le nombre de principes suit l'entrée de l'utilisateur, pas le template.

**specify.** Génère un nom court de 2 à 4 mots, numérote `NNN` d'après `specs/` (`feature_numbering: sequential` dans `init-options.json`), crée le dossier et copie le template lui-même : aucun script n'est appelé, l'agent fait `mkdir -p` et résout le template « équivalent à `specify preset resolve spec-template` ». Limite à 3 marqueurs `[NEEDS CLARIFICATION]`, priorité périmètre > sécurité > expérience > technique ; les autres inconnues deviennent des hypothèses dans la section `Assumptions`. Génère `checklists/requirements.md` (16 items) et le valide lui-même, 3 itérations au plus. Consigne « Focus on WHAT users need and WHY. Avoid HOW to implement ». Les critères de succès doivent être mesurables et sans technologie (« API response time is under 200ms » est donné en mauvais exemple).

**clarify.** Balaye le spec selon une taxonomie de dix catégories (périmètre, données, interaction, qualités non fonctionnelles, intégrations, cas limites, contraintes, terminologie, signaux de fin, placeholders), classe chaque catégorie Clear / Partial / Missing, puis pose une question à la fois, 5 au plus, chacune à choix multiples (2 à 5 options) ou réponse courte (5 mots). Chaque réponse est intégrée immédiatement dans le spec (bullet `- Q: … → A: …` sous `## Clarifications`, puis modification de la section concernée) et le fichier est sauvegardé après chaque intégration. Revalide `checklists/requirements.md` et rapporte « 12/16 → 15/16 items passing ». Ne crée pas de spec : renvoie à `/speckit-specify` s'il manque.

**plan.** `setup-plan.sh` copie le template résolu dans `plan.md` s'il n'existe pas. L'agent remplit Technical Context, puis la section Constitution Check, présentée comme « GATE: Must pass before Phase 0 research. Re-check after Phase 1 design » ; une violation non justifiée dans Complexity Tracking est une erreur. Phase 0 produit `research.md` (Decision, Rationale, Alternatives considered), Phase 1 `data-model.md`, `contracts/`, `quickstart.md`. La commande s'arrête après la Phase 1 ; `tasks.md` appartient à `/speckit-tasks`.

**tasks.** `setup-tasks.sh` renvoie le contenu du template résolu (`TASKS_TEMPLATE_CONTENT`) et la liste des documents disponibles. Format imposé de chaque tâche : `- [ ] T001 [P] [US1] Description avec chemin de fichier`. Organisation par user story, phases Setup, Foundational, une phase par story, Polish. Point à retenir pour le TP 6 : « Tests are OPTIONAL: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach ». Pour obtenir des tâches de test, le spec ou l'argument de la commande doit le demander.

**analyze.** Lecture seule. Construit un inventaire des exigences (FR-###, SC-###), des stories et des tâches, puis six passes : duplication, ambiguïté, sous-spécification, alignement avec la constitution, couverture, incohérence. Sévérité CRITICAL pour toute violation d'un MUST de la constitution. Rapport en tableau, 50 findings au plus, puis « Would you like me to suggest concrete remediation edits ? ».

**checklist.** « Unit Tests for English » : chaque item interroge la qualité d'une exigence (« Is 'prominent display' quantified ? [Clarity, Spec §FR-4] »), jamais le comportement du code. Fichier `checklists/<domaine>.md`, items `CHK001…`, non cochés à la génération. Le prompt rappelle que `/speckit-implement` lit l'état des cases comme une porte.

**implement.** Après les prérequis, compte les cases de chaque checklist ; si une checklist a des items non cochés, STOP et question « Do you want to proceed with implementation anyway? (yes/no) ». `requirements.md` généré par `specify` est coché par l'agent lui-même, donc en général PASS. Vérifie ou crée `.gitignore` (motifs Python : `__pycache__/`, `.venv/`, etc.). Exécute phase par phase, tâches `[P]` en parallèle, arrêt à la première tâche séquentielle en échec, coche `[X]` dans `tasks.md` au fur et à mesure.

**converge.** Nouveauté de la série 1.x. Compare le code présent avec spec, plan et tasks (sans git ni diff), classe les écarts `missing`, `partial`, `contradicts`, `unrequested`, et ajoute en fin de `tasks.md` une section `## Phase N: Convergence` avec des tâches `T{M+1}` tracées (`per FR-003 (missing)`). Si rien ne manque, `tasks.md` reste inchangé octet pour octet. Ne modifie ni le code ni spec et plan.

**taskstoissues.** Dépréciée : « will be removed in a future minor release. Use the bundled `github` extension instead ». Hors périmètre de la formation.

## 5. Les templates

| Template | Rempli par | Structure |
|---|---|---|
| `constitution-template.md` | `constitution` | `# [PROJECT_NAME] Constitution`, `## Core Principles` avec cinq `### [PRINCIPLE_N_NAME]` en exemple, deux sections libres `[SECTION_2_NAME]` et `[SECTION_3_NAME]`, `## Governance`, ligne de version `**Version**: X \| **Ratified**: date \| **Last Amended**: date`. Les exemples en commentaire HTML citent « Test-First (NON-NEGOTIABLE) » et « Library-First ». |
| `spec-template.md` | `specify` | En-tête (`**Feature Branch**`, `**Created**`, `**Status**: Draft`, `**Input**`), `## User Scenarios & Testing` avec stories priorisées P1, P2, P3 et scénarios `**Given** / **When** / **Then**`, `### Edge Cases`, `## Requirements` avec `FR-001…` en `System MUST`, `### Key Entities`, `## Success Criteria` avec `SC-001…`, `## Assumptions`. Les scénarios d'acceptation sont déjà en Given / When / Then, ce qui prépare EARS et Gherkin au module 4. |
| `plan-template.md` | `plan` | `## Summary`, `## Technical Context` (langage, dépendances, stockage, tests, plateforme, type de projet, performance, contraintes, échelle), `## Constitution Check` (GATE), `## Project Structure` (arbre de `specs/NNN/` et trois options de structure de code à élaguer), `## Complexity Tracking` (tableau Violation / Why Needed / Simpler Alternative Rejected Because). |
| `tasks-template.md` | `tasks` | Frontmatter `description`, format `[ID] [P?] [Story] Description`, phases Setup, Foundational, User Story 1 à 3 (chacune avec tests optionnels « Write these tests FIRST, ensure they FAIL »), Polish, puis `## Dependencies & Execution Order`, `## Parallel Example`, `## Implementation Strategy` (MVP first). Les tâches d'exemple sont à remplacer, ordre « Commit after each task or logical group » dans les notes. |
| `checklist-template.md` | `checklist` | Titre, méta (Purpose, Created, Feature), note de propriété (`[x]` = critère de qualité validé par le relecteur), catégories avec `- [ ] CHK001`, notes. |

`.specify/memory/constitution.md` déposé à l'initialisation est une copie exacte du template (vérifié par `diff`) : tous les jetons sont à remplir.

## 6. Ordre de résolution des surcharges

Deux mécanismes distincts, vérifiés dans `common.sh` (`resolve_template` et `resolve_template_content`) et dans la documentation des presets.

Les templates sont résolus à l'exécution, à chaque appel de script, par nom logique (`spec-template`, `plan-template`, `tasks-template`, `constitution-template`, `checklist-template`), dans cet ordre, premier trouvé gagnant :

1. surcharge locale au projet : `.specify/templates/overrides/<nom>.md` (toujours stratégie `replace`) ;
2. presets installés : `.specify/presets/<id>/templates/<nom>.md`, triés par priorité croissante (`priority` 10 par défaut, plus petit gagne, égalité départagée par ordre alphabétique de l'identifiant) ;
3. extensions installées : `.specify/extensions/<id>/templates/<nom>.md`, triées par priorité ;
4. cœur : `.specify/templates/<nom>.md`.

Un preset peut déclarer dans `preset.yml` une stratégie `replace`, `prepend`, `append` ou `wrap` (le jeton `{CORE_TEMPLATE}` reçoit la couche inférieure) ; la composition demande Python 3 et PyYAML dans le `PATH` du script. Une surcharge locale ne compose pas : elle remplace tout.

Les commandes sont matérialisées à l'installation dans le dossier de l'outil actif (`.claude/skills/` ou `.opencode/commands/`) par `specify preset add`, `specify extension add` ou `specify integration use`. Un agent ne re-résout pas la pile à chaque invocation : modifier `.specify/templates/overrides/` suffit pour un template, pas pour une commande.

Commandes d'inspection :

```sh
specify preset resolve plan-template       # quel fichier gagne et par quelle couche
specify artifact list --json               # inventaire : 10 commandes, 5 templates, 4 scripts
specify artifact info template:plan-template --json   # pile de composition d'un artefact
.specify/scripts/bash/resolve-template.sh plan-template   # contenu résolu
```

Pour le TP 5 (surcharge de template), le chemin à faire créer est `.specify/templates/overrides/plan-template.md` ou `tasks-template.md` : pris en compte par `setup-plan.sh` et `setup-tasks.sh` sans réinstallation. `setup-plan.sh` ne copie le template que si `plan.md` n'existe pas encore : pour voir l'effet d'une surcharge sur un plan déjà créé, supprimer `plan.md` d'abord.

Le dossier `overrides/` n'existe pas à l'initialisation. La commande `specify preset resolve` lit la même pile.

## 7. Le workflow `speckit` et ses gates

`specify init` installe un workflow bundled « Full SDD Cycle » (`.specify/workflows/speckit/workflow.yml`, version 1.0.1, listé par `specify workflow list`). Six étapes :

```text
specify (command) → review-spec (gate) → plan (command) → review-plan (gate) → tasks (command) → implement (command)
```

Chaque gate est de la forme :

```yaml
- id: review-spec
  type: gate
  message: "Review the generated spec before planning."
  options: [approve, reject]
  on_reject: abort
```

Deux entrées : `spec` (obligatoire, la description de la feature) et `integration` (`auto` par défaut, l'intégration du projet). Lancement par `specify workflow run speckit`, reprise par `specify workflow resume <run_id>`. Le moteur lance l'outil en ligne de commande hors session interactive : pour Open Code, l'intégration construit `opencode run --command speckit.specify --format json "<spec>"` (`build_exec_args` de `integrations/opencode/__init__.py`). Cette option appartient à Open Code v1 ; Open Code v2.0.32 répond « Unrecognized flag: --command » et `opencode run "/speckit.specify …"` envoie le texte brut au modèle (relevé du 20 octobre 2026). `specify workflow run` est donc inutilisable avec Open Code v2. Il n'y a pas de gate entre `tasks` et `implement`, ni d'appel à `clarify` ou `analyze`, décrites par `specify init` comme optionnelles.

Pour la formation, le workflow illustre la notion de gate (module 2, rôle humain à chaque transition) ; les TP restent sur les commandes invoquées une à une dans l'outil, où chaque transition est une décision du stagiaire.

## 8. Points d'attention pour les énoncés et les démonstrations

- `specify init` sur un `~/bookit/` déjà extrait : `specify init --here --force --integration claude --script sh` (ou `opencode`). Les fichiers existants sont conservés.
- Les deux variantes d'énoncé ne diffèrent que par l'intégration et le séparateur : `/speckit-specify` contre `/speckit.specify`.
- Pas de branche git : les artefacts vont dans `specs/001-<nom>/` sur `main`, et le champ `**Feature Branch**` du spec reçoit le nom du dossier.
- `/speckit-specify` peut poser jusqu'à trois questions en bloc avant d'écrire ; `/speckit-clarify` en pose jusqu'à cinq, une par une. Prévoir ces échanges dans le timing du TP 4.
- `/speckit-tasks` ne génère pas de tâches de test sans demande explicite : le TP 6 (TDD, pytest-bdd) doit l'exiger dans le spec ou dans l'argument de la commande.
- `/speckit-implement` s'arrête si une checklist contient des items non cochés ; seule `checklists/requirements.md` existe sans `/speckit-checklist`, et elle est cochée par l'agent.
- La constitution déposée est vierge. Seul `/speckit-converge` prévoit le cas d'une constitution restée au stade de template ; `/speckit-plan` remplit son Constitution Check depuis le fichier tel quel. Le TP 3 doit la remplir avant tout.
- Le « Sync Impact Report » en tête de `constitution.md` est un commentaire HTML à retirer avant commit, ce que le prompt annonce lui-même.
- `.specify/feature.json` n'est pas commité : l'état de la feature courante est local au poste.
- Option `--no-model-invocation` (Claude Code seulement) : à décider pour la commande d'initialisation du support. Sans elle, Claude Code peut lancer un skill Spec Kit de sa propre initiative quand la description lui paraît pertinente ; avec elle, seul `/speckit-<commande>` les déclenche. Open Code n'a pas d'équivalent : une commande ne se lance que par `/speckit.<commande>`.
