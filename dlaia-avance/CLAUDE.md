# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Objet du dépôt

Support de la journée « DLAIA Avancé », module complémentaire et facultatif de la formation « Développement logiciel assisté par l'IA » (DLAIA). Public : développeurs ayant suivi DLAIA, qui connaissent l'agent de code (**Claude Code** ou **Open Code**), le Spec Driven Development et GitHub Spec Kit. Le support n'en refait aucun rappel. La journée ne comporte aucun TP : le formateur joue des démonstrations. Le dépôt contient le support, les démonstrations (runbooks, dépôts et artefacts) et la préparation du formateur.

Le support d'origine (Markdown et HTML, OpenCode seul, septembre 2026) est dans `/home/ionut/code/didact/formations/dlaia-adv/`. Il sert de matière à revoir en profondeur, non de référence : chaque fait est revérifié avant reprise.

## Arborescence

| Répertoire | Contenu |
|---|---|
| `support/` | Cours en Markdown : `00-…` (ouverture), un fichier par module (`01-…` à `05-…`), `99-…` (clôture) ; images dans `support/images/` ; carte mentale dans `support/carte-mentale.yaml` |
| `demos/` | Une démonstration par sous-répertoire `NN-nom/` : `README.md` (runbook), script ou `Makefile` de session, dépôt ou artefacts propres à la démo, sorties de référence, repli |
| `formateur/` | Préparation hors support : lexique, équivalences entre les deux outils, relecture, timing, pièges fréquents ; les notes d'animation sont dans `support/` |
| `template-support/app/` | Application qui compile `support/` en `dist/index.html` (Vite, React, TypeScript) ; syntaxe des slides dans son `README.md` |
| `dist/` | Support généré et archive `dlaia-avance.zip`, à ne jamais éditer à la main |

Décisions prises :
- **Support web autosuffisant** : une seule présentation, compilée en un fichier `dist/index.html` qui s'ouvre sans serveur ni installation. Node sert uniquement à construire le support, sur le poste de l'utilisateur.
- **Charte graphique** définie dans `template-support/app/src/styles.css` : couleurs, polices, échelle typographique, canevas de 1920×1080, motifs (filets `border-t-4` d'accent, numérotation `01` en accent, slides sombres pour les titres de module, les idées clés et la fin). Un nouveau type de slide se dessine avec ces éléments.
- **Template propre à la formation** : copié de `dlaia/template-support/app/` et adapté librement, sans synchronisation.
- **Démonstrations seulement, aucun TP** : le formateur joue chaque démonstration ; les stagiaires regardent. Le prompt, le déroulé, le résultat attendu et le repli sont dans les notes de la slide qui porte la démonstration et dans le runbook de `demos/NN-nom/`.
- **Une base de code par démonstration** : chaque démonstration apporte le dépôt ou les artefacts dont elle a besoin. bookit n'est pas imposé. Un dépôt externe est vérifié (`gh repo view`) avant reprise.
- **Notes d'animation à côté de chaque slide** (bloc `::: notes`), rédigées comme des notes du formateur pour lui-même, en style télégraphique.
- **Distribution : les slides seulement.** Les stagiaires reçoivent le support (`dlaia-avance.html`), jamais les démonstrations (runbooks, dépôts, scripts de session, sorties de référence), qui restent chez le formateur. Aucune slide ne renvoie à `demos/` ni à l'archive. Décision du 25 octobre 2026.
- **Archive `dlaia-avance.zip`** : produite par `npm run dist`. Son contenu actuel (`dlaia-avance.html` et `demos/`) est à réduire à `dlaia-avance.html` pour suivre la décision de distribution ci-dessus.

Le skill `support-formation-html` ne doit pas être utilisé sur ce projet.

## Commandes

Depuis `template-support/app/` : `npm run build` génère `dist/index.html` à partir de `support/`, `npm run archive` assemble `dist/dlaia-avance.zip`, `npm run dist` enchaîne les deux, `npm run dev` sert le support avec rechargement à chaud, `npm run dev:exemple` sert le contenu de démonstration du template, `npm run captures` (option `-- --module NN`) capture chaque slide en PNG dans `tmp/captures/` et signale les débordements, `npm test` lance les tests du compilateur, `npm run typecheck` vérifie les types.

## Contexte pédagogique et contraintes techniques

- **Environnement** : poste du formateur équipé de Claude Code (abonnement Anthropic) et d'Open Code (Amazon Bedrock), tous deux avec `claude-sonnet-4-6` désigné par son identifiant complet (l'alias `sonnet` ne garantit pas la version). Tout se fait en CLI.
- **Double outil, un seul par session** : chaque démonstration est jouable avec Open Code comme avec Claude Code, mais la salle choisit un outil en début de formation et la journée se joue avec lui seul. Le sélecteur du support (en haut à droite, `?outil=opencode` dans l'adresse) fait n'afficher que la variante choisie des slides `compare`. Une étape porte des variantes `::: claude-code` / `::: opencode` seulement quand elle diffère. Les équivalences (commandes, fichier de contexte, permissions, skills, hooks, MCP, sous-agents) sont vérifiées dans la documentation officielle de chaque outil et tenues dans `formateur/equivalences.md`.
- **Mécanismes des outils, aucun framework tiers** : pas de LangGraph ni de CrewAI. GitHub et GitHub Actions sont l'unique forge d'exemple. Les produits SaaS ne figurent qu'en panorama daté et sourcé.
- **Version d'Open Code : v2.0.32** (poste de démonstration, décision du 25 octobre 2026). Le support d'origine citait 1.18.29 (v1) ; les plugins et les hooks diffèrent entre v1 et v2.
- **Contenu daté** : versions d'outils, listes de serveurs MCP, modèles, prix et benchmarks portent leur date et sont revérifiés avant chaque session.
- **Aucun numéro d'issue ni de pull request** sur les slides : ces numéros dépendent du dépôt de la session.

## Programme validé

L'ordre et le périmètre sont figés (25 octobre 2026) : ne pas les modifier sans demande explicite. Les durées ne sont pas un critère. Chaque module est joué en démonstrations par le formateur.

0. **Ouverture** : retours de terrain après DLAIA.
1. **Automatiser plus loin** (cinq démonstrations) : harnais et limites de l'agent seul ; MCP ; sous-agents et orchestrateur ; boucles et garde-fous ; SDK (notion présentée sans démonstration : définition, exemple, cas d'usage) ; grille de choix. La cinquième démonstration lie MCP et IHM : un serveur MCP pilote un navigateur, l'agent constate un défaut d'interface sur un front ajouté à `tickets-api`, le corrige et vérifie le rendu.
2. **Revue de code automatisée** (trois démonstrations) : règles en vérifications, format d'un finding, trois modes (commande, pull request, pre-commit), faux positifs et contradicteur.
3. **Hooks et pipeline** (trois démonstrations) : hook du harnais, hook git, job CI, workflow `workflow_run`, garde-fous (droits, secrets, budget), avec l'ancien module Sécurité réduit à deux ou trois slides sourcées (injection de prompt par issue, règle des deux, ce qui sort du pipeline).
4. **Modèles locaux** (démonstration facultative, décidée au plan : petit modèle Haiku, Mistral Mini ou Kimi 2.7 rapide, ou aucune) : décision « ce qui sort, ce qui reste local » issue de l'ancien module Sécurité ; mémoire, bande passante, pile moteur-format-serveur, écart avec les modèles frontier, tâches adaptées au local.
99. **Clôture** : bilan de la journée.

## Rédaction du support

- Langue : français, avec une orthographe et une accentuation complètes. Identifiants, commandes et termes techniques restent dans leur forme d'origine.
- **Progression logique** : chaque slide découle de la précédente et prépare la suivante. Une notion est introduite avant d'être utilisée.
- **Sources citées et vérifiées** : chaque slide qui avance un fait cite sa source sur la slide. Chaque source est consultée avant d'être citée. Toute commande, option, nom de fichier de configuration ou comportement d'outil est vérifié : ces outils évoluent vite et le support n'affirme rien de mémoire.
- **Style concis et techniquement exact** : phrases courtes, style direct et affirmatif. Supprimer les phrases évidentes pour un développeur.
- **Interdits de style** (valables aussi dans les échanges avec l'utilisateur) :
  - toute phrase sans information : généralités, évidences, encouragements ;
  - « ce n'est pas X, c'est Y » et ses variantes (« il ne s'agit pas de… mais de… », « plus qu'un X, un Y ») ;
  - les tirets cadratin (—) et demi-cadratin (–) : utiliser virgules, deux-points, parenthèses ou des phrases séparées ;
  - l'enthousiasme, les formules motivantes, les superlatifs ;
  - les listes à puces et le gras quand une phrase suffit ;
  - les triades décoratives.
- Le code et les scripts des démonstrations sont exécutés avant d'être livrés ; les sorties de référence sont celles observées.
- **Un seul nom par notion** : `formateur/lexique.md` fait foi. Un terme y entre avec le plan du module qui l'introduit.
- **Relecture selon `formateur/relecture.md`** : chaque critère porte un code que les constats citent. Les sous-agents `relecteur` et `verificateur-sources` (`.claude/agents/`) l'appliquent en lecture seule.
- **Un module se prépare par `/module NN plan`** (plan relu, puis validé par l'utilisateur) **et se livre par `/module NN`** (slides, démonstrations, captures, relecture, commits, rapport). La session qui exécute le skill orchestre sans lire le support ni les sources : la rédaction passe par le sous-agent `redacteur`, la préparation des démonstrations par `rejoueur-demo`, la relecture par `relecteur` et `verificateur-sources`.
- **Les démonstrations sont rejouées à la main par l'utilisateur** une fois le support entièrement réalisé. Le skill `/rejeu NN` (sous-agent `rejoueur-demo`, `claude -p` et `opencode run` dans `tmp/rejeu/<outil>/`) reste disponible. Les sorties de référence livrées avant ce rejeu sont provisoires. Chaque appel impose le modèle par `--model`.

### Qualité pédagogique des slides

La qualité pédagogique prime sur la durée annoncée d'un module.

- **Une idée par slide**, deux phrases courtes ou quatre éléments brefs au plus.
- **Un titre de cinq mots au plus**, compréhensible seul. Les idées clés (`statement`) suivent leur propre règle.
- **Le texte sous un support visuel apporte ce que le support ne montre pas**. Test : cacher le support et lire la phrase, puis l'inverse ; si les deux disent la même chose, la phrase part.
- **Une phrase de fin porte une seule information**, en vingt mots au plus.
- **Un manque se montre, il ne se commente pas.**
- **Une idée clé apporte ses propres mots** : elle ne reprend ni le mot central d'une idée clé antérieure (vérifier par `grep` des `.statement`) ni la phrase d'une slide qu'elle conclut. Une dizaine de mots, deux lignes au plus.
- **Une énumération de trois éléments ou plus se présente en liste ou en tableau.**
- **Un exemple est l'archétype de la notion.**
- **Une phrase se lit d'une traite** : pas de connecteur répété, de négations en série ni de subordonnées imbriquées.
- **Montrer avant d'expliquer** : schéma SVG dans `support/images/`, commande réelle, extrait de code, sortie de terminal. Un exemple inventé porte la mention « illustration ».
- **Des exemples présentés comme tels** : une liste partielle est signalée comme telle.
- **Des chiffres lisibles d'un coup d'œil** : légende de trois à cinq mots, méthode dans les notes.
- **Le détail technique dans les notes.**
- **Le support parle du sujet, pas du public.**
- **Des liens logiques explicites** : une slide de conclusion dit de quoi elle découle.
- **Partir des questions concrètes du développeur** (combien ça coûte, que se passe-t-il à la limite) avant les tableaux de référence.
- **Un glossaire limité aux notions vues** dans le module.
- **Corriger le template quand un type de slide rend mal.**
- **Relire chaque slide en capture d'écran** avant de livrer un module.
