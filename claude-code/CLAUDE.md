# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Objet du dépôt

Support de formation destiné à un public de développeurs : usage de **Claude Code** et **Open Code** en ligne de commande. Le dépôt contient le support (cours, démonstrations) et les travaux pratiques (énoncés, code de départ, corrigés).

## Arborescence

| Répertoire | Contenu |
|---|---|
| `support/` | Cours en Markdown : `00-…` (ouverture), un fichier par module (`01-…` à `07-…`), `99-…` (clôture) ; images dans `support/images/` |
| `fil-rouge/` | Projet Python 3.10 que chaque stagiaire copie une fois au début de la formation |
| `tp/` | Corrigés des TP et leurs tests ; les énoncés sont dans `support/` |
| `tp/tp07-pandoc/` | Fichiers du TP du module 7, indépendant du fil rouge |
| `demos/` | Scénarios joués par le formateur : prompts, déroulé, résultat attendu |
| `formateur/` | Préparation hors support : timing, pièges fréquents ; les notes d'animation sont dans `support/` |
| `template-support/app/` | Application qui compile `support/` en `dist/index.html` (Vite, React, TypeScript) ; syntaxe des slides dans son `README.md` |
| `dist/` | Support généré, à ne jamais éditer à la main |

Décisions prises :
- **Support web autosuffisant** : une seule présentation pour toute la formation, compilée en un fichier `dist/index.html` qui s'ouvre sans serveur ni installation. Il est publié sur la VM pour le formateur et les stagiaires. Node sert uniquement à construire le support, sur le poste de l'utilisateur.
- **Charte graphique respectée**, reprise du premier jet Lovable fourni par l'utilisateur et définie dans `template-support/app/src/styles.css` : couleurs, polices, échelle typographique, canevas de 1920×1080, motifs (filets `border-t-4` d'accent, numérotation `01` en accent, slides sombres pour les titres de module, les idées clés et la fin). Un nouveau type de slide se dessine avec ces éléments.
- **TP autoportants** : l'énoncé de chaque TP est écrit dans le fichier de son module (bloc `{.tp}`), en fin de module. Il produit une slide de lancement et une page d'énoncé qui défile. Le stagiaire ne travaille qu'avec le support et ses outils (Open Code ou Claude Code, IDE), sans autre fichier à ouvrir. Pas de TP pour le module 1.
- **Notes d'animation à côté de chaque slide** (bloc `::: notes`). Les stagiaires peuvent les voir : elles sont rédigées comme des notes du formateur pour lui-même, en style télégraphique.
- **Projet fil rouge Python 3.10** réutilisé de TP en TP (exploration, puis génération, refactoring, tests, extensions). Le stagiaire travaille sur une seule copie du projet du début à la fin et termine chaque TP avant le suivant. Pas d'état intermédiaire par TP ni de mécanisme de rattrapage : l'expérience des TP reste simple.
- **Le TP de la dernière demi-journée (module 7, chaîne pandoc) est indépendant du fil rouge.** Son contenu sera défini avec l'utilisateur le moment venu : ne pas l'anticiper.

Le skill `support-formation-html` ne doit pas être utilisé sur ce projet.

## Commandes

Depuis `template-support/app/` : `npm run build` génère `dist/index.html` à partir de `support/`, `npm run dev` sert le support avec rechargement à chaud, `npm run dev:exemple` sert le contenu de démonstration, `npm test` lance les tests du compilateur, `npm run typecheck` vérifie les types.

## Contexte pédagogique et contraintes techniques

- **Environnement des stagiaires** : une VM équipée d'Open Code. Les TP se font soit avec Open Code sur la VM, soit avec Claude Code sur le poste du développeur. Claude Code sur la VM viendra plus tard, quand la VM aura évolué. Le support considère Claude Code déjà installé et configuré sur le poste du stagiaire : le module 2 présente l'installation et l'authentification sans les faire réaliser.
- **Tout se fait en CLI.** Aucune manipulation ne doit dépendre d'une extension IDE ou d'une interface graphique.
- **Python 3.10** pour tous les exemples et TP (version présente sur la VM) : aucune syntaxe ni bibliothèque standard postérieure à 3.10 (pas de `tomllib`, `ExceptionGroup`, `except*`, `typing.Self`, `TaskGroup`…).
- **Modèle unique : Claude Sonnet 4.6** (`claude-sonnet-4-6`), dans les deux outils, pour toutes les démonstrations et tous les TP. Le support désigne le modèle par son identifiant complet : l'alias `sonnet` pointe vers la dernière version de Sonnet et ne garantit pas la 4.6. Les exemples de sortie, les limites et les comportements décrits sont ceux de ce modèle.
- **Double outil** : chaque TP doit être réalisable avec Open Code comme avec Claude Code. Quand une fonctionnalité diffère entre les deux (commandes, fichier de contexte, permissions, hooks, skills), le support indique l'équivalent dans chaque outil ou signale l'absence d'équivalent. Vérifier ces équivalences dans la documentation officielle de chaque outil avant de les écrire.

## Programme validé

L'ordre et le périmètre des modules sont validés : ne pas les modifier sans demande explicite.

La formation dure quatre demi-journées de 3h30. Les modules 1 à 4 forment ensemble la première demi-journée : ils servent d'introduction et ne s'attardent sur aucun sujet. Les modules 5, 6 et 7 occupent chacun une demi-journée.

1. **Les LLM au service du développement** : fonctionnement d'un LLM et ce qu'il sait vraiment faire ; panorama des assistants (Claude Code, Copilot, autres agents) ; apports pour le développeur ; limites structurelles ; confidentialité dès la première ligne de code envoyée à un modèle.
2. **Prise en main de Claude Code** : installation et configuration (CLI, IDE, authentification) ; cycle de travail agentique ; modes de permission et actions sensibles ; contexte de session et répertoire de travail ; bonnes pratiques de démarrage sur un dépôt existant.
3. **Explorer et comprendre un code existant** : recherche et navigation (Grep, Glob, lecture ciblée) ; expliquer une portion de code, une architecture, une dépendance ; édition assistée ; reformuler une demande pour obtenir un résultat exploitable ; garder le contrôle.
4. **Générer, refactorer et tester** : fonctionnalité à partir d'une spécification ; refactoring de code legacy à comportement constant ; écriture et complétion de tests ; boucle de vérification ; documentation et messages de commit.
5. **Prompting efficace, CLAUDE.md, mémoire et contexte projet** (½ journée, 3h30) : structurer une demande ; le fichier CLAUDE.md ; mémoire persistante et contextualisation par projet ; contexte long et dérive de conversation ; capitaliser les pratiques d'équipe dans le contexte partagé.
6. **Étendre Claude Code : skills, slash commands et hooks** (½ journée, 3h30) : skills ; slash commands pour les tâches récurrentes ; hooks ; workflow personnalisé pour l'équipe ; partage et versionnement des extensions.
7. **Cas d'usage : livrable documentaire avec pandoc** (½ journée, 3h30) : piloter la production de documents de la source au livrable ; chaîne pandoc Markdown → HTML → PDF ; gabarits, feuilles de style et mise en forme reproductible ; documents générés à partir de données structurées (rapports, fiches, contrats) ; industrialisation.

## Rédaction du support

- Langue : français, avec une orthographe et une accentuation complètes. Identifiants, commandes et termes techniques restent dans leur forme d'origine.
- **Progression logique** : au sein d'une section, chaque slide découle de la précédente et prépare la suivante. Un humain suit le fil sans saut logique : une notion est introduite avant d'être utilisée.
- **Sources citées et vérifiées** : chaque slide qui avance un fait cite sa source sur la slide elle-même. Chaque source est consultée avant d'être citée, et elle dit bien ce que la slide lui attribue. Cela vaut aussi pour toute commande, option, nom de fichier de configuration ou comportement d'outil : ces outils évoluent vite et le support n'affirme rien de mémoire.
- **Style concis et techniquement exact** : des phrases courtes, chacune juste sur le plan technique. Style direct et affirmatif : dire ce que la chose est. Supprimer les phrases évidentes pour un développeur.
- **Interdits de style** (valables aussi dans les échanges avec l'utilisateur) :
  - toute phrase sans information : généralités, évidences, encouragements ;
  - « ce n'est pas X, c'est Y » et ses variantes (« il ne s'agit pas de… mais de… », « plus qu'un X, un Y ») ;
  - les tirets cadratin (—) et demi-cadratin (–) : utiliser virgules, deux-points, parenthèses ou des phrases séparées ;
  - l'enthousiasme, les formules motivantes, les superlatifs : registre écrit français, sobre ;
  - les listes à puces et le gras quand une phrase suffit ;
  - les triades décoratives (trois adjectifs, trois exemples) par réflexe.
- Le code des TP est exécuté sous Python 3.10 avant d'être livré ; les corrigés passent leurs propres tests.
