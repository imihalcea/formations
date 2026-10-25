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
| revue automatisée | exécution de l'agent de code qui relit un diff ; l'humain tranche ; slide « Définition d'une revue automatisée » | 02 | revue par IA, revue de code (pour la notion) |
| finding | remarque localisée rendue par une revue automatisée sur un diff ; slide « Définition d'un finding » | 02 | constat, anomalie, remarque |
| sévérité | niveau d'un finding : haute, moyenne ou basse ; slide « Trois niveaux de sévérité » | 02 | gravité, criticité, priorité |
| règle de revue | énoncé que le diff peut violer, avec vérification, exemple de violation, exemple conforme et sévérité ; slide « Définition d'une règle de revue » | 02 | convention, règle d'équipe (pour la règle de revue), check |
| vérification (d'une règle) | ce que la revue lit pour décider si le diff viole la règle ; slide « Définition d'une règle de revue » | 02 | contrôle, test (pour la vérification) |
| réviseur | sous-agent en lecture seule qui applique les règles de revue et rend des findings, identifiant `reviseur` ; slide « Définition d'un réviseur » | 02 | relecteur, agent de revue, reviewer |
| scénario d'échec | entrée concrète qui produit le défaut décrit par le finding ; slide « Le scénario d'échec » | 02 | cas de test, exemple de défaut |
| mode de revue | moment où le réviseur tourne : à la demande, sur la pull request, avant le commit ; slide « Trois modes de revue » | 02 | niveau, étape |
| faux positif | finding sur un code conforme ; slide « Définition d'un faux positif » | 02 | fausse alerte, faux finding |
| contradicteur | sous-agent chargé de prouver qu'un finding est faux ; slide « Définition d'un contradicteur » | 02 | avocat du diable, vérificateur adverse |
| verdict | réponse du contradicteur : confirmé, plausible ou réfuté, avec preuve ; slide « Trois verdicts » | 02 | décision, résultat |
| revue adverse | revue suivie d'un contradicteur par finding de sévérité haute ; slide « Lancer la revue adverse » | 02 | passage adverse, revue simple (pour la revue sans contradicteur : « revue sans contradicteur ») |

## Hooks et pipeline (module 3)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| contrôle | ce qu'un hook ou un job exécute pour laisser passer ou refuser une modification (gitleaks, ruff, tests, réviseur) ; distinct de la vérification d'une règle de revue ; slide « Définition d'un hook » | 03 | vérification (pour le hook ou le job), check |
| événement | moment où une commande ou un job démarre : appel d'outil, commit, événement du dépôt (`pull_request`, `workflow_run`) ; slide « Définition d'un hook » | 03 | déclencheur, trigger |
| hook | contrôle exécuté sur un événement, sans prompt, qui peut laisser passer ou refuser ; slide « Définition d'un hook » | 03 | crochet, callback |
| hook du harnais | hook que le harnais exécute avant ou après un appel d'outil de l'agent de code ; slide « Définition d'un hook du harnais » | 03 | plugin (pour la notion), hook de l'agent |
| hook git | script que git exécute avant une opération ; un code de retour non nul l'annule ; slide « Définition d'un hook git » | 03 | hook seul pour git, crochet git |
| CI | sigle d'intégration continue : serveur qui exécute des workflows à chaque événement du dépôt ; slide « Définition d'un workflow » | 03 | pipeline (pour le serveur), intégration continue après la définition |
| workflow | fichier YAML qui décrit les jobs d'une CI et l'événement qui les lance ; slide « Définition d'un workflow » | 03 | pipeline, flux |
| job de CI | suite d'étapes d'un workflow ; slide « Définition d'un job de CI » | 03 | tâche, job seul |
| journal de CI | sortie texte d'un job de CI, lue ligne par ligne ; slide « Définition d'un job de CI » | 03 | log, build |
| branche principale | branche vers laquelle les pull requests sont fusionnées (`main`) ; le job y lit le réviseur et les règles ; slide « Règles lues sur main » | 03 | branche par défaut, master |
| analyse d'échec | job qui lit le journal de CI d'un job en échec et commente la cause avec un correctif proposé ; slide « Définition d'une analyse d'échec » | 03 | diagnostic, post-mortem |
| jeton du job | droits que le workflow accorde au job sur le dépôt (`permissions`) ; slide « Quatre garde-fous d'un job » | 03 | jeton seul, token |
| budget | garde-fou de durée et de tours posé à un job ; slide « Quatre garde-fous d'un job » | 03 | limite, plafond |
| archive du job | fichiers que le job conserve après son exécution ; slide « Quatre garde-fous d'un job » | 03 | artefact (déjà pris), pièce jointe |
| injection de prompt | texte lu par l'agent de code qui contient une instruction que l'agent suit ; slide « Injection de prompt par issue » | 03 | prompt injection, piratage du prompt |
| règle des deux | une session réunit au plus deux propriétés parmi : entrée non fiable, accès sensible, action vers l'extérieur ; slide « La règle des deux » | 03 | rule of two |
| entrée non fiable | texte rédigé par un tiers que l'agent de code lit (diff, issue, commentaire) ; slide « La règle des deux » | 03 | donnée externe, input |
| accès sensible | secret, donnée privée ou droit d'écriture auquel la session a accès ; slide « La règle des deux » | 03 | droit sensible |
| action vers l'extérieur | écriture ou envoi hors de la session (commentaire, push, requête réseau) ; slide « La règle des deux » | 03 | exfiltration (pour la notion), sortie |
| emplacement (de contrôle) | endroit où un contrôle s'exécute : hook du harnais, hook git, job de CI, humain ; slide « Quatre emplacements de contrôle » | 03 | étape, niveau |

## Modèles locaux (module 4)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| modèle distant | modèle hébergé hors du poste, appelé par le réseau (Claude Sonnet 4.6 par l'abonnement Anthropic ou par Amazon Bedrock) | 04 | modèle cloud, API |

## Hors slides

Ces mots désignent la situation de formation et restent dans les notes : stagiaire, formateur, salle, séance, journée. Une slide parle du sujet, pas du public.
