# Spécifier

Écrire le comportement attendu pour que l'agent n'ait rien à deviner

::: notes
Module 4, 1 h d'exposé, puis TP 4 (60 min) et bilan de la journée (15 min). Point de départ : les deux idées clés du module 3, « Structure du code dans la constitution, comportement du produit dans la spécification » et « bookit est cadré dès le TP 3 ; `validate_booking` attend le TP 6 », et le débrief du TP 3 : la constitution 1.0.1 dit où va une règle métier (principe IV) et rien de la règle elle-même. Question laissée ouverte : comment écrire REG-01 à REG-05 pour qu'un test tranche et que l'agent ne choisisse pas à notre place.
Trente-cinq slides, six sections : exigence vérifiable, EARS et Gherkin, fichier de contexte, skills, `specify` et `clarify`, bilan. Trois démonstrations appellent le modèle (`claude-sonnet-4-6` dans les deux outils) ; les démonstrations 2 et 3 se jouent sur `hello-spec`, jamais sur bookit, pour ne pas jouer le TP à la place des stagiaires.
:::

## Où la constitution s'arrête {kicker="Exigence vérifiable"}

| Question | Réponse | Où elle est écrite |
|---|---|---|
| où s'écrit la règle | `bookit/domain/validate_booking.py` | constitution 1.0.1, principe IV |
| quelle est la règle | au moins 2 heures après l'instant courant | `docs/regles-metier.md`, REG-03 |
| 2 heures pile, acceptée ou refusée ? | inconnue | aucun artefact ne le dit |

::: sources
- Constitution 1.0.1 de bookit, principe IV (`tp/tp03/.specify/memory/constitution.md`)
- Règles métier de bookit (`tp/fichiers/regles-metier.md`)
:::

::: notes
Principe IV de la constitution 1.0.1 : « Une règle métier s'écrit dans `bookit/domain/validate_booking.py` ». La constitution dit la couche et le fichier ; elle ne dit rien de la règle, par construction (idée clé du module 3 : structure du code dans la constitution, comportement du produit dans la spécification).
REG-03 dans `docs/regles-metier.md` : « une réservation commence au moins 2 heures après l'instant courant ». « Au moins » se lit comme une borne incluse en français courant, mais rien ne le dit en toutes lettres et aucun test n'existe : la troisième ligne est vide à dessein, le vide est la question du module.
Les deux autres règles à borne, REG-01 (30 minutes, 4 heures) et REG-04 (60 jours), sont dans le même cas ; REG-02 (8h, 20h00) aussi. Le responsable produit tranchera au TP 4 : toutes les bornes sont incluses.
:::

## Une règle, trois lectures possibles {kicker="Exigence vérifiable"}

> REG-03 : une réservation commence au moins 2 heures après l'instant courant.

| Lecture de REG-03 | Ligne produite (illustration) |
|---|---|
| 2 heures pile acceptée | `booking.start >= now + timedelta(hours=2)` |
| 2 heures pile refusée | `booking.start > now + timedelta(hours=2)` |
| préavis compté depuis la création de la demande | `booking.start >= booking.created_at + timedelta(hours=2)` |

::: sources
- [Spec Kit, `spec-driven.md` v1.2.2, « Don't guess »](https://github.com/github/spec-kit/blob/v1.2.2/spec-driven.md)
:::

::: notes
Trois lectures de la même phrase, trois lignes de code différentes ; la troisième mesure le préavis depuis un autre instant que l'instant courant, ce qu'un modèle choisit quand la phrase ne nomme pas l'origine de la mesure. Les trois lignes sont des illustrations, aucune n'est tirée d'un rejeu.
Rejeu du TP 1 (20 octobre 2026, `claude-sonnet-4-6`) : le prompt v2 disait « bornes incluses » et ne disait rien de 20h00 pile, du samedi ni des créneaux jointifs ; la v2 produite acceptait 30 min, 4 h et 20h00 pile dans les deux outils ; sous Claude Code, REG-02 ne bornait que `start < 8h` et `end > 20h`, une demande de 23h00 à 02h00 passait (slide « Deux fonctions produites, aucune preuve » du module 2). Ce que le prompt laisse ouvert, l'agent le tranche seul, sans le dire.
Spec Kit, `spec-driven.md`, section « Template-Driven Quality » : « Mark all ambiguities: Use [NEEDS CLARIFICATION: specific question] », « Don't guess: If the prompt doesn't specify something, mark it ». C'est la parade de l'outil ; le module la montre à la section « Specify et clarify ».
:::

## Borne, code, instant courant {kicker="Exigence vérifiable"}

![REG-03 réécrite en deux exigences : Quand une demande commence avant l'instant courant plus 2 heures, bookit doit la refuser avec le code lead_time. Quand une demande commence exactement 2 heures après l'instant courant, bookit doit l'accepter. Trois étiquettes : la borne, valeur limite incluse ou exclue ; le code de refus ; l'instant courant d'où le préavis se mesure](images/04-exigence.svg)

::: sources
- [Alistair Mavin, EARS, patron « event-driven »](https://alistairmavin.com/ears/)
- [Spec Kit, `templates/commands/specify.md` v1.2.2, marqueur `[NEEDS CLARIFICATION]`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md)
:::

::: notes
Définition du lexique, portée par l'étiquette du schéma : la borne est la valeur limite d'une règle (30 minutes, 4 heures, 2 heures, 60 jours, 20h00), incluse ou exclue ; une exigence la tranche, un scénario Gherkin la teste de chaque côté. Les trois éléments que REG-03 n'avait pas : la borne tranchée, le code de refus nommé, l'origine de la mesure. Avec eux, un test répond oui ou non : 9h00 + 2 h = 11h00, une demande à 11h00 est acceptée, une demande à 10h59 est refusée avec `lead_time`.
Les deux phrases suivent le patron « sur un événement » d'EARS (Mavin : « When <trigger>, the <system name> shall <system response> »), présenté au module 2 avec ses mots-clés traduits : un déclencheur, une réponse. La première refuse ; la seconde dit la valeur pile en toutes lettres, au lieu de la laisser à la lecture du mot « avant » ou de « moins de 2 heures ». À 9h00, une demande à 11h00 est acceptée, une demande à 10h59 est refusée avec `lead_time`. Le skill `ears` du TP 4 reste à aligner sur cette forme.
Quand la borne n'est pas tranchée au moment d'écrire, Spec Kit prévoit le marqueur `[NEEDS CLARIFICATION: …]` dans le texte (prompt `specify`, « Only mark with [NEEDS CLARIFICATION: specific question] if … Multiple reasonable interpretations exist with different implications ») : la question reste visible dans l'artefact au lieu d'être tranchée en silence.
:::

## Ce qu'une règle laisse ouvert, l'exigence le tranche avant que l'agent choisisse. {.statement kicker="Exigence vérifiable"}

::: notes
Conclut les trois slides : la constitution s'arrête à l'emplacement, la règle se lit de plusieurs façons, l'exigence porte la borne, le code et l'instant courant. La section suivante donne les deux formats qui portent ces trois éléments : EARS pour la phrase, Gherkin pour les bornes, l'un et l'autre vus au module 2 et appliqués ici à REG-05.
:::

## REG-05 en une phrase EARS {kicker="EARS et Gherkin"}

> **Quand** une demande vise une ressource dont une réservation confirmée chevauche le créneau demandé, bookit **doit** la refuser avec le code `overlap`.

![Ligne du temps de la salle A le mardi 2 juin 2026, instant courant 9h00 : une réservation confirmée de 14h à 15h, une demande jointive de 15h à 16h acceptée, une demande chevauchante de 14h30 à 15h30 refusée avec le code overlap](images/04-reg05.svg)

::: sources
- [Alistair Mavin, EARS, patron « event-driven »](https://alistairmavin.com/ears/)
- Règles métier de bookit (`tp/fichiers/regles-metier.md`)
:::

::: notes
Mavin, patron event-driven : « When <trigger>, the <system name> shall <system response> » ; mots-clés traduits, convention de la formation posée au module 2 (slide « EARS, une phrase à mots-clés »). Le déclencheur est la demande ; la réponse est le refus avec son code.
« Créneau » et « réservation confirmée » sont définis au module 3 : un créneau va de son début inclus à sa fin exclue, deux créneaux jointifs ne se chevauchent pas (REG-05 dans `docs/regles-metier.md`). La phrase EARS s'appuie sur ces définitions au lieu de les répéter : c'est le lexique du domaine qui porte la borne du chevauchement.
Le schéma montre la borne de REG-05 : 15h00 à 16h00 touche la réservation de 14h00 à 15h00 sans la chevaucher, 14h30 à 15h30 la chevauche. L'instant courant 9h00 et les créneaux de l'après-midi respectent REG-01 à REG-04, pour que seule REG-05 décide.
:::

## REG-05 en deux scénarios Gherkin {kicker="EARS et Gherkin"}

```gherkin
# language: fr
Fonctionnalité: Valider une demande de réservation

  Scénario: REG-05, créneau jointif
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Et la salle A réservée de 14h00 à 15h00
    Quand une demande vise la salle A de 15h00 à 16h00
    Alors la demande est acceptée

  Scénario: REG-05, créneau chevauchant
    Soit l'instant courant fixé au mardi 2 juin 2026 à 9h00
    Et la salle A réservée de 14h00 à 15h00
    Quand une demande vise la salle A de 14h30 à 15h30
    Alors la demande est refusée avec le code overlap
```

::: sources
- [Cucumber, Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Cucumber, Gherkin Languages, ligne `fr`](https://cucumber.io/docs/gherkin/languages/)
:::

::: notes
Un scénario de chaque côté de la borne : le jointif accepté, le chevauchant refusé. Chaque scénario fixe l'instant courant dans son Soit (Cucumber : « Given steps are used to describe the initial context of the system ») et l'état de la ressource ; le Quand porte la demande (« an event, or an action ») ; le Alors est observable (« an expected outcome, or result »), un code de refus ou « acceptée ».
Localisation : `# language:` en première ligne (« tells Cucumber what spoken language to use ») ; la ligne `fr` de la page des langues donne `Fonctionnalité`, `Scénario`, `Soit`, `Quand`, `Alors`, `Et`. `date -d 2026-06-02 +%A` répond `mardi` : les dates des scénarios du TP sont relues contre cette commande.
Les deux scénarios se lisent avec la ligne du temps de la slide précédente ; au TP 5 ils entrent dans le `.feature`, au TP 6 pytest-bdd les exécute.
:::

## Ce que chaque format fixe {kicker="EARS et Gherkin"}

| | EARS | Gherkin |
|---|---|---|
| unité | une exigence | un cas |
| ce qui est fixé | la condition et la réponse | les valeurs aux bornes |
| qui le lit | le développeur | pytest-bdd, module 6 |
| où | `spec.md`, Requirements | `spec.md`, User Scenarios ; `.feature` au TP 5 |

::: sources
- [Spec Kit, `templates/spec-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/spec-template.md)
- [Alistair Mavin, EARS](https://alistairmavin.com/ears/)
- [Cucumber, Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [pytest-bdd, documentation](https://pytest-bdd.readthedocs.io/en/stable/)
:::

::: notes
Le même numéro REG-NN lie la phrase et ses scénarios dans `spec.md` : c'est ce qui permet de relire un diff contre la spécification (module 2, slide « Chaque format dans le dépôt »).
`spec-template.md` 1.2.2 : section `## Requirements` avec des `FR-001` en « System MUST », section `## User Scenarios & Testing` avec des scénarios d'acceptation déjà en `**Given** / **When** / **Then**` ; le fichier à trous de bookit (section suivante, slide « Exigences REG-NN dès le brouillon ») remplace les premiers par des phrases EARS numérotées REG-NN et les seconds par des blocs Gherkin en français.
pytest-bdd : un scénario d'un `.feature` est lié à un test par `@scenario('fichier.feature', 'Titre du scénario')` ou en bloc par `scenarios('dossier')` ; la version 8.0.0 prend en charge `# language:`. Le module 6 le montre en exécution.
EARS se lit ; Gherkin s'exécute. Une exigence sans scénario reste une phrase ; un scénario sans exigence est un cas sans règle.
:::

## EARS énonce la règle ; Gherkin la vérifie sur des cas. {.statement kicker="EARS et Gherkin"}

::: notes
Conclut les trois slides : REG-05 en une phrase, en deux scénarios, puis ce que chaque format fixe. Écrire dans ces deux formats, en français et avec la numérotation REG-NN, demande une convention que l'agent doit recevoir à chaque session : c'est l'objet de la section suivante, le fichier de contexte.
:::

## `AGENTS.md`, lu à chaque session {kicker="Fichier de contexte"}

![Deux fenêtres de contexte : la session 1 au lancement, instructions fixes puis AGENTS.md puis le prompt ; la session 2, fenêtre vidée, AGENTS.md de nouveau présent, relu depuis la racine du dépôt](images/04-contexte.svg)

Ce que l'agent doit savoir à chaque session, dont la convention EARS et Gherkin, s'écrit une fois dans `AGENTS.md`.

::: sources
- [Claude Code, Memory, section AGENTS.md](https://code.claude.com/docs/en/memory#agents-md)
- [Open Code, Rules](https://opencode.ai/docs/rules/)
:::

::: notes
Définition du lexique, portée par l'étiquette du schéma : le fichier de contexte est `AGENTS.md`, lu par l'agent au lancement de chaque session. Reprise de la slide « Deux façons d'informer l'agent » du module 3 : un fichier court, lu à chaque commande, versionné.
Claude Code, Memory (consultée le 22 octobre 2026) : « Each Claude Code session begins with a fresh context window » ; section AGENTS.md : Claude Code lit `AGENTS.md` « At session start » quand aucun `CLAUDE.md`, `.claude/CLAUDE.md` ni `CLAUDE.local.md` n'existe dans le répertoire de travail ou au-dessus, et affiche « no CLAUDE.md found; AGENTS.md loaded: … » ; « Reading `AGENTS.md` directly requires Claude Code v2.1.277 or later » ; avec un `CLAUDE.md` à côté, « Your `CLAUDE.md` files only ». Open Code, Rules : « Place an `AGENTS.md` in your project root for project-specific rules », cherché en remontant depuis le répertoire courant au lancement.
Position dans la fenêtre : après les instructions fixes, avant le prompt, comme sur la slide « Ce que le modèle lit » du module 1, dont le schéma annonçait le fichier de contexte pour ce module. Le schéma ne montre ni les définitions d'outils ni les descriptions des skills, qui viennent à la section suivante.
Pourquoi `AGENTS.md` et non `CLAUDE.md` dans bookit : un seul fichier pour les deux outils ; Open Code ne lit que `AGENTS.md`, Claude Code le lit à défaut de `CLAUDE.md` (`formateur/equivalences.md`). La slide `compare` de la section Skills le détaille.
:::

## Ce qui entre dans `AGENTS.md` {kicker="Fichier de contexte"}

| Entre | N'entre pas |
|---|---|
| les commandes de test et de lint | la vue d'ensemble du dépôt |
| les conventions non standard : mots-clés en français, REG-NN | les conventions que le modèle connaît déjà |
| ce que l'agent ne fait jamais : commiter | ce qui change souvent |
| où sont la constitution et les règles métier | la documentation détaillée d'une API |

Gloaguen et al. : les instructions sont « well followed », les vues d'ensemble du dépôt « not helpful ».

::: sources
- [Claude Code, Best practices, « Write an effective CLAUDE.md »](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
- [Gloaguen et al., Evaluating AGENTS.md, arXiv 2602.11988, v3 du 29 septembre 2026](https://arxiv.org/abs/2602.11988)
:::

::: notes
Claude Code, Best practices, tableau Include / Exclude (consulté le 22 octobre 2026) : à inclure « Bash commands Claude can't guess », « Code style rules that differ from defaults », « Testing instructions and preferred test runners », « Architectural decisions specific to your project », « Common gotchas or behaviors that aren't self-evident » ; à exclure « Anything Claude can figure out by reading code », « Standard language conventions Claude already knows », « Detailed API documentation (link to docs instead) », « Information that changes frequently », « File-by-file descriptions of the codebase ». Et : « keep it short and human-readable », « Bloated CLAUDE.md files cause Claude to ignore your actual instructions! ». La page vaut pour `AGENTS.md`, lu à la même place.
Gloaguen, Mündler-Sasahara, Müller, Raychev, Vechev, v3 : « instructions in the context files are well followed by coding agents », « repository overviews, although popular and recommended by model providers, are not helpful », « context files are useful for specifying non-standard coding practices » ; coût d'inférence « over 20% on average » en plus. Rappels du module 3 : Lulla et al. (arXiv 2601.20404, v2 du 30 mars 2026), 10 dépôts, 124 pull requests, temps médian −28,64 % et tokens de sortie −16,58 % avec un `AGENTS.md` ; McMillan (arXiv 2605.10039, 11 mai 2026), 1 650 sessions Claude Code avec Sonnet 4.6 : aucune des quatre variables de structure du fichier ne change l'obéissance, qui baisse d'environ 5,6 % de chances par fonction générée dans la session.
Ce que bookit en fait : les mots-clés en français et la numérotation REG-NN sont des pratiques non standard, l'agent ne les devinerait pas ; la liste des dossiers est absente du fichier fourni.
:::

## Le fichier `AGENTS.md` de bookit {kicker="Fichier de contexte"}

```markdown file="../tp/fichiers/AGENTS.md"
```

Les skills `ears` et `gherkin`, dossiers chargés sur demande, sont la section suivante.

::: sources
- Fichier fourni au TP 4 (`tp/fichiers/AGENTS.md`)
:::

::: notes
Onze lignes : pile, commandes, renvoi à la constitution, renvoi aux règles métier et à REG-NN, renvoi aux skills `ears` et `gherkin` avec la convention des mots-clés en français, ligne git. Deux `<TODO>` restent à remplir à l'étape 1 du TP 4 : la commande qui lance les tests (`uv run pytest -q`) et ce que l'agent ne fait jamais avec git (commiter, principe VII de la constitution).
La ligne de pile et la ligne hexagonale disent ce que l'agent lit dans `pyproject.toml` et dans l'arborescence : elles restent courtes et servent d'ancrage ; la liste des fichiers est absente (slide précédente).
Le renvoi à la constitution corrige ce que la démonstration 1 du module 3 avait montré : sans fichier de contexte, l'agent n'ouvrait pas `.specify/memory/constitution.md` hors des commandes Spec Kit. La slide « Fichier de contexte et constitution » y revient.
Pas de `CLAUDE.md`, pas de `/init` : sous Claude Code, `/init` écrirait un `CLAUDE.md` qui ferait ignorer `AGENTS.md`.
:::

## Fichier de contexte et constitution {kicker="Fichier de contexte"}

| | `AGENTS.md` | `.specify/memory/constitution.md` |
|---|---|---|
| qui le lit | l'agent, à chaque session | les commandes Spec Kit, de `specify` à `converge` |
| ce qu'il contient | commandes, conventions, renvois | les principes du code |
| qui l'écrit | le développeur, à la main | la commande `constitution`, relue |
| ce qui change | rarement, avec l'outillage | par numéro de version : 1.0.0, 1.0.1 |

::: sources
- [Claude Code, Memory](https://code.claude.com/docs/en/memory)
- [Spec Kit, `templates/commands/specify.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md), [`plan.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/plan.md), [`converge.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/converge.md) v1.2.2
- [Spec Kit, `templates/plan-template.md` v1.2.2, section Constitution Check](https://github.com/github/spec-kit/blob/v1.2.2/templates/plan-template.md)
:::

::: notes
Deux fichiers, deux lecteurs. `AGENTS.md` dit comment travailler dans le dépôt ; la constitution dit ce que le code respecte. `AGENTS.md` renvoie à la constitution pour que l'agent la lise aussi hors des commandes Spec Kit : à la démonstration 1 du module 3, sans fichier de contexte, les deux outils ont jugé un diff sans ouvrir `.specify/` ni `docs/adr/`, qu'un `ls` leur avait pourtant montrés.
Qui relit la constitution (module 3, slide « Qui relit la constitution ensuite ») : `plan` remplit le Constitution Check (`plan.md` : « Fill Constitution Check section from constitution » ; `plan-template.md`, section Constitution Check : « GATE: Must pass before Phase 0 research. Re-check after Phase 1 design. »), `tasks` et `implement` la chargent, `analyze` classe les conflits CRITICAL, `converge` la relit face au code ; `specify` et `clarify` la chargent aussi (« IF EXISTS: Load `.specify/memory/constitution.md` for project principles and governance constraints », vérifié dans les deux commandes déposées par Spec Kit 1.2.2 le 22 octobre 2026).
Ce qui change : `AGENTS.md` bouge quand l'outillage bouge (commande de test, nouveau skill) ; la constitution bouge par amendement numéroté, avec l'ADR qui le motive (gouvernance, TP 3). Un fichier court et stable, lu à chaque session ; un fichier de principes, lu par les commandes qui écrivent.
:::

## À chaque session, l'agent reçoit ce que le code tait. {.statement kicker="Fichier de contexte"}

::: notes
Conclut les quatre slides : le fichier est lu à chaque session, il contient ce que l'agent ne déduit pas du code, celui de bookit tient en onze lignes, il renvoie à la constitution. Ce qui ne tient pas en quelques lignes (une procédure, une syntaxe avec ses exemples) va dans un skill : section suivante.
:::

## Le skill, chargé sur demande {kicker="Skills"}

![Au lancement, la fenêtre contient les instructions fixes, AGENTS.md, les descriptions des skills ears et gherkin, le prompt ; au moment d'écrire une exigence, le corps de .claude/skills/ears/SKILL.md entre dans la fenêtre, celui de gherkin reste dehors](images/04-skill.svg)

Le modèle appelle un skill d'après sa description ; l'utilisateur, par son nom.

::: sources
- [Claude Code, Skills](https://code.claude.com/docs/en/skills)
- [Open Code, Skills](https://opencode.ai/docs/skills/)
- [Agent Skills, standard ouvert](https://agentskills.io)
:::

::: notes
Définition du lexique, portée par l'étiquette du schéma : un skill est un dossier `.claude/skills/<nom>/SKILL.md`, savoir-faire chargé sur demande, lu par les deux outils.
Claude Code, Skills (consultée le 22 octobre 2026) : « In a regular session, skill descriptions are loaded into context so Claude knows what's available, but full skill content only loads when invoked » ; « Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it » ; « Claude uses skills when relevant, or you can invoke one directly with `/skill-name` » ; « Claude Code skills follow the Agent Skills open standard, which works across multiple AI tools ». Open Code, Skills : « Skills are loaded on-demand via the native `skill` tool », « OpenCode lists available skills in the `skill` tool description », chaque entrée avec « the skill name and description » ; emplacement « Project Claude-compatible: `.claude/skills/<name>/SKILL.md` ». agentskills.io : « At startup, agents load only the name and description of each available skill » ; « When a task matches a skill's description, the agent reads the full `SKILL.md` instructions into context » ; le dossier peut contenir `scripts/`, `references/`, `assets/`.
Qui appelle : le modèle d'après la description, ou l'utilisateur (`/ears` sous Claude Code, `@ears` sous Open Code ; slide `compare` de la section). Observé le 22 octobre 2026 avec `claude-sonnet-4-6` (démonstration 1 et rejeu du TP 4) : Claude Code charge `ears` quand le prompt le nomme, par `/ears` ou en prose (« avec le skill ears », outil `Skill`), et pas sur le seul renvoi d'`AGENTS.md` ; Open Code le charge d'après sa description dès le premier tour, sans mention dans le prompt. Sous Claude Code, `disable-model-invocation: true` réserve le skill à l'utilisateur et retire sa description du contexte ; les skills fournis ne le portent pas.
Le schéma prolonge celui de la slide « `AGENTS.md`, lu à chaque session » : mêmes blocs, plus les descriptions au lancement et le corps à l'appel. Les définitions d'outils restent hors du schéma.
:::

## Le skill `ears` de bookit {kicker="Skills"}

```markdown file="../tp/fichiers/skills/ears/SKILL.md" lines="1-13"
```

::: sources
- Fichier fourni au TP 4 (`tp/fichiers/skills/ears/SKILL.md`)
- [Claude Code, Skills, « Frontmatter reference »](https://code.claude.com/docs/en/skills#frontmatter-reference)
- [Open Code, Skills](https://opencode.ai/docs/skills/)
:::

::: notes
À l'écran, le frontmatter et le tableau des patrons. Le reste du fichier : règles d'écriture (une exigence par ligne `**REG-NN** : …`, une règle à borne en deux phrases dont la seconde dit le sort de la valeur pile, le code entre accents graves, l'instant courant nommé, aucun mot-clé anglais), l'exemple REG-03 en deux phrases de la slide « Borne, code, instant courant », le contre-exemple « Le système devrait vérifier le préavis. » (aucun déclencheur, aucune borne, aucun code).
Frontmatter : Claude Code, « All fields are optional. Only `description` is recommended so Claude knows when to use the skill » ; Open Code, `name` et `description` « (required) » ; sans `description`, le skill n'est jamais proposé au modèle (`formateur/equivalences.md`). La description dit quand employer le skill : toute exigence de `spec.md`.
Le skill `gherkin` a la même forme : description (tout scénario de `spec.md` ou d'un `.feature`), mots-clés de la localisation `fr`, règles (titre `REG-NN, …`, instant courant fixé dans le Soit au mardi 2 juin 2026 à 9h00, Alors observable, un scénario de chaque côté de chaque borne, créneaux qui respectent les autres règles), exemple REG-03 à deux scénarios (11h00 à 12h00 acceptée, 10h59 à 11h59 refusée).
Démonstration 1 (appelle le modèle, `claude-sonnet-4-6`, jouée le 22 octobre 2026 sous les deux outils). Deux copies jetables de l'état d'arrivée du TP 3 avec `docs/regles-metier.md` : la copie A sans `AGENTS.md` ni skills, la copie B avec `tp/fichiers/AGENTS.md` rempli et les deux skills dans `.claude/skills/`. Même prompt dans une session neuve de chaque copie : « Écris dans ta réponse la règle REG-04 de `docs/regles-metier.md` comme une exigence de la spécification, en une phrase, sans écrire de fichier. » Résultat attendu : copie A, une phrase libre, sujet « le système », code `horizon` repris du fichier des règles, borne de 60 jours pile non tranchée ; copie B, une phrase EARS en français conforme au skill, `**REG-04** :`, « bookit doit », code `horizon`, « 60 jours pile est accepté ». Observé, copie A dans les deux outils : « le système doit refuser … plus de 60 jours après l'instant courant … code `horizon` », 7 s sous Claude Code, 12 s sous Open Code (qui a en plus écrit `docs/specification.md`, d'où « dans ta réponse » et « sans écrire de fichier » dans le prompt). Copie B sous Claude Code, prompt tel quel : aucun appel `Skill`, phrase mêlée « **When** … **the system shall** refuser … », borne non tranchée, 8 s ; relancée avec `/ears` devant le prompt : « **REG-04** : Quand une demande commence plus de 60 jours après l'instant courant, bookit doit la refuser avec le code `horizon` ; 60 jours pile est accepté. », 9 s. Copie B sous Open Code, prompt tel quel : premier outil appelé `skill` `ears`, phrase « **REG-04** : Si une demande commence plus de 60 jours après l'instant courant, bookit doit la refuser avec le code `horizon` ; 60 jours pile est accepté. », patron « cas indésirable » au lieu de « sur un événement », les deux figurent dans le tableau du skill, 14 s. Déroulé en salle : copie A ; sous Claude Code, copie B sans `/ears` (le renvoi d'`AGENTS.md` ne charge pas le skill), puis avec `/ears` ; sous Open Code, copie B avec le prompt tel quel.
:::

## Ce qu'un skill apporte, mesuré {.figures kicker="Skills"}

- **+16,6 points** de réussite, skills rédigés pour la tâche
- **+1,2 %** de réussite, skills publics génériques
- **39 sur 49** skills publics sans aucun effet

Un skill aide quand il porte un savoir que le modèle n'a pas.

::: sources
- [Li et al., SkillsBench, arXiv 2602.12670, v4 du 14 juin 2026](https://arxiv.org/abs/2602.12670)
- [Han et al., SWE-Skills-Bench, arXiv 2603.15401, 16 mars 2026](https://arxiv.org/abs/2603.15401)
:::

::: notes
SkillsBench (Li, Liu, Chen, You, Di et 72 coauteurs, v1 du 13 février 2026, v4 du 14 juin 2026, résumé consulté le 22 octobre 2026) : 87 tâches, 8 domaines ; « Curated Skills raise the average pass rate from 33.9% to 50.5% (+16.6 percentage points; 25.5% normalized gain) » ; 18 configurations modèle et harnais, gains « ranging from +4.1 to +25.7 pp » ; « Focused Skills with at most three modules outperform larger or exhaustive bundles, and smaller models with Skills can match larger models without them ». « Module » du résumé rendu par « partie » : un skill reste court et centré, deux skills `ears` et `gherkin` plutôt qu'un seul skill `spécification`. Le résumé de la v4 ne dit rien des skills auto-générés : ne pas l'affirmer.
SWE-Skills-Bench (Han, Zhang, Song, Fang, Chen, Sun, Hu, 16 mars 2026) : 49 skills publics de développement, 565 tâches, six sous-domaines ; « 39 of 49 skills yield zero pass-rate improvement, and the average gain is only +1.2% » ; « Only seven specialized skills produce meaningful gains (up to +30%), while three degrade performance (up to −10%) », baisse attribuée à « version-mismatched guidance conflicting with project context ».
Lecture des deux études ensemble : un skill rédigé pour la tâche, qui porte un savoir absent du modèle (ici une convention de l'équipe), aide ; un skill générique de développement, que le modèle connaît déjà, n'apporte rien, et un skill daté contredit le projet. Les skills `ears` et `gherkin` portent la convention de bookit : mots-clés français, REG-NN, instant courant fixé, un scénario par côté de borne.
:::

## Fichier de contexte ou skill {kicker="Skills"}

| | fichier de contexte | skill |
|---|---|---|
| quand il est lu | chaque session | sur demande |
| taille | quelques lignes | un dossier : exemples, scripts |
| contenu | règles, commandes, renvois | une procédure, une syntaxe |
| effet | contraint | étend |

Dans bookit, `AGENTS.md` renvoie aux skills `ears` et `gherkin`.

::: sources
- [Claude Code, Skills](https://code.claude.com/docs/en/skills)
- [Claude Code, Best practices, « Write an effective CLAUDE.md »](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
:::

::: notes
Claude Code, Skills : « Create a skill when you keep pasting the same instructions, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact » ; « Unlike CLAUDE.md content, a skill's body loads only when it's used ». Best practices : « CLAUDE.md is loaded every session, so only include things that apply broadly. For domain knowledge or workflows that are only relevant sometimes, use skills instead. Claude loads them on demand without bloating every conversation. »
Règle de partage : un fait vaut à chaque session, il va dans le fichier de contexte ; une procédure ou une syntaxe avec ses exemples ne sert qu'au moment d'écrire, elle va dans un skill. Quand une section de `AGENTS.md` grossit en procédure, elle passe en skill et le fichier garde un renvoi d'une ligne.
Dans bookit : `AGENTS.md` dit « toute exigence s'écrit avec le skill `ears`, tout scénario avec le skill `gherkin` » ; les patrons, les règles d'écriture et les exemples sont dans les deux `SKILL.md`.
:::

## Emplacements dans les deux outils {.compare kicker="Skills"}

::: claude-code
| | |
|---|---|
| fichier de contexte | `AGENTS.md`, lu à défaut de `CLAUDE.md` (v2.1.277) |
| dossier des skills | `.claude/skills/<nom>/SKILL.md` |
| appel d'un skill | `/ears` ; le modèle le charge quand le prompt le nomme |
:::

::: opencode
| | |
|---|---|
| fichier de contexte | `AGENTS.md`, lu nativement |
| dossier des skills | `.claude/skills/` par compatibilité (aussi `.opencode/skills/`) |
| appel d'un skill | `@ears` dans le prompt, ou l'outil `skill` ; aucun `/ears` |
:::

::: sources
- [Claude Code, Memory, section AGENTS.md](https://code.claude.com/docs/en/memory#agents-md)
- [Claude Code, Skills, « Choose where skills load »](https://code.claude.com/docs/en/skills#where-skills-live)
- [Open Code, Rules](https://opencode.ai/docs/rules/)
- [Open Code, Skills](https://opencode.ai/docs/skills/)
- [Open Code v2.0.32, `autocomplete.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.32/packages/tui/src/component/prompt/autocomplete.tsx)
- Démonstration 1 du 22 octobre 2026, `claude-sonnet-4-6` (notes de la slide « Le skill `ears` de bookit »)
:::

::: notes
Un seul `AGENTS.md` et un seul `.claude/skills/` dans bookit, lus par les deux outils : c'est ce qui rend le dépôt commun.
Claude Code, Memory : `AGENTS.md` lu « At session start » quand aucun `CLAUDE.md`, `.claude/CLAUDE.md` ni `CLAUDE.local.md` dans le répertoire de travail ou au-dessus ; « requires Claude Code v2.1.277 or later » ; `/init` « generate a starting CLAUDE.md automatically ». Claude Code, Skills : « Project: `.claude/skills/<skill-name>/SKILL.md` », « invoke one directly with `/skill-name` ».
Open Code, Rules : `AGENTS.md` à la racine du projet ; `/init` « To create a new `AGENTS.md` file », et « will improve it in place instead of blindly replacing it » s'il existe ; un `CLAUDE.md` du projet n'est lu qu'à défaut d'`AGENTS.md` (documentation ; en v2.0.32 le code de découverte ne contient pas la chaîne `CLAUDE.md`, `formateur/equivalences.md`). Open Code, Skills : emplacements `.opencode/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md` et leurs équivalents globaux ; « Skills are loaded on-demand via the native `skill` tool » ; `metadata.opencode/slash: "true"` exposerait un `/nom`, documenté sans code en v2.0.32 (`formateur/equivalences.md`). `@ears` : `autocomplete.tsx` v2.0.32 construit les options de skills avec `display: "@" + skill.id` en mode « reference », déclenché par `@` ; le mode `/` ne liste que les commandes. Constaté dans le code, à vérifier sur la VM : la saisie de `@` doit proposer `ears` et le prompt envoyé doit charger `SKILL.md`. Ligne « appel d'un skill » : la démonstration 1 du 22 octobre 2026 montre que Claude Code ne charge pas `ears` sur un prompt qui ne le nomme pas, même avec le renvoi d'`AGENTS.md`, et le charge dès que le prompt le nomme (`/ears` ou « avec le skill ears ») ; Open Code l'a chargé de lui-même au premier tour sur le même prompt.
`/init` dans aucun outil pour le fil rouge : sous Claude Code il écrirait un `CLAUDE.md` qui ferait ignorer `AGENTS.md` ; sous Open Code il réécrirait `AGENTS.md`. Les énoncés font copier le fichier fourni et remplir ses deux `<TODO>` à la main.
:::

## `ears` et `gherkin` donnent à l'agent la convention de bookit. {.statement kicker="Skills"}

::: notes
Conclut les cinq slides : le skill chargé sur demande, le skill `ears`, ce qu'un skill apporte mesuré, fichier de contexte ou skill, emplacements dans les deux outils. Les deux skills et `AGENTS.md` sont en place ; la section suivante lance la commande qui s'en sert, `specify`, puis `clarify`.
:::

## Du brief au brouillon {kicker="Specify et clarify"}

![Trois entrées, le brief, la constitution et le fichier à trous, entrent dans specify, qui écrit trois sorties : le brouillon spec.md, la liste de contrôle checklists/requirements.md et le dossier courant .specify/feature.json](images/04-specify.svg)

::: sources
- [Spec Kit, `templates/commands/specify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md)
:::

::: notes
Définitions du lexique, portées par les étiquettes du schéma : le brief est le besoin écrit en langage courant, entrée de `specify`, fichier `docs/brief.md` dans bookit ; le brouillon est la spécification produite par `/speckit-specify`, avant `clarify` ; la liste de contrôle est le fichier `checklists/requirements.md` écrit par `specify`, questions de qualité sur les exigences (« checklist » dans Spec Kit).
Prompt `specify` 1.2.2 (vérifié sur le fichier déposé par `specify init` le 22 octobre 2026) : « Generate a concise short name (2-4 words) for the feature » ; `mkdir -p SPECIFY_FEATURE_DIRECTORY` ; « Resolve the active `spec-template` through the Spec Kit preset/template resolution stack » ; « Copy the resolved `spec-template` file to `SPECIFY_FEATURE_DIRECTORY/spec.md` as the starting point » ; « Persist the resolved path to `.specify/feature.json` » ; « IF EXISTS: Load `.specify/memory/constitution.md` for project principles and governance constraints » ; « Create Spec Quality Checklist: Generate a checklist file at `SPECIFY_FEATURE_DIRECTORY/checklists/requirements.md` », validée par la commande elle-même, trois passes au plus. Aucun script n'est appelé : l'agent crée le dossier et copie le fichier à trous (`formateur/spec-kit.md` § 4) ; confirmé au rejeu du TP 4 et à la démonstration 2 dans les deux outils, `mkdir -p` puis `feature.json` écrits par l'agent.
`.specify/feature.json` : `{"feature_directory": "specs/001-<nom>"}`, lu par toutes les commandes suivantes, ignoré par git (`.specify/.gitignore`). Pas de branche git dans le fil rouge : le dossier `specs/001-valider-reservation/` vit sur `main`.
Dans bookit : brief `docs/brief.md`, constitution 1.0.1, fichier à trous modifié à l'étape 2 du TP ; sortie `specs/001-valider-reservation/spec.md`.
:::

## Le brief de bookit {kicker="Specify et clarify"}

```markdown file="../tp/fichiers/brief.md"
```

::: sources
- Fichier fourni au TP 4 (`tp/fichiers/brief.md`)
:::

::: notes
Le brief dit le besoin en langage courant : qui demande, ce que bookit décide, les règles par renvoi à `docs/regles-metier.md`, l'exigence de reproductibilité (même demande, même instant, même décision), le périmètre (API et stockage inchangés).
Ce que le brief laisse ouvert, à dessein, pour le débrief du TP : les bornes (la valeur pile), le cas de plusieurs règles enfreintes (quel code ?), les jours fériés, le fuseau horaire, et ce qui est hors périmètre (quota, annulation, pools, approbation). `specify` doit marquer ou poser ces points ; `clarify` les fait remonter ; le responsable produit y a répondu dans `docs/clarifications.md` (slide « Dix réponses du responsable produit »).
Le prompt du TP demande à `specify` de lire `docs/brief.md` et `docs/regles-metier.md`, nomme le dossier `valider-reservation`, impose EARS et Gherkin via les skills, et demande de marquer plutôt que de demander.
:::

## Exigences REG-NN dès le brouillon {kicker="Specify et clarify"}

```markdown file="../tp/fichiers/spec-template.md" lines="116-122"
```

```console
$ git diff --stat
 .specify/templates/spec-template.md | 45 ++++++++++++++++++++++++++++---------
 1 file changed, 34 insertions(+), 11 deletions(-)
```

::: sources
- [Spec Kit, `templates/commands/specify.md` v1.2.2, « Resolve the active `spec-template` »](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md)
- [Spec Kit, `templates/spec-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/spec-template.md)
- Fichier fourni au TP 4 (`tp/fichiers/spec-template.md`)
:::

::: notes
Le fichier à trous `.specify/templates/spec-template.md` est déposé par `specify init` et commité au TP 3 : un fichier du dépôt comme un autre. Le fichier fourni le remplace en place (`cp` puis `git diff`) : mêmes sections, `## User Scenarios & Testing`, `## Requirements`, `## Success Criteria`, `## Assumptions`, que `clarify`, `plan` et `tasks` cherchent par leur nom anglais ; seul le contenu imposé change. Sous Requirements, une ligne `**REG-NN** : <phrase EARS>` par exigence, avec son code, à la place des `FR-001` en « System MUST » ; sous chaque parcours, un bloc `gherkin` `# language: fr` à la place des `**Given** / **When** / **Then**`. L'exemple de marqueur est conservé, en français.
Sortie du `git diff --stat` : 34 insertions et 11 suppressions, relevées le 22 octobre 2026 en copiant le fichier fourni sur celui que dépose `specify init` 1.2.2 (trois blocs Gherkin à la place des lignes Given / When / Then, six lignes REG-NN à la place des sept FR-00N). `grep -c 'REG-' .specify/templates/spec-template.md` rend 6 sur le fichier fourni.
Prompt `specify` : « Resolve the active `spec-template` through the Spec Kit preset/template resolution stack (equivalent to `specify preset resolve spec-template`) », puis copie du fichier résolu. `docs/reference/presets.md` 1.2.2, « File resolution » : fichiers de `.specify/templates/overrides/`, presets, extensions, puis « Spec Kit core » `.specify/templates/` ; « For files neither provides, the core default is used ». Le fil rouge ne se sert pas de `overrides/` et n'installe ni preset ni extension : le cœur modifié est lu tel quel. `overrides/`, presets et `specify preset resolve` existent pour personnaliser sans toucher au cœur ; hors du périmètre de la formation. Rejeu du 22 octobre 2026 : sous Open Code, `specify` a lu le fichier modifié tel quel (exigences REG-NN, blocs Gherkin) sans contrôler `.specify/integrations/speckit.manifest.json`, qui porte le SHA-256 des fichiers à trous déposés ; sous Claude Code, l'agent a cherché `spec-template.md` sous `.specify/` puis `.claude/skills/speckit-specify/`, sans l'ouvrir, et a écrit `spec.md` sans le fichier à trous (ni User Story ni Edge Cases) ; le prompt de l'étape 3 nomme depuis le chemin du fichier.
Le mot « template » arrive au module 5, qui traite la personnalisation des commandes ; ici, « fichier à trous ».
:::

## Trois questions en bloc {kicker="Specify et clarify"}

```text
LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total
Prioritize clarifications by impact: scope > security/privacy > user experience > technical details
Present all questions together before waiting for responses
```

| Option (illustration) | Answer | Implications |
|---|---|---|
| A | 2 heures pile acceptée | borne incluse, scénario à 11h00 accepté |
| B | 2 heures pile refusée | borne exclue, scénario à 11h00 refusé |

Le reste devient hypothèse dans Assumptions ou marqueur dans le texte.

::: sources
- [Spec Kit, `templates/commands/specify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md)
:::

::: notes
Prompt `specify` 1.2.2, cité au mot près : « Only mark with [NEEDS CLARIFICATION: specific question] if: The choice significantly impacts feature scope or user experience; Multiple reasonable interpretations exist with different implications; No reasonable default exists » ; « LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total » ; « Prioritize clarifications by impact: scope > security/privacy > user experience > technical details » ; « Use reasonable defaults for unspecified details (document assumptions in Assumptions section) » ; après l'écriture, si des marqueurs restent, « present options to user » dans un tableau Option / Answer / Implications, « Number questions sequentially (Q1, Q2, Q3 - max 3 total) », « Present all questions together before waiting for responses », réponse attendue « Q1: A, Q2: Custom - [details], Q3: B ». Le tableau de la slide est une illustration sur REG-03 ; la ligne « Custom » du format est omise.
Démonstration 2 (appelle le modèle, jouée le 22 octobre 2026 sous les deux outils) : dans `~/hello-spec/` (ou `demo-claude` et `demo-opencode` initialisés au module 3), `/speckit-specify une liste de courses partagée entre colocataires` (ou `/speckit.specify …`) ; lire les permissions ; puis `ls specs/`, `cat .specify/feature.json`, `grep -c 'NEEDS CLARIFICATION' specs/*/spec.md`, `head -20 specs/*/checklists/requirements.md`. Résultat attendu : soit un bloc de questions avec tableaux d'options avant toute écriture, soit un brouillon écrit avec marqueurs et hypothèses ; `specs/001-<nom>/spec.md` et `checklists/requirements.md` créés, `feature.json` écrit, nom court de deux à quatre mots. Observé, dossier `001-liste-courses-colocataires` dans les deux outils, `feature.json` écrit par l'agent (aucun script appelé), `constitution.md` intact. Sous Claude Code : brouillon écrit d'abord, 3 marqueurs (FR-009 comptes des colocataires, FR-010 nombre de listes, FR-011 sort des articles achetés), puis les trois questions en bloc, chacune avec son tableau Option / Réponse / Implications et la consigne « Répondez sous la forme `Q1: A, Q2: B, Q3: C` » ; 16 tours, 4 min, 0,86 USD, dont la moitié à chercher `spec-template.md` sous `.specify/presets/` et `.claude/skills/speckit-specify/` avant `.specify/templates/`. Sous Open Code : brouillon écrit en un tour, 0 question, 0 marqueur, 6 hypothèses dans Assumptions, 10 exigences, liste de contrôle 16/16 ; 44 s, 0,24 USD. Hors TUI, `opencode run` n'expanse pas la commande et l'agent lit lui-même `.opencode/commands/speckit.specify.md` ; déroulé dans la TUI à vérifier sur la VM. Permissions attendues : `ls`, `find` et `mkdir -p` sous Claude Code ; deux `ls`, `mkdir -p` et trois écritures sous Open Code.
Au TP 4, le prompt de l'étape 3 demande de marquer plutôt que de demander, pour que le brouillon s'écrive en un tour ; l'indice couvre le cas où la commande pose quand même ses questions.
:::

## `clarify` balaye dix catégories {kicker="Specify et clarify"}

![À gauche les dix catégories de clarify avec leur état Clear, Partial ou Missing ; au centre une question avec son option recommandée et la réponse retenue ; à droite spec.md modifié en deux endroits, la section Clarifications et la section Requirements](images/04-clarify.svg)

Une clarification : la question posée par `clarify` et sa réponse, consignées dans `spec.md`.

::: sources
- [Spec Kit, `templates/commands/clarify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/clarify.md)
:::

::: notes
Définition du lexique, portée par la phrase sous le schéma : une clarification est la question posée par `/speckit-clarify` et la réponse consignée dans la spécification.
Prompt `clarify` 1.2.2 (vérifié sur le fichier déposé le 22 octobre 2026) : « Perform a structured ambiguity & coverage scan using this taxonomy. For each category, mark status: Clear / Partial / Missing » ; dix catégories : Functional Scope & Behavior, Domain & Data Model, Interaction & UX Flow, Non-Functional Quality Attributes, Integration & External Dependencies, Edge Cases & Failure Handling, Constraints & Tradeoffs, Terminology & Consistency, Completion Signals, Misc / Placeholders. Puis « Present EXACTLY ONE question at a time », « **Recommended:** Option [X] - <reasoning> », tableau d'options A à E et « Short » ; « the user replies with "yes", "recommended", or "suggested" » accepte la recommandation. Intégration « after EACH accepted answer » : section `## Clarifications`, sous-titre `### Session YYYY-MM-DD`, ligne `- Q: <question> → A: <final answer>`, puis la section concernée (Functional Requirements, Edge Cases, Success Criteria…) ; « Save the spec file AFTER each integration ». La commande charge aussi la constitution (« IF EXISTS »).
Le schéma est une illustration sur REG-03 : Edge Cases en Partial déclenche la question de la borne, la réponse A « acceptée, borne incluse » entre sous `## Clarifications` et dans REG-03. Au TP 4, la réponse vient du responsable produit (`docs/clarifications.md`), pas de la recommandation : le stagiaire répond par la lettre ou le texte, et refuse la recommandation quand elle diffère.
:::

## Cinq questions, par impact {kicker="Specify et clarify"}

```text
Maximum of 5 total questions across the whole session.
If more than 5 categories remain unresolved, select the top 5 by (Impact * Uncertainty) heuristic.
avoid asking two low-impact questions when a single high-impact area (e.g., security posture) is unresolved.
```

| Question | Critère du prompt |
|---|---|
| posée | « materially impact architecture, data modeling, … test design » |
| écartée | « implementation method, tech-stack comparison, or task breakdown » |

Une question coûte un tour : `clarify` les dépense sur ce qui change le code.

::: sources
- [Spec Kit, `templates/commands/clarify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/clarify.md)
:::

::: notes
Prompt `clarify` 1.2.2, cité au mot près : « Maximum of 5 total questions across the whole session » ; une question est écartée quand « Clarification would not materially change implementation or validation strategy » ou quand « The item is specifically about implementation method, tech-stack comparison, or task breakdown » ; « Only include questions whose answers materially impact architecture, data modeling, task decomposition, test design, UX behavior, operational readiness, or compliance validation » ; « Ensure category coverage balance: attempt to cover the highest impact unresolved categories first; avoid asking two low-impact questions when a single high-impact area (e.g., security posture) is unresolved » ; « If more than 5 categories remain unresolved, select the top 5 by (Impact * Uncertainty) heuristic ». Arrêt : ambiguïtés critiques résolues, « done », « good », « no more », ou cinq questions posées ; « Never reveal future queued questions in advance ». Si rien à demander : « No critical ambiguities detected worth formal clarification. »
Questions de `clarify` sur bookit au second rejeu du 22 octobre 2026 (prompt de l'étape 3 avec marqueurs imposés) : sous Claude Code, cinq (règles multiples, bornes de REG-01, de REG-02, de REG-03, de REG-04), annoncées « sept marqueurs regroupables en cinq questions » ; sous Open Code, quatre (bornes, règles multiples, autres données temporelles avec fériés et fuseau fusionnés, périmètre avec quota, annulation, pools et approbation fusionnés). Au troisième rejeu, cinq dans les deux outils ; sous Open Code : bornes, règles multiples, fériés, fuseau, dépendance au seul instant courant. Au premier rejeu, sans marqueur dans le brouillon, Claude Code n'avait posé que deux questions (fuseau des `datetime`, cas `start >= end`, sans réponse dans le fichier, d'où le repli « hors périmètre, à noter en hypothèse »). Sous Claude Code, à la question des horaires, la recommandation A disait « 8h00 inclus, 20h00 exclu » contre le responsable produit : la bonne réponse était B, « 20h00 inclus ».
Démonstration 3, première partie (appelle le modèle, jouée le 22 octobre 2026 sous les deux outils) : dans le même `hello-spec`, après la démonstration 2, `/speckit-clarify` (ou `/speckit.clarify`) sans argument ; répondre « yes » aux deux premières questions, puis « stop » ; `grep -A6 '^## Clarifications' specs/*/spec.md`. Résultat attendu : une question à la fois, avec « Recommended: Option … » et le tableau d'options ; après chaque réponse, le fichier modifié en deux endroits. Observé sous Claude Code : « Je vais poser jusqu'à 5 questions, une à la fois », première question sur FR-009 (compte unique par logement ou compte par colocataire), « Recommandé : Option B », tableau Option / Description à deux colonnes plus la ligne « Court » ; après chaque « yes », `## Clarifications` avec `### Session 2026-10-22` et la ligne `- Q: … → A: …`, puis la FR réécrite sans marqueur ; 57 s, 26 s, 15 s. Observé sous Open Code : cinq questions annoncées, carte de couverture affichée d'abord (7 Partial, 3 Clear), première question sur le mécanisme de mise à jour en temps réel, « Recommended: Option A » WebSockets ; un choix technique que le prompt dit écarter, l'agent le relève lui-même au rapport final en décochant « No implementation details » (16/16 puis 15/16) : bon point de débrief, la recommandation du modèle fait entrer un détail d'implémentation dans la spécification ; 29 s, 9 s, 11 s. Hors TUI, `opencode run` n'expanse pas la commande, et l'agent n'a pas lu la constitution (`glob .specify/memory/*.md` rend « No files found » sur un dossier caché) ; dans la TUI, à vérifier sur la VM.
:::

## Le rapport de couverture {kicker="Specify et clarify"}

| Catégorie | Statut (illustration) |
|---|---|
| Edge Cases & Failure Handling | Resolved |
| Constraints & Tradeoffs | Deferred |
| Domain & Data Model | Clear |
| Non-Functional Quality Attributes | Outstanding |

« recommend whether to proceed to `/speckit-plan` or run `/speckit-clarify` again » : le développeur tranche.

::: sources
- [Spec Kit, `templates/commands/clarify.md` v1.2.2, rapport final, dans la forme déposée par `specify init` (`.claude/skills/speckit-clarify/SKILL.md`)](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/clarify.md)
:::

::: notes
Le prompt `clarify` du dépôt (`templates/commands/clarify.md`) porte les jetons `__SPECKIT_COMMAND_PLAN__` et `__SPECKIT_COMMAND_CLARIFY__` ; `specify init` les remplace par `/speckit-plan` et `/speckit-clarify` sous Claude Code (`/speckit.plan`, `/speckit.clarify` sous Open Code). La citation de la slide est celle du fichier déposé, vérifié le 22 octobre 2026.
Prompt `clarify` 1.2.2, rapport final : « Coverage summary table listing each taxonomy category with Status: Resolved (was Partial/Missing and addressed), Deferred (exceeds question quota, or remaining item is specifically implementation method, tech-stack comparison, or task breakdown), Clear (already sufficient), Outstanding (still Partial/Missing but low impact) » ; « If any Outstanding or Deferred remain, recommend whether to proceed to `/speckit-plan` or run `/speckit-clarify` again later post-plan » ; « If quota reached with unresolved high-impact categories remaining, explicitly flag them under Deferred with rationale ». La commande revalide aussi `checklists/requirements.md` et rapporte le nombre d'items qui passent.
Le tableau de la slide est réduit à quatre lignes, un exemple bookit par état : la borne résolue (Edge Cases), le fuseau différé faute de quota (Constraints), le domaine clair (Domain), la performance laissée ouverte à faible impact (Non-Functional).
Démonstration 3, seconde partie, jouée le 22 octobre 2026 : lire le rapport de couverture en fin de session sur `hello-spec`, après « stop ». Observé sous Open Code (24 s) : « Questions asked & answered: 2 / 5 », fichier et sections modifiées, liste de contrôle « 16/16 → 15/16 », tableau Catégorie / Statut à dix lignes aux catégories du prompt : Functional Scope & Behavior Resolved ; Domain & Data Model Resolved ; Interaction & UX Flow Clear ; Non-Functional Quality Attributes Outstanding ; Integration & External Dependencies Resolved ; Edge Cases & Failure Handling Resolved et Outstanding ; Constraints & Tradeoffs Outstanding ; Terminology & Consistency Clear ; Completion Signals Clear ; Misc / Placeholders Clear ; les points différés en liste sous le tableau, recommandation `/speckit.plan` avec son motif. Observé sous Claude Code (24 s, session entière 2 min et 0,45 USD) : « Questions posées et répondues : 2/5 », liste de contrôle 10/12, dix lignes aussi, mais catégories renommées et traduites par le modèle (« Cycle de vie des articles », « Critères de performance ») et deux statuts hors des quatre du prompt (« Non atteint (quota utilisé) », « En attente de FR-011 ») ; recommandation à deux branches, relancer `clarify` pour FR-011 ou passer à `plan` avec FR-011 en hypothèse. Le format du rapport varie d'une session à l'autre ; ses rubriques tiennent.
Ce que la recommandation ne fait pas : décider. Passer à `plan` avec une catégorie Outstanding est un choix du développeur, à écrire dans le commit ou dans Assumptions.
:::

## Dix réponses du responsable produit {kicker="Specify et clarify"}

```markdown file="../tp/fichiers/clarifications.md" lines="5-14"
```

Le responsable produit répond pour le métier ; ses réponses sont versionnées dans `docs/clarifications.md`.

::: sources
- Fichier fourni au TP 4 (`tp/fichiers/clarifications.md`)
:::

::: notes
Définition du lexique, portée par la phrase sous le bloc : le responsable produit est la personne qui répond pour le métier aux questions de `clarify` ; ses réponses sont versionnées dans `docs/clarifications.md`. Le développeur ne répond pas seul : la recommandation de la commande est un choix du modèle, la réponse du responsable produit est un choix du métier.
Deux réponses deviennent des exigences : la 2 donne REG-06 (un seul code, celui de la première règle enfreinte dans l'ordre REG-01 à REG-05), la 3 donne REG-07 (la décision dépend du seul instant courant fourni en entrée, exigence de reproductibilité du brief). Ni l'une ni l'autre n'a de code de refus propre : REG-06 dit quel code sort, REG-07 dit de quoi la décision dépend. Les huit autres ferment le périmètre : bornes incluses (REG-01 à REG-04 tranchées d'un coup), fériés ouvrés, un seul fuseau, quota, annulation, pools et approbation hors périmètre, API et stockage inchangés.
Au TP 4, étape 4 : lire les dix réponses avant de lancer `clarify`, répondre à chaque question par la lettre ou le texte pris dans ce fichier, sans accepter la recommandation si elle diffère ; une question sans réponse ici est « hors périmètre, à noter en hypothèse ». Étape 5 : la réconciliation, où l'agent réécrit le brouillon clarifié d'après `docs/regles-metier.md` et `docs/clarifications.md`, puis une relecture à la main vérifie sept exigences sans marqueur.
Lien avec l'idée clé du module 1, « Écrire l'intention avant le code permet de vérifier le code contre elle » : les réponses du responsable produit sont de l'intention écrite, versionnée avec le dépôt ; au TP 6, les scénarios de REG-06 et REG-07 se vérifient contre elles.
:::

## Clarifier avant de planifier {kicker="Specify et clarify"}

![Le workflow speckit, specify, review-spec, plan, review-plan, tasks, implement, avec clarify placé entre specify et le point de contrôle review-spec](images/04-workflow.svg)

Une ambiguïté laissée dans `spec.md` passe dans `plan.md`, `tasks.md` puis le code.

::: sources
- [Spec Kit, `docs/reference/workflows.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/workflows.md)
- [Spec Kit, `templates/commands/clarify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/clarify.md)
:::

::: notes
`.specify/workflows/speckit/workflow.yml` déposé par `specify init` 1.2.2 (lu le 22 octobre 2026) : six étapes, `specify`, `review-spec` (gate, « Review the generated spec before planning. »), `plan`, `review-plan`, `tasks`, `implement` ; aucun appel à `clarify`, décrite comme optionnelle par `specify init` (module 2, slide « Le workflow `speckit`, six étapes »). Le schéma la place là où elle sert : après `specify`, avant le point de contrôle `review-spec`, pour que le développeur relise un brouillon déjà clarifié.
Pourquoi avant `plan` : `plan` lit `spec.md` et la constitution pour écrire le COMMENT ; `tasks` découpe le plan ; `implement` écrit le code tâche par tâche. Un marqueur ou une borne non tranchée dans `spec.md` est repris tel quel ou tranché en silence à chaque étape ; le coût de la correction croît à chaque artefact traversé. Le prompt `clarify` le dit à sa manière : « Favor clarifications that reduce downstream rework risk or prevent misaligned acceptance tests ».
Dans les TP, les commandes sont invoquées une à une : chaque transition est une décision du stagiaire, le point de contrôle est le commit relu.
:::

## `clarify` porte chaque marqueur de `specify` au responsable produit. {.statement kicker="Specify et clarify"}

::: notes
Conclut les neuf slides : du brief au brouillon, le brief de bookit, le fichier à trous modifié, trois questions en bloc, les dix catégories, cinq questions par impact, le rapport de couverture, les réponses du responsable produit, clarifier avant de planifier. Le TP 4 enchaîne les trois gestes : brouillon par `specify`, clarification par `clarify` avec `docs/clarifications.md`, réconciliation par l'agent puis relecture à la main vers sept exigences REG-01 à REG-07.
:::

## TP 4 : spécifier `validate_booking` {.tp duration="60 min" kicker="TP 4"}

Arrivée : cinq commits faits à la main, `specs/001-valider-reservation/spec.md` à sept exigences REG-01 à REG-07, chacune avec ses scénarios Gherkin, sans marqueur. L'agent ne commite pas.

::: notes
Point de départ : arrivée du TP 3 (4 commits, constitution 1.0.1, `docs/adr/`, `docs/constitution-base.md`, 1 test vert, Spec Kit initialisé pour l'outil du stagiaire). Arrivée : 9 commits, `git status --short` vide, `specs/001-valider-reservation/spec.md` à sept exigences, `checklists/requirements.md`, `.specify/feature.json` présent et ignoré, 1 test vert, `validate_booking` rend toujours `None`. Ligne « TP 4 » de la trajectoire (`formateur/fil-rouge.md`).
Durées prévues : 8 min pour les skills et `AGENTS.md`, 7 min pour le brief et le fichier à trous, 10 min pour le brouillon, 13 min pour la clarification (3 min de lecture, 10 min de session), 13 min pour la réconciliation (8 min de prompt, 5 min de relecture), 5 min de débrief, 4 min de marge.
Rejeux du 22 octobre 2026 (mode non interactif, `claude-sonnet-4-6` dans les deux outils, prompts des étapes 3 et 5 durcis après un premier rejeu ; second et troisième rejeux conformes de suite dans les deux outils, étapes 3 à 5). Troisième rejeu, étape 3 : Claude Code 24 tours, 6 min 24 s, 0,75 USD ; Open Code 9 tours, 62 s, 0,27 USD. Étape 4 : Claude Code 30 tours en six appels, 3 min 08 s, 0,84 USD, cinq questions ; Open Code 7 tours, 54 s, 0,24 USD, cinq questions. Étape 5 : Claude Code 9 tours, 7 min 32 s, 0,88 USD ; Open Code 5 tours, 46 s, 0,17 USD. Coût des étapes 3 à 5 : 2,47 USD sous Claude Code, 0,67 USD sous Open Code (second rejeu : 2,47 et 0,65 USD ; 17, 25 et 13 tours sous Claude Code, 9, 8 et 7 sous Open Code). Étapes 1 et 2 : une minute chacune hors lecture.
Permissions à lire en TUI (relevées aux second et troisième rejeux) : étape 3, `ls specs/` puis `mkdir -p` sous Claude Code (le fichier à trous est lu par `Read` au chemin du prompt ; au troisième rejeu, l'agent a aussi demandé `cat` de `.specify/init-options.json`, `.specify/extensions.yml` et de la constitution) ; `mkdir -p` et trois écritures (`spec.md`, `checklists/requirements.md`, `.specify/feature.json`) sous Open Code ; étape 4, `.specify/scripts/bash/check-prerequisites.sh --json --paths-only`, autorisé par la configuration du fil rouge quand l'agent l'appelle tel quel ; au troisième rejeu sous Claude Code, l'agent l'a préfixé par `bash `, ce qui sort du motif `Bash(.specify/scripts/bash/*)` : refusé en mode `-p`, à accepter en TUI, l'agent a trouvé la spécification par `Read` de `.specify/feature.json` ; puis les `edit` de `spec.md` et de la liste de contrôle après chaque réponse (dix à vingt-deux `Edit` sous Claude Code) ; étape 5, `python3 -c` pour calculer les dates de REG-04 au second rejeu dans les deux outils (refusé sous Claude Code, dates calculées de tête, justes ; aucune commande au troisième rejeu), puis l'écriture de `spec.md`. Aucune commande git lancée par l'agent, `validate_booking.py` intact dans les deux outils.
Valeurs du corrigé (`tp/tp04/`) : 19 scénarios (une demande conforme, deux par borne pour REG-01 à REG-05, un pour REG-06, un pour REG-07), 5 lignes `- Q:` sous `### Session` ; 9 commits confirmés aux rejeux dans les deux outils. Observé aux second et troisième rejeux, étape 3 : Claude Code 7 marqueurs sur 6 lignes puis 5 sur 5 lignes (REG-01 à REG-04 et un marqueur pour les règles multiples, dans Edge Cases ou sous Functional Requirements), 9 puis 6 scénarios, six User Story, Edge Cases présent, aucun marqueur dans Assumptions ; Open Code 5 puis 12 lignes de marqueur (REG-01 à REG-04 ou REG-01 et REG-02 seules, Edge Cases, et au troisième rejeu le titre et le Alors de quatre scénarios de borne, que l'agent compte « 3 marqueurs »), 14 puis 18 scénarios, cinq ou six User Story, REG-05 tranchée dans la phrase comme la règle métier le dit (REG-03 et REG-04 aussi au troisième rejeu, malgré le prompt ; `clarify` tranche de toute façon toutes les bornes d'après `docs/clarifications.md`). Au brouillon, six à dix-huit scénarios selon l'outil et le rejeu. Étape 4 : 5 lignes `- Q:` sous Claude Code aux deux rejeux, 4 puis 5 sous Open Code ; dérive stable sous Open Code aux deux rejeux : une exigence `**REG-MULTI**` hors numérotation (et un `SC-005` au second), retirée par l'étape 5 (l'étape 4 n'a pas d'argument, dérive à montrer au débrief depuis le diff). Étape 5 : 19 scénarios et 0 mot-clé anglais dans les deux outils aux deux rejeux, Clarifications intacte ; REG-04 encadrée au vendredi 31 juillet et au lundi 3 août dans les deux outils ; Claude Code ajoute deux User Story (7 et 8) pour REG-06 et REG-07 ; dérive stable sous Open Code : les `### User Story N` supprimées et les 19 scénarios dans un seul bloc `Fonctionnalité` (le corrigé garde trois User Story ; les attendus passent, structure non imposée). Sous Claude Code, `grep -c 'NEEDS CLARIFICATION'` rend 1 sur la ligne `**Input**`, qui cite le prompt de l'étape 3 avec sa chaîne `[NEEDS CLARIFICATION: …]` : l'attendu exclut cette ligne. Premier rejeu, pour mémoire : sans marqueur imposé, Claude Code tranchait les bornes dans Assumptions et `clarify` ne posait que deux questions ; d'où le durcissement des prompts.
Borne de REG-04 : 60 jours pile après le mardi 2 juin 2026 à 9h00 tombe le samedi 1er août 2026, que REG-02 refuse d'abord (REG-06). Le prompt tranche l'encadrement : 59 jours (vendredi 31 juillet) et 62 jours (lundi 3 août), dit dans Edge Cases. Au débrief, demander pourquoi 60 jours pile n'est pas testable depuis un mardi : tout mardi plus 60 jours est un samedi, seul un autre instant courant (un lundi) permettrait de tester la valeur pile.
Débrief, deux questions : quelles questions `clarify` a posées et lesquelles le brief laissait ouvertes à dessein (bornes, plusieurs règles, fériés, fuseau, annulation ; réponses dans `docs/clarifications.md`) ; ce qui distingue REG-06 et REG-07 des cinq premières : aucun code propre, elles viennent des réponses du responsable produit et du brief (même demande, même instant, même décision).
Pièges : répondre aux questions de `clarify` de tête au lieu de lire `docs/clarifications.md` ; répondre « yes » quand la recommandation contredit le responsable produit (vérifié au second rejeu sous Claude Code : à la question des horaires, la recommandation A disait « 20h00 exclu », la bonne réponse était B ; au troisième, les cinq recommandations coïncidaient avec le responsable produit : le piège ne se présente pas à chaque session) ; laisser un marqueur dans le texte ; laisser l'agent corriger `validate_booking.py` ; lancer `/init` sous Claude Code, qui écrirait un `CLAUDE.md` et ferait ignorer `AGENTS.md` ; oublier `mkdir -p .claude/skills` sous Open Code, où `specify init` n'a pas créé le dossier.
Non rejouable hors TUI, à vérifier sur la VM : la complétion `/ears` sous Claude Code, la proposition `@ears` sous Open Code, les questions de `clarify` posées une à une (sous Claude Code, `claude -p` puis `--resume` avec une réponse par appel reproduit le dialogue : « A », « A », « B », « A », « A » au second rejeu, « A », « A », « A », « A », « A » au troisième). Sous Open Code 2.0.32, `opencode run` n'expanse ni `/speckit.specify` ni `/speckit.clarify` : au second rejeu, la commande envoyée telle quelle a produit un dossier `specs/valider-reservation/` sans préfixe `001-` ni `checklists/` ; au premier, `clarify` n'avait écrit ni `## Clarifications` ni `### Session`. Le rejeu a envoyé le texte des deux commandes expansé à la main, avec, après la commande `clarify`, une phrase qui nomme `docs/clarifications.md`, et obtenu les valeurs des attendus. Dans la TUI, la saisie `/speckit.specify` ou `/speckit.clarify` passe par le menu des commandes : nom du dossier, présence de `checklists/`, nombre de questions (4 ou 5) et rapport de couverture à vérifier sur la VM, l'énoncé reste tel quel ; l'indice de l'étape 4 couvre le cas d'une commande qui ne pose aucune question.
Point ouvert tranché par le rejeu et la démonstration 1 : sous Claude Code, les skills `ears` et `gherkin` sont chargés par l'outil `Skill` quand le prompt les nomme (« avec le skill ears », étapes 3 et 5), et pas sur le seul renvoi d'`AGENTS.md` (démonstration 1, copie B) ; sous Open Code, le modèle les charge dès le premier tour d'après leur description, nommés ou non. Le prompt de l'étape 3 les nomme.
:::

### Skills et `AGENTS.md`

Copier les deux skills et le fichier de contexte, puis les lire.

```console
$ cd ~/bookit
$ mkdir -p .claude/skills
$ cp -r ~/fichiers/skills/ears ~/fichiers/skills/gherkin .claude/skills/
$ cp ~/fichiers/AGENTS.md .
$ cat .claude/skills/ears/SKILL.md .claude/skills/gherkin/SKILL.md AGENTS.md
```

Dans l'éditeur, remplacer les deux `<TODO>` de `AGENTS.md` : la commande qui lance les tests, et ce que l'agent ne fait jamais avec git. Puis lancer l'outil et vérifier qu'il propose le skill `ears`.

::: claude-code
```console
$ ls .claude/skills | wc -l
12
$ claude
```

Les dix commandes Spec Kit et les deux skills partagent le dossier. Taper `/ears` : la complétion propose le skill. Quitter par `/exit`.
:::

::: opencode
```console
$ ls .claude/skills | wc -l
2
$ opencode
```

Les commandes Spec Kit sont dans `.opencode/commands/` ; le dossier ne contient que les deux skills. Taper `@ears` : la liste propose le skill. Quitter par `/exit`.
:::

```console
$ git add -A
$ git commit -m "TP 4 : skills et AGENTS.md"
```

::: attendu
```console
$ grep -c TODO AGENTS.md
0
$ grep -c 'uv run pytest' AGENTS.md
1
$ ls .claude/skills/ears/SKILL.md .claude/skills/gherkin/SKILL.md
.claude/skills/ears/SKILL.md
.claude/skills/gherkin/SKILL.md
$ git log --oneline | wc -l
5
```
:::

::: indice
Le skill n'est pas proposé : vérifier le chemin exact `.claude/skills/ears/SKILL.md` et la ligne `description` du frontmatter. `cp -r` a créé `.claude/skills/ears/ears` : le dossier existait déjà, supprimer et recopier. Un `<TODO>` oublié : le `grep` le montre. La commande des tests est `uv run pytest -q` ; pour git, une phrase suffit : l'agent ne commite pas et ne lance aucune commande git.
:::

### Brief et fichier à trous

Copier le brief et les règles métier dans `docs/`, puis remplacer le fichier à trous de la spécification par le fichier fourni. Lire le diff, puis le brief.

```console
$ cp ~/fichiers/brief.md ~/fichiers/regles-metier.md docs/
$ cp ~/fichiers/spec-template.md .specify/templates/
$ git diff
$ cat docs/brief.md
$ git add -A
$ git commit -m "TP 4 : brief et fichier à trous"
```

::: attendu
```console
$ git diff --stat HEAD~1 -- .specify/templates/ | tail -1
 1 file changed, 34 insertions(+), 11 deletions(-)
$ grep -c 'REG-' .specify/templates/spec-template.md
6
$ ls docs
adr  brief.md  constitution-base.md  regles-metier.md
$ git log --oneline | wc -l
6
```

Les sections du fichier à trous gardent leur titre : sous Requirements, les exigences sont des lignes `**REG-NN** : …` ; sous chaque parcours, un bloc `gherkin` en français.
:::

::: indice
`git diff` ne montre rien : le fichier est mal placé, son nom est `spec-template.md` et son dossier `.specify/templates/`, sans sous-dossier. `specify init` relancé par erreur réécrit le fichier : le reprendre de `~/fichiers/`.
:::

### Brouillon

Lancer l'outil dans `~/bookit` et invoquer la commande avec ce prompt, tel quel. Lire chaque demande de permission avant de l'accepter.

::: claude-code
```console
$ claude
```

```prompt
/speckit-specify Lis docs/brief.md et docs/regles-metier.md : la fonctionnalité à spécifier est la validation d'une demande de réservation décrite par le brief. Nom court du dossier : valider-reservation. Le fichier à trous est .specify/templates/spec-template.md : copie-le tel quel et garde ses sections. Écris une exigence par règle métier, REG-01 à REG-05, en EARS avec le skill ears, chacune avec son code de refus ; un scénario Gherkin par parcours avec le skill gherkin, mots-clés en français, instant courant fixé au mardi 2 juin 2026 à 9h00. Ne tranche ni les bornes (la valeur pile, acceptée ou refusée) ni le cas de plusieurs règles enfreintes : marque chacun [NEEDS CLARIFICATION: …] dans le texte de l'exigence, jamais dans Assumptions, et ne me pose aucune question. Ne modifie aucun fichier hors specs/ et .specify/feature.json.
```
:::

::: opencode
```console
$ opencode
```

```prompt
/speckit.specify Lis docs/brief.md et docs/regles-metier.md : la fonctionnalité à spécifier est la validation d'une demande de réservation décrite par le brief. Nom court du dossier : valider-reservation. Le fichier à trous est .specify/templates/spec-template.md : copie-le tel quel et garde ses sections. Écris une exigence par règle métier, REG-01 à REG-05, en EARS avec le skill ears, chacune avec son code de refus ; un scénario Gherkin par parcours avec le skill gherkin, mots-clés en français, instant courant fixé au mardi 2 juin 2026 à 9h00. Ne tranche ni les bornes (la valeur pile, acceptée ou refusée) ni le cas de plusieurs règles enfreintes : marque chacun [NEEDS CLARIFICATION: …] dans le texte de l'exigence, jamais dans Assumptions, et ne me pose aucune question. Ne modifie aucun fichier hors specs/ et .specify/feature.json.
```
:::

Quand la commande a terminé, quitter par `/exit` et commiter le brouillon tel quel : il se relit à l'étape suivante.

```console
$ git add -A
$ git commit -m "TP 4 : brouillon de spécification"
```

::: attendu
```console
$ ls specs
001-valider-reservation
$ ls specs/001-valider-reservation
checklists  spec.md
$ grep -oE '\*\*REG-0[1-5]\*\*' specs/001-valider-reservation/spec.md | sort -u | wc -l
5
$ grep -c '^### Edge Cases' specs/001-valider-reservation/spec.md
1
$ grep -q 'NEEDS CLARIFICATION' specs/001-valider-reservation/spec.md && echo marqueurs
marqueurs
$ grep -o 'specs/[^"]*' .specify/feature.json
specs/001-valider-reservation
$ git status --short | grep -c feature.json
0
$ git log --oneline | wc -l
7
```

Le nombre de marqueurs dépend du modèle : le prompt en impose un par borne et un pour les règles multiples, au-delà de la limite de trois de la commande ; `grep -n 'NEEDS CLARIFICATION'` en liste cinq à douze lignes au rejeu. `feature.json` est ignoré par `.specify/.gitignore` : il ne fait pas partie du commit.
:::

::: indice
La commande pose ses questions malgré le prompt : répondre « choisis l'option recommandée et note-la en hypothèse ». Le dossier porte un autre nom : `git mv specs/001-<autre> specs/001-valider-reservation`, puis corriger le chemin dans `.specify/feature.json`. L'agent cherche le fichier à trous ailleurs et demande un `find` : accepter, ou lui répondre par le chemin `.specify/templates/spec-template.md`. Les exigences sont en `FR-001` et « System MUST », ou la section Edge Cases manque : le fichier à trous n'a pas été lu, vérifier l'étape précédente, supprimer `specs/` et relancer la commande dans une session neuve. Aucun marqueur, les bornes tranchées dans Assumptions : demander « remplace chaque hypothèse sur une borne ou sur plusieurs règles enfreintes par un marqueur [NEEDS CLARIFICATION: …] dans l'exigence ». Les skills n'apparaissent pas dans la trace : sous Open Code, ajouter `@ears` et `@gherkin` dans le prompt ; sous Claude Code, le prompt nomme déjà les skills, relancer dans une session neuve.
:::

### Clarification

Lire le brouillon et noter ses marqueurs. Copier les réponses du responsable produit et les lire : elles priment sur l'option recommandée par la commande.

```console
$ grep -n 'NEEDS CLARIFICATION' specs/001-valider-reservation/spec.md
$ cp ~/fichiers/clarifications.md docs/
$ cat docs/clarifications.md
```

Relancer l'outil dans `~/bookit` et invoquer la commande sans argument. À chaque question, répondre par la lettre de l'option qui correspond à la réponse de `docs/clarifications.md`, ou par cette réponse en cinq mots au plus ; ne pas accepter la recommandation quand elle diffère.

::: claude-code
```console
$ claude
```

```prompt
/speckit-clarify
```
:::

::: opencode
```console
$ opencode
```

```prompt
/speckit.clarify
```
:::

Lire le rapport de couverture en fin de session, quitter par `/exit`, lire le diff, puis commiter.

```console
$ git diff
$ git add -A
$ git commit -m "TP 4 : spécification clarifiée"
```

::: attendu
```console
$ grep -c '^### Session' specs/001-valider-reservation/spec.md
1
$ grep -q '^- Q:' specs/001-valider-reservation/spec.md && echo clarifié
clarifié
$ git log --oneline | wc -l
8
```

Une ligne `- Q:` par question posée, cinq au plus : 5 au corrigé, 4 ou 5 au rejeu ; `grep -c '^- Q:'` les compte.
:::

::: indice
Une question n'a pas de réponse dans `docs/clarifications.md` : répondre « hors périmètre, à noter en hypothèse ». La commande répond « No critical ambiguities detected » : la relancer en ajoutant après la commande : « relis les bornes de chaque règle et le cas de plusieurs règles enfreintes ». La commande ne pose aucune question et n'écrit pas `## Clarifications` : la relancer en ajoutant après la commande : « réponds d'après docs/clarifications.md et consigne chaque question sous ## Clarifications ». La commande ne trouve pas la spécification : `.specify/feature.json` manque, le recréer avec `{"feature_directory": "specs/001-valider-reservation"}`. L'outil est resté ouvert depuis l'étape précédente : `/clear` (Claude Code) ou `/new` (Open Code) avant la commande. L'agent ajoute une exigence hors numérotation (`REG-MULTI`) ou un critère de plus : la laisser, l'étape suivante impose sept exigences REG-01 à REG-07.
:::

### Réconciliation

La réconciliation aligne le brouillon clarifié sur `docs/regles-metier.md` et `docs/clarifications.md` : l'agent réécrit les exigences, puis une relecture à la main vérifie sept exigences sans marqueur. Relancer l'outil dans `~/bookit` et envoyer ce prompt, tel quel.

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
Réconcilie specs/001-valider-reservation/spec.md avec docs/regles-metier.md et docs/clarifications.md. Exactement sept exigences, REG-01 à REG-07, en EARS avec le skill ears, chacune sur sa ligne **REG-NN** : …, dans l'ordre. REG-01 à REG-05 reprennent les règles métier avec leur code de refus et leur borne tranchée : la valeur pile est acceptée. REG-06 : quand plusieurs règles sont enfreintes, un seul code, celui de la première dans l'ordre REG-01 à REG-05. REG-07 : la décision dépend du seul instant courant fourni en entrée. Scénarios Gherkin avec le skill gherkin, en français, instant courant fixé au mardi 2 juin 2026 à 9h00 dans chaque scénario, dix-neuf scénarios en tout : une demande conforme acceptée ; un scénario de chaque côté de chaque borne (REG-01 : 30 minutes et 4 heures ; REG-02 : 8h00, 20h00, vendredi et samedi ; REG-03 : 2 heures ; REG-05 : créneau jointif et créneau chevauchant) ; pour REG-04, 60 jours pile tombe un samedi, encadre la borne par le dernier jour ouvré avant et le premier après ; exactement un scénario pour REG-06 et exactement un pour REG-07, où la même demande jugée deux fois au même instant courant reçoit la même décision. Supprime tout marqueur [NEEDS CLARIFICATION] et mets à jour Edge Cases, Success Criteria et Assumptions d'après les réponses ; ne touche pas à la section Clarifications. Ne modifie aucun autre fichier.
```

Quitter par `/exit`, puis relire chaque exigence avec quatre questions.

- La borne est-elle tranchée dans la phrase ?
- Le code de refus est-il nommé ?
- L'instant courant est-il fixé dans chaque scénario, un jour de semaine ?
- Les scénarios sont-ils dix-neuf : une demande conforme, deux par borne, un pour REG-06, un pour REG-07 ?

Corriger dans l'éditeur, puis commiter.

```console
$ git diff
$ git add -A
$ git commit -m "TP 4 : spécification relue"
```

::: attendu
```console
$ grep -oE '\*\*REG-0[1-7]\*\*' specs/001-valider-reservation/spec.md | sort -u | wc -l
7
$ grep -v '^\*\*Input' specs/001-valider-reservation/spec.md | grep -c 'NEEDS CLARIFICATION'
0
$ grep -c 'Scénario:' specs/001-valider-reservation/spec.md
19
$ grep -cE '\b(Given|When|Then)\b' specs/001-valider-reservation/spec.md
0
$ git diff HEAD~1 -- specs | grep -c '^[-+]- Q:'
0
$ uv run pytest -q | grep -o '^[0-9]* passed'
1 passed
$ git status --short | wc -l
0
$ git log --oneline | wc -l
9
```

Le nombre de scénarios est celui du corrigé : une demande conforme, deux par borne, un pour REG-06, un pour REG-07. La section Clarifications garde ses lignes de l'étape précédente. La ligne `**Input**` cite le prompt de l'étape 3, marqueur compris : elle est exclue du compte.
:::

::: indice
L'agent propose de modifier `validate_booking.py` : refuser, le TP s'arrête à la spécification. Une exigence en anglais ou en « SHALL » : demander sa réécriture en nommant le skill `ears`. Un scénario tombe un samedi sans le vouloir : `date -d <date du scénario> +%A` donne le jour ; décaler la demande au jour ouvré voulu. Il manque un scénario : l'ajouter à la main, sur le modèle de son voisin. Vingt scénarios ou plus : un second scénario pour REG-06 ou REG-07, supprimer le surplus. Des lignes `- Q:` ajoutées ou réécrites : remettre la section Clarifications telle que commitée à l'étape précédente, `git diff` la montre.
:::

### Corrigé {.corrige}

```markdown file="../tp/tp04/AGENTS.md"
```

Spécification relue : sept exigences, dix-neuf scénarios, cinq clarifications, aucun marqueur. Vérification : `grep -v '^\*\*Input' … | grep -c 'NEEDS CLARIFICATION'` rend `0`, `grep -cE '\b(Given|When|Then|SHALL)\b'` rend `0`.

```markdown file="../tp/tp04/specs/001-valider-reservation/spec.md"
```

## Quatre modules, un dépôt {kicker="Bilan"}

![Frise des quatre TP : TP 3 cadrer et TP 4 spécifier en couleur, TP 5 planifier et découper et TP 6 implémenter et vérifier en grisé ; commits cumulés 4 après le TP 3, 9 après le TP 4](images/04-trajectoire.svg)

```console
$ git log --oneline | wc -l
9
```

Aucune ligne de code encore : `validate_booking` rend `None`.

::: sources
- Trajectoire du fil rouge (`formateur/fil-rouge.md`)
:::

::: notes
État de `~/bookit/` après quatre modules : 9 commits (4 du TP 3, 5 du TP 4), la constitution 1.0.1, `AGENTS.md` et deux skills, `docs/` avec les ADR, la base de la constitution, le brief, les règles métier et les clarifications, `specs/001-valider-reservation/spec.md` à sept exigences avec sa liste de contrôle ; 1 test vert, le test de fumée ; `validate_booking` rend toujours `None`, l'API accepte tout.
Ce que le dépôt porte, qu'aucune session ne porte : chaque artefact est versionné, relu, commité à la main. Les sessions des TP 3 et 4 sont terminées ; leur fenêtre de contexte est perdue (module 1) ; le dépôt reste.
Le `9` est confirmé par le rejeu du 22 octobre 2026 dans les deux outils.
:::

## La carte des notions {kicker="Bilan"}

![Carte des notions des quatre modules : le LLM, la fenêtre de contexte, l'agent, le prompt et l'intention au module 1 ; le workflow, le point de contrôle, la spécification, l'exigence, EARS et Gherkin au module 2 ; l'ADR, le principe, la couche, la frontière et l'architecture hexagonale au module 3 ; la borne, le fichier de contexte, le skill, le brief, le brouillon et la clarification au module 4](images/04-carte.svg)

::: sources
- Lexique de la formation (`formateur/lexique.md`)
:::

::: notes
Aperçu réduit, limité aux quatre modules de la journée ; chaque notion a sa slide de définition dans le module cité, les définitions sont celles du lexique.
La page carte (`index.html#carte`), qui relie chaque nœud à sa slide, n'existe que si `support/carte-mentale.yaml` est rempli (issue #88) : à la livraison du module 4, le fichier n'existe pas encore, la slide ne porte donc pas de lien vers la page. Quand il existera, remplacer l'aperçu par le lien vers `#carte` ou l'ajouter sous le schéma.
Projection de la carte (15 min) : partir de la question du matin (une fonction confiée à l'agent, module 1) et suivre la branche de chaque module jusqu'à l'exigence vérifiable ; demander où chaque stagiaire situe ce qu'il a écrit au TP 4.
:::

## REG-01 à REG-07, relues et versionnées, sont l'entrée de `plan`. {.statement kicker="Bilan"}

::: notes
Conclut la journée : quatre modules, un dépôt, une carte. Le module 5 ouvre sur le fichier à trous de `plan` et de `tasks`, et sur ce que Spec Kit laisse au développeur quand le format de l'équipe diffère : une commande Spec Kit est un prompt et un template versionnés, le plan porte le COMMENT sous contrôle de la constitution, les tâches sont des incréments vérifiables séparément.
:::

## Glossaire : borne, contexte, skills {kicker="Glossaire"}

- **Borne** : valeur limite d'une règle, incluse ou exclue ; une exigence la tranche, un scénario Gherkin la teste de chaque côté
- **Fichier de contexte** : `AGENTS.md`, lu par l'agent au lancement de chaque session

|||

- **Skill** : dossier `.claude/skills/<nom>/SKILL.md` : savoir-faire chargé sur demande, lu par les deux outils
- **Responsable produit** : personne qui répond pour le métier aux questions de `clarify` ; ses réponses sont versionnées dans `docs/clarifications.md`

::: sources
- [Claude Code, Skills](https://code.claude.com/docs/en/skills)
- [Claude Code, Memory](https://code.claude.com/docs/en/memory)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation.
:::

## Glossaire : `specify` et `clarify` {kicker="Glossaire"}

- **Brief** : besoin écrit en langage courant, entrée de `specify` ; fichier `docs/brief.md` dans bookit
- **Brouillon** : spécification produite par `/speckit-specify`, avant `clarify`
- **Liste de contrôle** : fichier `checklists/requirements.md` écrit par `specify`, questions de qualité sur les exigences

|||

- **Clarification** : question posée par `/speckit-clarify` et réponse consignée dans la spécification
- **Réconciliation** : réécriture du brouillon clarifié par l'agent d'après `docs/regles-metier.md` et `docs/clarifications.md`, puis relecture à la main, jusqu'à sept exigences sans marqueur

::: sources
- [Spec Kit, `templates/commands/specify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md)
- [Spec Kit, `templates/commands/clarify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/clarify.md)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation.
:::
