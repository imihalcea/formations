# Lexique

Vocabulaire de référence du support. Une notion a un seul nom, celui de la colonne « Terme » ; les slides, les notes et les notes de démonstration l'emploient sous cette forme et sous aucune autre. Un terme entre au lexique avec le plan du module qui l'introduit, et la slide qui le définit précède toute slide qui l'emploie. Un module ne redéfinit pas un terme d'un module antérieur : il le reprend tel quel. Une notion absente du lexique ne s'emploie pas comme notion : soit elle y entre, soit la phrase se reformule avec les termes existants.

La colonne « Introduit » donne le module de la première définition. La colonne « À ne pas employer » liste les synonymes, anglicismes et variantes à remplacer par le terme. Les noms de fichiers, de commandes et d'identifiants (`.mcp.json`, `opencode.json`, `claude-sonnet-4-6`) gardent leur forme d'origine et ne figurent pas ici. Les sigles (LLM, MCP, SDK, CI) sont développés une fois, sur la slide qui les définit, puis employés seuls.

Les définitions ci-dessous sont provisoires jusqu'au plan du module concerné, qui les confirme ou les corrige. La carte mentale (`support/carte-mentale.yaml`) reprend ces définitions en fin de rédaction.

Les termes des modules 1 à 3 de DLAIA (agent, harnais, fenêtre de contexte, skill, constitution, spécification) sont des acquis : la colonne « Introduit » vaut `DLAIA` pour eux et le support ne les redéfinit pas. Les modules de ce lexique portent les numéros de DLAIA Avancé.

## Produits et noms propres

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| agent de code | programme en ligne de commande qui pilote un modèle pour lire, écrire et exécuter du code dans un dépôt ; Claude Code et Open Code en sont deux ; « agent » seul aux slides 1 à 3 de l'ouverture (acquis de la formation initiale), « agent de code » dès la slide 4 ; slide « Choisir l'agent de code » | 00 | assistant, outil, CLI, harnais (pour l'agent de code) |
| Claude Code | agent de code en ligne de commande d'Anthropic | 00 | Claude (pour l'outil), ClaudeCode, claude hors commande |
| Open Code | agent de code libre en ligne de commande, version 2 | 00 | OpenCode, opencode hors commande |
| Claude Sonnet 4.6 | modèle unique de la formation, identifiant `claude-sonnet-4-6` | 00 | Sonnet seul, Claude 4.6, le modèle d'Anthropic |
| Amazon Bedrock | service d'Amazon Web Services qui héberge des modèles ; Open Code l'appelle pour Claude Sonnet 4.6 (Claude Code passe par l'abonnement Anthropic) (étiquette du schéma) | 00 | Bedrock seul, AWS Bedrock |
| fichier de contexte | fichier lu par l'agent de code au lancement : `CLAUDE.md` (Claude Code), `AGENTS.md` (Open Code) ; slide « Choisir l'agent de code » | 00 | fichier d'instructions, mémoire |
| limitation | ce que l'agent de code ne dépasse pas seul, même avec une spécification et un harnais ; slide « Définition d'une limitation » | 00 | goulot, blocage, plafond (pour la notion) |
| démonstration | exécution commentée, en direct, d'une tâche confiée à l'agent de code, jouée par le formateur ; définie à l'oral et dans le glossaire | 00 | démo, TP, atelier |
| tickets-api | dépôt de démonstration commun aux modules 1 à 3 ; slide « Le dépôt tickets-api » | 00 | fil rouge, bookit |
| dépôt | répertoire versionné du projet | DLAIA | repo, projet (pour le dépôt) |
| spécification | document versionné qui écrit l'intention d'une fonctionnalité avant le code | DLAIA | cahier des charges, specs |
| pull request | demande de fusion d'une branche dans une autre, relue avant fusion | DLAIA | PR, merge request |
| support | cours compilé, `dlaia-avance.html` ; défini au glossaire | 00 | slides (pour l'ensemble), présentation |

## Modèle et agent (acquis DLAIA, module 1)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| génération (d'assistance) | une des quatre étapes de l'assistance au code : complétion de l'IDE, suggestion dans l'éditeur, assistant conversationnel, agent | 01 | vague, ère, phase |
| LLM | modèle de langage qui produit du texte token par token à partir d'un contexte ; « modèle » seul une fois le sigle défini | 01 | grand modèle de langage, IA (pour le modèle), réseau de neurones |
| token | unité de texte que le modèle lit et produit, comptée dans la fenêtre et facturée | 01 | jeton, mot, caractère |
| fenêtre de contexte | tout ce que le modèle lit pour produire une réponse, de taille bornée | 01 | contexte seul (pour la fenêtre), context window, mémoire |
| instructions fixes | texte que le harnais place en tête de la fenêtre de contexte à chaque appel, avant le prompt ; slide « Ce que le modèle lit » (étiquette du schéma) | 01 | prompt système, system prompt, préambule |
| température | réglage de la part de hasard dans le choix de chaque token | 01 | créativité, aléa, randomness |
| hallucination | affirmation produite avec assurance et fausse | 01 | invention, erreur du modèle, confabulation |
| date de coupure | date jusqu'à laquelle les connaissances du modèle sont fiables, fixée par son entraînement | 01 | cutoff, date limite, fraîcheur |
| non-déterminisme | deux appels identiques au modèle peuvent produire deux réponses différentes, même à température 0 | 01 | aléa (pour la propriété), instabilité, variabilité |
| agent | modèle dans une boucle d'outils : il lit, exécute, relit, jusqu'au résultat | 01 | assistant, IA (pour l'agent), copilote, bot |
| outil (de l'agent) | action que l'agent peut déclencher : lire un fichier, écrire, exécuter une commande, chercher | 01 | fonction, tool, capacité |
| harnais | logiciel qui entoure le modèle : boucle, outils, permissions, affichage | 01 | runtime, wrapper, outil agentique, agent CLI |
| permission | accord demandé à l'utilisateur avant une action de l'agent | 01 | autorisation, droit, approbation |
| session | une suite d'échanges avec l'agent, du lancement à `/clear` ou `/new` | 01 | conversation, chat, contexte (pour la session) |
| tour | un échange de la session : message, appels d'outils, réponse ; chaque tour reste entier dans la fenêtre de contexte | 01 | turn, itération, aller-retour |
| prompt | texte envoyé au modèle ; ses quatre composants : rôle, contexte, instruction, format | 01 | invite, requête, demande, instruction (pour l'ensemble) |
| vibe coding | pilotage par prompts successifs, sans intention écrite ni vérification | 01 | codage à l'instinct, prompt-and-pray |
| intention | ce que le logiciel doit faire, écrit, versionné, vérifié | 01 | besoin, idée, vision, objectif (pour l'intention) |
| méthode | manière dont l'équipe organise le travail avec l'agent : ce qui s'écrit avant le code et ce qui se relit après | 01 | process, pratique, approche (pour la méthode) |
| artefact | fichier versionné dans le dépôt qui porte le travail au-delà d'une session : code, tests, règles, intention écrite | 01 | livrable, document, sortie |

## Automatiser plus loin (module 1)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| issue | fiche de suivi d'un dépôt GitHub : description et commentaires (distincte du ticket métier de tickets-api) ; slide « Une information hors du dépôt » | 01 | ticket (pour l'issue), bug report |
| mécanisme | moyen d'étendre l'agent de code : serveur MCP, sous-agent, orchestrateur, boucle, SDK, garde-fou ; slide « Trois limitations, trois sections » | 01 | fonctionnalité, brique, solution |
| MCP | sigle de Model Context Protocol, protocole commun entre un agent de code et un serveur qui lui expose des outils ; slide « Définition d'un serveur MCP » | 01 | plugin, connecteur |
| serveur MCP | programme qui expose des outils à l'agent de code par le MCP ; slide « Définition d'un serveur MCP » | 01 | plugin MCP, connecteur, extension |
| outil MCP | outil d'un serveur MCP : nom, description et paramètres typés ; slide « Un outil MCP » | 01 | fonction MCP, tool |
| jeton d'accès | secret lu dans une variable d'environnement qui authentifie l'agent de code auprès d'un serveur MCP, distinct du token de la fenêtre de contexte ; slide « Brancher un serveur MCP » | 01 | jeton seul, clé, token (pour le secret) |
| agent principal | agent de code qui reçoit la tâche de l'utilisateur et lance les sous-agents ; slide « Définition d'un sous-agent » | 01 | agent parent, agent racine |
| sous-agent | agent lancé par l'agent principal, avec sa propre fenêtre de contexte ; seul son rapport revient ; slide « Définition d'un sous-agent » | 01 | agent enfant, spécialiste, worker |
| orchestrateur | agent qui découpe une tâche, la délègue à des sous-agents et fait converger leurs rapports, sans rien modifier lui-même ; slide « Définition d'un orchestrateur » | 01 | chef d'orchestre, superviseur, graphe dynamique |
| horizon de tâche | durée d'une tâche, mesurée en temps humain, qu'un modèle mène à bien avec une probabilité de 50 % (mesure METR) ; slide « L'horizon double en 131 jours » | 01 | autonomie, durée de tâche |
| critère vérifiable | commande dont le code de retour dit si le travail est fini ; slide « Un critère vérifiable » | 01 | condition d'arrêt, test de sortie, vert, commande de vérification |
| boucle | relance de l'agent de code tant qu'un critère vérifiable n'est pas satisfait ; slide « Définition d'une boucle » | 01 | itération, cycle, loop |
| relance | nouvel appel de l'agent de code par la boucle quand le critère vérifiable n'est pas satisfait ; slide « Définition d'une boucle » | 01 | itération, essai, retry |
| garde-fou | limite posée hors du modèle, qui arrête ou borne l'agent de code ; slide « Définition d'un garde-fou » | 01 | borne, plafond, limite, safeguard, réglage |
| SDK | sigle de Software Development Kit, bibliothèque qui pilote l'agent de code depuis un programme ; slide « Définition d'un SDK » | 01 | API, bibliothèque cliente |
| outil d'origine | outil fourni avec l'agent de code, sans serveur MCP : lire, écrire, exécuter, chercher ; slide « Les outils d'origine » | 01 | outil natif, outil intégré, built-in |
| rapport | texte court que le sous-agent renvoie à l'agent principal à la fin de sa tâche ; slide « Définition d'un sous-agent » | 01 | compte rendu, résumé, retour |
| instructions fixes du sous-agent | corps du fichier d'agent, placé en tête de la fenêtre de contexte du sous-agent ; slide « Déclarer un sous-agent » | 01 | consigne, prompt système |
| dérive | écart de comportement de l'agent de code que le garde-fou corrige ; slide « Quatre dérives d'un orchestrateur » | 01 | problème, défaut, risque |
| imbrication | un sous-agent qui lance lui-même un sous-agent ; slide « Quatre dérives d'un orchestrateur » | 01 | récursion |
| commande personnalisée | prompt enregistré dans un fichier du dépôt, lancé par `/nom` ; slide « Une boucle par commande » | 01 | commande du dépôt, slash command, macro |
| règle de refus | permission qui interdit une action à l'agent de code (`deny`) ; slide « Protéger les tests » | 01 | blocage, interdiction |
| diff | liste des lignes ajoutées et retirées d'un fichier entre deux états ; slide « Un test désactivé masque l'échec » | 01 | différentiel, patch |
| code de retour | nombre rendu par une commande à sa fin, 0 si elle réussit ; slide « Un critère vérifiable » | 01 | exit code, statut de sortie |
| mode non interactif | exécution sans session ouverte : un prompt en entrée, le résultat en sortie (`claude -p`, `opencode run`) ; slide « Une boucle par script » | 01 | headless, batch |
| script shell | fichier de commandes exécuté par le shell, qui lance l'agent de code en mode non interactif ; slide « Une boucle par script » | 01 | bash, batch |
| programme | code écrit par le développeur (TypeScript ou Python dans le support) qui appelle le SDK ; slide « Définition d'un SDK » | 01 | service, application, bot |
| appel (au SDK) | envoi d'un prompt à l'agent de code par le SDK ; slide « Un premier appel au SDK » | 01 | requête, invocation |
| Claude Agent SDK | SDK d'Anthropic qui pilote Claude Code depuis TypeScript ou Python ; slide « Un premier appel au SDK » | 01 | SDK Claude, SDK Anthropic |

## Revue de code automatisée (module 2)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|

## Hooks et pipeline (module 3)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|

## Modèles locaux (module 4)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| modèle distant | modèle hébergé hors du poste, appelé par le réseau (Claude Sonnet 4.6 par l'abonnement Anthropic ou par Amazon Bedrock) | 04 | modèle cloud, API |

## Hors slides

Ces mots désignent la situation de formation et restent dans les notes : stagiaire, formateur, salle, séance, journée. Une slide parle du sujet, pas du public.
