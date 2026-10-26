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
| prompt | texte envoyé au modèle ; ses quatre composants : rôle, contexte, instruction, format | 01 | invite, requête, demande, consigne, instruction (pour l'ensemble) |
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
| règle d'équipe | phrase de `AGENTS.md` qui dit quoi faire, sans vérification ni exemple ; slide « Les règles d'équipe de tickets-api » | 02 | convention, règle de revue (pour la phrase d'`AGENTS.md`) |
| règle de revue | énoncé que le diff peut violer, avec vérification, exemple de violation, exemple conforme et sévérité ; slide « Définition d'une règle de revue » | 02 | convention, check |
| vérification (d'une règle) | ce que la revue lit pour décider si le diff viole la règle ; slide « Définition d'une règle de revue » | 02 | contrôle, test (pour la vérification) |
| reviewer | sous-agent en lecture seule qui applique les règles de revue et rend des findings, identifiant `reviewer` ; slide « Définition d'un reviewer » | 02 | réviseur, relecteur, agent de revue |
| identifiant émis | jeton, mot de passe ou clé délivré par un fournisseur, distinct d'une valeur factice de test ; slide « Corriger la règle » | 02 | secret (pour la valeur factice), credential |
| scénario d'échec | entrée concrète qui produit le défaut décrit par le finding ; slide « Le scénario d'échec » | 02 | cas de test, exemple de défaut |
| mode de revue | moment où le reviewer tourne : à la demande, sur la pull request, avant le commit ; slide « Trois modes de revue » | 02 | niveau, étape |
| faux positif | finding sur un code conforme ; slide « Définition d'un faux positif » | 02 | fausse alerte, faux finding |
| Code Review | service hébergé d'Anthropic qui relit les pull requests GitHub, distinct de la commande `/code-review` ; slide « Code Review hébergé » | 02 | revue d'Anthropic, /review (pour le service) |
| contradicteur | sous-agent chargé de prouver qu'un finding est faux ; slide « Définition d'un contradicteur » | 02 | avocat du diable, vérificateur adverse |
| verdict | réponse du contradicteur : confirmé, plausible ou réfuté, avec preuve ; slide « Trois verdicts » | 02 | décision, résultat |
| revue adverse | revue suivie d'un contradicteur par finding de sévérité haute ; slide « Lancer la revue adverse » | 02 | passage adverse, revue simple (pour la revue sans contradicteur : « revue sans contradicteur ») |

## Hooks et pipeline (module 3)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| contrôle | ce qu'un hook exécute (ou un job de CI) pour laisser passer ou refuser une modification (gitleaks, ruff, tests, reviewer) ; distinct de la vérification d'une règle de revue ; slide « Définition d'un hook » | 03 | vérification (pour le hook ou le job), check |
| événement | moment où une commande démarre (appel d'outil, commit, événement du dépôt : `pull_request`, `workflow_run`) ; « job » est réservé à la section CI ; slide « Définition d'un hook » | 03 | déclencheur, trigger |
| hook | contrôle qu'un événement lance, sans que le modèle décide de le lancer ; il laisse passer ou refuse ; slide « Définition d'un hook » | 03 | crochet, callback |
| hook du harnais | hook que le harnais exécute avant ou après un appel d'outil de l'agent de code ; slide « Définition d'un hook du harnais » | 03 | plugin (pour la notion), hook de l'agent |
| hook git | script que git exécute avant une opération ; un code de retour non nul l'annule ; slide « Définition d'un hook git » | 03 | hook seul pour git, crochet git |
| CI | sigle d'intégration continue : serveur qui exécute des workflows à chaque événement du dépôt ; slide « Définition d'un workflow » | 03 | pipeline (pour le serveur), intégration continue après la définition ; `ci` seul désigne le workflow de ce nom : écrire « le workflow `ci` » |
| workflow | fichier de configuration YAML qui décrit des jobs de CI et l'événement qui les lance ; slide « Définition d'un workflow » | 03 | pipeline (exception : le titre du module « Hooks et pipeline », figé par le programme, n'est employé nulle part ailleurs), flux |
| job de CI | suite d'étapes d'un workflow ; slide « Définition d'un job de CI » | 03 | tâche ; « job » seul est admis après cette slide, comme « CI » |
| journal de CI | sortie texte d'un job de CI, lue ligne par ligne ; slide « Définition d'un job de CI » | 03 | log, build |
| branche principale | branche vers laquelle les pull requests sont fusionnées (`main`) ; le job y lit le reviewer et les règles ; slide « Définition d'un workflow » | 03 | branche par défaut, master |
| analyse d'échec | job qui lit en lecture seule le journal de CI d'un job en échec ; une étape sans agent de code publie la cause et un correctif proposé ; slide « Définition d'une analyse d'échec » | 03 | diagnostic, post-mortem |
| jeton du job | droits que le workflow accorde au job sur le dépôt (`permissions`) ; slide « Quatre éléments d'un job » | 03 | jeton seul, token |
| budget | garde-fou de durée posé à un job (`timeout-minutes`) ; il borne aussi les tours de l'agent de code, slide « Borner le budget » ; slide « Quatre éléments d'un job » | 03 | limite, plafond |
| archive du job | fichiers que le job conserve après son exécution ; slide « Quatre éléments d'un job » | 03 | artefact (déjà pris), pièce jointe |
| emplacement (de contrôle) | endroit où un contrôle s'exécute : hook du harnais, hook git, job de CI, humain ; slide « Quatre emplacements de contrôle » | 03 | étape, niveau |
| changements indexés | modifications ajoutées par `git add`, que `git commit` va enregistrer et que le hook git lit ; slide « Le reviewer avant le commit » | 03 | diff indexé, staged (pour la notion) |
| diagnostiqueur | sous-agent en lecture seule qui lit un journal de CI et rend la cause avec un correctif en diff ; slide « Définition d'une analyse d'échec » | 03 | analyseur, debugger |
| migration | fichier versionné qui fait évoluer le schéma de la base ; une colonne ajoutée au modèle sans migration fait échouer les tests ; slide « Journal d'un job en échec » | 03 | script SQL, évolution de schéma |
| pull request en brouillon | pull request que son auteur marque non prête à relire (état `draft` de GitHub) ; le job de revue ne la lit pas ; slide « Revue sur pull request » | 03 | WIP, pull request incomplète |
| runner | machine qui exécute un job de CI (`runs-on`) ; slide « Définition d'un job de CI » | 03 | exécuteur, agent de CI |

## Modèles locaux (module 4)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| modèle distant | modèle hébergé chez un fournisseur, hors du réseau de l'équipe (Claude Sonnet 4.6 par l'abonnement Anthropic ou par Amazon Bedrock, ou tout modèle d'un fournisseur) ; slide « Définition d'un modèle local » | 04 | modèle cloud, API |
| modèle local | modèle exécuté sur une machine de l'équipe ; le prompt ne quitte pas le réseau de l'équipe ; slide « Définition d'un modèle local » | 04 | modèle on-premise, modèle embarqué |
| poids | nombres appris du modèle, relus à chaque token (modèle dense) ; taille en mémoire = paramètres × octets par paramètre ; slide « Définition d'un poids » | 04 | coefficients, weights |
| paramètre (du modèle) | un des nombres du modèle, distinct du paramètre d'un outil MCP ; slide « Définition d'un poids » | 04 | paramètre seul |
| quantification | stockage des poids sur moins de bits (4 au lieu de 16) pour réduire la mémoire ; slide « Quantification des poids » | 04 | compression, quantisation |
| petit modèle | modèle de quelques milliards de paramètres, local ou distant ; slide « Définition d'un petit modèle » | 04 | modèle léger, SLM |
| distillation | entraînement d'un petit modèle sur les réponses d'un modèle plus grand ; slide « Définition d'un petit modèle » | 04 | compression de modèle |
| mixture d'experts | modèle dont chaque token n'active qu'une partie des poids ; slide « Définition d'une mixture d'experts » | 04 | MoE |
| expert | bloc de poids d'une mixture d'experts, activé ou non selon le token ; slide « Définition d'une mixture d'experts » | 04 | sous-modèle, spécialiste |
| modèle dense | modèle dont chaque token relit tous les poids ; slide « Définition d'une mixture d'experts » | 04 | modèle classique |
| grand modèle | modèle auquel le routage renvoie les cas que le petit modèle ne sait pas traiter (Claude Sonnet 4.6) ; slide « Routage vers le grand modèle » | 04 | modèle frontier, gros modèle |
| bande passante (mémoire) | quantité de données que la mémoire envoie au processeur par seconde, en Go/s ; slide « Vitesse maximale d'un modèle » | 04 | débit mémoire, bande passante seule |
| vitesse de génération | nombre de tokens produits par seconde ; slide « Vitesse maximale d'un modèle » | 04 | débit, tokens par seconde (pour la notion) |
| cache de la fenêtre de contexte | données gardées en mémoire pour chaque token déjà lu ou produit ; slide « Mémoire d'un modèle » | 04 | cache du contexte, KV cache |
| mémoire unifiée | mémoire partagée par le processeur et la carte graphique ; slide « Machines individuelles » | 04 | mémoire partagée |
| inférence | exécution du modèle pour produire des tokens ; slide « Trois couches d'un modèle local » | 04 | exécution, run |
| moteur d'inférence | programme qui exécute le modèle (llama.cpp) ; slide « Trois couches d'un modèle local » | 04 | runtime, backend |
| format de poids | fichier qui stocke les poids (GGUF) ; slide « Trois couches d'un modèle local » | 04 | format de modèle |
| serveur d'API | programme qui expose le modèle par une adresse compatible avec l'API OpenAI ; slide « Trois couches d'un modèle local » | 04 | serveur compatible OpenAI, endpoint |
| modèle ouvert | modèle dont les poids sont publiés ; slide « Scores sur SWE-bench Pro » | 04 | open source (pour un modèle), open weights |
| benchmark | jeu de tâches avec une méthode de notation ; un score porte une date et un harnais ; slide « Définition d'un benchmark » | 04 | test de référence, classement |
| taux d'accord | part des issues dont la réponse égale celle de l'équipe ; slide « Mesurer le taux d'accord » | 04 | précision, accuracy |
| trieur | agent qui range une issue dans une étiquette d'une liste fermée ; slide « Définition d'un trieur » | 04 | classifieur, tri |
| étiquette | catégorie d'une liste fermée dans laquelle le trieur range une issue (bug, fonctionnalité, question, inconnu) ; slide « Définition d'un trieur » | 04 | label, classe |
| liste fermée | ensemble fixe de valeurs que la réponse du trieur ne peut pas dépasser ; slide « Définition d'un trieur » | 04 | liste exhaustive |
| serveur d'équipe | machine partagée de l'équipe, dont le réseau garde le prompt, qui traite les prompts de plusieurs développeurs à la fois ; slide « Définition d'un serveur d'équipe » | 04 | serveur local, serveur partagé |
| fournisseur | organisation qui héberge un modèle distant (Anthropic, Amazon Bedrock) ; slide « Lieux d'exécution d'un modèle » | 04 | cloud, hébergeur (sauf pour un serveur loué) |
| poste | ordinateur du développeur ; slide « Lieux d'exécution d'un modèle » | 04 | machine locale, laptop |
| machine de l'équipe | ordinateur que l'équipe contrôle : un poste ou un serveur d'équipe, l'endroit où s'exécute un modèle local ; slide « Lieux d'exécution d'un modèle » | 04 | machine locale |
| serveur loué | serveur de calcul loué à un hébergeur, hors du réseau de l'équipe ; sert de repère de coût d'un serveur d'équipe ; slide « Définition d'un serveur loué » | 04 | serveur d'équipe (pour cette notion), cloud GPU |
| confiance | champ de la réponse du trieur, haute ou basse ; slide « Définition d'un trieur » | 04 | score, certitude |
| sortie imposée | réponse contrainte à un schéma JSON ; slide « Sortie imposée par un schéma » | 04 | sortie structurée |
| trieur-distant | second agent identique au trieur, dont le modèle est le grand modèle ; reçoit les issues routées ; slide « Routage vers le grand modèle » | 04 | trieur de repli |
| routage | envoi d'une tâche au grand modèle quand le petit modèle ne sait pas la traiter ; slide « Routage vers le grand modèle » | 04 | cascade, fallback |

## Vocabulaire des démonstrations

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| dépôt de session | dépôt privé sur GitHub, copie miroir du dépôt de référence, variable `$TARGET` | 01 | dépôt de test, dépôt cible, fork |
| copie de travail | clone local du dépôt de session sur le poste, variable `$WORK` | 01 | clone local, répertoire de travail |
| faux `gh` | exécutable `gh` factice placé en tête du `PATH` | 01 | mock de gh, gh simulé |
| session interactive | utilisation de l'agent dans son interface en ligne de commande | 01 | TUI |
| processus d'arrière-plan | programme qui continue de tourner sans terminal attaché | 01 | démon, daemon |

## Hors slides

Ces mots désignent la situation de formation et restent dans les notes : stagiaire, formateur, salle, séance, journée. Une slide parle du sujet, pas du public.
