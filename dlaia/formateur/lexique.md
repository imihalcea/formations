# Lexique

Vocabulaire de référence du support. Une notion a un seul nom, celui de la colonne « Terme » ; les slides, les notes et les énoncés l'emploient sous cette forme et sous aucune autre. Un terme entre au lexique avec le plan du module qui l'introduit, et la slide qui le définit précède toute slide qui l'emploie. Un module ne redéfinit pas un terme d'un module antérieur : il le reprend tel quel. Une notion absente du lexique ne s'emploie pas comme notion : soit elle y entre, soit la phrase se reformule avec les termes existants.

La colonne « Introduit » donne le module de la première définition. La colonne « À ne pas employer » liste les synonymes, anglicismes et variantes à remplacer par le terme. Les noms de fichiers, de commandes et d'identifiants (`spec.md`, `/speckit-plan`, `claude-sonnet-4-6`) gardent leur forme d'origine et ne figurent pas ici. Les sigles (LLM, ADR, EARS, TDD, BDD) sont développés une fois, sur la slide qui les définit, puis employés seuls.

Les définitions ci-dessous sont provisoires jusqu'au plan du module concerné, qui les confirme ou les corrige. La carte mentale (`support/carte-mentale.yaml`) reprend ces définitions en fin de rédaction.

## Produits et noms propres

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| Claude Code | agent de code en ligne de commande d'Anthropic | 00 | Claude (pour l'outil), ClaudeCode, claude hors commande |
| Open Code | agent de code libre en ligne de commande, version 2 sur la VM | 00 | OpenCode, opencode hors commande |
| Spec Kit | outil de GitHub qui installe dans l'agent les commandes du Spec Driven Development | 02 | SpecKit, spec-kit, specify (pour l'outil entier) |
| Claude Sonnet 4.6 | modèle unique de la formation, identifiant `claude-sonnet-4-6` | 00 | Sonnet seul, Claude 4.6, le modèle d'Anthropic |
| bookit | projet fil rouge : application de réservation de ressources | 00 | Bookit, l'application ou le projet sans son nom |
| fil rouge | projet bookit repris de TP en TP | 00 | projet d'exemple, cas d'école |

## Domaine bookit (module 3, règles et codes de refus dès le module 1)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| ressource | ce qui se réserve : salle, équipement ou personne ; connaît ses réservations confirmées | 03 (sens courant dès le 01) | salle (pour la notion), asset, objet réservable |
| demande de réservation | une ressource visée, un début et une fin, soumise à bookit ; « demande » seule une fois définie | 03 | requête, booking, réservation (avant décision) |
| créneau | intervalle entre un début et une fin, début inclus et fin exclue ; deux créneaux jointifs ne se chevauchent pas | 03 | plage, slot, intervalle, période |
| réservation confirmée | demande acceptée et enregistrée sur sa ressource ; « réservation » seule une fois définie | 03 | booking, réservation existante, occupation |
| décision | résultat de la validation d'une demande : acceptée, ou refusée avec un code | 03 | résultat, verdict, réponse (pour la décision) |
| code de refus | identifiant de la règle enfreinte, un par règle : `duration`, `hours`, `lead_time`, `horizon`, `overlap` | 01 | code d'erreur, erreur, motif |
| instant courant | moment auquel la demande est jugée, fourni en entrée à la validation | 03 (sens courant dès le 01) | maintenant, now (hors code), heure système, date du jour |
| règle métier | contrainte du domaine que toute réservation respecte, numérotée REG-NN ; devient une exigence dans la spécification | 01 | règle de gestion, contrainte métier, business rule |

## Modèle et agent (module 1)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| génération (d'assistance) | une des quatre étapes de l'assistance au code : complétion de l'IDE, suggestion dans l'éditeur, assistant conversationnel, agent | 01 | vague, ère, phase |
| LLM | modèle de langage qui produit du texte token par token à partir d'un contexte ; « modèle » seul une fois le sigle défini | 01 | grand modèle de langage, IA (pour le modèle), réseau de neurones |
| token | unité de texte que le modèle lit et produit, comptée dans la fenêtre et facturée | 01 | jeton, mot, caractère |
| fenêtre de contexte | tout ce que le modèle lit pour produire une réponse, de taille bornée | 01 | contexte seul (pour la fenêtre), context window, mémoire |
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

## Spec Driven Development (module 2)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| Spec Driven Development | méthode où une spécification écrite précède et pilote le plan, les tâches et le code ; « SDD » une fois le sigle défini | 02 | développement piloté par la spécification, spec-first, approche spec |
| workflow | suite ordonnée des étapes du SDD, chacune produisant un artefact relu par un humain | 02 | pipeline, processus, cycle, chaîne |
| spécification | ce que le logiciel doit faire et pourquoi, sans dire comment ; fichier `spec.md` | 02 | spec hors nom de fichier, cahier des charges, exigences (pour l'ensemble) |
| exigence | une phrase vérifiable de la spécification, numérotée REG-NN dans bookit | 02 | requirement, règle (pour une exigence), critère |
| QUOI et COMMENT | partage entre la spécification (QUOI) et le plan (COMMENT) | 02 | what et how, fond et forme, besoin et solution |
| ADR | note qui trace une décision d'architecture, son contexte et ses conséquences ; « architecture decision record » développé une fois | 02 | décision seule, RFC, note de conception |
| EARS | syntaxe d'exigence en une phrase à mots-clés (WHEN, IF, SHALL) ; développé une fois | 02 | syntaxe structurée, exigence formelle |
| Gherkin | syntaxe de scénario Given, When, Then, exécutable avec pytest-bdd | 02 | cucumber, BDD (pour le format), feature (pour la syntaxe) |
| scénario | un cas d'une exigence écrit en Gherkin : contexte, action, résultat | 02 | exemple, cas de test, test (pour le scénario) |
| commande Spec Kit | prompt versionné, invoqué `/speckit-x` sous Claude Code et `/speckit.x` sous Open Code | 02 | slash command, skill speckit, étape (pour la commande) |

## Constitution et architecture (module 3)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| constitution | fichier `.specify/memory/constitution.md` : principes que chaque plan et chaque diff respectent | 03 | charte, règles du projet, guidelines, convention |
| principe | une règle de la constitution, vérifiable sur un diff | 03 | règle (pour un principe), invariant seul, contrainte |
| architecture implicite | structure que l'équipe connaît sans l'avoir écrite, invisible pour l'agent | 03 | architecture tacite, non-dit |
| architecture hexagonale | domaine au centre, ports, adaptateurs à l'extérieur ; les dépendances pointent vers le domaine | 03 | ports et adaptateurs, onion, clean architecture (différente) |
| couche | ensemble de modules de même rôle : domaine, application, infrastructure | 03 | niveau, tier, strate |
| frontière | règle qui dit quelle couche peut dépendre de quelle autre | 03 | limite, séparation, barrière |

## Spécifier (module 4)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| fichier de contexte | `AGENTS.md`, lu par l'agent au lancement de chaque session | 04 | fichier de règles, mémoire, fichier d'instructions, CLAUDE.md (absent du fil rouge) |
| skill | dossier `.claude/skills/<nom>/SKILL.md` : savoir-faire chargé à la demande, lu par les deux outils | 04 | compétence, extension, plugin, command |
| brouillon | spécification produite par `/speckit-specify`, avant `clarify` | 04 | première version, draft, ébauche |
| clarification | question posée par `/speckit-clarify` et réponse consignée dans la spécification | 04 | ambiguïté levée, question ouverte, précision |

## Personnaliser, planifier, découper (module 5)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| template | gabarit Markdown d'un artefact Spec Kit (`spec`, `plan`, `tasks`, `constitution`) | 05 | modèle (pour template), gabarit, squelette |
| surcharge | fichier de `.specify/templates/overrides/` qui remplace un template du cœur | 05 | override, personnalisation, patch |
| plan | artefact `plan.md` : le COMMENT, sous contrôle de la constitution | 05 | design, conception, architecture (pour le plan) |
| tâche | ligne de `tasks.md` : incrément vérifiable seul, une tâche par session | 05 | ticket, étape, story, item |
| analyse | passe `/speckit-analyze` de cohérence entre spécification, plan et tâches | 05 | audit, revue, vérification (pour analyze) |

## Implémenter et vérifier (module 6)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| TDD | test écrit avant le code : rouge, vert, remaniement ; développé une fois | 06 | test-first, tests d'abord |
| BDD | scénarios Gherkin exécutés comme tests ; développé une fois | 06 | tests comportementaux, spécification exécutable |
| couverture | part du code exécutée par les tests | 06 | coverage, taux de test |
| mutation testing | modification automatique du code pour vérifier qu'un test échoue ; outil cosmic-ray | 06 | test de mutation, mutation seule |
| mutant | une version modifiée du code ; tué si un test échoue, survivant sinon | 06 | mutation (pour un mutant), variante |
| converger | répéter implémenter, tester, corriger jusqu'à toutes les tâches faites et les tests verts (définition à confirmer par le relevé Spec Kit) | 06 | boucler, itérer, finaliser |

## Contexte, sécurité et choix des outils (module 7)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| lost in the middle | baisse d'attention du modèle sur le milieu d'un long contexte | 07 | effet de milieu, dilution |
| cache de prompt | réutilisation d'un préfixe de contexte déjà traité, facturé moins cher | 07 | caching, mise en cache, prompt caching |
| unité de travail | ce qu'une session traite d'un bout à l'autre : une tâche, son contexte, sa vérification | 07 | lot, itération, sprint, incrément |
| dépendance hallucinée | paquet inventé par le modèle, parfois enregistré par un attaquant | 07 | slopsquatting (à définir si employé), paquet fantôme |
| fichier de règles piégé | fichier de contexte ou skill contenant une instruction malveillante | 07 | prompt injection (à définir si employé), fichier empoisonné |
| coût total | prix des tokens, temps de relecture et risque, additionnés | 07 | TCO, coût réel |

## Lucidité et clôture (module 8)

| Terme | Définition | Introduit | À ne pas employer |
|---|---|---|---|
| productivité ressentie | gain estimé par le développeur, comparé au gain mesuré | 08 | impression, perception |
| dette de relecture | code généré plus vite qu'il n'est relu | 08 | dette de revue, backlog de review |
| atrophie des compétences | perte de pratique du développeur qui délègue | 08 | déqualification, deskilling |
| signataire | le développeur répond du code qu'il livre, généré ou non | 08 | responsable, owner, garant |
| orchestrateur | développeur qui cadre, délègue et vérifie au lieu d'écrire chaque ligne | 08 | chef d'orchestre, superviseur, pilote |

## Hors slides

Ces mots désignent la situation de formation et restent dans les notes et les énoncés : stagiaire, formateur, salle, VM, séance, journée. Une slide parle du sujet, pas du public.
