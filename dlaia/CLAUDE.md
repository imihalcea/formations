# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Objet du dépôt

Support de formation « Développement logiciel assisté par l'IA » (DLAIA), destiné à un public de développeurs : piloter un agent de code (**Claude Code** ou **Open Code**) avec la méthode Spec Driven Development et **GitHub Spec Kit**. Le dépôt contient le support (cours, démonstrations), le projet fil rouge bookit et les travaux pratiques (énoncés, fichiers fournis, corrigés).

## Arborescence

| Répertoire | Contenu |
|---|---|
| `support/` | Cours en Markdown : `00-…` (ouverture), un fichier par module (`01-…` à `08-…`), `99-…` (clôture) ; images dans `support/images/` ; carte mentale dans `support/carte-mentale.yaml` |
| `fil-rouge/` | Squelette hexagonal bookit (domaine, application, infrastructure FastAPI et SQLite) en Python 3.14, géré par uv, que chaque stagiaire reçoit une fois au début de la formation |
| `tp/fichiers/` | Fichiers fournis aux stagiaires par les énoncés (règles métier, brief, clarifications, ADR, constitution de base, skills, surcharges de templates, `.feature`, configuration cosmic-ray) |
| `tp/tpNN/` | Corrigés des TP : fichiers ajoutés ou modifiés par le TP, en état cumulé ; les énoncés sont dans `support/` |
| `demos/` | Scénarios joués par le formateur : prompts, déroulé, résultat attendu |
| `formateur/` | Préparation hors support : trajectoire du fil rouge, équivalences entre les deux outils, timing, pièges fréquents ; les notes d'animation sont dans `support/` |
| `template-support/app/` | Application qui compile `support/` en `dist/index.html` (Vite, React, TypeScript) ; syntaxe des slides dans son `README.md` |
| `dist/` | Support généré et archive `dlaia.zip`, à ne jamais éditer à la main |

Décisions prises :
- **Support web autosuffisant** : une seule présentation pour toute la formation, compilée en un fichier `dist/index.html` qui s'ouvre sans serveur ni installation. Il est publié sur la VM pour le formateur et les stagiaires. Node sert uniquement à construire le support, sur le poste de l'utilisateur.
- **Charte graphique respectée**, reprise du premier jet Lovable fourni par l'utilisateur et définie dans `template-support/app/src/styles.css` : couleurs, polices, échelle typographique, canevas de 1920×1080, motifs (filets `border-t-4` d'accent, numérotation `01` en accent, slides sombres pour les titres de module, les idées clés et la fin). Un nouveau type de slide se dessine avec ces éléments.
- **Template propre à la formation** : copié de `claude-code/template-support/app/` et adapté librement, sans synchronisation avec claude-code.
- **TP autoportants** : l'énoncé de chaque TP est écrit dans le fichier de son module (bloc `{.tp}`), en fin de module. Il produit une slide de lancement et une page d'énoncé qui défile. Le stagiaire ne travaille qu'avec le support et ses outils (Open Code ou Claude Code, IDE), sans autre fichier à ouvrir. Cinq TP : TP 1 (module 1, partie A lancée en fin de module 1, partie B lancée par une slide du module 2), TP 3, TP 4, TP 5 et TP 6. Pas de TP pour les modules 2, 7 et 8.
- **Notes d'animation à côté de chaque slide** (bloc `::: notes`). Les stagiaires peuvent les voir : elles sont rédigées comme des notes du formateur pour lui-même, en style télégraphique.
- **Projet fil rouge bookit** réutilisé de TP en TP : une application de réservation de ressources dont une seule fonction, `validate_booking`, est demandée à l'agent sans méthode au TP 1, puis cadrée (constitution), spécifiée, planifiée, implémentée et testée avec Spec Kit du TP 3 au TP 6. Le stagiaire travaille sur une seule copie du projet du début à la fin et termine chaque TP avant le suivant. Pas d'état intermédiaire par TP ni de mécanisme de rattrapage : l'expérience des TP reste simple.
- **Archive distribuée `dlaia.zip`** : produite par `npm run dist` dans `dist/`, elle contient `dlaia/dlaia.html` (support compilé), `dlaia/bookit/` (fil rouge sans `.venv`, caches ni base SQLite) et `dlaia/fichiers/` (copie de `tp/fichiers/`). Le stagiaire l'extrait par `unzip -d ~` et travaille dans `~/bookit/` avec les fichiers de `~/fichiers/`.
- **Fichiers fournis dans `tp/fichiers/`** : tout fichier que l'énoncé fait copier au stagiaire vit là, et nulle part ailleurs ; les énoncés le désignent par son chemin dans `~/fichiers/`.

Le skill `support-formation-html` ne doit pas être utilisé sur ce projet.

## Commandes

Depuis `template-support/app/` : `npm run build` génère `dist/index.html` à partir de `support/`, `npm run archive` assemble `dist/dlaia.zip` à partir du support compilé, de `fil-rouge/` et de `tp/fichiers/`, `npm run dist` enchaîne les deux, `npm run dev` sert le support avec rechargement à chaud, `npm run dev:exemple` sert le contenu de démonstration, `npm test` lance les tests du compilateur, `npm run typecheck` vérifie les types.

## Contexte pédagogique et contraintes techniques

- **Environnement des stagiaires** : une VM équipée de Claude Code et d'Open Code v2, tous deux installés et configurés. Les deux outils utilisent `claude-sonnet-4-6` par Amazon Bedrock, avec des identifiants AWS fournis par le rôle de la machine : aucune clé API à saisir. Chaque stagiaire travaille dans son répertoire personnel sur la VM.
- **Tout se fait en CLI.** Aucune manipulation ne doit dépendre d'une extension IDE ou d'une interface graphique.
- **Python 3.14 géré par uv** pour tous les exemples et TP, seule pile de la formation. Le détail est dans `formateur/fil-rouge.md`.
- **Modèle unique : Claude Sonnet 4.6** (`claude-sonnet-4-6`), dans les deux outils, pour toutes les démonstrations et tous les TP. Le support désigne le modèle par son identifiant complet : l'alias `sonnet` pointe vers la dernière version de Sonnet et ne garantit pas la 4.6. Les exemples de sortie, les limites et les comportements décrits sont ceux de ce modèle.
- **Double outil** : chaque TP doit être réalisable avec Open Code comme avec Claude Code. Dans un énoncé, une étape porte des variantes `::: claude-code` / `::: opencode` seulement quand elle diffère d'un outil à l'autre (nom de la commande Spec Kit, lancement, `/clear` contre `/new`). Quand une fonctionnalité diffère entre les deux (commandes, fichier de contexte, permissions, skills), le support indique l'équivalent dans chaque outil ou signale l'absence d'équivalent. Vérifier ces équivalences dans la documentation officielle de chaque outil avant de les écrire ; le relevé est tenu dans `formateur/equivalences.md`.
- **Spec Kit épinglé en 1.2.2** : installé par `uv tool install specify-cli==1.2.2`, initialisé par `specify init … --integration claude|opencode --script sh`. Sous Claude Code les commandes sont des skills invoqués `/speckit-<commande>` ; sous Open Code des commandes invoquées `/speckit.<commande>`. Les releases sont hebdomadaires : le support cite la version épinglée, et les corrigés sont refaits si elle change.
- **Un seul fichier de contexte et un seul dossier de skills pour les deux outils** : `AGENTS.md` à la racine du projet (Claude Code le lit à défaut de `CLAUDE.md` depuis la v2.1.277) et `.claude/skills/` (lu aussi par Open Code). Aucun `CLAUDE.md` ni `.opencode/skills/` dans le fil rouge.
- **Le stagiaire commite lui-même** après chaque étape de TP ; l'agent ne commite pas. Les énoncés donnent le nombre de commits attendu et l'`attendu` de chaque étape sous forme de commande à sortie connue.
- **Tous les stagiaires terminent tous les TP** : c'est le postulat des énoncés, qui prévoient des replis (`::: indice`) et aucun point de reprise.

## Programme validé

L'ordre et le périmètre des huit modules sont validés : ne pas les modifier sans demande explicite. Seul le contenu est revu.

La formation dure deux journées, cadre nominal. Les durées ci-dessous sont indicatives : la qualité pédagogique prime et le formateur adapte. Le jour 1 (modules 1 à 4) pilote l'agent, cadre et spécifie ; le jour 2 (modules 5 à 8) planifie, implémente, vérifie et garde le recul. Chaque journée se termine par une clôture : projection de la carte le jour 1 (15 min), bilan et évaluation le jour 2 (30 min).

1. **L'IA appliquée au développement logiciel** (1h15, TP 1 partie A 45 min) : quatre générations d'assistance au code et grille de lecture d'une nouveauté (modèle, harnais, méthode, artefact) ; le LLM (token, fenêtre de contexte, température) et ses limites structurelles ; l'agent comme modèle dans une boucle d'outils ; le vibe coding et son alternative, l'intention écrite, versionnée, vérifiée ; le prompt (rôle, contexte, instruction, format) et sa boucle de raffinement.
2. **Introduction au Spec Driven Development** (50 min, TP 1 partie B 30 min) : un prompt ne fait pas un projet ; le workflow SDD et le rôle humain à chaque transition ; ce qu'une spécification contient, séparer le QUOI du COMMENT ; les formats qui se combinent (Markdown structuré, ADR, EARS, Gherkin) ; GitHub Spec Kit, des étapes aux commandes.
3. **Constitution et architecture** (45 min, TP 3 50 min) : l'agent ignore l'architecture implicite ; l'ADR trace une décision et son pourquoi ; la constitution (invariants, patterns imposés, anti-patterns interdits), une règle efficace est vérifiable sur un diff ; contraindre la structure (couches, sens des dépendances, emplacement des fichiers) ; hexagonale, clean, microservices et la règle de frontière de chacune.
4. **Spécifier** (1h, TP 4 60 min) : EARS et Gherkin, la même règle bookit dans les deux ; les fichiers de règles persistants (`AGENTS.md`) ; le skill qui étend là où la règle contraint ; `specify` produit un brouillon, `clarify` lève les ambiguïtés avant le plan ; clôture du jour 1.
5. **Personnaliser Spec Kit, planifier, découper** (45 min, TP 5 60 min) : une commande Spec Kit est un prompt et un template versionnés ; personnaliser pour imposer les formats de l'équipe ; le plan porte le COMMENT sous contrôle de la constitution ; les tâches comme incréments vérifiables séparément, une tâche par session ; `analyze`.
6. **Implémenter et vérifier** (45 min, TP 6 90 min) : TDD et BDD ; du scénario Gherkin au test exécutable avec pytest-bdd ; ce que l'IA teste bien et ce qu'elle rate ; couverture contre mutation testing avec cosmic-ray ; converger.
7. **Contexte, sécurité et choix des outils** (1h30, exposé sans TP) : fenêtre de contexte et « lost in the middle », latence, prix et caching ; l'unité de travail et ses frontières, relecture des deux jours comme boucle faite à la main ; sécurité du code généré (chiffres datés et sourcés, dépendances hallucinées, fichiers de règles piégés, données sensibles, audit d'un diff) ; choisir un modèle et un harnais, coût total.
8. **Lucidité et clôture** (45 min, sans TP) : productivité ressentie et mesurée (METR, DORA, datés et sourcés), dette de relecture ; atrophie des compétences et parades, le développeur reste signataire ; du codeur à l'orchestrateur ; feuille de route personnelle.

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
- Le code des TP est exécuté sous Python 3.14 avec `uv run` avant d'être livré ; les corrigés passent leurs propres tests.

### Qualité pédagogique des slides

La qualité pédagogique prime sur la durée annoncée d'un module : le formateur accepte de dépasser le temps prévu quand le contenu l'exige.

- **Une idée par slide**, deux phrases courtes ou quatre éléments brefs au plus. Au-delà, scinder la slide plutôt que condenser le texte.
- **Montrer avant d'expliquer** : chaque notion abstraite a un support visuel (schéma SVG dans `support/images/`, commande réelle, extrait de code, sortie de terminal). Un exemple inventé porte la mention « illustration ».
- **Des exemples présentés comme tels** : le titre ou une phrase indique qu'une liste est partielle, pour qu'elle ne passe pas pour exhaustive.
- **Des chiffres lisibles d'un coup d'œil** : légende de trois à cinq mots. Intervalles de confiance, effectifs et méthode vont dans les notes. Aucune abréviation non définie à l'écran.
- **Le détail technique dans les notes** : variables d'environnement, chemins secondaires, cas particuliers servent au formateur pour répondre aux questions. Une slide qui ne contient que du détail se supprime.
- **Le support parle du sujet, pas du public** : aucune mention des stagiaires ni de la situation de formation sur les slides ; ces éléments vont dans les notes.
- **Des liens logiques explicites** : une slide de conclusion ou d'idée clé dit de quoi elle découle.
- **Des idées clés courtes** : une phrase d'une dizaine de mots, deux lignes au plus en `statement`.
- **Partir des questions concrètes du développeur** (combien ça coûte, comment je paie, que se passe-t-il à la limite) avant les tableaux de référence.
- **Un glossaire limité aux notions vues** dans le module.
- **Corriger le template quand un type de slide rend mal**, au lieu de contourner dans le contenu : la hiérarchie visuelle (terme et explication, chiffre et légende) doit être évidente.
- **Relire chaque slide en capture d'écran** avant de livrer un module, en plus du contrôle automatique des débordements.
