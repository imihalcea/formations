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
| alias (de modèle) | nom court d'un modèle (`sonnet`) dont la version change avec le fournisseur ; slide « Claude Sonnet 4.6, modèle unique » | 00 | raccourci, surnom |
| Claude Sonnet 4.6 | modèle unique de la formation, identifiant `claude-sonnet-4-6` | 00 | Sonnet seul, Claude 4.6, le modèle d'Anthropic |
| Amazon Bedrock | service d'Amazon Web Services qui héberge des modèles ; Open Code l'appelle pour Claude Sonnet 4.6 (Claude Code passe par l'abonnement Anthropic) ; slide « Claude Sonnet 4.6, modèle unique » (étiquette du schéma) | 00 | Bedrock seul, AWS Bedrock |
| fichier de contexte | fichier lu par l'agent de code au lancement : `CLAUDE.md` (Claude Code), `AGENTS.md` (Open Code) ; slide « Choisir l'agent de code » | 00 | fichier d'instructions, mémoire |
| limitation | ce que l'agent de code ne dépasse pas seul, même avec une spécification et un harnais ; slide « Définition d'une limitation » | 00 | goulot, blocage, plafond (pour la notion) |
| démonstration | exécution commentée, en direct, d'une tâche confiée à l'agent de code, jouée par le formateur ; slide « Une démonstration » | 00 | démo, TP, atelier |
| tickets-api | dépôt de démonstration commun aux modules 1 à 3 ; slide « Le dépôt tickets-api » | 00 | fil rouge, bookit |
| dépôt | répertoire versionné du projet | DLAIA | repo, projet (pour le dépôt) |
| spécification | document versionné qui écrit l'intention d'une fonctionnalité avant le code | DLAIA | cahier des charges, specs |
| pull request | demande de fusion d'une branche dans une autre, relue avant fusion | DLAIA | PR, merge request |
| archive | `dlaia-avance.zip` : le support et les dossiers `demos/` ; slide « Contenu de l'archive » | 00 | zip, paquet |
| support | cours compilé, `dlaia-avance.html` ; slide « Contenu de l'archive » | 00 | slides (pour l'ensemble), présentation |

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
