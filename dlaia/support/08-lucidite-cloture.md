# Lucidité et clôture

Gain mesuré, relecture, compétence et rôle du développeur

::: notes
Module 8, 45 min d'exposé, sans TP ni démonstration. Point de départ : l'idée clé du module 7, « Chaque équipe mesure sur son dépôt ce que l'agent lui coûte », et deux questions que ses notes laissent ouvertes : la mesure à l'échelle du développeur (productivité ressentie et mesurée) et la responsabilité du signataire. La première section reprend la première question.
Vingt-quatre slides, quatre sections plus trois slides de glossaire : Mesurer, Relecture et compétence, Orchestrateur, Pour continuer. Si le temps manque, les slides 5 (suivi METR) et 12 (deux usages, deux scores) passent dans les notes.
Tous les chiffres d'études ont été relevés dans les sources le 23 octobre 2026. Les études portent sur des modèles et des outils de 2025 : dater chaque chiffre à voix haute.
Vocabulaire : « outil d'assistance » pour les produits des études citées, « agent » pour l'objet de la formation, « IA » seulement dans les noms d'enquêtes. La feuille de route personnelle se remplit sur papier, sans fichier ni commit. La slide de clôture (`99-cloture.md`) enchaîne sur le bilan et l'évaluation (30 min).
:::

## Productivité ressentie ou mesurée {kicker="Mesurer"}

| Mesure | Qui la produit | Exemple (illustration) |
|---|---|---|
| Productivité attendue | le développeur prévoit le gain avant la tâche | « cette tâche prendra deux heures » |
| Productivité ressentie | le développeur estime le gain après coup | « la session m'a fait gagner une heure » |
| Productivité mesurée | un chronomètre relève le gain sur des tâches comparables | `git log --format='%ci %s'` comparé à l'estimation d'avant |

Le module 7 a mesuré le coût d'une session ; reste à mesurer le gain.

::: sources
- Module 7, « Le coût total » (support de la formation)
:::

::: notes
Définitions du lexique portées par les trois lignes du tableau. Question à poser en salle : « combien de temps a pris la dernière tâche sans agent ? » Aucune réponse attendue : la difficulté de répondre est le sujet. L'écart entre deux commits mélange le temps de l'agent, de la relecture et des pauses (module 7) : un ordre de grandeur. Une mesure fiable demande une estimation faite avant la tâche et des tâches comparables.
:::

## Une étude de METR {kicker="Mesurer"}

En 2025, METR (Model Evaluation & Threat Research, organisme d'évaluation des modèles) fait travailler des développeurs expérimentés sur leurs propres dépôts.

| Effectif de l'étude | Valeur |
|---|---|
| Développeurs | 16 |
| Tâches | 246 |
| Taille des dépôts | plus d'un million de lignes |

Un outil d'assistance est un produit d'assistance au code utilisé dans une étude.

::: sources
- [METR, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
:::

::: notes
Définition du lexique portée par la dernière phrase (l'outil d'assistance est un assistant conversationnel ou un agent). Source consultée le 23 octobre 2026 : 16 développeurs expérimentés, 246 tâches (bogues, fonctionnalités, remaniements). Dépôts matures : plus de 22 000 étoiles GitHub en moyenne et plus d'un million de lignes. Outil d'assistance principal : Cursor Pro avec Claude 3.5 et 3.7 Sonnet.
:::

## Essai randomisé de METR {kicker="Mesurer"}

Dans un essai randomisé, le hasard décide quelle tâche reçoit l'outil d'assistance.

![Quatre tâches d'un dépôt, illustration : chacune est tirée au sort vers « avec outil d'assistance » ou « sans outil d'assistance », puis le temps de résolution des deux groupes de tâches est comparé](images/08-essai.svg)

::: sources
- [METR, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [Becker et al., arXiv:2507.09089](https://arxiv.org/abs/2507.09089)
:::

::: notes
Définition du lexique portée par la phrase. Chaque tâche est tirée au sort entre « outil d'assistance autorisé » et « interdit ». Les tâches de l'illustration sont inventées.
Intérêt du tirage au sort : le développeur ne choisit pas les tâches faciles pour l'outil d'assistance, donc la différence de temps vient de lui et non du choix des tâches.
:::

## Attendu, ressenti, mesuré {.figures kicker="Mesurer"}

- **+24 %** productivité attendue avant
- **+20 %** productivité ressentie après
- **+19 %** temps de travail mesuré en plus

METR, début 2025

::: sources
- [METR, Early-2025 AI study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [Becker et al., arXiv:2507.09089](https://arxiv.org/abs/2507.09089)
:::

::: notes
Lire les trois chiffres dans l'ordre : avant l'essai les développeurs prévoient de gagner 24 % de temps ; après, ils estiment en avoir gagné 20 % ; le chronomètre relève des tâches 19 % plus longues avec l'outil d'assistance. Les deux premiers chiffres sont de la productivité ressentie, le troisième de la productivité mesurée. Source primaire (arXiv) : les experts en économie prévoyaient 39 % et ceux en apprentissage automatique 38 %. Intervalle de confiance à 95 % de l'écart mesuré : de +2 % à +39 % (page de METR sur le suivi de 2026). Effectifs : 16 développeurs, 246 tâches. Modèles de début 2025 : le résultat ne dit rien des modèles actuels, ce que la slide suivante précise. Les auteurs ont examiné vingt facteurs possibles (taille du dépôt, exigences de qualité, expérience de l'outil) et jugent peu probable qu'un artefact de l'essai explique la lenteur ; ils ne l'écartent pas totalement.
:::

## Le suivi METR de 2026 {kicker="Mesurer"}

| Étude | Résultat | Limite |
|---|---|---|
| Essai de 2025 | tâches 19 % plus longues avec outil d'assistance | un seul essai, début 2025 |
| Suivi, publié en 2026 | aucun chiffre fiable sur le gain | des développeurs écartent les tâches qu'ils refusent de faire sans outil d'assistance |
| Suivi, développeurs de 2025 revenus | tâches 18 % plus courtes, intervalle de −38 % à +9 % | l'intervalle contient zéro |

::: sources
- [METR, We are Changing our Developer Productivity Experiment Design, 24 février 2026](https://metr.org/blog/2026-02-24-uplift-update/)
:::

::: notes
Page de METR consultée le 23 octobre 2026, datée du 24 février 2026. METR qualifie ses données de « signal peu fiable » de l'effet actuel : des développeurs refusent de participer s'ils doivent travailler sans l'outil (biais probable vers un gain sous-estimé), la rémunération est passée de 150 à 50 $ l'heure, 30 à 50 % des développeurs disent avoir écarté des tâches, le temps est difficile à relever quand l'agent tourne pendant que le développeur fait autre chose. Sous-groupes (négatif = gain, positif = ralentissement) : étude de 2025 +19 % (intervalle +2 % à +39 %) ; développeurs de 2025 revenus −18 % (−38 % à +9 %) ; nouveaux développeurs −4 % (−15 % à +9 %). Les intervalles contiennent zéro. METR estime que les développeurs gagnent probablement plus qu'en début 2025 (« we believe it is likely that developers are more sped up from AI tools now ») et juge ses données « only very weak evidence for the size of this increase » (relu le 23 octobre 2026). L'essai de 2025 laissait les développeurs choisir leurs tâches avant le tirage au sort. Message à tenir : un chiffre de 2025 daté et un suivi qui ne conclut pas, ni pour ni contre l'outil d'assistance.
:::

## DORA : adoption et livraison {kicker="Mesurer"}

DORA (DevOps Research and Assessment) mène des enquêtes par questionnaire.

| Rapport | Débit de livraison (vitesse d'arrivée en production) | Stabilité de livraison (échecs et reprises) | Conclusion |
|---|---|---|---|
| 2024 | en baisse | en baisse | adoption d'outils d'assistance associée à un recul des deux |
| 2025 | en hausse | en baisse | l'outil d'assistance amplifie ce que l'organisation fait déjà |

Une enquête relève des associations, un essai randomisé établit une cause.

::: sources
- [DORA, State of AI-assisted Software Development 2025](https://dora.dev/research/2025/dora-report/)
- [Google Cloud, Announcing the 2025 DORA Report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)
- [DORA, Accelerate State of DevOps 2024](https://dora.dev/research/2024/dora-report/)
:::

::: notes
Définitions du lexique portées par les en-têtes du tableau et par la phrase sous le tableau (enquête : recueil d'avis par questionnaire). Formulation à tenir devant la salle : l'enquête relève des associations, l'essai randomisé établit une cause. Les enquêtes DORA interrogent des développeurs et des équipes. Rapport 2025 (billet Google Cloud du 23 septembre 2025, près de 5 000 répondants) : l'adoption s'associe positivement au débit et au produit, toujours négativement à la stabilité ; « AI's primary role is as an amplifier, magnifying an organization's existing strengths and weaknesses » (page dora.dev). Rapport 2024 : la page dora.dev indique que l'IA « negatively impacts software delivery stability and throughput » sans chiffre. Les chiffres 1,5 % de débit en moins et 7,2 % de stabilité en moins pour une hausse de 25 % d'adoption sont relayés par des sources secondaires (HashiCorp, RedMonk) et non confirmés dans le rapport primaire : à citer comme « relayés », ou à lire dans le rapport complet avant de les projeter. DORA a aussi déplacé le temps de reprise du côté du débit à partir de 2024 : comparer les années avec prudence.
:::

## La productivité ressentie peut contredire la productivité mesurée. {.statement kicker="Mesurer"}

::: notes
Conclut la section : le ressenti, l'essai randomisé, ses chiffres, la limite du suivi, l'enquête DORA. La mesure de l'équipe reprend le coût total du module 7 : tokens, temps de lecture des diffs, défauts passés, relevés sur son dépôt.
:::

## La dette de relecture {kicker="Relecture et compétence"}

![Deux courbes dans le temps, illustration : le code généré monte plus vite que le code relu ; la surface entre les deux est la dette de relecture](images/08-dette.svg)

Sur bookit, un commit par tâche borne la dette à une tâche.

::: sources
- Fil rouge bookit, trajectoire des TP
:::

::: notes
Définition du lexique portée par le schéma. Les courbes sont une illustration, sans chiffre. Un agent écrit un diff en minutes, un humain le relit à sa vitesse : sans commit par tâche, les diffs s'empilent et la relecture se fait sur un volume que personne ne tient. Rappel du module 6 : une session par tâche, relecture du diff avant le commit. Source : `formateur/fil-rouge.md`, trajectoire des TP (21 commits du TP 3 au TP 6).
:::

## Adoption et confiance {.figures kicker="Relecture et compétence"}

- **90 %** utilisent un outil d'assistance
- **3 %** confiance forte dans l'exactitude
- **46 %** défiance envers l'exactitude

Adoption massive, confiance faible : la relecture reste nécessaire.

::: sources
- [DORA, billet Google Cloud sur le rapport 2025](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)
- [Stack Overflow Developer Survey 2025, AI](https://survey.stackoverflow.co/2025/ai)
:::

::: notes
Le titre du plan était « Confiance dans le code généré » : la question de Stack Overflow porte sur l'exactitude de la sortie des outils d'IA, pas sur le code seul. Population différente selon la source : 90 % vient de DORA 2025, 3 % et 46 % de Stack Overflow 2025. Premier chiffre : DORA 2025, 90 % des répondants utilisent l'IA au travail ; la même source note que 30 % déclarent peu ou pas de confiance dans le code généré. Deuxième et troisième : Stack Overflow 2025, tous répondants : 3,1 % font une « grande confiance » à l'exactitude (2,7 % chez les professionnels), 46 % s'en défient (26,1 % « plutôt » et 19,6 % « fortement »). La même page donne 84 % d'utilisateurs ou futurs utilisateurs : l'écart avec les 90 % tient à la population et à la question. La confiance et la défiance sont mesurées séparément, le reste des répondants est entre les deux. Lecture : l'adoption est massive, la confiance faible, la relecture reste l'étape qui coûte.
:::

## Le signataire {kicker="Relecture et compétence"}

Le signataire répond du code qu'il livre, généré ou non.

```text
Valider la durée minimale (REG-01)

Assisted-by: LLM
Signed-off-by: Prénom Nom <prenom.nom@exemple.org>
```

Illustration, convention du noyau Linux.

Sur bookit, `git commit` est lancé par le développeur, jamais par l'agent.

::: sources
- [Documentation du noyau Linux, AI Coding Assistants](https://docs.kernel.org/process/coding-assistants.html)
- Fil rouge bookit, règle du commit par le développeur
:::

::: notes
Définition du lexique portée par la première phrase. La documentation du noyau (consultée le 23 octobre 2026) : « AI agents MUST NOT add Signed-off-by tags. Only humans can legally certify the Developer Certificate of Origin (DCO) » ; le soumis humain relit le code généré, vérifie la licence, ajoute son `Signed-off-by` et prend la responsabilité. L'outil se déclare par `Assisted-by`, au format donné par la page « Assisted-by: LLM [TOOL1] [TOOL2] » (outils d'analyse spécialisés, optionnels) ; exemple de la page : `Assisted-by: LLM coccinelle sparse`. À relire sur la page avant de projeter : la forme exacte de la ligne vient d'une lecture par outil de la page. Le message de commit et le nom sont une illustration pour bookit. Source interne de la règle du commit : `formateur/fil-rouge.md`. Le noyau Linux est un exemple de règle écrite, pas une obligation pour l'équipe.
:::

## L'atrophie des compétences {kicker="Relecture et compétence"}

L'atrophie des compétences est la perte de pratique du développeur qui délègue.

![Deux barres, score au test de compréhension : 50 % pour le groupe avec outil d'assistance, 67 % pour le groupe sans outil d'assistance ; Anthropic, test de compréhension](images/08-atrophie.svg)

::: sources
- [Anthropic, How AI assistance impacts the formation of coding skills](https://www.anthropic.com/research/AI-assistance-coding-skills)
:::

::: notes
Définition du lexique portée par la première phrase. Étude consultée le 23 octobre 2026 : essai randomisé sur 52 ingénieurs, pour la plupart juniors, qui apprennent la bibliothèque Python Trio (programmation asynchrone) puis passent un test de compréhension. Groupe avec outil : 50 % ; groupe sans : 67 % ; écart de 17 points, le plus grand sur les questions de débogage. L'étude émane d'Anthropic, ce qu'il faut dire en salle ; auteurs : Judy Hanwen Shen et Alex Tamkin. L'outil d'assistance est ici l'assistant conversationnel de la génération 3 du module 1, pas un agent. Effectif (52 ingénieurs) et bibliothèque (Trio) à donner à l'oral, ils ne figurent plus sur le schéma. Petit échantillon, une bibliothèque, une tâche d'apprentissage : un signal, pas une loi.
:::

## Deux usages, deux scores {kicker="Relecture et compétence"}

| Profil | Observation | Résultat |
|---|---|---|
| questions de compréhension | explique le code, questions conceptuelles | score de 65 % et plus |
| génération déléguée | dépendance croissante, débogage délégué à l'outil d'assistance | score de moins de 40 % |
| groupe avec outil d'assistance | temps gagné : environ deux minutes | non significatif |

::: sources
- [Anthropic, How AI assistance impacts the formation of coding skills](https://www.anthropic.com/research/AI-assistance-coding-skills)
:::

::: notes
Même étude : l'outil d'assistance ne fait pas le même effet selon l'usage. Profils à score élevé (65 % et plus) : génération puis compréhension, explication de code, questions conceptuelles. Profils à score bas (moins de 40 %) : délégation de la génération, dépendance croissante, débogage itératif par l'outil. Temps gagné par le groupe avec outil : environ deux minutes, différence non significative. Ce que le développeur délègue décide de ce qu'il retient : base des parades de la slide « Quatre parades contre l'atrophie ».
:::

## Quatre parades contre l'atrophie {kicker="Relecture et compétence"}

Une parade est une pratique de la méthode qui maintient la compétence du développeur.

| Parade | Pratique | Module |
|---|---|---|
| écrire l'intention | spécification et scénarios Gherkin | 4 |
| relire le diff d'une tâche | une tâche, un diff, un commit | 6 |
| classer les survivants | trou dans les tests ou mutant équivalent | 6 |
| pratique sans agent | une tâche par semaine écrite à la main (recommandation) | 8 |

::: sources
- Modules 4 et 6 (support de la formation)
:::

::: notes
Définition du lexique portée par la première phrase. Les trois premières lignes sont des pratiques vécues aux TP 4 et 6. La quatrième, « une tâche par semaine écrite à la main », est une recommandation de la formation : aucune source ne la chiffre, le dire en salle. Le lien avec l'étude : les profils à score élevé comprennent ce que l'outil produit, ce que ces pratiques imposent.
:::

## Le développeur signe un code qu'il doit encore savoir lire et corriger. {.statement kicker="Relecture et compétence"}

::: notes
Conclut la section : la dette de relecture, la confiance, le signataire, l'atrophie, les deux usages, les parades.
:::

## Le développeur devient orchestrateur {kicker="Orchestrateur"}

L'orchestrateur cadre, délègue et vérifie au lieu d'écrire chaque ligne.

![Trois colonnes. Cadrer : constitution et ADR, spécification, plan. Déléguer : tâches et implement. Vérifier : suite verte, diff, mutation.md](images/08-orchestrateur.svg)

::: sources
- [Addy Osmani, The Conductor to Orchestrator shift](https://addyosmani.com/blog/future-agentic-coding/)
- Modules 3 à 6 (support de la formation)
:::

::: notes
Définition du lexique portée par la phrase. Les trois colonnes sont les trois verbes du workflow vécu aux TP 3 à 6 : constitution et ADR au TP 3, spécification au TP 4, plan et tâches au TP 5, `implement`, suite verte et `mutation.md` au TP 6. Osmani (consulté le 23 octobre 2026) : « the role of the software engineer is evolving from implementer to manager » ; son « orchestrateur » coordonne plusieurs agents en parallèle, ce que la formation ne pratique pas. La définition de la slide est celle de la formation.
:::

## Les quatre points de contrôle {kicker="Orchestrateur"}

![Quatre points de contrôle du workflow, avec la question du développeur sous chacun : spécification, « est-ce le bon QUOI ? » ; plan, « le plan respecte-t-il la constitution ? » ; tâches, « la tâche est-elle vérifiable seule ? » ; diff, « le diff est-il signable ? »](images/08-controles.svg)

::: sources
- Module 2, « Le workflow » (support de la formation)
- [GitHub Spec Kit](https://github.com/github/spec-kit)
:::

Aucun point de contrôle après `tasks` ni après `implement` dans Spec Kit : le développeur crée celui des tâches vérifiables et celui du diff.

::: notes
Reprise du schéma `02-workflow.svg` du module 2, réduit aux points de contrôle. Les questions sont une illustration. À chaque point, le développeur approuve ou refuse ; c'est le travail qui reste. Le README de Spec Kit (consulté le 23 octobre 2026) demande de lancer les commandes une à une « reviewing each result before continuing ». Le workflow livré par Spec Kit 1.2.2 n'a que deux `gate`, `review-spec` avant le plan et `review-plan` avant les tâches (`formateur/spec-kit.md`, module 7) : l'orchestrateur crée celui des tâches vérifiables et celui du diff en relisant le diff de chaque tâche (la phrase sous le schéma le dit). Affirmer que cette posture demande plus de jugement qu'avant est une position de la formation, sans source chiffrée.
:::

## L'orchestrateur garde la décision à chacun des quatre points de contrôle. {.statement kicker="Orchestrateur"}

::: notes
Conclut les slides 15 et 16 : les trois verbes, les quatre questions.
:::

## bookit à l'arrivée du TP 6 {kicker="Pour continuer"}

Chaque point de contrôle a laissé un artefact versionné.

```console
$ git log --oneline | wc -l
21
$ ls .specify/memory specs/001-valider-reservation
.specify/memory:
constitution.md

specs/001-valider-reservation:
checklists  data-model.md  mutation.md  plan.md  quickstart.md
research.md  spec.md  tasks.md  valider-reservation.feature
```

::: sources
- Fil rouge bookit, trajectoire des TP ; `tp/tp06/` (corrigé)
:::

::: notes
État d'arrivée des deux jours : constitution, spécification, plan, tâches, tests et `mutation.md`, versionnés en 21 commits. Le `ls` est relevé sur le corrigé `tp/tp06/` (23 octobre 2026) ; le compte de 21 commits est l'attendu du TP 6 (source visible : trajectoire des TP, `formateur/fil-rouge.md`), le corrigé n'ayant pas d'historique git. Inviter à parcourir son propre `git log --oneline`. Les tests sont dans `tests/`, le code dans `bookit/domain/validate_booking.py`.
:::

## Suivre l'évolution des harnais {.compare kicker="Pour continuer"}

::: claude-code
```console
$ claude --version
$ claude update
```

Les installations natives se mettent à jour seules en arrière-plan ; `claude update` applique la mise à jour tout de suite.
:::

::: opencode
```console
$ opencode --version
$ opencode upgrade
```

`opencode upgrade` met à jour vers la dernière version ; `--major` passe à Open Code 2.
:::

::: sources
- [Claude Code, Changelog](https://code.claude.com/docs/en/changelog)
- [Claude Code, Advanced setup : Update manually](https://code.claude.com/docs/en/setup#update-manually)
- [Open Code, CLI : upgrade](https://opencode.ai/docs/cli/)
:::

::: notes
Idée du module 1 : le dépôt survit au harnais ; les harnais changent, les artefacts restent (le template refuse un texte libre dans une slide compare). Le rythme des versions n'est pas sourcé, ne pas l'affirmer. Claude Code (consulté le 23 octobre 2026) : le Changelog est généré depuis `CHANGELOG.md` du dépôt GitHub ; les installations natives se mettent à jour seules en arrière-plan, `claude update` applique la mise à jour tout de suite (page de la source « Update manually ») ; Journal des versions : page « Changelog » ; `claude --version` donne la version installée. `opencode --version` donne `v2.0.32` sur la machine (23 octobre 2026).  Open Code : `opencode upgrade [target]` met à jour vers la dernière version ou une version donnée ; `--major` passe à Open Code 2 en retirant Open Code 1 ; `--method` indique la méthode d'installation déjà utilisée (curl, npm, pnpm, bun, brew). La page de l'outil ne mentionne pas de journal des versions : aucune page de notes de version n'est citée côté Open Code, à chercher dans le dépôt de l'outil si la question est posée.
Spec Kit (page des releases `https://github.com/github/spec-kit/releases`, hors sources de la slide) est épinglé en 1.2.2 dans la formation (19 octobre 2026) ; la page des releases liste la 1.2.3 au 22 octobre 2026. Relire les notes de version avant de changer de version : les corrigés et les commandes sont refaits si l'épinglage change. Même précaution pour la version de Python (3.14).
:::

## Feuille de route personnelle {kicker="Pour continuer"}

Une feuille de route personnelle réunit quatre engagements écrits par le développeur pour son dépôt et sa pratique.

| Question | Ma réponse |
|---|---|
| Que vais-je mesurer sur mon dépôt ? | |
| Qu'est-ce que je relis toujours avant de signer ? | |
| Qu'est-ce que j'écris moi-même, sans agent ? | |
| Quel artefact de la méthode j'ajoute en premier à mon équipe ? | |

::: sources
- Modules 7 et 8 (support de la formation)
:::

::: notes
Définition du lexique portée par la première phrase. À remplir sur papier, dix minutes, sans fichier ni commit. Les quatre questions renvoient aux quatre acquis : mesurer (slides 1 à 7), relire (8 à 10), pratiquer sans agent (11 à 13), adopter un artefact (15 et 16 : constitution, spécification, `AGENTS.md`, skill). Le lien vers la carte des notions (`index.html#carte`) n'est pas posé : `support/carte-mentale.yaml` n'existe pas (issue #88). Une fois la carte remplie, ajouter sous le tableau une ligne qui renvoie à la page carte, comme à la clôture du module 4.
:::

## La méthode se prolonge par une mesure et une pratique personnelles. {.statement kicker="Pour continuer"}

::: notes
Conclut la section et le module : la feuille de route reprend les quatre lignes du tableau (mesure, relecture, pratique sans agent, artefact adopté). La slide de clôture enchaîne sur le bilan et l'évaluation (30 min).
:::

## Glossaire : productivité {kicker="Glossaire"}

- **Productivité attendue** : gain prévu par le développeur avant la tâche
- **Productivité ressentie** : gain estimé par le développeur après coup
- **Productivité mesurée** : gain chronométré sur tâches comparables
- **Outil d'assistance** : produit d'assistance au code cité dans une étude

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation.
:::

## Glossaire : études {kicker="Glossaire"}

- **Essai randomisé** : le hasard choisit la tâche outillée
- **Enquête** : recueil d'avis par questionnaire, relève des associations
- **Débit de livraison** : vitesse d'arrivée des changements en production
- **Stabilité de livraison** : fréquence des échecs et des reprises

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation. Débit et stabilité de livraison sont aussi définis dans les en-têtes du tableau de la slide DORA.
:::

## Glossaire : relecture et rôle {kicker="Glossaire"}

- **Dette de relecture** : code généré plus vite que relu
- **Signataire** : répond du code livré, généré ou non
- **Atrophie des compétences** : perte de pratique par délégation
- **Parade** : pratique qui maintient la compétence
- **Orchestrateur** : cadre, délègue et vérifie
- **Feuille de route personnelle** : quatre engagements écrits

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation.
:::
