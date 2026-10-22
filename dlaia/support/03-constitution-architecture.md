# Constitution et architecture

Écrire l'architecture pour que l'agent la respecte

::: notes
Module 3, 45 min d'exposé puis TP 3 (50 min). Point de départ : l'idée clé « Chaque étape devient une commande et la relecture reste au développeur » et le débrief du TP 1 partie B : `hello-spec` initialisé, dix commandes en place, constitution à trous. Question laissée ouverte : que mettre dans la constitution, et pourquoi l'agent en a besoin. Trente-six slides pour 45 min : la section « Fil rouge bookit » (dix slides) est tenue pour essentielle, dépasser si le contenu l'exige.
Trois démonstrations : la première et la deuxième appellent le modèle (`claude-sonnet-4-6` dans les deux outils), la troisième est un `grep`. Aucune ne touche `~/bookit/` : la commande `constitution` ne se montre que sur `hello-spec`, pour ne pas jouer le TP à la place des stagiaires.
:::

## Ce que l'agent voit {kicker="Architecture implicite"}

![À gauche l'arbre de bookit tel que l'agent le lit, trois dossiers étiquetés couche domaine, couche application, couche infrastructure, plus tests ; à droite, en grisé, ce que l'équipe sait sans l'avoir écrit : un refus est une valeur, le domaine ne lit pas l'horloge, aucun import d'infrastructure dans le domaine, et pourquoi](images/03-implicite.svg)

À écrire pour l'agent : ce qu'il ne peut pas déduire du code (« persistent context it can't infer from code alone »).

::: sources
- [Claude Code, Best practices, « Write an effective CLAUDE.md »](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
- [Gloaguen et al., Evaluating AGENTS.md, arXiv 2602.11988, v3 du 29 septembre 2026](https://arxiv.org/abs/2602.11988)
:::

::: notes
Reprend l'idée clé du module 1 « L'agent ne connaît que sa fenêtre de contexte » : à chaque session, l'agent infère la structure de ce qu'il lit (arborescence, noms, imports). Il voit trois dossiers ; il ne voit ni le pourquoi d'une décision, ni ce qui est interdit, ni où va un fichier nouveau.
Définition du lexique, portée par l'étiquette du schéma : l'architecture implicite est la structure que l'équipe connaît sans l'avoir écrite, invisible pour l'agent. Couche : un ensemble de modules de même rôle (étiquette aussi).
Documentation Claude Code, consultée le 21 octobre 2026 : le fichier lu à chaque session « gives Claude persistent context it can't infer from code alone » ; tableau Include / Exclude : à inclure « Architectural decisions specific to your project », à exclure « Anything Claude can figure out by reading code ». La liste des dossiers s'exclut donc ; le pourquoi et l'interdit s'écrivent.
Gloaguen, Mündler-Sasahara, Müller, Raychev, Vechev (ETH Zurich), v1 du 12 février 2026 : « instructions in the context files are well followed by coding agents » ; « repository overviews, although popular and recommended by model providers, are not helpful » ; « context files are useful for specifying non-standard coding practices ». Lu à notre échelle : les trois phrases grisées sont des pratiques non standard que l'agent suit si on les écrit ; décrire l'arborescence ne sert à rien.
:::

## Un diff juste, mal placé {kicker="Architecture implicite"}

```diff file="../demos/03-diff-api.diff" lines="14-20"
```

```console
$ uv run pytest -q
1 passed in 0.32s
$ uv run ruff check
All checks passed!
```

Vert et conforme à ruff, le diff place une règle hors de `validate_booking` (illustration).

::: notes
Diff `demos/03-diff-api.diff`, créé pour ce module ; à l'écran, le corps du second bloc (`@@ -27,6 +27,8 @@`) ; le premier bloc, hors écran, ajoute `timedelta` à l'import de `datetime`. Sorties relevées le 21 octobre 2026 sur une copie du squelette : `1 passed in 0.32s`, `All checks passed!`, `14 files already formatted`.
Ce que le diff viole, à dire à l'oral et à retrouver au TP : la règle REG-01 est écrite dans la couche infrastructure (`api.py`) au lieu du domaine ; le refus est une exception `HTTPException` au lieu d'une valeur `InvalidBooking` ; la règle passe par-dessus `validate_booking`, que l'application appelle ensuite pour rien. Aucun outil ne le dit : le test de fumée réserve une heure, ruff ne connaît pas les couches.
Démonstration 1, dans une copie jetable du squelette sous git, sans `.specify/` : `git apply demos/03-diff-api.diff`, `uv run pytest -q` (vert), puis dans une session neuve le prompt « Relis les modifications non commitées (`git diff`) et dis si elles peuvent être intégrées dans ce projet, et pourquoi. » ; ensuite, dans une seconde copie où `tp/tp03/` est superposé (constitution 1.0.1 présente), même diff, et le prompt qui nomme le fichier, comme à l'étape 5 du TP 3 : « Relis les modifications non commitées (`git diff`) et dis si elles peuvent être intégrées dans ce projet au regard de `.specify/memory/constitution.md`, et pourquoi. » Résultat attendu : sans constitution, un avis d'architecture tiré du code, sans règle à citer ; avec, un refus qui cite les principes par leur numéro.
Résultat observé le 21 octobre 2026 avec `claude-sonnet-4-6`. Sans constitution : Claude Code lit le README et les trois couches, « Techniquement : oui. Architecturalement : non, pas en l'état », propose de déplacer la règle dans `validate_booking`, 32 s, 9 tours ; Open Code, « Non, pas en l'état », architecture hexagonale reconnue d'après l'arborescence et le commentaire des codes dans `models.py`, 15 s, 5 tours. Aucun des deux ne cite une règle ni un document. Avec la constitution et le prompt qui la nomme (Claude Code) : « Non, ce diff ne peut pas être intégré tel quel », principes I et IV cités par numéro et par titre, V pour le test à écrire, 12 s, 3 tours ; les ADR ne sont pas nommés. Open Code, même prompt, relevé le 21 octobre 2026 : « Verdict : Non intégrable en l'état », principes I, III et IV cités par numéro et par titre, V « en observation complémentaire », constitution lue en un seul `cat` juste après `git diff`, 9 s, 2 tours, 0,06 USD ; les ADR ne sont pas nommés non plus. Deux lectures larges à connaître : III (imports du domaine) et V (test avant le code dans `bookit/domain/`) ne sont pas enfreints à la lettre par un diff qui ne touche pas le domaine ; l'agent les mobilise pour le fond. En TUI, `git diff` et `cat` relèvent de `bash: ask` dans `opencode.json` : deux permissions à lire.
L'écart à montrer est celui de la certitude et de la référence : le verdict est le même, la constitution donne la règle et son numéro. Pourquoi le prompt nomme le fichier : avec le prompt de la première copie, les deux outils ont rendu le même avis sans ouvrir `.specify/` ni `docs/adr/`, qu'un `ls` leur avait pourtant montrés. À l'état du TP 3, aucun fichier de contexte ne désigne la constitution (`AGENTS.md` arrive au TP 4) et seules les commandes Spec Kit la lisent d'elles-mêmes (slide « Qui relit la constitution ensuite »). Le dire à l'oral : un fichier déposé ne sert que s'il est lu, ce que la slide suivante et le module 4 traitent.
:::

## Deux façons d'informer l'agent {kicker="Architecture implicite"}

| | Faire tout relire | Écrire les principes, court |
|---|---|---|
| coût par session | tout le dépôt lu à chaque fois | un `AGENTS.md` de quelques lignes, lu au début de chaque session |
| tenue dans la fenêtre | la précision baisse à mesure qu'elle se remplit | la fenêtre reste disponible pour la tâche |
| ce que l'agent en retient | ce qu'il infère du code, sans le pourquoi | les principes écrits, bien suivis |
| ce qui reste après la session | rien : tout est relu la fois suivante | le fichier, versionné dans le dépôt |

Avec un `AGENTS.md` court, lu au début de chaque session : temps médian −28,6 % sur 124 pull requests (Lulla et al.).

::: sources
- [Claude Code, Best practices](https://code.claude.com/docs/en/best-practices)
- [Lulla et al., On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents, arXiv 2601.20404, v2 du 30 mars 2026](https://arxiv.org/abs/2601.20404)
- [Gloaguen et al., Evaluating AGENTS.md, arXiv 2602.11988, v3 du 29 septembre 2026](https://arxiv.org/abs/2602.11988)
:::

::: notes
Claude Code, Best practices : « performance degrades as it fills », « The context window is the most important resource to manage » ; sur le fichier lu à chaque session : « keep it short and human-readable », « Bloated CLAUDE.md files cause Claude to ignore your actual instructions! ». Un fichier trop long fait ignorer ses propres règles : la constitution de bookit tient en sept principes.
Lulla, Mohsenimofidi, Galster, Zhang, Baltes, Treude, v1 du 28 janvier 2026 : 10 dépôts, 124 pull requests, deux conditions (avec et sans `AGENTS.md`, le fichier de contexte présenté au module 4) ; temps médian −28,64 %, tokens de sortie médians −16,58 %, « comparable task completion behavior ». Le résumé ne nomme pas le modèle employé ; la qualité du code produit n'est pas mesurée.
Gloaguen et al. : les fichiers de contexte « does not generally improve task success rates » et augmentent le coût « over 20% on average », « for both LLM-generated and developer-committed context files » ; parmi leurs contenus, « repository overviews … are not helpful », les pratiques non standard si. Les deux études se complètent : un fichier court de pratiques non standard, oui ; une vue d'ensemble du dépôt, non.
Longueur de contexte, pour répondre aux questions : Dhara et Sheth, arXiv 2603.15723, 16 mars 2026, « a consistent degradation in performance as context length increases » à contenu utile constant, HotpotQA (multi-sauts) « nearly twice the accuracy degradation of SQuAD ». Obéissance : McMillan, arXiv 2605.10039, 11 mai 2026, 1 650 sessions Claude Code avec Sonnet 4.6 : aucune des quatre variables de structure du fichier (taille, position, architecture, contradictions) ne change l'obéissance ; elle baisse d'environ 5,6 % de chances (odds ratio 0,944) par fonction générée dans la session : une tâche par session, module 5. Persistance : Anthropic, How we contain Claude across products, 25 mai 2026, « The share of agent context that persists across sessions keeps growing », `CLAUDE.md` parmi cet état, « reloaded each time the agent starts » ; la sécurité de ces fichiers est au module 7. « Lost in the middle » et les mesures de longueur restent au module 7.
:::

## L'ADR porte le pourquoi, la constitution porte le principe. {.statement kicker="Architecture implicite"}

::: notes
Conclut les trois slides : ce que l'agent ne voit pas, un diff vert et mal placé, l'`AGENTS.md` lu au début de chaque session. Nomme les deux artefacts de la section suivante : l'ADR, qui trace une décision et son pourquoi, et la constitution, qui porte le principe qui en découle.
:::

## Cinq décisions structurantes {kicker="ADR et constitution"}

| ADR | Décision | Pourquoi (contexte) | Dans le squelette |
|---|---|---|---|
| 1 | trois couches, le domaine au centre, aucun import vers l'extérieur | les règles se testent sans serveur ni base | oui |
| 2 | API HTTP avec FastAPI, refus en 422 avec un code | le client doit savoir quelle règle a refusé | oui |
| 3 | stockage SQLite dans la couche infrastructure | une instance, aucun serveur de base à administrer | oui |
| 4 | une image de conteneur, la base sur un volume | la même image du poste à la production | décidé, à construire |
| 5 | authentification déléguée à un fournisseur d'identité | bookit ne gère ni comptes ni mots de passe | décidé, à construire |

Décision structurante : elle engage tout le projet et survit à chaque spécification.

::: sources
- [Michael Nygard, Documenting Architecture Decisions, 15 novembre 2011](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [FastAPI, Tutorial, First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)
:::

::: notes
Fichiers `tp/fichiers/adr/0001-architecture-hexagonale.md`, `0002-api-http-fastapi.md`, `0003-stockage-sqlite.md`, `0004-deploiement-conteneur.md`, `0005-authentification-idp.md`, au format de la slide « L'ADR trace une décision » (titre numéroté, contexte, décision, statut, conséquences) ; le TP 3 les fait copier dans `docs/adr/`. La slide du module 2 cite l'ADR 2 par `file=`. Les cinq décisions ont pour source ces fichiers et le squelette (`fil-rouge/`) ; FastAPI, First Steps, pour le `/docs` de l'ADR 2 : « automatic interactive API documentation » servie à `/docs`. Statut « acceptée » pour les cinq (Nygard ne connaît que proposed, accepted, deprecated, superseded) ; pour 4 et 5, la ligne Conséquences dit « à construire » : le `Dockerfile` et l'adaptateur OpenID Connect s'écrivent après `validate_booking`, hors formation.
Règle du support, à dire à l'oral : un ADR se rédige au moment du choix ; deux des cinq précèdent leur code.
Nygard : Context « describes the forces at play » ; Decision « our response to these forces » ; Consequences « the resulting context, after applying the decision » ; « One ADR describes one significant decision for a specific project » ; une décision annulée reste, marquée « superseded » ; « Numbers will not be reused ».
Décision structurante : elle engage tout le projet et survit aux spécifications ; style d'architecture, exposition, stockage, déploiement, identité. Une convention de code (un refus en valeur de retour, l'horloge en paramètre) en est une conséquence : ces deux conventions découlent de l'ADR 1 et figurent dans sa ligne « Conséquences ». Aucune des cinq ne dit combien dure une réservation : c'est le partage de la section « La constitution ».
Les trois premières se lisent dans le squelette (`bookit/domain/ports.py`, `api.py`, `sqlite_repository.py`) ; les deux dernières, dans aucun fichier : l'ADR précède le code, c'est le point à retenir. La slide « L'ADR 1 motive quatre principes » dit ce que la constitution en tire.
:::

## ADR et constitution, deux rôles {kicker="ADR et constitution"}

| | ADR | Constitution |
|---|---|---|
| quand on l'écrit | à chaque décision | une fois, puis amendée |
| ce qu'il contient | contexte, décision, conséquences | des principes |
| qui le lit | l'équipe | les commandes Spec Kit (`plan` en premier) et l'équipe |
| combien | un par décision | un par projet |
| où il vit | `docs/adr/NNNN-nom.md` | `.specify/memory/constitution.md` |

::: sources
- [Michael Nygard, Documenting Architecture Decisions, 15 novembre 2011](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [Spec Kit, `templates/commands/constitution.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/constitution.md)
- [Spec Kit, `templates/plan-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/plan-template.md)
:::

::: notes
L'ADR est lu par des humains ; Spec Kit ne le connaît pas. La constitution est lue par les commandes : `plan-template.md` porte une section « Constitution Check », et les prompts de `plan`, `tasks`, `implement` et `analyze` chargent `/memory/constitution.md`, chemin tel qu'écrit dans le dépôt ; seul le prompt de `constitution` écrit `.specify/memory/constitution.md` (slide « Qui relit la constitution ensuite »).
Un principe renvoie à l'ADR qui le motive : dans bookit, chaque principe de structure se termine par « (ADR n) ». L'ADR garde le contexte, qui ne tient pas dans un principe d'une phrase ; la constitution garde le principe, court, que l'agent applique.
« Une fois, puis amendée » : `constitution.md` numérote en semver et date chaque amendement ; détail sur la slide « Principes, sections libres, gouvernance ».
Nygard range un fichier par décision sous `doc/arch/adr-NNN.md` ; bookit retient `docs/adr/NNNN-nom.md`.
:::

## L'ADR 1 motive quatre principes {kicker="ADR et constitution"}

| Principe | Règle | ADR |
|---|---|---|
| I. Un refus est une valeur de retour | aucun `raise` pour refuser dans `bookit/domain/` | 1 et 2 |
| II. L'horloge est un paramètre | aucun `datetime.now()` dans `bookit/domain/` | 1 |
| III. Les dépendances pointent vers le domaine | aucun import de `bookit.infrastructure` dans `bookit/domain/` | 1 |
| IV. Chaque fichier a sa couche | une règle dans `domain/validate_booking.py`, un test dans `tests/` | 1 |

Principes de structure I à IV ; les principes de workflow V à VII portent leur pourquoi sans ADR.

::: sources
- [Michael Nygard, Documenting Architecture Decisions, 15 novembre 2011](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
:::

::: notes
Les quatre principes de structure de la constitution de bookit (`tp/tp03/.specify/memory/constitution.md`, I à IV) ; la colonne « Règle » résume la phrase de chaque principe ; « vérifiable sur un diff » est posé à la slide suivante. Définitions du lexique : principe de structure, principe qui porte sur les couches, les dépendances ou l'emplacement des fichiers (I à IV) ; principe de workflow, principe qui porte sur la manière de travailler, test avant le code, lint, commit (V à VII). Les quatre tirent leur pourquoi de l'ADR 1 ; le I cite aussi l'ADR 2, parce que c'est l'adaptateur HTTP qui traduit le code en 422.
Les principes V à VII (test avant le code, ruff, un commit par étape) sont des principes de workflow : ils portent une ligne « Pourquoi » sans ADR, aucune décision d'architecture ne les motive.
Les ADR 3 à 5 ne donnent aucun principe tant que `validate_booking` est le périmètre : ils entrent dans la section « Contraintes techniques » de la constitution (FastAPI et SQLite restent en place, le conteneur et l'authentification attendent).
Un ADR motive plusieurs principes et un principe peut citer deux ADR : le contexte reste dans l'ADR, écrit une fois, la règle dans la constitution.
:::

## Principe vérifiable sur un diff {kicker="ADR et constitution"}

| Phrase (illustration) | Vérifiable sur un diff ? | Où elle va |
|---|---|---|
| le code est propre et maintenable | non : aucun critère à appliquer | nulle part |
| aucun import de `bookit.infrastructure` dans `bookit/domain/` | oui : un `grep` sur le diff répond | constitution |
| une réservation dure au plus 4 heures | oui, par un test ; mais c'est une règle métier | spécification |
| aucun `raise` dans `bookit/domain/` : un refus est une valeur rendue | oui : un `grep` sur le diff répond | constitution |

Spec Kit l'exige du prompt de la commande : « Principles are declarative, testable, and free of vague language ».

::: sources
- [Spec Kit, `templates/commands/constitution.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/constitution.md)
- [Claude Code, Best practices, « Write an effective CLAUDE.md »](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
:::

::: notes
Vérifiable sur un diff : un relecteur, humain ou agent, lit le diff et répond oui ou non sans exécuter le programme ; le principe nomme un fichier, un import, un type de retour. « Propre et maintenable » ne se tranche pas ; Claude Code l'exclut aussi du fichier lu à chaque session : « Self-evident practices like "write clean code" ».
La troisième ligne se vérifie, mais par un test et sur le produit : c'est une exigence, REG-01, qui appartient à la spécification (idée clé du module 2 : la spécification porte le QUOI). La section « La constitution » y revient.
Les trois phrases diffèrent des trois pièges de `constitution-base.md` du TP 3 ; ne pas les donner ici.
`constitution.md` conseille aussi de remplacer « should » par MUST ou SHOULD : la forme impérative rend la violation lisible ; `analyze` et `converge` ne classent CRITICAL qu'une violation d'un MUST.
:::

## Trois sortes de principe {.facts kicker="ADR et constitution"}

- **Invariant** ce qui est toujours vrai dans le code : aucun import de `bookit.infrastructure` dans `bookit/domain/` (ADR 1)
- **Pattern imposé** la manière de faire que tout diff suit : un refus est une valeur `InvalidBooking` rendue par la fonction (ADR 1 et 2)
- **Anti-pattern interdit** ce qu'aucun diff ne fait : aucune lecture de l'horloge système dans le domaine (ADR 1)

::: sources
- [Mohsenimofidi, Galster, Treude, Baltes, Context Engineering for AI Agents in Open-Source Software, MSR 2026, 13 avril 2026](https://2026.msrconf.org/details/msr-2026-technical-papers/17/Context-Engineering-for-AI-Agents-in-Open-Source-Software)
- [Spec Kit, `templates/constitution-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/constitution-template.md)
:::

::: notes
Grille de lecture propre au support, à présenter comme telle. L'étude MSR 2026 (466 projets open source dotés d'un fichier d'instructions lu par l'agent) relève cinq modes d'écriture des instructions, « descriptive, prescriptive, prohibitive, explanatory, conditional », et conclut « there is no established content structure yet ». Le support retient les trois modes qui donnent une règle vérifiable : descriptif (invariant), prescriptif (pattern imposé), prohibitif (anti-pattern interdit) ; l'explicatif est le pourquoi, qui va dans l'ADR ; le conditionnel se ramène à l'un des trois.
Les exemples sont les principes I, II et III de la constitution de bookit (`tp/tp03/.specify/memory/constitution.md`). Le fichier à trous de Spec Kit propose en commentaire « Test-First (NON-NEGOTIABLE) » et « Library-First » : des patterns imposés.
Définitions du lexique : invariant, pattern imposé, anti-pattern interdit sont trois sortes de principe. Mots à ne pas employer : patron, bonne pratique, convention, anti-patron, interdit seul.
:::

## Invariant, pattern imposé, anti-pattern interdit : chacun se juge sur un diff. {.statement kicker="ADR et constitution"}

::: notes
Conclut la section : cinq ADR et leur pourquoi, deux rôles, l'ADR 1 qui motive quatre principes, le principe vérifiable sur un diff, trois sortes de principe. La section suivante dit ce qui entre dans la constitution et ce qui va ailleurs.
:::

## Constitution, spécification ou plan {kicker="La constitution"}

| Phrase bookit (illustration) | Artefact | Raison |
|---|---|---|
| aucun import hors `bookit.domain` dans le domaine | constitution | structure du code, valable pour tout le projet |
| une réservation dure au plus 4 heures | spécification | règle métier REG-01 : le QUOI |
| les scénarios s'exécutent avec pytest-bdd | plan | choix technique d'une fonctionnalité : le COMMENT |
| Claude Code lance pytest avant de répondre | aucun des trois | réglage d'un outil ; la constitution vaut pour les deux outils et pour un humain |

::: sources
- [Spec Kit, `templates/commands/specify.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/specify.md)
- [Spec Kit, `templates/commands/constitution.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/constitution.md)
- [Spec Kit, `templates/plan-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/plan-template.md)
:::

::: notes
`specify.md` : « Focus on WHAT users need and WHY. Avoid HOW to implement (no tech stack, APIs, code structure). » : la règle métier va dans `spec.md`. `plan-template.md`, section Technical Context (langage, dépendances, stockage, tests) : le choix de pytest-bdd va dans le plan, au TP 5. `constitution.md` : la commande n'écrit que la constitution et range toute demande d'implémentation en « deferred intents ».
Quatrième ligne : un réglage de l'agent (commande autorisée, outil lancé automatiquement) appartient à la configuration de l'outil ; dans bookit, `.claude/settings.json` et `opencode.json` autorisent déjà `uv run pytest`. Le fichier lu par les deux outils au lancement de chaque session est présenté au module 4. La constitution ne nomme ni Claude Code ni Open Code : relue par un humain, elle doit rester vraie.
Test rapide pour classer une phrase : change-t-elle si on change de langage ou de base ? COMMENT, plan. Si on change de produit ? QUOI, spécification. Si on change d'outil ? réglage. Sinon, structure : constitution.
:::

## Principes, sections libres, gouvernance {kicker="La constitution"}

```console
$ grep '^#' .specify/templates/constitution-template.md
# [PROJECT_NAME] Constitution
## Core Principles
### [PRINCIPLE_1_NAME]
…
### [PRINCIPLE_5_NAME]
## [SECTION_2_NAME]
## [SECTION_3_NAME]
## Governance
```


|||

```markdown file="../tp/tp03/.specify/memory/constitution.md" lines="5-8"
```

|||

Version `1.0.1` : numérotation sémantique, une reformulation incrémente le troisième chiffre.

::: sources
- [Spec Kit, `templates/constitution-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/constitution-template.md)
- [Spec Kit, `templates/commands/constitution.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/constitution.md)
:::

::: notes
Titres relevés le 21 octobre 2026 dans le fichier déposé par `specify init` 1.2.2 (`[PRINCIPLE_2_NAME]` à `[PRINCIPLE_4_NAME]` omis à l'écran), copie exacte de `templates/constitution-template.md` (`formateur/spec-kit.md` § 5). Fin du fichier : `**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]`. Les cinq `###` sont un exemple : la commande en écrit autant que l'entrée en demande (slide « `constitution` n'écrit qu'un fichier »).
Règles de version du prompt `constitution.md` : « MAJOR: Backward incompatible governance/principle removals or redefinitions » ; « MINOR: New principle/section added or materially expanded guidance » ; « PATCH: Clarifications, wording, typo fixes, non-semantic refinements ». Au TP 3, la version 1.0.0 est écrite par la commande, la 1.0.1 par la relecture à la main : trois reformulations, un PATCH. Un principe ajouté ferait 1.1.0.
Corrigé cité par `file=` : `tp/tp03/.specify/memory/constitution.md`, sept principes, les quatre de structure avec leur ADR, deux sections libres (« Contraintes techniques », « Workflow »), `## Governance`. Les sections libres reçoivent ce qui n'est pas un principe mais vaut pour tout le projet : la pile (Python 3.14, uv, FastAPI et SQLite inchangés, conteneur et authentification en attente : ADR 2 à 5) et l'ordre des artefacts.
:::

## Structure du code dans la constitution, comportement du produit dans la spécification. {.statement kicker="La constitution"}

::: notes
Conclut les deux slides : chaque phrase a son artefact, et le fichier a sa forme. Renvoie à l'idée clé du module 2 « La spécification porte le QUOI ; le plan porte le COMMENT » : la constitution s'ajoute en amont, pour ce qui vaut quelle que soit la fonctionnalité. La section suivante donne le contenu de ces principes de structure.
:::

## Couches, dépendances, frontière {kicker="Structure et frontières"}

![Trois boîtes, infrastructure, application, domaine, avec les fichiers du squelette ; des flèches d'import de l'infrastructure vers l'application et le domaine, de l'application vers le domaine ; une flèche barrée du domaine vers l'infrastructure, interdite par la frontière](images/03-frontiere.svg)

Martin, 2012 : « source code dependencies can only point inwards ».

::: sources
- [Robert C. Martin, The Clean Architecture, 13 août 2012](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
:::

::: notes
Trois définitions du lexique, portées par les étiquettes : une couche est un ensemble de modules de même rôle ; une dépendance est un import d'un module vers un autre ; une frontière est la règle qui dit quelle couche peut dépendre de quelle autre.
Imports relevés dans `fil-rouge/` le 21 octobre 2026 : `api.py` importe `bookit.application.request_booking`, `bookit.domain.models` et les deux adaptateurs ; `request_booking.py` importe `bookit.domain.models`, `bookit.domain.ports`, `bookit.domain.validate_booking` ; `sqlite_repository.py` et `system_clock.py` importent au plus `bookit.domain.models` ; aucun fichier de `bookit/domain/` n'importe hors de `bookit.domain` et de la bibliothèque standard (`dataclasses`, `datetime`, `typing`).
Martin : « The overriding rule that makes this architecture work is The Dependency Rule. This rule says that source code dependencies can only point inwards. » Dans bookit, « inwards » veut dire : vers le domaine.
La flèche barrée est ce qu'un `grep -rn 'bookit.infrastructure' bookit/domain/` attrape ; c'est le principe III de la constitution.
:::

## Trois aspects de la structure {kicker="Structure et frontières"}

| Aspect de la structure | Principe de bookit | Vérification sur un diff |
|---|---|---|
| les couches | trois dossiers : `domain/`, `application/`, `infrastructure/` | `git diff --name-only` : aucun dossier nouveau |
| le sens des dépendances | le domaine n'importe rien hors de `bookit.domain` | `grep -rn 'bookit.infrastructure' bookit/domain/` ne rend rien |
| l'emplacement des fichiers | une règle métier va dans `validate_booking.py`, un test dans `tests/` | `git diff --stat` : les fichiers touchés |

Les trois se vérifient sans lire le corps du code : noms de fichiers et lignes d'import suffisent.

::: notes
Principes III et IV de la constitution de bookit (`tp/tp03/.specify/memory/constitution.md`) ; les commandes de la troisième colonne sont celles du débrief du TP 3, étape « Juger un diff » : `violation.diff` touche `validate_booking.py` et `api.py`, un `grep` attrape l'import de `bookit.infrastructure` dans le domaine, `git diff --stat` montre la règle écrite dans `api.py`.
Dans Spec Kit, `analyze` fait la même vérification sur les artefacts (spécification, plan, tâches) : « Constitution conflicts are automatically CRITICAL » ; le diff, lui, est relu par le développeur. Les deux ensemble couvrent l'intention et le code.
Le diff de la slide « Un diff juste, mal placé » échoue sur la troisième ligne : la règle REG-01 est dans `api.py`.
:::

## L'architecture hexagonale {kicker="Structure et frontières"}

![Un hexagone : le domaine au centre avec validate_booking et models.py, l'application autour avec request_booking.py ; deux ports sur le côté droit, BookingRepository et Clock ; trois adaptateurs à l'extérieur, api.py qui pilote le domaine, sqlite_repository.py qui réalise BookingRepository, system_clock.py qui réalise Clock ; toutes les flèches pointent vers le centre](images/03-hexagonale.svg)

Cockburn, 2005 : « code pertaining to the inside part should not leak into the outside part ».

::: sources
- [Alistair Cockburn, The Hexagonal (Ports & Adapters) Architecture, 4 septembre 2005](https://alistair.cockburn.us/hexagonal-architecture/)
:::

::: notes
Définitions du lexique, portées par la légende : un port est l'interface que le domaine déclare pour ce qu'il attend de l'extérieur (`BookingRepository`, `Clock`, dans `ports.py`, des `Protocol`) ; un adaptateur est le module d'infrastructure qui réalise un port (`sqlite_repository.py`, `system_clock.py`) ou pilote le domaine (`api.py`). Architecture hexagonale : domaine au centre, ports, adaptateurs à l'extérieur ; les dépendances pointent vers le domaine (ADR 1).
Cockburn, rapport technique 2005.02 : l'intention est « Allow an application to equally be driven by users, programs, automated test or batch scripts, and to be developed and tested in isolation from its eventual run-time devices and databases » ; « A port identifies a purposeful conversation » ; l'adaptateur « converts the API definition to the signals needed by that device ». Le test de fumée est un pilote comme l'API ; au TP 6, les tests de `validate_booking` pilotent le domaine sans aucun adaptateur.
Dans le squelette, les ports sont dans le domaine et les adaptateurs dans l'infrastructure ; l'application (`request_booking`) reçoit les adaptateurs en paramètres (`repo`, `clock`) et appelle `validate_booking(booking, resource, clock.now())`. C'est là que l'horloge devient un paramètre (conséquence de l'ADR 1).
Mots à ne pas employer : adapter, implémentation, driver ; interface seule, protocole, contrat.
:::

## Trois styles parmi d'autres {kicker="Structure et frontières"}

| Style | Forme | Règle de frontière | Ce qu'un diff ne doit pas montrer |
|---|---|---|---|
| architecture hexagonale (Cockburn, 2005) | intérieur et extérieur | l'intérieur ignore l'extérieur | un import d'adaptateur dans le domaine |
| clean architecture (Martin, 2012) | cercles concentriques | les dépendances pointent vers l'intérieur | un import d'un cercle extérieur dans un cercle intérieur |
| microservices (Lewis et Fowler, 2014) | services en processus séparés | chaque service possède sa base | une requête sur la base d'un autre service |

::: sources
- [Alistair Cockburn, The Hexagonal (Ports & Adapters) Architecture, 4 septembre 2005](https://alistair.cockburn.us/hexagonal-architecture/)
- [Robert C. Martin, The Clean Architecture, 13 août 2012](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [James Lewis et Martin Fowler, Microservices, 25 mars 2014](https://martinfowler.com/articles/microservices.html)
:::

::: notes
Trois styles parmi d'autres ; le tableau n'est pas une liste exhaustive. Définitions du lexique : clean architecture, cercles concentriques, les dépendances pointent vers l'intérieur ; microservices, services en processus séparés, chacun propriétaire de sa base, échanges par le réseau. Mots à ne pas employer : architecture propre, onion ; micro-services.
Martin nomme quatre cercles : Entities, Use Cases, Interface Adapters, Frameworks and Drivers ; « Nothing in an inner circle can know anything at all about something in an outer circle ». Lewis et Fowler : « suite of small services, each running in its own process and communicating with lightweight mechanisms » ; section Decentralized Data Management, « Microservices prefer letting each service manage its own database ». Pour les microservices, la frontière porte sur un service, pas sur une couche : d'où l'élargissement de la définition de frontière (« quelle couche, ou quel service »).
La quatrième colonne est ce qu'une constitution écrit : une phrase par style, vérifiable sur un diff. bookit est hexagonal ; les deux autres lignes servent à transposer la méthode à un autre projet.
:::

## Quel que soit le style, la frontière s'écrit comme un import interdit. {.statement kicker="Structure et frontières"}

::: notes
Conclut la section : couches, dépendances et frontière, trois principes de structure, l'hexagone de bookit, trois styles. Quel que soit le style, la constitution en garde la règle de frontière sous forme d'import interdit, vérifiable par `grep`. La section suivante montre comment Spec Kit écrit et relit ce fichier.
:::

## `constitution` n'écrit qu'un fichier {kicker="Spec Kit"}

```markdown
Write only `.specify/memory/constitution.md`;
do not create or modify template source files.

The user might require less or more principles
than the ones used in the template.
```

|||

```console
$ grep '^### ' .specify/memory/constitution.md
### I. Availability Integrity (NON-NEGOTIABLE)
### II. Explicit Conflict Detection
### III. Test-First (NON-NEGOTIABLE)
…
```

|||

Sans principes dans le prompt, la commande en invente cinq d'après les exemples du fichier à trous.

::: sources
- [Spec Kit, `templates/commands/constitution.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/constitution.md)
:::

::: notes
Extraits du prompt `templates/commands/constitution.md` v1.2.2, consulté le 21 octobre 2026 ; même texte dans `.claude/skills/speckit-constitution/SKILL.md` et `.opencode/commands/speckit.constitution.md`. Le prompt commence par « You are updating the project constitution at `.specify/memory/constitution.md` ».
Ce que la commande fait d'autre (`formateur/spec-kit.md` § 4) : elle résout le fichier à trous par `resolve-template.sh constitution-template --json` ; elle charge la constitution existante comme « the source of current project-specific values and amendments » ; elle remplit chaque jeton `[ALL_CAPS]` ; elle numérote en semver et date en ISO ; elle écrit en tête un « Sync Impact Report » en commentaire HTML, « expected to be removed before the amended constitution file is committed » ; elle range toute demande d'implémentation en « deferred intents » et ne touche pas au code ; elle propose un message de commit, que le stagiaire ne suit pas (il commite lui-même).
Conséquences pour le TP 3 : le prompt part d'une base de sept principes et interdit d'en ajouter, sinon la commande en invente cinq d'après les exemples du fichier à trous ; le rapport HTML est retiré avant commit (`grep -c '<!--'` doit rendre 0).
Démonstration 2, dans `~/hello-spec/` (projet vide, sans dépôt git ; ou dans un `demo-claude` initialisé sans `--no-model-invocation`, avec `.claude/settings.json` du fil rouge copié pour le modèle ; sous Open Code, `opencode.json` du fil rouge copié) : `/speckit-constitution bookit, application de réservation de ressources` (ou `/speckit.constitution …`) ; lire les permissions demandées ; puis `head -30 .specify/memory/constitution.md`, `grep -c '^### ' .specify/memory/constitution.md`, `git status` (aucun dépôt). Résultat attendu : cinq principes inventés d'après les exemples du fichier à trous, version 1.0.0, date du jour, « Sync Impact Report » en tête, aucun autre fichier écrit. Montre pourquoi le TP part d'une base.
Le bloc console de la slide est la sortie relevée sous Claude Code (seconde passe, `tmp/rejeu/demos-claude-code/journal-03/demo2-releves-run2.txt`) : IV « Auditability » et V « Simplicity and Minimal Surface Area » sont omis à l'écran. Résultat observé le 21 octobre 2026 avec `claude-sonnet-4-6`, conforme sous les deux outils : cinq principes en anglais, version 1.0.0, date du jour, rapport en commentaire HTML, `.specify/memory/constitution.md` seul fichier écrit, aucune question posée, message de commit proposé. Claude Code : 63 s, 9 tours, principes « Availability Integrity (NON-NEGOTIABLE) », « Explicit Conflict Detection », « Test-First (NON-NEGOTIABLE) », « Auditability », « Simplicity and Minimal Surface Area ». Open Code : 39 s, 10 tours, principes « Resource-Centric Design », « Conflict-Free Reservations (NON-NEGOTIABLE) », « Test-First Development (NON-NEGOTIABLE) », « Explicit Availability Model », « Auditability & Traceability » ; le principe II impose une contrainte d'unicité en base dans une transaction, le V un journal append-only : deux décisions d'architecture inventées, contraires au squelette. La langue des principes varie d'un appel à l'autre (français à un autre essai).
Permission à attendre en TUI, à vérifier sur la VM : l'agent lance `bash /chemin/absolu/.specify/scripts/bash/resolve-template.sh constitution-template --json` (forme relevée au troisième rejeu du TP 3) ; le préfixe `bash` et le chemin absolu sortent de la règle `allow` `.specify/scripts/bash/*` de `.claude/settings.json`, la question est posée. Sous Open Code, `opencode.json` demande l'écriture du fichier (`edit: ask`) et le `test -f .specify/extensions.yml` (`bash: ask` ; la clé `bash` est la forme héritée de `shell`, documentée sous `permission` en v2, que le fil rouge garde).
:::

## Qui relit la constitution ensuite {kicker="Spec Kit"}

| Commande | Ce qu'elle fait de la constitution |
|---|---|
| `plan` | remplit le Constitution Check : « GATE: Must pass before Phase 0 research » |
| `tasks`, `implement` | la lisent avant d'écrire |
| `analyze` | « Constitution conflicts are automatically CRITICAL » |
| `converge` | la relit face au code ; violation d'un MUST : CRITICAL |

```console
$ grep -l constitution .claude/skills/speckit-*/SKILL.md | wc -l
10
```


::: sources
- [Spec Kit, `templates/plan-template.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/templates/plan-template.md)
- [Spec Kit, `templates/commands/analyze.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/analyze.md), [`tasks.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/tasks.md), [`implement.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/implement.md), [`converge.md`](https://github.com/github/spec-kit/blob/v1.2.2/templates/commands/converge.md) v1.2.2
:::

::: notes
`plan-template.md` : « ## Constitution Check », puis « *GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* » ; la commande `plan` s'arrête en erreur si une violation n'est pas justifiée dans Complexity Tracking. `tasks.md` : « IF EXISTS: Load `/memory/constitution.md` for project principles and governance constraints » ; `implement.md` : « IF EXISTS: Read /memory/constitution.md for governance constraints ». `analyze.md` : « STRICTLY READ-ONLY », « Constitution conflicts are automatically CRITICAL and require adjustment of the spec, plan, or tasks ». `converge.md` : « The project constitution (`/memory/constitution.md`) is non-negotiable » ; « CRITICAL: violates a constitution MUST principle » ; si la constitution est encore un fichier à trous, « skip constitution checks gracefully rather than failing ». Les chemins `/memory/constitution.md` des prompts du dépôt sont réécrits `.specify/memory/constitution.md` dans les fichiers déposés.
Sortie relevée le 21 octobre 2026 dans un projet initialisé avec Spec Kit 1.2.2 : `grep -l constitution` rend les dix fichiers, `checklist` et `taskstoissues` compris ; six portent une ligne « IF EXISTS … constitution » (`checklist`, `clarify`, `implement`, `specify`, `tasks`, `taskstoissues` ; `implement` dit « Read », les cinq autres « Load ») et quatre la mentionnent autrement (`constitution`, `plan`, `analyze`, `converge`). Même résultat sous Open Code : `grep -l constitution .opencode/commands/speckit.*.md | wc -l` rend 10. Le fichier le plus dense est `constitution`, puis `converge` et `analyze` ; le compte exact par fichier dépend de l'outil et de la commande de comptage, ne pas le donner.
Démonstration 3 (shell, rejouable) : dans `demo-claude`, `grep -l constitution .claude/skills/speckit-*/SKILL.md`, puis `grep -n 'Constitution Check' .specify/templates/plan-template.md` (ligne 39, et « GATE » ligne 41) ; dans `demo-opencode`, `grep -l constitution .opencode/commands/speckit.*.md`. Résultat observé le 21 octobre 2026 sous les deux outils : dix fichiers de chaque côté, `## Constitution Check` ligne 39, `*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*` ligne 41, et une troisième occurrence ligne 108 (« Fill ONLY if Constitution Check has violations »).
Le tableau ne nomme que les commandes qui font quelque chose de la constitution au-delà de la charger : `specify`, `clarify`, `checklist` la lisent pour la cohérence des exigences ; `taskstoissues` est dépréciée.
:::

## Initialiser bookit, écrire la constitution {.compare kicker="Spec Kit"}

::: claude-code
```console
$ specify init --here --force --integration claude --script sh --integration-options="--no-model-invocation"
```

`/speckit-constitution <prompt>`. L'option écrit `disable-model-invocation: true` : la commande ne part que si le développeur l'invoque.
:::

::: opencode
```console
$ specify init --here --force --integration opencode --script sh
```

`/speckit.constitution <prompt>`. Le nom du fichier de commande devient le nom de la commande ; aucune option à passer.
:::

::: sources
- [Spec Kit, `docs/reference/integrations.md` v1.2.2](https://github.com/github/spec-kit/blob/v1.2.2/docs/reference/integrations.md)
- [Claude Code, Skills, « Control who invokes a skill »](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill)
- [Claude Code, Permission modes, « Analyze before you edit with plan mode »](https://code.claude.com/docs/en/permission-modes#analyze-before-you-edit-with-plan-mode)
- [Open Code, Agents](https://opencode.ai/docs/agents/)
- [Open Code, Commands](https://opencode.ai/docs/commands/)
:::

::: notes
`--here --force` : initialise dans `~/bookit/` déjà extrait sans demander confirmation ; les fichiers existants sont conservés (`formateur/spec-kit.md` § 1). `integrations.md`, tableau des options : « Write `disable-model-invocation: true` into the core Spec Kit command skills so Claude Code runs them only when invoked as `/speckit-<command>` and keeps their descriptions out of its context » ; intégration `claude` seulement ; « By default every Spec Kit skill installed for Claude Code is model-invocable » ; l'option est mémorisée dans `.specify/integration.json`. Vérifié le 21 octobre 2026 : les dix `SKILL.md` portent `disable-model-invocation: true` et `user-invocable: true`.
Claude Code, Skills : avec `disable-model-invocation: true`, « Claude can't invoke the skill on its own » et la description sort du contexte, « full skill loads when invoked ». Sans l'option, Claude Code peut lancer une commande Spec Kit de lui-même quand sa description lui paraît pertinente. Open Code, Commands : « The markdown file name becomes the command name », invoquée en tapant `/` et le nom ; la page ne décrit aucune invocation d'une commande par le modèle et aucune option à ce sujet (inférence : sans mécanisme documenté, rien à désactiver). L'option donne aux deux outils le même comportement et laisse chaque transition du workflow au développeur. Confirmé au rejeu du 21 octobre 2026 (Claude Code 2.1.306) : `claude -p "/speckit-constitution …"` développe la commande malgré `disable-model-invocation: true`, conformément à la documentation Headless (« Include `/skill-name` in the prompt string and Claude Code expands it before running ») ; l'option reste dans l'énoncé. Sous Open Code 2.0.32, `opencode run "/speckit.constitution …"` ne remplace pas la commande par son prompt (second rejeu du 21 octobre 2026 : le message est stocké tel quel, aucune trace d'expansion ; passé en un seul argument avec des espaces, il est même stocké entre guillemets et l'agent écrit un fichier au mauvais endroit) : l'agent reçoit le texte brut et va lire lui-même `.opencode/commands/speckit.constitution.md`, ce qui donne le même résultat. L'expansion en TUI, que la page Commands décrit, reste à vérifier sur la VM.
Lecture seule, pour l'étape « Juger un diff » du TP 3, hors slide : Claude Code, mode `plan` : « Claude reads files, runs shell commands to explore, and writes a plan, but does not edit your source » ; entrée par `Shift+Tab`, préfixe `/plan` ou `--permission-mode plan`. Open Code, agent Plan : « Denies file edits, writes, and patches outside its plan directory, `~/.opencode/plan/` », « Does not restrict shell commands » (le shell suit `opencode.json` : `ask`). La documentation dit « cycle through them using the Tab key, or your configured `switch_agent` keybind » ; le relevé du code v2.0.26 (`keybind.ts`, `formateur/equivalences.md`) donne `Shift+Tab` : à vérifier sur la VM en v2.0.32.
La commande d'initialisation sous Claude Code dépasse la largeur d'une ligne de console : elle défile horizontalement, le bouton de copie prend la ligne entière.
:::

## De `plan` à `converge`, Spec Kit relit `constitution.md` avant d'écrire. {.statement kicker="Spec Kit"}

::: notes
Conclut la section : la commande qui écrit le fichier, les commandes qui le relisent, l'initialisation dans chaque outil. Renvoie à l'idée clé du module 2 « la relecture reste au développeur » : la constitution produite par la commande se relit avant commit, à trois questions par principe (vérifiable sur un diff ? un principe de structure cite-t-il son ADR ? aucune règle métier, aucun nom d'outil ?) ; c'est l'étape 4 du TP 3. La section suivante présente le projet sur lequel le TP travaille.
:::

## À quoi sert bookit {kicker="Fil rouge bookit"}

![Un demandeur envoie deux demandes de réservation à bookit : salle A jeudi de 10h00 à 11h00, acceptée ; salle A samedi de 10h00 à 11h00, refusée avec le code hours](images/03-bookit.svg)

::: notes
Point de vue fonctionnel d'abord, le code en fin de section (`formateur/fil-rouge.md`, « Présentation de bookit dans le support ») : aux sessions précédentes, comprendre le domaine a pris trop de temps ; prendre le temps ici, avant le TP 3.
Un demandeur (mot courant) réserve une ressource (salle, équipement, personne) entre un début et une fin ; bookit accepte, ou refuse en disant pourquoi, par le code de la règle enfreinte (notion du module 1). Le samedi enfreint REG-02, en semaine de 8h à 20h : code `hours`.
Hors périmètre, à ne pas ouvrir : annulation, quotas, approbation, plusieurs fuseaux ; ce sont des réponses de `clarifications.md` au TP 4.
:::

## Ressource, demande, créneau, réservation {kicker="Fil rouge bookit"}

![La ligne du temps de la salle A, de 8h00 à 20h00 : deux réservations confirmées, 9h à 10h et 14h à 16h ; une demande de réservation de 10h à 11h en pointillé ; le créneau de la demande, début inclus et fin exclue, jointif à la réservation de 9h à 10h](images/03-ligne-du-temps.svg)

La demande de 10h à 11h est acceptée après la réservation de 9h à 10h.

::: notes
Quatre définitions du lexique, portées par les étiquettes du schéma. Ressource : ce qui se réserve, salle, équipement ou personne ; connaît ses réservations confirmées (`Resource.bookings` dans `models.py`). Demande de réservation : une ressource visée, un début et une fin, soumise à bookit ; « demande » seule ensuite. Créneau : intervalle entre un début et une fin, début inclus et fin exclue, `[start, end[` dans `models.py` ; deux créneaux jointifs ne se chevauchent pas. Réservation confirmée : demande acceptée et enregistrée sur sa ressource ; « réservation » seule ensuite.
Mots à ne pas employer : requête, booking (hors code), plage, slot, intervalle, période, occupation.
La fin exclue tranche la question laissée ouverte au module 2 (« deux réservations qui se touchent à 10h00 ») : la demande de 10h à 11h est acceptée après une réservation de 9h à 10h. `tp/fichiers/regles-metier.md`, REG-05, le dit en toutes lettres.
:::

## Décision, refus, instant courant {kicker="Fil rouge bookit"}

| Décision | Effet |
|---|---|
| acceptée | la demande devient une réservation confirmée, enregistrée sur sa ressource |
| refusée | un code de refus, un par règle : `duration`, `hours`, `lead_time`, `horizon`, `overlap` |

![La même ligne du temps avec l'instant courant à 9h00 : le moment où la demande est jugée, fourni en entrée ; une demande de 12h à 13h a trois heures de préavis](images/03-instant-courant.svg)

::: notes
Définitions du lexique : la décision est le résultat de la validation d'une demande, acceptée, ou refusée avec un code ; l'instant courant est le moment auquel la demande est jugée, fourni en entrée à la validation (le paramètre `now` de `validate_booking`, conséquence de l'ADR 1). Mots à ne pas employer : résultat, verdict, réponse ; maintenant, heure système, date du jour.
Deux règles dépendent de l'instant courant : REG-03 (préavis de 2 heures) et REG-04 (horizon de 60 jours), slide suivante. Le schéma montre pourquoi il est fourni et non lu : la même demande, jugée à 11h00, n'aurait plus qu'une heure de préavis ; un test fixe l'instant courant pour rester reproductible.
Un seul code rendu quand plusieurs règles sont enfreintes : question tranchée au TP 4 (REG-06, première règle enfreinte dans l'ordre). Ne pas répondre ici, noter la question.
:::

## Les cinq règles métier {kicker="Fil rouge bookit"}

![Deux lignes du temps : la journée, de 8h00 à 20h00, avec REG-02 hours (en semaine, de 8h à 20h), REG-01 duration (30 minutes à 4 heures) et REG-05 overlap (deux créneaux qui se chevauchent) ; le calendrier depuis l'instant courant, avec REG-03 lead_time (au moins 2 heures) et REG-04 horizon (au plus 60 jours)](images/03-regles.svg)

::: notes
Reprise du tableau de la slide « Les règles métier de bookit » du module 1, chaque règle placée sur la ligne du temps ; texte de référence `tp/fichiers/regles-metier.md`. Un code de refus par règle.
Ce que les règles ne tranchent pas : 20h00 pile (une réservation qui finit à 20h00), les jours fériés (ouvrés, réponse du TP 4), une durée de 30 minutes pile ou de 4 heures pile (bornes incluses au TP 1, à confirmer dans la spécification), un seul code quand deux règles sont enfreintes (REG-06 au TP 4). Noter les questions, ne pas y répondre.
Le fond coloré est la zone acceptée : hors du fond, refus. Même convention sur les deux lignes.
:::

## Trois demandes, une journée {kicker="Fil rouge bookit"}

![La ligne du temps de la salle A le mardi 2 juin 2026, instant courant à 9h00 ; trois demandes numérotées : 12h à 13h acceptée, 12h30 à 13h30 refusée avec le code overlap, 13h à 14h acceptée parce que jointive](images/03-journee.svg)

Jugée avant la 1, la demande 2 aurait été acceptée : la décision dépend de l'ordre d'arrivée.

::: notes
Illustration construite pour la slide : instant courant mardi 2 juin 2026 à 9h00, la date des scénarios Gherkin du TP 5. Les trois demandes sont jugées dans l'ordre, chacune sur l'état laissé par la précédente : après la demande 1, la salle A a une réservation confirmée de 12h à 13h ; la demande 2 la chevauche de 12h30 à 13h00, refusée `overlap` ; la demande 3 commence à 13h00, fin exclue de la réservation 1, acceptée.
Si la demande 2 avait été jugée avant la 1, elle aurait été acceptée et la 1 refusée : la décision dépend de l'ordre d'arrivée, et de l'instant courant.
Les trois respectent REG-01 à REG-04 : une heure, en semaine entre 8h et 20h, plus de 2 heures de préavis, moins de 60 jours.
:::

## Le squelette, trois couches {kicker="Fil rouge bookit"}

![Quatre colonnes : infrastructure (api.py, sqlite_repository.py, system_clock.py), application (request_booking.py), domaine (models.py, ports.py, validate_booking.py), tests (test_fumee.py, conftest.py) ; les flèches pointent vers le domaine ; en bas la signature validate_booking(booking, resource, now) -> InvalidBooking | None, la décision est la valeur de retour](images/03-squelette.svg)

::: notes
Définition du lexique (squelette), à dire à l'oral : le `fil-rouge/` fourni dans l'archive, extrait en `~/bookit/`, bookit avec son API, son stockage et son test de fumée, sans `validate_booking` ni artefact SDD. « Sans `validate_booking` » : le fichier existe et la fonction rend `None`, slide suivante. Test de fumée (lexique) : l'unique test fourni, `tests/test_fumee.py`, une réservation valide via l'API répond 201 ; il reste vert une fois les règles écrites. Mots à ne pas employer : stub, base, projet de départ ; squelette pour un fichier à trous.
Détail par couche (`formateur/fil-rouge.md`) : `models.py` porte `Booking` (créneau `[start, end[`), `Resource` (nom et réservations confirmées), `InvalidBooking` (code et message) ; `ports.py` porte `BookingRepository` et `Clock`, des `Protocol` ; `request_booking.py` charge la ressource, appelle `validate_booking(booking, resource, clock.now())` et enregistre si le résultat est `None` ; `api.py` expose `POST /resources/{name}/bookings`, répond 201 ou 422 avec `{"detail": {"code": …}}` ; `sqlite_repository.py` écrit dans `bookit.db` (ou `BOOKIT_DB`) ; `conftest.py` donne au test une base temporaire.
Trois ADR se lisent sur le schéma : les flèches pointent vers le domaine, `now` est un paramètre et la décision est la valeur de retour (ADR 1) ; `api.py` traduit la décision en 201 ou 422 (ADR 2) ; `sqlite_repository.py` réalise le port `BookingRepository` (ADR 3). Les ADR 4 et 5 (conteneur, fournisseur d'identité) n'ont encore aucun fichier.
Pile : Python 3.14 géré par uv, `uv sync` puis `uv run pytest -q` ; FastAPI, uvicorn ; groupe `dev` avec pytest, pytest-bdd, ruff, httpx2.
:::

## `validate_booking` rend `None` {kicker="Fil rouge bookit"}

```python file="../fil-rouge/bookit/domain/validate_booking.py" lines="6-7"
```

```console
$ curl -s -o /dev/null -w '%{http_code}\n' -H 'Content-Type: application/json' -d @demande.json $url
201
$ curl -s -o /dev/null -w '%{http_code}\n' -H 'Content-Type: application/json' -d @demande.json $url
201
```

Au TP 6, le même second envoi répond 422 `overlap`.

::: notes
Code cité par `file=` depuis `fil-rouge/bookit/domain/validate_booking.py` ; les lignes 1 à 4 sont les imports (`datetime`, `Booking`, `InvalidBooking`, `Resource`). La signature est celle du schéma précédent : la décision est la valeur de retour (ADR 1 et 2), `now` un paramètre (ADR 1).
Bloc console : les deux envois de l'étape 1 du TP 3 (même demande, le lundi suivant de 10h00 à 11h00 sur la salle A), codes relevés au rejeu du 21 octobre 2026 : `201` puis `201` ; aucune règle, pas même le chevauchement. Au TP 6, le même second envoi répond 422 `overlap`.
:::

## Fourni et à construire {kicker="Fil rouge bookit"}

Fourni :

- l'API `POST /resources/{name}/bookings`
- le stockage SQLite et l'horloge système
- `models.py` et les ports
- un test de fumée

|||

À construire :

- `validate_booking`
- ses tests
- les artefacts SDD

::: notes
L'API répond 201, ou 422 avec `{"detail": {"code": …}}`.
Le test de fumée (`tests/test_fumee.py`) réserve le lundi suivant de 10h à 11h : il respecte les cinq règles quel que soit le jour, et reste vert une fois les règles écrites.
Ce qui ne change jamais pendant la formation : l'API, le stockage, `models.py`, les ports. Seul `bookit/domain/validate_booking.py` et `tests/` reçoivent du code ; `git log --oneline -- bookit/application bookit/infrastructure` ne montrera que le commit du squelette.
:::

## Ce que chaque TP ajoute {kicker="Fil rouge bookit"}

![Frise à quatre étapes : TP 3 cadrer (.git, .specify/, docs/adr/, constitution.md) ; TP 4 spécifier (AGENTS.md, .claude/skills/, spec.md) ; TP 5 planifier et découper (valider-reservation.feature, plan.md, tasks.md) ; TP 6 implémenter et vérifier (test_valider_reservation.py, validate_booking.py, tasks.md coché)](images/03-trajectoire.svg)

::: notes
Trajectoire de `formateur/fil-rouge.md` : une seule copie de `~/bookit/` du TP 3 au TP 6, aucun état intermédiaire fourni, chaque TP terminé avant le suivant. Commits cumulés : 4 après le TP 3, 9 après le TP 4, 14 après le TP 5, 19 après la partie A du TP 6, 21 après la partie B.
TP 6 partie B, absente de la frise : mutation testing avec cosmic-ray, `cosmic-ray.toml`, `mutation.md`, l'exemple du dimanche ajouté à la spécification, au `.feature` et aux tests.
Le TP 3 n'écrit aucune ligne de code : il met le squelette sous git et sous Spec Kit, dépose les ADR et écrit la constitution. Le code n'arrive qu'au TP 6, dans la seule fonction qui reste à écrire.
:::

## bookit est cadré dès le TP 3 ; `validate_booking` attend le TP 6. {.statement kicker="Fil rouge bookit"}

::: notes
Conclut la section : à quoi sert bookit, ses concepts, ses règles, une journée, le squelette, ce qui est fourni, ce que chaque TP ajoute. Ouvre le TP 3 : versionner le squelette, constater que l'API accepte tout, initialiser Spec Kit, déposer les ADR, écrire la constitution à partir d'une base, la relire à trois questions, juger un diff contre elle.
:::

## TP 3 : cadrer bookit par sa constitution {.tp duration="50 min" kicker="TP 3"}

Arrivée : quatre commits faits à la main, `.specify/memory/constitution.md` en 1.0.1, quatre principes de structure citant leur ADR. L'agent ne commite pas.

::: notes
Point de départ : arrivée du TP 1 (`~/bookit/` extrait sans `.git` ni `.venv`, `~/fichiers/` présent, Spec Kit 1.2.2 installé). Arrivée : 4 commits, `git status --short` vide, 1 test vert, `.specify/memory/constitution.md` en 1.0.1 à sept principes dont les quatre de structure citent leur ADR, `bookit.db` (ignoré) avec deux réservations. Ligne « TP 3 » de la trajectoire (`formateur/fil-rouge.md`).
Durées prévues : 8 min pour versionner, 7 min pour Spec Kit et les ADR, 12 min pour la constitution 1.0.0, 10 min de relecture, 8 min pour le diff, 5 min de débrief. Rejeux non interactifs (`claude-sonnet-4-6`, prompt « mot pour mot »), Claude Code le 22 octobre 2026 sur la base à cinq ADR, Open Code le 21 octobre sur la base à trois ADR (relevé à refaire) : cinq étapes conformes sous Claude Code ; commande `constitution` sous Claude Code 121 s, 14 tours, 0,53 USD (corps de la constitution identique à la base, `diff` vide ; mentions `(ADR 1 et 2)` et `(ADR 1)` intactes ; lignes Pourquoi de V à VII reprises sans ADR ; trois pièges reproduits ; Sync Impact Report de 7 lignes ; aucun `TODO(` ; aucune lecture de `docs/adr/` ; six appels Bash refusés, d'où le coût au-dessus du 21 octobre, 0,26 USD) ; sous Open Code 34 s, 9 tours, 12 appels d'outils, 0,14 USD, aucune commande shell (l'agent lit le fichier à trous au lieu de lancer `resolve-template.sh`). Jugement en lecture seule, étape 5 : Claude Code 21 s, 3 tours, 0,13 USD, jugement concordant avec le corrigé à trois nuances (IV imputé aussi à l'appel `SqliteBookingRepository(...)`, blocs `if … raise` jugés d'un tenant, II non cité pour l'instant courant du test) ; Open Code 17 s, 3 tours ; les deux agents ont lu `git diff` puis `.specify/memory/constitution.md` et rendu le tableau du corrigé sans rien écrire. Étape 1 : `1 passed in 0.11s` à `0.42s`, les deux `curl` répondent `201`, `select count(*) from bookings` rend 2. Étape 4 : `git diff --stat` donne `1 file changed, 4 insertions(+), 4 deletions(-)` (trois phrases et la ligne de version). Étape 5, diff appliqué : `3 files changed, 19 insertions(+), 1 deletion(-)`. Durée totale du TP en non interactif : 5 min et 0,66 USD sous Claude Code, le reste du temps prévu va à la lecture et au jugement à la main.
Permissions attendues à l'étape 3 : le script `.specify/scripts/bash/resolve-template.sh constitution-template --json` passe sans question (règles `allow` de `.claude/settings.json` et d'`opencode.json`) tant que l'agent l'appelle par son chemin relatif et sans préfixe ; aux rejeux Claude Code des 21 et 22 octobre, l'agent l'a lancé par `bash` et par son chemin absolu, hors de la règle : en TUI, une question (refusé en non interactif, il a lu le script par `Read` et écrit le fichier d'après le template) ; le 22 octobre, six appels Bash refusés en tout (`find` hors liste, `resolve-template.sh` par `bash` et en chemin absolu), et un sous-agent Explore a listé `.specify/` et lu les templates ; l'écriture de `constitution.md` est demandée une fois ; un `ls .specify/` peut s'ajouter ; la lecture de `docs/` et du README ne demande rien sous Claude Code. Sous Open Code, chaque commande shell hors règle est en `ask` (clé `bash` d'`opencode.json`, forme héritée de `shell`) : au premier rejeu l'agent a lancé un `ls .specify/memory/` qui en ajoute une, au second aucune commande shell, l'écriture seule. Étape 5 : sous Claude Code, le mode `plan` lit et explore sans éditer (vérifié : aucune écriture) ; sous Open Code, l'agent Plan refuse les éditions et le shell suit `opencode.json` (`git diff` demandé une fois). À vérifier sur la VM : la lecture des permissions en TUI, le passage à l'agent Plan par `Shift+Tab` (documentation v1 : `Tab`) en v2.0.32, et l'acceptation de la confiance du répertoire au premier `claude` dans `~/bookit/`, sans laquelle les règles `allow` de `.claude/settings.json` sont ignorées.
Le prompt de l'étape 3 demande de reprendre le texte de la base tel quel et ne dit rien des règles métier : les trois pièges passent dans la constitution, ce qui donne matière à l'étape 4. Si la commande en retire un d'elle-même, le noter : la relecture reste à faire pour les deux autres. Au premier rejeu (prompt sans « mot pour mot »), les agents passaient les principes au style normatif (`DOIT`) et Claude Code retirait le piège VI ; au second rejeu, avec le prompt actuel, les deux outils ont repris les sept principes et les lignes « Pourquoi » au mot près (`diff` identique au corps de la base) et reproduit les trois pièges. Seule la mention `(ADR n)` avait été remplacée par le nom de fichier, que le prompt demandait alors ; il demande désormais de la garder telle quelle, ce que les rejeux Claude Code des 21 et 22 octobre confirment (corps identique à la base, trois pièges, mentions `(ADR 1 et 2)` et `(ADR 1)` intactes, Sync Impact Report de 16 puis 7 lignes, aucun `TODO`). Ligne de version : `**Version**: 1.0.0` au format du fichier à trous, ou `**Version** : 1.0.0` avec libellés traduits et une espace avant les deux-points ; l'attendu `grep -oE '[0-9]+\.[0-9]+\.[0-9]+'` tolère les deux (vérifié sur les deux constitutions du rejeu : une seule occurrence, les dates ISO ne correspondent pas au motif). Un `TODO(…)` peut rester à la place d'un nom de fichier si la commande n'a pas pu lire `docs/adr/` (observé une fois au rejeu) : le cas est dans l'indice.
Débrief, deux questions : quel principe la commande a reproduit tel quel alors qu'il était piégé (IV porte une règle métier, V nomme Claude Code, VI une phrase vague : la commande respecte l'entrée, la relecture reste au développeur) ; quelles lignes de `violation.diff` un `grep` aurait suffi à attraper (`grep -rn 'bookit.infrastructure' bookit/domain/` pour l'import, `grep -rn 'datetime.now' bookit/domain/` pour l'horloge, `grep -rn 'raise' bookit/domain/` pour l'exception ; la règle écrite dans `api.py` demande de lire le diff).
Ce que le diff montre en plus : `uv run ruff check` et `uv run ruff format --check` passent sur le diff appliqué (relevé du 21 octobre 2026) ; `uv run pytest -q` donne `1 failed, 1 passed`, le test ajouté échouant sur `ValueError` au lieu d'`InvalidBooking("duration")` : la conséquence de l'ADR 2 (« une exception levée par le domaine est un bogue ») en direct.
Pièges : lancer `constitution` sans prompt (cinq principes inventés d'après les exemples du fichier à trous, comme à la démonstration) ; laisser le rapport HTML dans le commit ; corriger les pièges par un nouvel appel à la commande, qui peut renuméroter en MINOR ; commiter la violation ; accepter la proposition de commit de l'agent.
Décision `--no-model-invocation` sous Claude Code : les dix skills portent `disable-model-invocation: true` et `user-invocable: true` (vérifié le 21 octobre 2026 sur une initialisation locale) ; le rejeu du même jour confirme que `claude -p "/speckit-constitution …"` développe la commande, l'option reste. `specify init --force` conserve le `.claude/settings.json` du squelette.
:::

### Versionner le squelette

Installer l'environnement, lancer le test de fumée, créer le dépôt et faire le premier commit.

```console
$ cd ~/bookit
$ uv sync
$ uv run pytest -q
$ git init -b main
$ git add -A
$ git commit -m "TP 3 : squelette bookit"
```

Lancer l'API dans un second terminal.

```console
$ cd ~/bookit && uv run uvicorn bookit.infrastructure.api:app
```

Depuis le premier terminal, envoyer deux fois la même demande : le lundi suivant, de 10h00 à 11h00, sur la salle A. La commande `curl` se lance deux fois. Puis arrêter le serveur par Ctrl+C dans le second terminal.

```console
$ lundi=$(date -d 'next monday' +%F)
$ printf '{"start": "%sT10:00:00", "end": "%sT11:00:00"}' $lundi $lundi > demande.json
$ url=http://127.0.0.1:8000/resources/salle-a/bookings
$ curl -s -o /dev/null -w '%{http_code}\n' -H 'Content-Type: application/json' -d @demande.json $url
```

Supprimer ensuite `demande.json`, pour ne pas le commiter à l'étape suivante.

```console
$ rm demande.json
```

::: attendu
```console
$ uv run pytest -q | grep -o '^[0-9]* passed'
1 passed
$ git log --oneline | wc -l
1
```

Les deux envois répondent `201` : la seconde demande chevauche la première réservation et l'API l'accepte, aucune règle n'est écrite.
:::

::: indice
`uvicorn` occupe le terminal : sans second terminal, lancer la commande suivie de `&`, puis `kill %1` à la fin. `uv sync` paraît long : le téléchargement n'a lieu qu'une fois. `git commit` refuse faute d'identité : `git config --global user.name "Prénom Nom"` et `git config --global user.email "adresse"`, puis recommencer.
:::

### Spec Kit et ADR

Initialiser Spec Kit dans le dépôt, pour son outil, et compter les commandes déposées.

::: claude-code
```console
$ specify init --here --force --integration claude --script sh --integration-options="--no-model-invocation"
$ ls .claude/skills | wc -l
10
```
:::

::: opencode
```console
$ specify init --here --force --integration opencode --script sh
$ ls .opencode/commands | wc -l
10
```
:::

Copier les cinq ADR et la base de la constitution (`constitution-base.md`), puis les lire : chaque ADR porte un contexte, une décision et ses conséquences ; la base porte sept principes avec leur pourquoi, les quatre de structure avec leur mention `(ADR n)`.

```console
$ mkdir -p docs/adr
$ cp ~/fichiers/adr/*.md docs/adr/
$ cp ~/fichiers/constitution-base.md docs/
$ cat docs/adr/*.md docs/constitution-base.md
$ git add -A
$ git commit -m "TP 3 : Spec Kit et ADR"
```

::: attendu
```console
$ ls docs/adr | wc -l
5
$ head -1 .specify/memory/constitution.md
# [PROJECT_NAME] Constitution
$ git log --oneline | wc -l
2
```

La constitution déposée est le fichier à trous, intact.
:::

::: indice
L'encadré « Agent Folder Security » conseille d'ignorer le dossier de l'outil dans git : ne pas le suivre, les commandes se versionnent. `specify init` demande une confirmation : `--force` manque dans la commande. Le `.gitignore` du squelette reste en place, rien à y ajouter.
:::

### Constitution 1.0.0

Lancer l'outil dans `~/bookit`, puis invoquer la commande avec ce prompt, tel quel. Lire chaque demande de permission avant de l'accepter.

::: claude-code
```console
$ claude
```

```prompt
/speckit-constitution Écris la constitution de bookit à partir de docs/constitution-base.md : reprends ses sept principes dans l'ordre, avec leur texte et leur ligne « Pourquoi », mot pour mot, sans reformuler, sans en ajouter ni en retirer, en gardant la mention (ADR n) telle quelle ; reprends aussi ses sections Contraintes techniques, Workflow et Governance. Nom du projet : bookit. Version 1.0.0, ratifiée à la date du jour.
```
:::

::: opencode
```console
$ opencode
```

```prompt
/speckit.constitution Écris la constitution de bookit à partir de docs/constitution-base.md : reprends ses sept principes dans l'ordre, avec leur texte et leur ligne « Pourquoi », mot pour mot, sans reformuler, sans en ajouter ni en retirer, en gardant la mention (ADR n) telle quelle ; reprends aussi ses sections Contraintes techniques, Workflow et Governance. Nom du projet : bookit. Version 1.0.0, ratifiée à la date du jour.
```
:::

Quand la commande a terminé, quitter par `/exit`. Ouvrir `.specify/memory/constitution.md`, supprimer le « Sync Impact Report » (le commentaire `<!-- … -->` en tête de fichier), puis commiter.

```console
$ git add -A
$ git commit -m "TP 3 : constitution 1.0.0"
```

::: attendu
```console
$ grep -c '^### ' .specify/memory/constitution.md
7
$ grep -c '<!--' .specify/memory/constitution.md
0
$ grep -oE '[0-9]+\.[0-9]+\.[0-9]+' .specify/memory/constitution.md
1.0.0
$ git log --oneline | wc -l
3
```
:::

::: indice
La commande pose une question (nom du projet, date) : répondre « bookit » et la date donnée par `date +%F`. Plus de sept `###` : demander dans la même session de retirer les principes absents de `docs/constitution-base.md`. Un `TODO(…)` reste dans le fichier à la place d'une référence d'ADR : donner le nom du fichier manquant à l'agent dans la même session, ou le remplacer à la main avant de commiter. L'agent propose de commiter : refuser, le commit se fait à la main. Pour retirer le rapport en une commande : `sed -i '/^<!--/,/^-->/d' .specify/memory/constitution.md`, puis vérifier par `head -3`.
:::

### Relecture 1.0.1

Relire chaque principe de `.specify/memory/constitution.md` avec trois questions.

- Se vérifie-t-il sur un diff, par oui ou non ?
- Un principe de structure cite-t-il son ADR ?
- Est-il sans règle métier et sans nom d'outil ?

La base fournie porte trois phrases pièges. Dans l'éditeur :

- retirer les trois phrases ;
- passer la version à 1.0.1 (PATCH : reformulation) ;
- mettre la date d'amendement à la date du jour.

Puis commiter.

```console
$ git diff --stat
$ git add -A
$ git commit -m "TP 3 : constitution 1.0.1"
```

::: attendu
```console
$ grep -oE '[0-9]+\.[0-9]+\.[0-9]+' .specify/memory/constitution.md
1.0.1
$ git show --name-only --format= HEAD
.specify/memory/constitution.md
$ git log --oneline | wc -l
4
```
:::

::: indice
Un piège ne se trouve pas : poser les trois questions à chaque phrase de la base, une phrase répond non à l'une d'elles. La commande a déjà retiré un piège d'elle-même : le noter pour le débrief, et vérifier que les autres sont partis. La correction peut se demander à l'agent : relire son diff avant d'accepter, et vérifier qu'il n'a pas renuméroté en 1.1.0.
:::

### Juger un diff

Appliquer le diff fourni sans le commiter, le lire, et pour chaque ligne ajoutée dire quel principe de la constitution elle enfreint, ou lequel elle respecte.

```console
$ git apply ~/fichiers/violation.diff
$ git diff
```

Demander ensuite le même jugement à l'agent, en lecture seule, et comparer avec le sien.

::: claude-code
```console
$ claude --permission-mode plan
```

Le mode `plan` lit et explore sans éditer.
:::

::: opencode
```console
$ opencode
```

`Shift+Tab` bascule sur l'agent Plan, qui refuse toute édition ; `git diff` demande une permission, à accorder une fois.
:::

```prompt
Relis les modifications non commitées (git diff) contre .specify/memory/constitution.md et dis, pour chaque fichier et chaque ligne ajoutée, quel principe elle enfreint ou respecte, en le citant par son numéro. Ne modifie rien.
```

Quitter par `/exit`, puis remettre l'arbre propre.

```console
$ git restore .
```

::: attendu
```console
$ git apply --stat ~/fichiers/violation.diff | tail -1
 3 files changed, 19 insertions(+), 1 deletion(-)
$ git status --short | wc -l
0
$ git log --oneline | wc -l
4
```
:::

::: indice
`git apply` refuse (« patch does not apply ») : l'arbre n'est pas propre, `git status`, puis commiter ou restaurer avant de recommencer. L'agent propose de corriger le code : refuser, le TP s'arrête au jugement. Le diff est resté appliqué après la session : `git restore .` suffit, aucun fichier n'est créé.
:::

### Corrigé {.corrige}

Constitution 1.0.1, après relecture : sept principes avec leur pourquoi, les quatre de structure avec leur mention `(ADR n)`, sans les trois phrases pièges de la base. Vérification : `grep -ciE 'heures|Claude Code|Open Code|maintenable' .specify/memory/constitution.md` rend `0`.

```markdown file="../tp/tp03/.specify/memory/constitution.md"
```

Jugement de `~/fichiers/violation.diff`, ligne ajoutée par ligne ajoutée :

| Fichier | Ligne ajoutée | Principe |
|---|---|---|
| `bookit/domain/validate_booking.py` | `timedelta` ajouté à l'import de `datetime` | neutre : bibliothèque standard |
| | `from bookit.infrastructure.sqlite_repository import …` | enfreint III : import de l'infrastructure dans le domaine |
| | `now = datetime.now()` | enfreint II : l'horloge est lue au lieu d'être reçue |
| | `resource = SqliteBookingRepository("bookit.db").get_resource(…)` | enfreint III : le domaine lit la base |
| | `if booking.end - booking.start > …`, `if booking.start < now + …` | respectent IV : la règle est écrite dans `validate_booking.py` ; le second dépend de l'horloge lue (II) |
| | `raise ValueError("duration")`, `raise ValueError("lead_time")` | enfreint I : un refus est une valeur de retour |
| `bookit/infrastructure/api.py` | contrôle des heures ouvrées avant `request_booking` | enfreint IV : une règle métier hors de `validate_booking.py` |
| `tests/test_fumee.py` | deux imports de `bookit.domain` | neutres |
| | `test_une_reservation_de_cinq_heures_est_refusee` | respecte IV et V ; l'instant courant y est fixé (II) |

Les lignes de `validate_booking.py` ne font qu'un bloc dans `git diff` : le jugement se fait ligne par ligne.

## Glossaire : principes {kicker="Glossaire"}

- **Architecture implicite** : structure que l'équipe connaît sans l'avoir écrite, invisible pour l'agent
- **Invariant** : sorte de principe : ce qui est toujours vrai dans le code

|||

- **Pattern imposé** : sorte de principe : la manière de faire que tout diff suit
- **Anti-pattern interdit** : sorte de principe : ce qu'aucun diff ne fait

::: sources
- [Claude Code, Best practices, « Write an effective CLAUDE.md »](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
- [Mohsenimofidi, Galster, Treude, Baltes, Context Engineering for AI Agents in Open-Source Software, MSR 2026, 13 avril 2026](https://2026.msrconf.org/details/msr-2026-technical-papers/17/Context-Engineering-for-AI-Agents-in-Open-Source-Software)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation.
:::

## Glossaire : couches, frontière {kicker="Glossaire"}

- **Couche** : ensemble de modules de même rôle : domaine, application, infrastructure
- **Dépendance** : import d'un module vers un autre ; son sens est ce que la frontière contraint
- **Frontière** : règle qui dit quelle couche, ou quel service, peut dépendre de quelle autre

|||

- **Port** : interface que le domaine déclare pour ce qu'il attend de l'extérieur : `BookingRepository`, `Clock`
- **Adaptateur** : module d'infrastructure qui réalise un port ou pilote le domaine : `sqlite_repository.py`, `system_clock.py`, `api.py`

::: sources
- [Alistair Cockburn, The Hexagonal (Ports & Adapters) Architecture, 4 septembre 2005](https://alistair.cockburn.us/hexagonal-architecture/)
- [Robert C. Martin, The Clean Architecture, 13 août 2012](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::

## Glossaire : styles d'architecture {kicker="Glossaire"}

- **Architecture hexagonale** : domaine au centre, ports, adaptateurs à l'extérieur ; les dépendances pointent vers le domaine
- **Clean architecture** : cercles concentriques, les dépendances pointent vers l'intérieur (Martin, 2012)

|||

- **Microservices** : services en processus séparés, chacun propriétaire de sa base, échanges par le réseau (Lewis et Fowler, 2014)

::: sources
- [Alistair Cockburn, The Hexagonal (Ports & Adapters) Architecture, 4 septembre 2005](https://alistair.cockburn.us/hexagonal-architecture/)
- [Robert C. Martin, The Clean Architecture, 13 août 2012](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [James Lewis et Martin Fowler, Microservices, 25 mars 2014](https://martinfowler.com/articles/microservices.html)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::

## Glossaire : bookit {kicker="Glossaire"}

- **Squelette** : le `fil-rouge/` fourni dans l'archive, sans `validate_booking` ni artefact SDD
- **Ressource** : ce qui se réserve : salle, équipement ou personne ; connaît ses réservations confirmées
- **Demande de réservation** : une ressource visée, un début et une fin, soumise à bookit
- **Créneau** : intervalle du début inclus à la fin exclue ; deux créneaux jointifs ne se chevauchent pas

|||

- **Réservation confirmée** : demande acceptée et enregistrée sur sa ressource
- **Décision** : résultat de la validation d'une demande : acceptée, ou refusée avec un code
- **Instant courant** : moment auquel la demande est jugée, fourni en entrée à la validation

::: notes
Slide de référence, à ne pas lire en salle. Texte de référence du domaine : `tp/fichiers/regles-metier.md` et `formateur/fil-rouge.md`.
:::
