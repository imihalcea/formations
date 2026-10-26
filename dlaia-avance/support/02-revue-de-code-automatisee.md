# Revue de code automatisée

Un agent relit chaque diff.

## Le diff reste à relire {kicker="Périmètre"}

La boucle et l'orchestrateur produisent un diff que seuls les tests contrôlent.

```console
$ git log --oneline origin/main..HEAD
31ece52 Démo module 2 : quatre défauts plantés pour la revue […]
d199e6e feat: assignee on tickets, required on high priority (spec 002)
$ git diff --stat origin/main...HEAD | tail -1
 14 files changed, 336 insertions(+), 12 deletions(-)
```

::: notes
Reprend la dernière idée clé du module 1 (le mécanisme se choisit d'après la tâche) et la dernière ligne du tableau « La relecture humaine reste nécessaire » : la relecture du diff couvre ce que les tests et les autres garde-fous omettent. Un diff livré par la boucle ou l'orchestrateur passe `make test` ; personne n'a lu les lignes.
Bloc relevé sur la branche `demo/revue-defauts` de tickets-api le 25 octobre 2026 : deux commits (spec 002 livrée, défauts plantés). Le sujet du deuxième commit est tronqué (`[…]`). La démonstration 6 ne commite rien : le bloc reste exact sur la copie, sauf fusion de `main` (troisième commit).
Le décompte de commits (deux ou trois selon la fusion de `main`) se relève sur la copie de session.
Question probable : pourquoi ne pas lire le diff à la main ? On le lit, la revue automatisée prépare cette lecture et ne la remplace pas (slide suivante).
:::

## Définition d'une revue automatisée {kicker="Périmètre"}

![Un diff, relu par l'agent de code, puis tranché par un humain](images/02-revue.svg)

La revue rend des remarques ; l'humain décide de les suivre ou de les écarter.

::: sources
- [Claude Code, Code Review](https://code.claude.com/docs/en/code-review)
- [Claude Code, Review locally with /code-review](https://code.claude.com/docs/en/code-review-local)
:::

::: notes
La doc de Claude Code avertit : « Code Review uses AI to review code and may miss bugs, security vulnerabilities, or other issues. A review with no findings doesn't mean your code is error-free or secure. » Une revue sans remarque ne prouve rien ; c'est la raison de l'humain à la fin du schéma.
Le schéma ne montre pas encore la sortie de l'agent de code : elle a un nom et un format à la slide suivante.
Lexique : « revue automatisée », pas « revue par IA ».
:::

## Définition d'un finding {kicker="Périmètre"}

Un finding est une remarque localisée que la revue automatisée rend sur le diff.

```
src/tickets/adapters/outbound/notifications.py:6
Jeton en clair : NOTIFY_TOKEN reçoit un littéral de chaîne.
Sévérité : haute
```

Illustration : un finding en texte, sans scénario d'échec.

::: sources
- [Claude Code, Review locally with /code-review](https://code.claude.com/docs/en/code-review-local)
:::

::: notes
Bloc : illustration du format (fichier, ligne, résumé, sévérité), rédigée d'après le code réel de la branche (`NOTIFY_TOKEN` à la ligne 6 de `notifications.py`) ; le finding réellement rendu est à relever à la démonstration 6.
Doc Claude Code : le harnais d'une application hôte rend les findings par l'outil `ReportFindings` (emplacement du fichier, résumé d'une phrase, étiquette de catégorie) ; dans un terminal et en `-p`, `/code-review` les rend en texte dans la réponse. Le format du finding de la formation (JSON, cinq champs) est celui du support, il arrive deux sections plus loin.
Lexique : « finding » est un anglicisme assumé (terme du programme et de l'outil). « Constat » désigne les remarques du relecteur de la formation, pas les findings.
:::

## Trois niveaux de sévérité {kicker="Périmètre"}

| Sévérité | Critère | Exemple dans tickets-api |
|---|---|---|
| haute | un secret exposé ou une règle métier violée | jeton en clair |
| moyenne | un test absent | route sans test |
| basse | une gêne de lecture sans risque | nom de variable ambigu (illustration) |

::: notes
Grille du support, pas une source externe. La sévérité sert plus tard à décider quels findings reçoivent un contradicteur (haute seulement) et lesquels bloquent un commit. Lexique : « sévérité », pas « gravité » ni « priorité » (la priorité est un champ des tickets de tickets-api).
Valeurs dans le format JSON du finding : `haute`, `moyenne`, `basse`.
La ligne « basse » est une illustration : aucun défaut de ce niveau n'est planté dans la branche de démonstration.
:::

## Ce que la revue attrape {kicker="Périmètre"}

| Catégorie | Exemple dans tickets-api | Référence écrite |
|---|---|---|
| architecture | un routeur qui écrit en base | `AGENTS.md` |
| test manquant | une route sans test | `AGENTS.md` |
| secret | un jeton en clair | `AGENTS.md` |
| comportement | le retrait du responsable d'un ticket `high` accepté | spécification 002 |
| design, priorités | choix d'une autre structure, ordre des tâches | aucune |

::: sources
- Dépôt tickets-api, `AGENTS.md` et `specs/002-responsable-priorite-haute/spec.md`
:::

::: notes
Classement du support. Les quatre premières lignes ont une phrase écrite dans le dépôt contre laquelle comparer le diff ; la dernière n'en a aucune, la revue ne peut donc pas la trancher et l'humain la garde.
Les défauts de la branche `demo/revue-defauts` sont tirés de ces quatre lignes (un par ligne) : la démonstration 6 les retrouve.
Exemple de comportement : la spécification 002 (FR-004) refuse un ticket de priorité haute sans responsable, y compris par retrait du responsable.
:::

## Limites mesurées des revues automatisées {kicker="Périmètre"}

| Indicateur | Valeur | Signification |
|---|---|---|
| Précision, meilleur outil (SWR-Bench) | 16,65 % | Part des remarques qui touchent un vrai défaut : environ une sur six. |
| Score F1, même outil (SWR-Bench) | 19 % | Moyenne de la précision et de la part des vrais défauts relevés. |
| Défauts corrigés, un outil (c-CRAB) | 20 à 32 % | Part des défauts que l'agent corrige en suivant la revue d'un seul outil. |
| Défauts corrigés, quatre outils (c-CRAB) | 41 % | Même mesure en réunissant les revues des quatre outils. |

Ces outils relisent sans les règles du dépôt.

::: sources
- [SWR-Bench, arXiv 2509.01494, table 4](https://arxiv.org/pdf/2509.01494)
- [c-CRAB, arXiv 2603.23448](https://arxiv.org/pdf/2603.23448)
:::

::: notes
Chiffres relus dans les PDF le 25 octobre 2026. « 1 sur 6 » : précision de 16,65 % de la meilleure combinaison de SWR-Bench (SWR-Bench, F1 de 19,38 %). « 41 % » : union des quatre outils de c-CRAB (un seul outil : 20,1 % à 32,1 %). Précision : part des remarques qui touchent un vrai défaut. Rappel : part des vrais défauts que les remarques touchent. Le score F1 combine les deux (moyenne harmonique).
SWR-Bench (Zeng et al., ACM FSE 2026) : 1 000 pull requests vérifiées à la main, tirées de 12 projets Python de SWE-Bench ; évaluation par un LLM juge (accord d'environ 90 % avec un jugement humain, d'après le résumé). 19 % : score F1 de 19,38 % pour la meilleure combinaison (PR-Review avec Gemini-2.5-Pro, table 4), une passe ; F1 = moyenne harmonique de la précision et du rappel des remarques qui touchent un défaut de la vérité terrain. Précision de 16,65 % pour cette combinaison, moins de 10 % pour les autres techniques : beaucoup de faux positifs. Modèles de 2025 (Claude 3.7 Sonnet, Gemini 2.5 Pro, DeepSeek-R1) : ils ne sont pas Claude Sonnet 4.6.
c-CRAB (Zhang et al., mars 2026) : 184 pull requests de 67 dépôts Python, 234 tests écrits à partir de revues humaines ; une revue réussit un test si l'agent qui la suit corrige le défaut. Quatre outils : PR-Agent, Devin Review, Claude Code, Codex. 20,1 % à 32,1 % par outil ; union des quatre : 97 tests sur 234, soit 41,5 % (résumé : « environ 40 % »). Les revues humaines réussissent 100 % par construction. Le jeu mesure des outils sans règles du dépôt.
Réserves : deux jeux de données Python, un LLM juge d'un côté, des tests générés de l'autre ; les deux chiffres ne se comparent pas entre eux. À présenter comme deux ordres de grandeur, pas comme un classement.
Décision du 25 octobre 2026 : slide conservée, chiffres à discuter avec les PDF. Le plan signalait que la table 8 contredit la conclusion de l'article sur le meilleur outil : non vérifié ici, ne pas citer cette conclusion.
:::

## Les règles écrites cadrent la revue ; l'humain garde le design et les priorités. {.statement kicker="Périmètre"}

::: notes
Conclut la section : définition, finding, sévérité, ce que la revue attrape, limites mesurées.
Transition : ce que la revue vérifie doit être écrit quelque part. Section suivante : les règles.
:::

## Les règles d'équipe de tickets-api {kicker="Règles"}

```markdown
## Règles d'équipe

1. **Accès à la base dans `adapters/outbound/` seulement.** Un routeur ne touche ni
   session, ni requête SQL, ni table [...]
2. **Un test nominal et un test d'erreur par route.** Toute route ajoutée ou modifiée
   arrive avec les deux dans `tests/integration/` [...]
3. **Configuration par variables d'environnement.** Toute valeur d'environnement passe
   par `Settings` dans `settings.py` et par `.env.example`. Aucun jeton, mot de passe
   ni URL de service en dur dans le code, les tests ou les fixtures.
```

::: sources
- Dépôt tickets-api, `AGENTS.md`
:::

::: notes
Extrait de `AGENTS.md` (branche `demo/revue-defauts`), les règles 1 et 2 abrégées (`[...]`). Ces conventions sont lues par l'agent de code à chaque session (fichier de contexte) mais elles ne sont ni structurées ni vérifiables mécaniquement : « un routeur ne touche ni session ni requête SQL » dit quoi faire, pas ce que la revue lit pour décider.
Le fichier de contexte de Claude Code (`CLAUDE.md`) importe `AGENTS.md`.
Remarque pour l'animation : la règle 3 vise aussi « les tests ou les fixtures », ce qui sert la démonstration 7 (faux positif).
:::

## Définition d'une règle de revue {kicker="Règles"}

Une règle de revue est un énoncé que le diff peut violer.

| Champ | Contenu | Règle 3 d'`AGENTS.md` (illustration) |
|---|---|---|
| énoncé | ce que le diff ne doit pas faire | aucun jeton en dur |
| vérification | ce que la revue lit pour décider | les littéraux affectés à un nom de jeton |
| violation | un exemple qui viole la règle | `API_TOKEN = "abc123"` |
| conforme | un exemple qui la respecte | `API_TOKEN = settings.api_token` |
| sévérité | haute, moyenne ou basse | haute |

::: notes
Définition du support : l'énoncé, plus la vérification, les deux exemples et la sévérité du tableau. « Vérification » : le mot désigne ce que la revue lit (un fichier, une forme de ligne, une absence) ; le module 3 appelle « contrôle » ce qu'un hook ou un job exécute, ne pas confondre.
Pourquoi deux exemples : la violation montre ce que la règle cherche, le conforme montre où elle s'arrête. Sans exemple conforme, le reviewer devine la frontière (cause de faux positif, section « Faux positifs »).
Les exemples de la colonne de droite sont des illustrations ; la vraie règle R3 est écrite deux slides plus loin.
:::

## Quatre règles de revue {kicker="Règles"}

| Règle | Texte d'origine | Sévérité |
|---|---|---|
| R1 | accès à la base dans `adapters/outbound/` seulement (`AGENTS.md`, règle 1) | haute |
| R2 | un test nominal et un test d'erreur par route (`AGENTS.md`, règle 2) | moyenne |
| R3 | aucun jeton, mot de passe ni URL de service en dur (`AGENTS.md`, règle 3) | haute |
| R4 | un ticket de priorité haute garde un responsable (spécification 002, exigence 4) | haute |

::: sources
- Dépôt tickets-api, `AGENTS.md` et `specs/002-responsable-priorite-haute/spec.md`
:::

::: notes
Fichier `revue/regles.md`, commun aux deux outils, hors des dossiers propres à chacun (`.claude/`, `.opencode/`) : une seule source de règles. R1 à R3 viennent des trois règles d'équipe ; R4 de la spécification 002 : exigence 4 (FR-004 dans le fichier) « refuser toute opération dont le résultat serait un ticket de priorité haute sans responsable : création, changement de priorité, retrait du responsable ».
Sévérités : R2 est moyenne (une route sans test n'est pas un défaut en soi), les trois autres sont hautes.
Le reviewer ne reçoit pas la spécification complète dans les règles : la commande lui donne le chemin de la spécification visée.
:::

## Écrire la règle R3 {kicker="Règles"}

```markdown
## R3 Aucun secret en clair

Énoncé : aucun jeton, mot de passe ni URL de service en dur dans le code, les tests ou les fixtures.
Vérification : chercher dans le diff un littéral de chaîne affecté à un nom de jeton, de mot de passe ou de clé.
Violation : `API_TOKEN = "abc123"`
Conforme : `API_TOKEN = settings.api_token`
Sévérité : haute
```

::: sources
- Dépôt tickets-api, `AGENTS.md` et `revue/regles.md`
:::

::: notes
Première version de R3 dans `revue/regles.md` : traduction littérale de la règle 3 d'`AGENTS.md`, cinq champs. Cette version est celle qui doit produire le faux positif de la démonstration 6 (valeur factice de `tests/conftest.py`, non rendue au rejeu) : ne pas la corriger avant la section « Faux positifs ».
Point de vigilance : la phrase d'`AGENTS.md` vise aussi les tests. La réécriture de la démonstration 7 réduit la règle aux identifiants émis et exclut `tests/` ; c'est un choix de l'équipe, pas une lecture de la règle d'origine.
:::

## Quatre règles dans `revue/regles.md` donnent au reviewer de quoi trancher. {.statement kicker="Règles"}

::: notes
Conclut la section : règles d'équipe en prose, définition d'une règle de revue, quatre règles, R3 écrite.
Transition : une règle ne lit pas le diff. Qui l'applique ? Section suivante : le finding et l'agent qui le rend.
:::

## Définition d'un reviewer {kicker="Finding"}

![Le diff et les règles de revue entrent dans le reviewer, qui rend des findings à l'agent principal](images/02-reviewer.svg)

Un reviewer est un sous-agent en lecture seule qui applique les règles de revue et rend des findings.

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Application du module 1 : le reviewer est un sous-agent (fenêtre de contexte neuve, seul son rapport revient). Ici le rapport est la liste des findings.
Lecture seule : un reviewer qui peut écrire pourrait « corriger » le diff qu'il juge. Identifiant `reviewer`.
Décision du 25 octobre 2026 : « reviewer » remplace « réviseur » (terme, identifiant et fichier `reviewer.md`).
:::

## Le scénario d'échec {kicker="Finding"}

Un scénario d'échec est l'entrée concrète qui produit le défaut.

| Finding (illustration) | Scénario d'échec |
|---|---|
| Le retrait du responsable d'un ticket `high` est accepté. | `PATCH /tickets/{id}/assignee` avec `{"assignee": null}` sur un ticket `high` : réponse 200 au lieu de 422 |
| Le routeur pourrait être mieux structuré. | aucun |

::: notes
Le premier finding décrit un défaut planté de la branche (le routeur écrit en base sans passer par le domaine, donc sans la garde de la spécification 002). Le second est inventé : une remarque sans scénario ne peut être ni rejouée ni réfutée, l'humain ne peut que l'approuver ou l'ignorer.
Règle de rédaction du reviewer : pas de scénario, pas de finding. C'est ce qui rend la section « Contradicteur » possible : un contradicteur a besoin d'une entrée à rejouer.
Lexique : « scénario d'échec », pas « cas de test ».
:::

## Le format d'un finding {kicker="Finding"}

```json
{
  "regle": "R4",
  "fichier": "src/tickets/adapters/inbound/http/routers/tickets.py",
  "ligne": 56,
  "resume": "Le retrait du responsable d'un ticket high est accepté.",
  "scenario": "PATCH /tickets/{id}/assignee avec {\"assignee\": null} sur un ticket high : 200 au lieu de 422.",
  "severite": "haute"
}
```

Illustration : le finding R4 de la démonstration 6.

::: sources
- Dépôt tickets-api, `revue/finding.schema.json`
:::

::: notes
Le bloc est une illustration rédigée d'après le code de la branche (route `assign_ticket`, `routers/tickets.py` ligne 56) ; au rejeu du 25 octobre 2026, le finding R4 est rendu avec `ligne` entre 57 et 63 selon l'exécution (la route commence à la ligne 56) ; le champ `ligne` est approximatif, le scénario est stable.
`revue/finding.schema.json` : schéma JSON des six champs ci-dessus ; `regle` (R1 à R4), `fichier`, `ligne` (entier), `resume`, `scenario` (obligatoire), `severite` (`haute`, `moyenne` ou `basse`). Un format fixe permet de valider la sortie par programme (`jq`, schéma) avant de la lire, et de trier par sévérité.
Claude Code propose `--output-format json` et `--json-schema` en mode non interactif ; le support n'en dépend pas : le reviewer reçoit le schéma dans ses instructions fixes.
:::

## Déclarer le reviewer {.compare kicker="Finding"}

Le fichier d'agent limite le reviewer aux outils de lecture.

::: claude-code
```markdown
---
name: reviewer
description: Applique les règles de revue à un diff et rend des findings
tools: Read, Grep, Glob
---

Tu appliques les règles de revue au diff reçu et tu ne modifies rien.
Pour chaque violation, rends un finding conforme à revue/finding.schema.json.
Sans règle violée, ne rends rien.
```
:::

::: opencode
```markdown
---
description: Applique les règles de revue à un diff et rend des findings
mode: subagent
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
---

Tu appliques les règles de revue au diff reçu et tu ne modifies rien.
Pour chaque violation, rends un finding conforme à revue/finding.schema.json.
Sans règle violée, ne rends rien.
```
:::

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents (v2)](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Fichiers : `.claude/agents/reviewer.md` (Claude Code), `.opencode/agents/reviewer.md` (Open Code). Extraits abrégés : les fichiers réels fixent aussi `model: claude-sonnet-4-6` (Open Code : `amazon-bedrock/eu.anthropic.claude-sonnet-4-6`) et le nombre maximal de tours.
Claude Code : `tools` est une liste blanche, seuls `name` et `description` sont requis. Le reviewer n'a ni `Bash` ni `Write` ni `Edit`. La doc ne montre pas de motif `Bash(git diff *)` dans `tools` : c'est la commande `/revue` qui injecte le diff, le reviewer n'a pas à le lire lui-même.
Open Code v2 : `permissions` est une liste ordonnée de règles `{action, resource, effect}`, la dernière règle qui correspond l'emporte. Ici le diff est injecté par la commande (les blocs shell d'une commande Open Code s'exécutent hors du flux de permissions de l'outil) : aucune règle d'autorisation n'est nécessaire.
Le format de finding est défini dans `revue/finding.schema.json` (slide précédente).
:::

## Un finding qu'on peut rejouer prouve qu'il dit vrai. {.statement kicker="Finding"}

::: notes
Conclut la section : reviewer, scénario d'échec, format, déclaration.
Transition : le reviewer est déclaré. Reste à le lancer, et à choisir le moment. Section suivante : les modes.
:::

## Trois modes de revue {kicker="Modes"}

| Mode | Lieu | Diff relu | Qui lit | Bloque |
|---|---|---|---|---|
| à la demande | poste du développeur | branche courante | l'auteur | non |
| pull request | GitHub, sur la pull request | pull request | l'équipe | non |
| avant le commit | git, avant le commit | changements indexés | l'auteur | oui |

Un mode de revue est le moment où le reviewer tourne.

::: sources
- [Claude Code, Code Review (tableau « Compare ways to get a review »)](https://code.claude.com/docs/en/code-review)
:::

::: notes
Le tableau de la doc compare les moyens d'obtenir une revue avec Claude Code (service hébergé, `/code-review`, ultrareview, Claude dans sa propre CI, reviewer maison en sous-agent) ; le classement en trois modes est celui du support.
Le job de CI et le hook pre-commit sont du module 3 : le même reviewer et les mêmes règles y sont repris. Ici seul le mode à la demande est joué.
« Bloque : non » en pull request : le job commente, il n'est pas une condition de fusion (le module 3 revient sur ce choix).
:::

## La commande /revue {.compare kicker="Modes"}

Une commande personnalisée `/revue` injecte les règles et le diff, puis appelle le reviewer.

::: claude-code
```markdown
---
description: Relit un diff contre les règles de revue
argument-hint: [nom de la spécification]
allowed-tools: Bash(cat *) Bash(git diff *)
---

!`cat revue/regles.md`
!`git diff origin/main...HEAD`

Lance le sous-agent reviewer sur ce diff avec ces règles et la spécification
specs/$ARGUMENTS/spec.md. Affiche ses findings tels quels.
```
:::

::: opencode
```markdown
---
description: Relit un diff contre les règles de revue
agent: reviewer
---

!`cat revue/regles.md`
!`git diff origin/main...HEAD`

Applique ces règles à ce diff et à la spécification
specs/$ARGUMENTS/spec.md. Rends tes findings tels quels.
```
:::

::: sources
- [Claude Code, Skills (commandes et injection de sortie shell)](https://code.claude.com/docs/en/skills)
- [Open Code, Commands (v2)](https://opencode.ai/v2/docs/commands/)
:::

::: notes
Fichiers : `.claude/commands/revue.md` (Claude Code), `.opencode/commands/revue.md` (Open Code). Nom `/revue` et non `/review` : `/review` est l'alias intégré de `/code-review` dans Claude Code depuis la v2.1.223.
Claude Code : `` !`commande` `` remplace le marqueur par la sortie avant l'envoi à Claude ; une commande qui échoue interrompt l'invocation. `allowed-tools` évite l'interruption quand la règle de permission ne couvre pas `cat` et `git diff`. `$ARGUMENTS` est substitué dans le texte de la commande ; la doc ne dit pas s'il l'est à l'intérieur d'un bloc `` !`…` ``, d'où la spécification donnée par chemin dans le texte, que le reviewer lit avec `Read`.
Open Code v2 : champs `description`, `agent`, `model`, `subagent` (l'ancien `subtask` est un alias déprécié) ; `$ARGUMENTS` et `$1`, `$2` ; les blocs `` !`…` `` s'exécutent à l'évaluation de la commande, hors du flux de permissions des outils de l'agent. `agent: reviewer` désigne l'agent qui exécute la commande : l'exécution du reviewer (mode `subagent`) dans la session courante ou dans une session enfant n'est pas établie.
Le diff est celui de la branche contre `origin/main`, pas celui du seul dernier commit.
:::

## Revue en mode non interactif {.compare kicker="Modes"}

Sans session ouverte, la même revue se lance depuis un script shell.

::: claude-code
```console
$ claude -p "/revue 002-responsable-priorite-haute"
```
:::

::: opencode
```console
$ git diff origin/main...HEAD | opencode run --agent reviewer "Applique revue/regles.md à ce diff."
```
:::

::: sources
- [Claude Code, Headless](https://code.claude.com/docs/en/headless)
- [Open Code, CLI (v2)](https://opencode.ai/v2/docs/cli/)
:::

::: notes
Claude Code : en `-p`, une commande personnalisée écrite dans le prompt est développée avant l'exécution (doc headless : « Include `/skill-name` in the prompt string and Claude Code expands it »). L'entrée standard est ajoutée au prompt (limite de 10 Mo). Depuis la v2.1.302, `claude -p` démarre en mode Manual : une action qui demanderait une permission est refusée. Observé le 25 octobre 2026 (v2.1.310) : sur une copie jamais ouverte en interactif, `claude -p` ignore les `permissions.allow` du projet (« this workspace has not been trusted »). Ouvrir `claude` une fois dans la copie et accepter le dialogue de confiance, sinon le reviewer subit des refus de lecture (coût doublé à l'essai : 0,51 contre 0,24 USD). Avec `--allowedTools`, le prompt précède l'option (variadique : placé après, il est absorbé).
Open Code v2.0.32 : `opencode run` envoie le message tel quel, il ne développe ni `/revue` ni `` !`…` `` ; la commande personnalisée ne sert donc pas en mode non interactif. Le script assemble le prompt (règles, diff) et lance `opencode run --agent reviewer`. L'entrée standard s'ajoute au message : constaté les 18 et 20 octobre 2026 (voir `formateur/equivalences.md`), non documenté, signalé comme tel : la page v1 (`opencode.ai/docs/cli/`) décrit `--agent`, `--model`, `--format`, la page v2 (`opencode.ai/v2/docs/cli/`) ne les détaille pas. À confirmer par `opencode run --help`. La forme `git diff … | opencode run --agent reviewer` avec l'entrée standard n'a pas été exécutée ; la démonstration 6 passe par le script de l'indice de l'étape « Lancer la revue ».
Le module 3 reprend ces deux formes dans le hook pre-commit et dans le job de CI.
:::

## Démonstration 6 : relire une branche avec un reviewer {kicker="Modes"}

Le reviewer relit la branche et rend ses findings.

Étapes : section Démonstrations, en fin de module.

::: notes
Démonstration 6, branche `demo/revue-defauts`, première du module. Elle fournit les règles et le reviewer que les démonstrations 7 et 8 recréent.
Enchaînement : la revue peut signaler du code conforme (finding sur `tests/conftest.py`), ce que traite la section suivante.
Mesures du rejeu automatisé du 25 octobre 2026 (`claude-sonnet-4-6`, une exécution par agent de code) : coût de 0,24 à 0,51 USD (Claude Code) et de 0,03 à 0,10 USD (Open Code, session principale) ; le finding sur `tests/conftest.py` n'est apparu dans aucune des quatre exécutions. Sous Open Code, en mode non interactif, `opencode run` ne développe pas la commande : un script assemble le prompt.
:::

## Un même reviewer tourne dans les trois modes de revue. {.statement kicker="Modes"}

::: notes
Conclut la section : trois modes, commande, mode non interactif, démonstration.
La revue peut signaler du code conforme : section suivante, les faux positifs.
:::

## Définition d'un faux positif {kicker="Faux positifs"}

Un faux positif est un finding sur un code conforme.

```
tests/conftest.py:6
Jeton en clair : monkeypatch.setenv("NOTIFY_TOKEN", "test-token-0000")
```

Illustration : finding possible avec la première version de R3.

::: notes
Finding attendu sur la ligne 6 de `tests/conftest.py` : valeur factice qui ne donne accès à aucun service. Libellé de l'illustration, jamais rendu au rejeu du 25 octobre 2026 (quatre exécutions, deux outils) : si la démonstration 6 ne le produit pas, annoncer que le modèle écarte ici ce que la règle, à la lettre, signalerait.
Le code est conforme à l'intention de l'équipe, mais pas à la lettre de la règle R3 dans sa première version, qui vise « un littéral affecté à un nom de jeton » partout.
Lexique : « faux positif », pas « fausse alerte ».
:::

## Coût d'un faux positif {kicker="Faux positifs"}

| Mode | Qui perd du temps | Effet |
|---|---|---|
| à la demande | l'auteur, seul | une ligne à écarter |
| pull request | l'équipe | des commentaires à écarter |
| avant le commit | l'auteur | le commit est refusé |

::: notes
Classement du support. Le coût grandit avec le nombre de personnes exposées et avec le pouvoir de blocage du mode. Avant le commit, un faux positif bloque le travail tant que l'auteur ne le contourne pas : le module 3 traite la durée maximale et le contournement.
SWR-Bench (voir la slide « Limites mesurées des revues automatisées ») : les outils de revue testés produisent plusieurs remarques fausses par pull request ; précision inférieure à 10 % pour toutes les techniques sauf PR-Review.
:::

## Quatre causes de faux positif {kicker="Faux positifs"}

| Cause | Symptôme | Remède dans la règle |
|---|---|---|
| règle ambiguë | tout littéral de chaîne est signalé | préciser la vérification |
| contexte absent du diff | une ligne signalée alors qu'un fichier voisin l'explique | nommer le fichier à lire |
| exemple manquant | le reviewer devine la frontière | ajouter un exemple conforme |
| règle appliquée à un cas voisin | une valeur de test signalée comme un secret | exclure le cas par dossier ou par forme |

::: sources
- [SWR-Bench, arXiv 2509.01494](https://arxiv.org/abs/2509.01494)
:::

::: notes
Classement du support, rapproché de la taxonomie de SWR-Bench : 100 faux positifs tirés au hasard parmi 1 101 produits par une seule combinaison (PR-Review avec Gemini-2.5-Pro), annotés à la main par trois auteurs (table 7). Manque de compréhension du contexte : 48 % ; sensibilité excessive aux modifications : 17 % ; retour vague : 16 % ; ignorance des conventions du projet : 13 % ; faux jugement sur les écarts voulus aux bonnes pratiques : 3 % ; autres : 3 %. Les auteurs concluent que la plupart des faux positifs viennent d'un contexte non lu et de conventions de projet ignorées, d'où l'intérêt de règles écrites dans le dépôt. Échantillon d'un seul outil, modèle de 2025 : ordre de grandeur, pas une règle.
Cas de la démonstration 7 : « règle appliquée à un cas voisin » (la règle sur les secrets déclenchée par une valeur de test) et « exemple manquant » (aucun exemple conforme dans `tests/`).
:::

## Corriger la règle {kicker="Faux positifs"}

Un identifiant émis est un jeton, un mot de passe ou une clé délivré par un fournisseur.

```diff
-Énoncé : aucun jeton, mot de passe ni URL de service en dur dans le code, les tests ou les fixtures.
-Vérification : chercher dans le diff un littéral de chaîne affecté à un nom de jeton, de mot de passe ou de clé.
-Violation : `API_TOKEN = "abc123"`
+Énoncé : aucun identifiant émis (jeton, mot de passe, clé) en dur dans `src/`.
+Vérification : chercher dans le diff de `src/` un littéral qui a la forme d'un identifiant émis : préfixe de fournisseur suivi d'au moins seize caractères hexadécimaux. Les fichiers de `tests/` sont exclus.
+Violation : `API_TOKEN = "ntfy_9f3a7c21e0b44d8f"`
+Conforme : dans `tests/`, `monkeypatch.setenv("API_TOKEN", "test-token-0000")`
```

::: notes
Réécriture de la démonstration 7, commitée dans `revue/regles.md` : forme d'un identifiant émis (le jeton planté `ntfy_9f3a…` a un préfixe de fournisseur et seize caractères hexadécimaux ; `test-token-0000` n'a ni l'un ni l'autre), exclusion de `tests/`, exemple conforme. La règle corrigée est versionnée : la correction profite à toutes les revues suivantes, au poste, en pull request et avant le commit.
Contrepartie à montrer : l'exclusion de `tests/` supprime aussi la détection d'un vrai secret commité dans un test. C'est un choix de l'équipe, à nommer comme tel. Repli : le patch de la règle de référence (indice de la démonstration 7).
Bloc `diff` : différence de `revue/regles.md` entre les deux versions de R3 (règle de référence, patch de la démonstration 7). La règle réellement écrite par l'agent varie de mots et d'exemples ; le motif, lui, doit couvrir `ntfy_…` (séparateur `_`).
:::

## Démonstration 7 : corriger la règle R3 {kicker="Faux positifs"}

Une règle réécrite et commitée corrige toutes les revues suivantes.

Étapes : section Démonstrations, en fin de module.

::: notes
Démonstration 7, branche `demo/revue-defauts`. Suite de la démonstration 6 : mêmes règles, R3 en première version commitée localement pour que `git diff HEAD~1` montre la seule différence.
Enchaînement : la démonstration 8 reprend la règle R3 corrigée.
Historique du rejeu du 25 octobre 2026 : le prompt d'origine (« elle ne vise que les identifiants émis ») a donné, sous Claude Code, un motif à tiret seul qui ne reconnaît pas `ntfy_9f3a…` et, sous Open Code, une règle de format inversée qui fait perdre R3 sur `notifications.py`. Le prompt de l'étape est la version durcie (« continue de signaler », séparateur `-` ou `_`), jouée une fois sous Claude Code (motif `[a-zA-Z]+[-_][0-9a-fA-F]{16,}`) et non rejouée sous Open Code. Coûts : réécriture 0,14 à 0,19 USD (19 s) sous Claude Code, 0,10 USD (15 s) sous Open Code ; relance de la revue 0,44 USD en 144 s sous Claude Code.
:::

## Chaque faux positif corrigé améliore toutes les revues suivantes. {.statement kicker="Faux positifs"}

::: notes
Conclut la section : définition, coût par mode, quatre causes, correction, démonstration.
Transition : une règle plus précise réduit les faux positifs, elle n'en supprime aucun. Les findings les plus graves méritent une contre-vérification avant l'humain. Section suivante : le contradicteur.
:::

## Définition d'un contradicteur {kicker="Contradicteur"}

![Le reviewer rend des findings de sévérité haute, un contradicteur par finding, des verdicts vers l'humain](images/02-contradicteur.svg)

Un contradicteur est un sous-agent à qui l'on confie un finding avec la consigne de prouver qu'il est faux.

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Un contradicteur par finding de sévérité haute (trois à quatre selon que R1 est rendu en un ou deux findings) : ce sont ceux qu'un faux positif rend le plus coûteux. Les findings moyens et bas vont directement à l'humain.
Le contradicteur reçoit un seul finding, dans une fenêtre de contexte neuve : il ne subit pas le raisonnement du reviewer. C'est l'intérêt d'un sous-agent.
Parallélisme : les contradicteurs sont lancés dans le même tour. Claude Code : jusqu'à 20 sous-agents simultanés par défaut. Open Code : plafond observé de dix actifs au module 1.
Lexique : « contradicteur », pas « avocat du diable ».
:::

## Trois verdicts {kicker="Contradicteur"}

| Verdict | Preuve | Suite |
|---|---|---|
| confirmé | sortie de commande ou ligne de code citée | le finding reste |
| plausible | raisonnement sans preuve rejouable | l'humain décide |
| réfuté | le scénario d'échec rejoué ne produit pas le défaut | le finding est retiré |

::: notes
Grille du support. Un verdict sans preuve n'est pas accepté : le contradicteur cite la ligne ou la sortie de commande qui le justifie. « Réfuté » exige de rejouer le scénario du finding ; c'est pourquoi un finding sans scénario d'échec ne passe pas.
Un contradicteur est un modèle : il peut se tromper dans les deux sens. L'humain voit le finding, le verdict et la preuve, et décide.
:::

## Déclarer le contradicteur {.compare kicker="Contradicteur"}

Le contradicteur lit le code et peut lancer des commandes, sans outil d'écriture.

::: claude-code
```markdown
---
name: contradicteur
description: Tente de réfuter un finding en lisant le code et en lançant les tests
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
---

Tu reçois un finding. Prouve qu'il est faux : rejoue son scénario d'échec, ou lance `make test`
s'il est couvert par un test. Rends un verdict (confirmé, plausible ou réfuté) avec sa preuve.
```
:::

::: opencode
```markdown
---
description: Tente de réfuter un finding en lisant le code et en lançant les tests
mode: subagent
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: shell, resource: "make test*", effect: allow }
---

Tu reçois un finding. Prouve qu'il est faux : rejoue son scénario d'échec, ou lance `make test`
s'il est couvert par un test. Rends un verdict (confirmé, plausible ou réfuté) avec sa preuve.
```
:::

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents (v2)](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Fichiers : `.claude/agents/contradicteur.md`, `.opencode/agents/contradicteur.md`.
Open Code : les règles se lisent dans l'ordre, la dernière qui correspond l'emporte : refus général de `shell`, puis exception pour `make test*`. Les ressources `shell` sont du texte de commande avec jokers ; la forme `make test*` suit la syntaxe documentée, sans exemple équivalent dans la doc ; à confirmer en séance (la commande réellement lancée par le sous-agent doit correspondre).
Claude Code : `Bash` y est autorisé en entier. La doc dit qu'un motif dans `disallowedTools` retire l'outil entier, et ne montre pas de motif dans `tools` : la restriction aux seuls tests passe par des règles `permissions.allow` du projet (`Bash(make test *)`, `Bash(grep *)`) ou par un hook `PreToolUse` dans le fichier de l'agent (module 3). `disallowedTools` retire `Write` et `Edit`, mais pas les écritures par `Bash` : à dire en salle, la lecture seule de Claude Code est ici moins stricte que celle d'Open Code.
Observé au rejeu du 25 octobre 2026 : les contradicteurs des deux outils ont cité des lignes de code lues (`Read`, `grep -n`) sans lancer `make test` ni requête, y compris pour R4 (« la lecture suffit ») ; la consigne « rejoue son scénario d'échec » seule ne déclenche pas de test, d'où la ligne ajoutée sur le test existant (non rejouée : à vérifier en séance). Aucun appel `bash` côté Open Code : le motif `make test*` reste à vérifier en séance (TUI). Le fichier réel du contradicteur est un peu plus long que l'extrait.
:::

## Lancer la revue adverse {.compare kicker="Contradicteur"}

Une revue adverse est une revue suivie d'un contradicteur par finding de sévérité haute.

::: claude-code
```markdown
---
description: Revue suivie d'un contradicteur par finding de sévérité haute
argument-hint: [nom de la spécification]
allowed-tools: Bash(cat *) Bash(git diff *)
---
[règles et diff injectés comme dans /revue]

1. Lance le reviewer sur ce diff et specs/$ARGUMENTS/spec.md.
2. Pour chaque finding de sévérité haute, lance dans le même tour
   un contradicteur qui reçoit ce finding seul.
3. Affiche chaque finding avec son verdict et sa preuve.
```
:::

::: opencode
```markdown
---
description: Revue suivie d'un contradicteur par finding de sévérité haute
---
[règles et diff injectés comme dans /revue]

1. Lance le reviewer sur ce diff et specs/$ARGUMENTS/spec.md.
2. Pour chaque finding de sévérité haute, lance dans le même tour
   un contradicteur qui reçoit ce finding seul.
3. Affiche chaque finding avec son verdict et sa preuve.
```
:::

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Commands (v2)](https://opencode.ai/v2/docs/commands/)
:::

::: notes
Fichiers : `.claude/commands/revue-adverse.md`, `.opencode/commands/revue-adverse.md`. Le crochet `[règles et diff injectés comme dans /revue]` remplace dans l'extrait les deux blocs `` !`cat revue/regles.md` `` et `` !`git diff origin/main...HEAD` ``.
Open Code : pas de champ `agent` dans cette commande. L'agent qui l'exécute (agent principal par défaut) doit pouvoir lancer deux sous-agents, ce que `agent: reviewer` interdirait.
Claude Code : la doc cite l'exemple « in parallel using separate subagents » ; plusieurs sous-agents partent dans le même message. Open Code : la doc ne décrit pas le parallélisme ; trois appels `subagent` dans le même tour sont lancés ensemble (module 1). À relever : parallélisme réel de chaque outil sur cette commande.
Lexique : « revue adverse » ; la revue sans contradicteur s'appelle « revue sans contradicteur ».
:::

## Le coût d'une revue {kicker="Contradicteur"}

| Mesure | Revue sans contradicteur | Revue adverse |
|---|---|---|
| Claude Code, coût total | 0,24 à 0,44 USD | 0,61 USD |
| Open Code, session principale seule | 0,08 USD | 0,19 USD |

Mesures au 25 octobre 2026, une à deux exécutions par outil.

::: sources
- [Claude Code, Subagents (contexte neuf de chaque sous-agent)](https://code.claude.com/docs/en/sub-agents)
:::

::: notes
Les coûts sont des mesures du formateur, la source Subagents ne porte que le contexte neuf. Valeurs du rejeu automatisé du 25 octobre 2026 (`claude-sonnet-4-6`, une exécution par mode et par outil, branche `demo/revue-defauts`, règle R3 corrigée), à remplacer par celles du rejeu manuel. Méthode : Claude Code, `total_cost_usd` du JSON de `claude -p --output-format json` (revue sans contradicteur : 0,24 USD sur la copie de la démonstration 6, 0,44 USD sur celle de la démonstration 7 ; revue adverse : 0,61 USD, soit 1,4 à 2,6 fois) ; Open Code, coût de la session principale dans le JSON de `opencode run --format json` (0,08 contre 0,19 USD, environ 2,4 fois). Le coût des sous-agents Open Code n'est pas dans ce JSON : l'écart réel est plus grand. Durées : 92 à 144 s contre 96 s (Claude Code), 15 s contre 74 s (Open Code). À relever en séance : `/usage` en session interactive, coût affiché en fin de session.
Doc Claude Code : chaque sous-agent démarre avec une fenêtre de contexte neuve (prompt système du sous-agent, message de tâche, fichiers `CLAUDE.md`, état git). Une revue adverse lance un sous-agent de plus par finding de sévérité haute, chacun avec ses instructions fixes et ses lectures : elle coûte plus qu'une revue sans contradicteur. Module 1 : même constat pour l'orchestrateur.
:::

## Démonstration 8 : lancer une revue adverse {kicker="Contradicteur"}

Un contradicteur par finding de sévérité haute rend un verdict et sa preuve.

Étapes : section Démonstrations, en fin de module.

::: notes
Démonstration 8, branche `demo/revue-defauts` avec la règle R3 de la démonstration 7, recréée par l'étape de règles.
Enchaînement : le coût de la revue adverse est comparé à celui de la slide précédente.
Mesures du rejeu automatisé du 25 octobre 2026 (`claude-sonnet-4-6`) : Claude Code, 4 contradicteurs dans le même tour (R1 en deux findings, R3, R4), 96 s, 0,61 USD ; Open Code, 3 contradicteurs aux exécutions chevauchées, 74 s, 0,19 USD pour la session principale. Tous les verdicts « confirmé », lignes de code citées, aucun test rejoué, aucune écriture.
:::

## Chaque finding de sévérité haute reçoit un verdict avant l'humain. {.statement kicker="Contradicteur"}

::: notes
Conclut la section : contradicteur, verdicts, déclaration, revue adverse, coût, démonstration.
Transition : tout ce qui précède se construit avec les mécanismes de l'agent de code. D'autres outils de revue existent ; comment les situer ? Section suivante : les alternatives.
:::

## Commandes de Claude Code {kicker="Alternatives"}

| Commande | Ce qu'elle relit | Sortie |
|---|---|---|
| `/code-review` | la branche courante, une pull request, une branche ou un chemin | findings en texte dans la conversation |
| `/security-review` | la différence entre la branche et la branche par défaut d'`origin` | risques de sécurité |

Open Code : aucune commande de revue.

::: sources
- [Claude Code, Commands](https://code.claude.com/docs/en/commands)
- [Claude Code, Review locally with /code-review](https://code.claude.com/docs/en/code-review-local)
- [Open Code, TUI](https://opencode.ai/docs/tui/)
:::

::: notes
`/code-review` : compétence intégrée (sans fichier `SKILL.md` à modifier) ; options `--fix`, `--comment`, niveaux d'effort `low` à `max`, `ultra` pour une revue dans le cloud ; elle suit `CLAUDE.md` et ignore `REVIEW.md` ; la revue tourne dans un sous-agent en arrière-plan. `/review` est un alias depuis la v2.1.223. `/security-review` exige un remote `origin`.
Open Code : la liste des commandes de la page TUI (16 commandes, présentée comme exhaustive) ne contient pas de commande de revue. La page TUI de la documentation v2 est introuvable (404 le 25 octobre 2026) : la ligne s'appuie sur la page v1 et sur le fait qu'une commande personnalisée remplace ce manque.
Écart avec le module : `/code-review` n'applique pas `revue/regles.md` et n'a pas de format de finding de la formation ; on peut la combiner avec les règles dans `CLAUDE.md`.
:::

## Code Review hébergé {kicker="Alternatives"}

| Point | Code Review |
|---|---|
| Plans | Team et Enterprise |
| Hébergement | infrastructure d'Anthropic, compte Claude requis même avec Amazon Bedrock |
| Rôle | commente la pull request, n'approuve ni ne bloque jamais |

Code Review est un service d'Anthropic qui relit les pull requests GitHub ; la commande `/code-review` est un autre outil.

::: sources
- [Claude Code, Code Review](https://code.claude.com/docs/en/code-review)
:::

::: notes
Vérifié le 25 octobre 2026. Dépôts GitHub (dont GitHub Enterprise Server). Plusieurs agents lisent le diff en parallèle, une étape de vérification filtre les faux positifs, puis classement par sévérité ; commentaires en ligne, résumé et un check run qui ne conclut jamais en échec.
Configuration : `REVIEW.md` à la racine, lu sur la branche de base ou par défaut, jamais sur les changements de la pull request (même raison que le module 3 : un auteur ne réécrit pas les règles qui le jugent) ; `CLAUDE.md` est aussi lu. Indisponible avec Zero Data Retention, avec la configuration HIPAA et avec les clés de chiffrement gérées par le client. La revue lit le diff et le code voisin sans compiler ni exécuter le code.
Niveaux Quick, Standard, Deep ; le coût dépend du niveau (page « Code Review costs and usage », non lue pour cette slide : pas de chiffre).
:::

## D'autres outils de revue {kicker="Alternatives"}

Liste partielle au 25 octobre 2026.

| Famille | Exemple | Règles lues | Où part le diff | Bloque la fusion |
|---|---|---|---|---|
| revue de GitHub | Copilot code review | `copilot-instructions.md`, `AGENTS.md` | non documenté sur la page | non par défaut |
| service sur pull request | CodeRabbit | `.coderabbit.yaml`, `CLAUDE.md`, `AGENTS.md` | partagé avec OpenAI et Anthropic | avec les approbations automatiques |
| analyseur de style | ruff | règles natives, aucun plugin tiers | outil local | par le code de retour |
| détecteur de secrets | gitleaks | regex, entropie, mots-clés | outil local | non, bloque le commit |

::: sources
- [GitHub, Copilot code review](https://docs.github.com/en/copilot/concepts/agents/code-review)
- [CodeRabbit, Code guidelines](https://docs.coderabbit.ai/knowledge-base/code-guidelines)
- [CodeRabbit, FAQ](https://docs.coderabbit.ai/faq)
- [CodeRabbit, Automatic approvals](https://docs.coderabbit.ai/pr-reviews/automatic-approvals.md)
- [CodeRabbit, Pre-merge checks](https://docs.coderabbit.ai/pr-reviews/pre-merge-checks.md)
- [ruff, FAQ](https://docs.astral.sh/ruff/faq/)
- [gitleaks, README](https://github.com/gitleaks/gitleaks)
:::

::: notes
Panorama partiel, sans prix, lu avec les critères du module (règles lues, où part le diff, blocage). Qodo et Greptile écartés : faits non confirmés par la documentation consultée.
Copilot : lit `.github/copilot-instructions.md`, `.github/instructions/**/*.instructions.md` et `AGENTS.md`, depuis la branche de tête (celle de la pull request, à l'inverse du service d'Anthropic ci-dessus pour `REVIEW.md`). « By default, Copilot's reviews do not count toward required approvals » ; la page recommande de compléter par une relecture humaine. Le traitement du diff n'est pas documenté sur la page.
CodeRabbit : détecte par défaut `AGENTS.md`, `CLAUDE.md`, les fichiers de Copilot, Cursor, etc., en plus de `.coderabbit.yaml`. FAQ : « Your code is shared with OpenAI and/or Anthropic for reviewing purposes only » ; auto-hébergement pour l'offre Enterprise. `reviews.auto_approvals.enabled` vaut `false` par défaut ; activé, un commentaire exploitable déclenche une demande de modifications ; un pre-merge check en mode `error` bloque la fusion seulement avec les approbations automatiques (le mode `warning` est le défaut).
ruff : FAQ « Ruff is a linter, not a type checker », pas de plugins tiers pour l'instant. gitleaks : README « feature complete », mises à jour de sécurité seulement, l'auteur travaille désormais sur Betterleaks ; à dire en salle avant de recommander l'outil.
« Outil local » pour ruff et gitleaks : programmes exécutés sur le poste ou le job, sans service ; déduction, aucune page ne parle d'envoi de code.
:::

## Un outil de revue se juge sur les règles qu'il lit et sur l'endroit où part le diff. {.statement kicker="Alternatives"}

::: notes
Conclut la section : commandes de Claude Code, service hébergé, panorama. Les colonnes « règles lues » et « où part le diff » du tableau sont les deux questions à poser à tout outil, avec le format de sortie.
Transition : récapitulatif des éléments du module.
:::

## Les éléments d'une revue {kicker="Synthèse"}

![Les sources des règles, les règles, le reviewer, les findings, le contradicteur et l'humain, avec les trois modes de lancement](images/02-revue-complete.svg)

::: notes
Récapitulatif des six boîtes : sources (`AGENTS.md`, spécification), règles, reviewer, findings, contradicteur, humain ; les trois modes (à la demande, pull request, avant le commit) lancent le même reviewer avec les mêmes règles. Seul le premier mode est joué ici ; le module 3 place les deux autres dans un job de CI et un hook git.
Question à poser : que reste-t-il à l'humain ? Les findings avec leur verdict, le design et les priorités (aucune référence écrite).
:::

## Démonstration 6 : relire une branche avec un reviewer {.tp}

Le reviewer relit la branche `demo/revue-defauts` de `tickets-api` contre les règles de l'équipe et rend des findings classés par sévérité. La branche porte quatre défauts qu'aucun test n'attrape.

### Préparer le dépôt de session

Prérequis : `git`, `make`, `jq`, `docker` avec Compose, `uv`, `gh` connecté (`gh auth status`) avec le droit de créer un dépôt privé et un accès en lecture à `imihalcea/tickets-api`, une clé SSH enregistrée sur GitHub (les clones passent par l'URL SSH), le port 5432 libre. Claude Code 2.1.310 connecté à un abonnement Anthropic, ou Open Code v2.0.32 avec des identifiants Amazon Bedrock (`AWS_PROFILE` ou clés d'accès, région européenne, accès au modèle `eu.anthropic.claude-sonnet-4-6`). Le modèle est `claude-sonnet-4-6` pour les deux outils : option `--model` et `settings.json` pour Claude Code, champ `model` des agents pour Open Code.

Le dépôt de session est un dépôt privé, copie miroir du dépôt de référence. Le bloc le crée s'il manque, en clone la copie de travail dans `$WORK`, se place sur la branche et remet son état d'origine.

```bash
export SESSION=demo
export REFERENCE=imihalcea/tickets-api
export TARGET="$REFERENCE-$SESSION"
export WORK="$HOME/travail/tickets-api-$SESSION"

if ! gh repo view "$TARGET" >/dev/null 2>&1; then
  gh repo create "$TARGET" --private --description "Dépôt de session $SESSION"
  tmp=$(mktemp -d)
  git clone --mirror "$(gh repo view "$REFERENCE" --json sshUrl -q .sshUrl)" "$tmp/reference.git"
  git -C "$tmp/reference.git" push --mirror "$(gh repo view "$TARGET" --json sshUrl -q .sshUrl)"
  rm -rf "$tmp"
fi
if [ ! -d "$WORK/.git" ]; then
  mkdir -p "$HOME/travail"
  git clone "$(gh repo view "$TARGET" --json sshUrl -q .sshUrl)" "$WORK"
fi

cd "$WORK"
git fetch --quiet origin
git checkout -- . && git clean -fdq -e .venv -e node_modules
git checkout demo/revue-defauts
git reset --hard origin/demo/revue-defauts
make db-up
uv sync
make test
```

::: attendu
`make test` affiche `57 passed`. Les quatre défauts de la branche ne font échouer aucun test : la revue est le seul filet.
:::

::: indice
Contenu utilisé du dépôt de référence, branche `demo/revue-defauts` :

- `AGENTS.md` : pile (Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, `uv`), commandes et trois règles d'équipe (accès à la base dans `adapters/outbound/` seulement, un test nominal et un test d'erreur par route, aucun secret en dur) dont dérivent R1 à R3.
- `specs/002-responsable-priorite-haute/spec.md` : exigence FR-004, un ticket de priorité `high` garde un responsable.
- `src/tickets/adapters/outbound/notifications.py` : ligne 6, `NOTIFY_TOKEN = "ntfy_9f3a7c21e0b44d8f"` (défaut R3).
- `src/tickets/adapters/inbound/http/routers/tickets.py` : route `assign_ticket` (`PATCH /tickets/{id}/assignee`), qui lit et écrit en base par `unit._session` sans appeler le domaine (défauts R1 et R4).
- `tests/integration/test_tickets_api.py` : aucun test de la route d'attribution (défaut R2).
- `tests/conftest.py` : ligne 6, `monkeypatch.setenv("NOTIFY_TOKEN", "test-token-0000")`, valeur factice (cas voisin de la démonstration 7).
- `Makefile` : `make db-up` (Docker Compose, PostgreSQL sur le port 5432), `make test` (`uv run pytest`), `make lint`.
- `opencode.json` : modèle `amazon-bedrock/eu.anthropic.claude-sonnet-4-6` et serveur MCP `github`, sans objet ici.

Dépôt de session déjà créé par une démonstration précédente : les deux blocs `if` ne font rien. Port 5432 pris par un autre conteneur (par exemple `tickets-api-db-1`) : l'arrêter avant `make db-up`. Dépôt de référence inaccessible : `gh auth status`, puis demander l'accès à `imihalcea/tickets-api`.
:::

### Lire ce que la branche change

```console
$ git log --oneline origin/main..HEAD
$ git diff --stat origin/main...HEAD
```

::: attendu
Deux commits : la spécification 002 livrée (« feat: assignee on tickets, required on high priority (spec 002) ») et les défauts plantés (« Démo module 2 : quatre défauts plantés pour la revue… »). Un troisième apparaît si `main` a été fusionnée. `--stat` : 14 fichiers, 336 insertions, 12 suppressions.
:::

### Écrire les règles de revue

Quatre règles à cinq champs (énoncé, vérification, violation, conforme, sévérité), et le schéma JSON des six champs d'un finding. R3 est en première version : elle vise « le code, les tests ou les fixtures ».

```bash
cd "$WORK"
mkdir -p revue
cat > revue/regles.md <<'EOF'
# Règles de revue

Fichier lu par le reviewer et le contradicteur, commun à Claude Code et Open Code. Chaque règle a cinq champs : énoncé, vérification, violation, conforme, sévérité.

## R1 Accès à la base hors du routeur

Énoncé : le code de `adapters/inbound/` ne touche ni session, ni requête SQL, ni table. L'accès à la base vit dans `adapters/outbound/`.
Vérification : chercher dans le diff, sous `adapters/inbound/`, un import de `tables`, un accès à `_session` ou une requête SQL.
Violation : `row = unit._session.get(TicketRow, ticket_id)` dans un routeur
Conforme : `AssignTicket(uow).execute(ticket_id, payload.assignee)` dans un routeur
Sévérité : haute

## R2 Un test nominal et un test d'erreur par route

Énoncé : toute route ajoutée ou modifiée arrive avec un test nominal et un test d'erreur dans `tests/integration/`.
Vérification : pour chaque route du diff, chercher dans `tests/integration/` un test qui l'appelle avec succès et un test qui l'appelle en erreur.
Violation : route `PATCH /tickets/{id}/assignee` sans aucun test d'intégration
Conforme : `test_assign_ticket_nominal` et `test_assign_ticket_unknown_returns_404`
Sévérité : moyenne

## R3 Aucun secret en clair

Énoncé : aucun jeton, mot de passe ni URL de service en dur dans le code, les tests ou les fixtures.
Vérification : chercher dans le diff un littéral de chaîne affecté à un nom de jeton, de mot de passe ou de clé.
Violation : `API_TOKEN = "abc123"`
Conforme : `API_TOKEN = settings.api_token`
Sévérité : haute

## R4 Conformité à la spécification

Énoncé : un ticket de priorité haute garde un responsable (spécification 002, FR-004) : création, changement de priorité et retrait du responsable sont refusés si le résultat est un ticket `high` sans responsable.
Vérification : lire la spécification donnée en argument, puis chercher dans le diff une route ou un cas d'usage qui contourne `domain/` pour modifier le responsable ou la priorité.
Violation : `PATCH /tickets/{id}/assignee` avec `{"assignee": null}` sur un ticket `high` répond 200
Conforme : la même requête répond 422 et le responsable reste inchangé
Sévérité : haute
EOF
mkdir -p revue
cat > revue/finding.schema.json <<'EOF'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Finding de revue",
  "type": "object",
  "required": ["regle", "fichier", "ligne", "resume", "scenario", "severite"],
  "additionalProperties": false,
  "properties": {
    "regle": { "type": "string", "enum": ["R1", "R2", "R3", "R4"] },
    "fichier": { "type": "string" },
    "ligne": { "type": "integer", "minimum": 1 },
    "resume": { "type": "string" },
    "scenario": { "type": "string", "minLength": 1 },
    "severite": { "type": "string", "enum": ["haute", "moyenne", "basse"] }
  }
}
EOF
```

::: attendu
`jq empty revue/finding.schema.json` ne dit rien et `grep -c "^## R" revue/regles.md` affiche `4`.
:::

### Déclarer le reviewer et la commande /revue

Le reviewer lit sans rien modifier. La commande injecte les règles et le diff dans le prompt, puis lance le reviewer.

::: claude-code
Agent, commande et permissions du projet. `.claude/settings.json` remplace celui de la branche (mêmes entrées, plus `cat` et `grep`).

```bash
cd "$WORK"
mkdir -p .claude/agents
cat > .claude/agents/reviewer.md <<'EOF'
---
name: reviewer
description: Applique les règles de revue à un diff et rend des findings
tools: Read, Grep, Glob
model: claude-sonnet-4-6
maxTurns: 20
---

Tu appliques les règles de revue (revue/regles.md) au diff reçu. Tu ne modifies rien.

Pour chaque violation, rends un finding : un objet JSON conforme à revue/finding.schema.json
(regle, fichier, ligne, resume, scenario, severite). Le scénario est l'entrée concrète qui produit
le défaut. Pas de scénario, pas de finding. La sévérité est celle de la règle.

Lis le code autour de la ligne signalée avant de conclure. Rends la liste des findings, un objet
JSON par ligne, sans préambule. Sans règle violée, ne rends rien.
EOF
mkdir -p .claude/commands
cat > .claude/commands/revue.md <<'EOF'
---
description: Relit un diff contre les règles de revue
argument-hint: [nom de la spécification]
allowed-tools: Bash(cat *) Bash(git diff *)
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

Lance le sous-agent reviewer sur ce diff avec ces règles et la spécification
specs/$ARGUMENTS/spec.md. Affiche ses findings tels quels.
EOF
mkdir -p .claude
cat > .claude/settings.json <<'EOF'
{
  "model": "claude-sonnet-4-6",
  "permissions": {
    "allow": [
      "Bash(make test *)",
      "Bash(make lint *)",
      "Bash(uv run pytest *)",
      "Bash(uv run ruff *)",
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(cat *)",
      "Bash(grep *)"
    ]
  }
}
EOF
```

Ouvrir `claude --model claude-sonnet-4-6` une fois dans la copie de travail et accepter le dialogue de confiance du dossier, puis quitter.
:::

::: opencode
Agent et commande en forme v2 (`permissions` en tableau, `mode: subagent`).

```bash
cd "$WORK"
mkdir -p .opencode/agents
cat > .opencode/agents/reviewer.md <<'EOF'
---
description: Applique les règles de revue à un diff et rend des findings
mode: subagent
model: amazon-bedrock/eu.anthropic.claude-sonnet-4-6
steps: 20
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: webfetch, resource: "*", effect: deny }
---

Tu appliques les règles de revue (revue/regles.md) au diff reçu. Tu ne modifies rien.

Pour chaque violation, rends un finding : un objet JSON conforme à revue/finding.schema.json
(regle, fichier, ligne, resume, scenario, severite). Le scénario est l'entrée concrète qui produit
le défaut. Pas de scénario, pas de finding. La sévérité est celle de la règle.

Lis le code autour de la ligne signalée avant de conclure. Rends la liste des findings, un objet
JSON par ligne, sans préambule. Sans règle violée, ne rends rien.
EOF
mkdir -p .opencode/commands
cat > .opencode/commands/revue.md <<'EOF'
---
description: Relit un diff contre les règles de revue
agent: reviewer
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

Applique ces règles à ce diff et à la spécification specs/$ARGUMENTS/spec.md.
Rends tes findings tels quels.
EOF
opencode debug agents | jq -r '.[] | select(.id=="reviewer") | "\(.id)\t\(.mode)"'
```

:::

::: attendu
Claude Code : aucune sortie, les fichiers sont lus au lancement. Open Code : la dernière commande affiche `reviewer` puis `subagent`. `opencode debug agents` liste aussi les règles `edit`, `shell` et `webfetch` du reviewer en `deny`.
:::

::: indice
Sans dialogue de confiance accepté, `claude -p` ignore les `permissions.allow` du projet (avertissement « this workspace has not been trusted ») et le reviewer subit des refus de lecture : coût doublé à l'essai (0,51 contre 0,24 USD). Cette précaution ne concerne pas la session interactive.
:::

### Lancer la revue

::: claude-code
```console
$ cd "$WORK"
$ claude --model claude-sonnet-4-6
```
:::

::: opencode
```console
$ cd "$WORK"
$ opencode
```
:::

Prompt, dans la session :

```prompt
/revue 002-responsable-priorite-haute
```

::: attendu
Le reviewer ouvre des fichiers autour des lignes qu'il signale, puis rend quatre ou cinq findings (R1 en compte un ou deux) :

- R3, haute : `src/tickets/adapters/outbound/notifications.py` ligne 6, `NOTIFY_TOKEN = "ntfy_9f3a7c21e0b44d8f"` versionné.
- R4, haute : `assign_ticket` dans `src/tickets/adapters/inbound/http/routers/tickets.py`, `PATCH /tickets/{id}/assignee` avec `{"assignee": null}` sur un ticket `high` répond 200 au lieu de 422.
- R1, haute : le même routeur importe `TicketRow` (ligne 14) et lit puis écrit en base par `unit._session` (lignes 59 à 63).
- R2, moyenne : la route `PATCH /{ticket_id}/assignee` n'a aucun test d'intégration (quatre tests retirés).

Les numéros de ligne varient d'une exécution à l'autre, le contenu non. Le reviewer est invité à répondre en JSON sans préambule : Claude Code reformate en texte, Open Code ajoute une phrase de rapport. Le finding R3 sur `tests/conftest.py` (valeur factice `test-token-0000`) n'est pas garanti : le reviewer n'ouvre pas ce fichier et la règle « pas de scénario, pas de finding » écarte une valeur factice.
:::

::: indice
Claude Code, mode non interactif (le prompt précède `--allowedTools`, option variadique) :

```bash
claude -p "/revue 002-responsable-priorite-haute" --model claude-sonnet-4-6 \
  --allowedTools "Bash(cat *)" "Bash(grep *)" "Bash(git diff *)" "Bash(git log *)"
```

Constaté sur Open Code v2.0.32, comportement que la documentation ne décrit pas : `opencode run` (mode non interactif) ne développe ni `/revue` ni les blocs `` !`…` `` : le script suivant assemble le prompt de la commande puis lance `opencode run`. À poser une fois, hors de la copie.

```bash
cat > "$HOME/lancer-opencode.sh" <<'EOF'
#!/usr/bin/env bash
# Exécution non interactive sous Open Code v2.0.32 : `opencode run` ne développe ni /revue ni !`cmd`.
# Ce script lit le fichier de la commande, retire le frontmatter, remplace $ARGUMENTS, exécute les
# blocs !`cmd` dans la copie de travail, puis lance opencode run avec le prompt assemblé.
# Usage : lancer-opencode.sh <copie de travail> <revue|revue-adverse> <spécification> [agent]
#   agent : défaut reviewer pour revue, agent principal (build) pour revue-adverse
# Variable : MODEL (défaut amazon-bedrock/eu.anthropic.claude-sonnet-4-6)
set -euo pipefail
work="${1:?usage: lancer-opencode.sh <copie> <revue|revue-adverse> <spec> [agent]}"
cmd="${2:?commande}"
spec="${3:?spécification}"
default_agent=""; [ "$cmd" = "revue" ] && default_agent="reviewer"
agent="${4:-$default_agent}"
model="${MODEL:-amazon-bedrock/eu.anthropic.claude-sonnet-4-6}"
file="$work/.opencode/commands/$cmd.md"
[ -f "$file" ] || { echo "KO : $file absent"; exit 1; }

prompt=""
in_front=0; seen_front=0
while IFS= read -r line; do
  if [ "$line" = "---" ] && [ "$seen_front" -eq 0 ]; then
    if [ "$in_front" -eq 0 ]; then in_front=1; continue; else in_front=0; seen_front=1; continue; fi
  fi
  [ "$in_front" -eq 1 ] && continue
  line="${line//\$ARGUMENTS/$spec}"
  if [[ "$line" =~ ^\!\`(.*)\`$ ]]; then
    out="$(cd "$work" && bash -c "${BASH_REMATCH[1]}")"
    prompt+="$out"$'\n'
  else
    prompt+="$line"$'\n'
  fi
done < "$file"

cd "$work"
args=(run --model "$model")
[ -n "$agent" ] && args+=(--agent "$agent")
opencode "${args[@]}" "$prompt"
EOF
chmod +x "$HOME/lancer-opencode.sh"
```

Lancer ensuite `"$HOME/lancer-opencode.sh" "$WORK" revue 002-responsable-priorite-haute`.

Aucun finding rendu (modèle muet, réseau coupé) : lire les quatre défauts avec les commandes de l'étape suivante.
:::

### Vérifier les défauts dans le code

Chaque finding se contrôle par la ligne qu'il cite.

```console
$ grep -n NOTIFY_TOKEN src/tickets/adapters/outbound/notifications.py
$ sed -n 56,66p src/tickets/adapters/inbound/http/routers/tickets.py
$ grep -c "/assignee" tests/integration/test_tickets_api.py
```

::: attendu
`notifications.py:6` porte le littéral `ntfy_9f3a7c21e0b44d8f` et la ligne 14 l'envoie dans `Authorization`. Le routeur montre `unit._session.get(TicketRow, ticket_id)` puis `unit._session.commit()` dans `assign_ticket`, sans appel au domaine. Le dernier `grep` affiche `0` : aucun test n'appelle la route.
:::

::: indice
Remise à zéro avant la démonstration suivante : rejouer l'étape « Préparer le dépôt de session » (elle contient `git reset --hard origin/demo/revue-defauts` et le nettoyage des fichiers de la revue).
:::

## Démonstration 7 : corriger la règle R3 {.tp}

Une règle qui produit un faux positif se réécrit dans `revue/regles.md`, se commite, et la revue relancée en profite. Branche `demo/revue-defauts`, règles à écrire avec R3 en première version.

### Reconstruire l'état de départ

Prérequis : `git`, `make`, `jq`, `docker` avec Compose, `uv`, `gh` connecté (`gh auth status`) avec le droit de créer un dépôt privé et un accès en lecture à `imihalcea/tickets-api`, une clé SSH enregistrée sur GitHub (les clones passent par l'URL SSH), le port 5432 libre. Claude Code 2.1.310 connecté à un abonnement Anthropic, ou Open Code v2.0.32 avec des identifiants Amazon Bedrock (`AWS_PROFILE` ou clés d'accès, région européenne, accès au modèle `eu.anthropic.claude-sonnet-4-6`). Le modèle est `claude-sonnet-4-6` pour les deux outils : option `--model` et `settings.json` pour Claude Code, champ `model` des agents pour Open Code.

Le dépôt de session est un dépôt privé, copie miroir du dépôt de référence. Le bloc le crée s'il manque, en clone la copie de travail dans `$WORK` et remet l'état d'origine de la branche, même si une démonstration précédente a laissé des fichiers : tout se recrée dans les étapes suivantes.

```bash
export SESSION=demo
export REFERENCE=imihalcea/tickets-api
export TARGET="$REFERENCE-$SESSION"
export WORK="$HOME/travail/tickets-api-$SESSION"

if ! gh repo view "$TARGET" >/dev/null 2>&1; then
  gh repo create "$TARGET" --private --description "Dépôt de session $SESSION"
  tmp=$(mktemp -d)
  git clone --mirror "$(gh repo view "$REFERENCE" --json sshUrl -q .sshUrl)" "$tmp/reference.git"
  git -C "$tmp/reference.git" push --mirror "$(gh repo view "$TARGET" --json sshUrl -q .sshUrl)"
  rm -rf "$tmp"
fi
if [ ! -d "$WORK/.git" ]; then
  mkdir -p "$HOME/travail"
  git clone "$(gh repo view "$TARGET" --json sshUrl -q .sshUrl)" "$WORK"
fi

cd "$WORK"
git fetch --quiet origin
git checkout -- . && git clean -fdq -e .venv -e node_modules
git checkout demo/revue-defauts
git reset --hard origin/demo/revue-defauts
make db-up
uv sync
make test
```

::: attendu
`make test` affiche `57 passed`. Les quatre défauts de la branche ne font échouer aucun test : la revue est le seul filet.
:::

::: indice
Contenu utilisé du dépôt de référence, branche `demo/revue-defauts` :

- `AGENTS.md` : pile (Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, `uv`), commandes et trois règles d'équipe (accès à la base dans `adapters/outbound/` seulement, un test nominal et un test d'erreur par route, aucun secret en dur) dont dérivent R1 à R3.
- `specs/002-responsable-priorite-haute/spec.md` : exigence FR-004, un ticket de priorité `high` garde un responsable.
- `src/tickets/adapters/outbound/notifications.py` : ligne 6, `NOTIFY_TOKEN = "ntfy_9f3a7c21e0b44d8f"` (défaut R3).
- `src/tickets/adapters/inbound/http/routers/tickets.py` : route `assign_ticket` (`PATCH /tickets/{id}/assignee`), qui lit et écrit en base par `unit._session` sans appeler le domaine (défauts R1 et R4).
- `tests/integration/test_tickets_api.py` : aucun test de la route d'attribution (défaut R2).
- `tests/conftest.py` : ligne 6, `monkeypatch.setenv("NOTIFY_TOKEN", "test-token-0000")`, valeur factice (cas voisin de la démonstration 7).
- `Makefile` : `make db-up` (Docker Compose, PostgreSQL sur le port 5432), `make test` (`uv run pytest`), `make lint`.
- `opencode.json` : modèle `amazon-bedrock/eu.anthropic.claude-sonnet-4-6` et serveur MCP `github`, sans objet ici.

Dépôt de session déjà créé par une démonstration précédente : les deux blocs `if` ne font rien. Port 5432 pris par un autre conteneur (par exemple `tickets-api-db-1`) : l'arrêter avant `make db-up`. Dépôt de référence inaccessible : `gh auth status`, puis demander l'accès à `imihalcea/tickets-api`.
:::

### Écrire les règles de revue

Les règles de la démonstration 6, R3 en première version. Un commit local suit à l'étape d'après et sert de point de comparaison : sans lui, `git diff` afficherait un fichier entier créé.

```bash
cd "$WORK"
mkdir -p revue
cat > revue/regles.md <<'EOF'
# Règles de revue

Fichier lu par le reviewer et le contradicteur, commun à Claude Code et Open Code. Chaque règle a cinq champs : énoncé, vérification, violation, conforme, sévérité.

## R1 Accès à la base hors du routeur

Énoncé : le code de `adapters/inbound/` ne touche ni session, ni requête SQL, ni table. L'accès à la base vit dans `adapters/outbound/`.
Vérification : chercher dans le diff, sous `adapters/inbound/`, un import de `tables`, un accès à `_session` ou une requête SQL.
Violation : `row = unit._session.get(TicketRow, ticket_id)` dans un routeur
Conforme : `AssignTicket(uow).execute(ticket_id, payload.assignee)` dans un routeur
Sévérité : haute

## R2 Un test nominal et un test d'erreur par route

Énoncé : toute route ajoutée ou modifiée arrive avec un test nominal et un test d'erreur dans `tests/integration/`.
Vérification : pour chaque route du diff, chercher dans `tests/integration/` un test qui l'appelle avec succès et un test qui l'appelle en erreur.
Violation : route `PATCH /tickets/{id}/assignee` sans aucun test d'intégration
Conforme : `test_assign_ticket_nominal` et `test_assign_ticket_unknown_returns_404`
Sévérité : moyenne

## R3 Aucun secret en clair

Énoncé : aucun jeton, mot de passe ni URL de service en dur dans le code, les tests ou les fixtures.
Vérification : chercher dans le diff un littéral de chaîne affecté à un nom de jeton, de mot de passe ou de clé.
Violation : `API_TOKEN = "abc123"`
Conforme : `API_TOKEN = settings.api_token`
Sévérité : haute

## R4 Conformité à la spécification

Énoncé : un ticket de priorité haute garde un responsable (spécification 002, FR-004) : création, changement de priorité et retrait du responsable sont refusés si le résultat est un ticket `high` sans responsable.
Vérification : lire la spécification donnée en argument, puis chercher dans le diff une route ou un cas d'usage qui contourne `domain/` pour modifier le responsable ou la priorité.
Violation : `PATCH /tickets/{id}/assignee` avec `{"assignee": null}` sur un ticket `high` répond 200
Conforme : la même requête répond 422 et le responsable reste inchangé
Sévérité : haute
EOF
mkdir -p revue
cat > revue/finding.schema.json <<'EOF'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Finding de revue",
  "type": "object",
  "required": ["regle", "fichier", "ligne", "resume", "scenario", "severite"],
  "additionalProperties": false,
  "properties": {
    "regle": { "type": "string", "enum": ["R1", "R2", "R3", "R4"] },
    "fichier": { "type": "string" },
    "ligne": { "type": "integer", "minimum": 1 },
    "resume": { "type": "string" },
    "scenario": { "type": "string", "minLength": 1 },
    "severite": { "type": "string", "enum": ["haute", "moyenne", "basse"] }
  }
}
EOF
```

::: attendu
`jq empty revue/finding.schema.json` ne dit rien et `grep -c "^## R" revue/regles.md` affiche `4`.
:::

### Déclarer le reviewer et la commande /revue

Le reviewer lit sans rien modifier. La commande injecte les règles et le diff dans le prompt, puis lance le reviewer.

::: claude-code
Agent, commande et permissions du projet. `.claude/settings.json` remplace celui de la branche (mêmes entrées, plus `cat`, `grep`, `git add` et `git commit`, utilisés à l'étape « Réécrire R3 »).

```bash
cd "$WORK"
mkdir -p .claude/agents
cat > .claude/agents/reviewer.md <<'EOF'
---
name: reviewer
description: Applique les règles de revue à un diff et rend des findings
tools: Read, Grep, Glob
model: claude-sonnet-4-6
maxTurns: 20
---

Tu appliques les règles de revue (revue/regles.md) au diff reçu. Tu ne modifies rien.

Pour chaque violation, rends un finding : un objet JSON conforme à revue/finding.schema.json
(regle, fichier, ligne, resume, scenario, severite). Le scénario est l'entrée concrète qui produit
le défaut. Pas de scénario, pas de finding. La sévérité est celle de la règle.

Lis le code autour de la ligne signalée avant de conclure. Rends la liste des findings, un objet
JSON par ligne, sans préambule. Sans règle violée, ne rends rien.
EOF
mkdir -p .claude/commands
cat > .claude/commands/revue.md <<'EOF'
---
description: Relit un diff contre les règles de revue
argument-hint: [nom de la spécification]
allowed-tools: Bash(cat *) Bash(git diff *)
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

Lance le sous-agent reviewer sur ce diff avec ces règles et la spécification
specs/$ARGUMENTS/spec.md. Affiche ses findings tels quels.
EOF
mkdir -p .claude
cat > .claude/settings.json <<'EOF'
{
  "model": "claude-sonnet-4-6",
  "permissions": {
    "allow": [
      "Bash(make test *)",
      "Bash(make lint *)",
      "Bash(uv run pytest *)",
      "Bash(uv run ruff *)",
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(cat *)",
      "Bash(grep *)",
      "Bash(git add *)",
      "Bash(git commit *)"
    ]
  }
}
EOF
```

Ouvrir `claude --model claude-sonnet-4-6` une fois dans la copie de travail et accepter le dialogue de confiance du dossier, puis quitter.
:::

::: opencode
Agent et commande en forme v2 (`permissions` en tableau, `mode: subagent`).

```bash
cd "$WORK"
mkdir -p .opencode/agents
cat > .opencode/agents/reviewer.md <<'EOF'
---
description: Applique les règles de revue à un diff et rend des findings
mode: subagent
model: amazon-bedrock/eu.anthropic.claude-sonnet-4-6
steps: 20
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: webfetch, resource: "*", effect: deny }
---

Tu appliques les règles de revue (revue/regles.md) au diff reçu. Tu ne modifies rien.

Pour chaque violation, rends un finding : un objet JSON conforme à revue/finding.schema.json
(regle, fichier, ligne, resume, scenario, severite). Le scénario est l'entrée concrète qui produit
le défaut. Pas de scénario, pas de finding. La sévérité est celle de la règle.

Lis le code autour de la ligne signalée avant de conclure. Rends la liste des findings, un objet
JSON par ligne, sans préambule. Sans règle violée, ne rends rien.
EOF
mkdir -p .opencode/commands
cat > .opencode/commands/revue.md <<'EOF'
---
description: Relit un diff contre les règles de revue
agent: reviewer
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

Applique ces règles à ce diff et à la spécification specs/$ARGUMENTS/spec.md.
Rends tes findings tels quels.
EOF
opencode debug agents | jq -r '.[] | select(.id=="reviewer") | "\(.id)\t\(.mode)"'
```

:::

::: attendu
Claude Code : aucune sortie, les fichiers sont lus au lancement. Open Code : la dernière commande affiche `reviewer` puis `subagent`. `opencode debug agents` liste aussi les règles `edit`, `shell` et `webfetch` du reviewer en `deny`.
:::

::: indice
Sans dialogue de confiance accepté, `claude -p` ignore les `permissions.allow` du projet (avertissement « this workspace has not been trusted ») et le reviewer subit des refus de lecture : coût doublé à l'essai (0,51 contre 0,24 USD). Cette précaution ne concerne pas la session interactive.
:::

### Commiter la première version

```bash
cd "$WORK"
git add revue/regles.md revue/finding.schema.json
git commit -q -m "Revue : règles de revue, R3 en première version" -- revue/regles.md revue/finding.schema.json
git log --oneline -1
```

::: attendu
Le commit « Revue : règles de revue, R3 en première version » est le dernier. Les fichiers de `.claude/` ou `.opencode/` restent non commités.
:::

### Voir le cas voisin

```console
$ grep -n NOTIFY_TOKEN src/tickets/adapters/outbound/notifications.py tests/conftest.py
```

::: attendu
Deux lignes qui diffèrent : le littéral `ntfy_9f3a7c21e0b44d8f` (`notifications.py:6`, un vrai défaut) et `monkeypatch.setenv("NOTIFY_TOKEN", "test-token-0000")` (`tests/conftest.py:6`, une valeur factice). R3 vise « le code, les tests ou les fixtures » : à la lettre, elle signalerait aussi la seconde. Le modèle ne la signale pas toujours : le faux positif n'est pas garanti. Corriger la règle par prévention.
:::

### Réécrire R3

Lancer l'agent de code dans la copie de travail (`claude --model claude-sonnet-4-6` ou `opencode`). Le reviewer est en lecture seule : l'agent principal modifie le fichier. Accepter la permission d'écrire `revue/regles.md` si la session la demande.

```prompt
Réécris la règle R3 de revue/regles.md : elle continue de signaler tout identifiant émis écrit en clair dans src/ (préfixe de fournisseur, séparateur - ou _, au moins seize caractères hexadécimaux), exclut tests/ et donne un exemple conforme dans tests/. Commite la modification.
```

Relire ensuite la différence :

```console
$ git diff HEAD~1 -- revue/regles.md
```

::: attendu
Seule la section R3 change : l'énoncé vise les identifiants émis dans `src/`, la vérification décrit un préfixe de fournisseur suivi d'au moins seize caractères hexadécimaux avec `tests/` exclu, un exemple conforme figure dans `tests/`. Règle de référence :

```diff
-Énoncé : aucun jeton, mot de passe ni URL de service en dur dans le code, les tests ou les fixtures.
-Vérification : chercher dans le diff un littéral de chaîne affecté à un nom de jeton, de mot de passe ou de clé.
-Violation : `API_TOKEN = "abc123"`
-Conforme : `API_TOKEN = settings.api_token`
+Énoncé : aucun identifiant émis (jeton, mot de passe, clé) en dur dans `src/`.
+Vérification : chercher dans le diff de `src/` un littéral qui a la forme d'un identifiant émis : préfixe de fournisseur suivi d'au moins seize caractères hexadécimaux. Les fichiers de `tests/` sont exclus.
+Violation : `API_TOKEN = "ntfy_9f3a7c21e0b44d8f"`
+Conforme : `API_TOKEN = settings.api_token` ; dans `tests/`, `monkeypatch.setenv("API_TOKEN", "test-token-0000")`
```

Le commit passe sans refus de permission (en mode non interactif sous Claude Code : `--permission-mode acceptEdits`). La règle écrite varie de mots et d'exemples ; le motif doit couvrir un séparateur `-` ou `_` entre le préfixe et les caractères hexadécimaux, sans quoi R3 disparaît de la revue suivante.
:::

::: indice
Règle écrite à contresens ou séparateur `_` oublié : appliquer la règle de référence, un patch du fichier de règles.

```bash
cd "$WORK"
git apply <<'EOF'
--- a/revue/regles.md
+++ b/revue/regles.md
@@ -20,10 +20,10 @@
 
 ## R3 Aucun secret en clair
 
-Énoncé : aucun jeton, mot de passe ni URL de service en dur dans le code, les tests ou les fixtures.
-Vérification : chercher dans le diff un littéral de chaîne affecté à un nom de jeton, de mot de passe ou de clé.
-Violation : `API_TOKEN = "abc123"`
-Conforme : `API_TOKEN = settings.api_token`
+Énoncé : aucun identifiant émis (jeton, mot de passe, clé) en dur dans `src/`.
+Vérification : chercher dans le diff de `src/` un littéral qui a la forme d'un identifiant émis : préfixe de fournisseur suivi d'au moins seize caractères hexadécimaux. Les fichiers de `tests/` sont exclus.
+Violation : `API_TOKEN = "ntfy_9f3a7c21e0b44d8f"`
+Conforme : `API_TOKEN = settings.api_token` ; dans `tests/`, `monkeypatch.setenv("API_TOKEN", "test-token-0000")`
 Sévérité : haute
 
 ## R4 Conformité à la spécification
EOF
git add revue/regles.md
git commit -q -m "Revue : règle R3 réduite aux identifiants émis de src/" -- revue/regles.md
```

Autre variante : réécrire la règle à la main dans l'éditeur, plus lisible que par prompt.
:::

### Relancer la revue

Prompt, dans la session :

```prompt
/revue 002-responsable-priorite-haute
```

::: attendu
Le finding R3 sur `notifications.py:6` survit à la correction, avec R4, R1 et R2 : quatre findings, cinq si R1 est scindé en deux objets. Un R3 perdu signale une règle écrite à contresens ou un séparateur `_` oublié : appliquer le patch de l'indice de l'étape précédente et relancer. Le finding sur `tests/conftest.py` n'existait pas au départ : sa disparition ne se démontre pas.

Contrepartie à signaler : l'exclusion de `tests/` supprime aussi la détection d'un vrai secret commité dans un test. Aucune commande ne la montre.
:::

::: indice
Claude Code, mode non interactif (le prompt précède `--allowedTools`, option variadique) :

```bash
claude -p "/revue 002-responsable-priorite-haute" --model claude-sonnet-4-6 \
  --allowedTools "Bash(cat *)" "Bash(grep *)" "Bash(git diff *)" "Bash(git log *)"
```

Constaté sur Open Code v2.0.32, comportement que la documentation ne décrit pas : `opencode run` (mode non interactif) ne développe ni `/revue` ni les blocs `` !`…` `` : le script suivant assemble le prompt de la commande puis lance `opencode run`. À poser une fois, hors de la copie.

```bash
cat > "$HOME/lancer-opencode.sh" <<'EOF'
#!/usr/bin/env bash
# Exécution non interactive sous Open Code v2.0.32 : `opencode run` ne développe ni /revue ni !`cmd`.
# Ce script lit le fichier de la commande, retire le frontmatter, remplace $ARGUMENTS, exécute les
# blocs !`cmd` dans la copie de travail, puis lance opencode run avec le prompt assemblé.
# Usage : lancer-opencode.sh <copie de travail> <revue|revue-adverse> <spécification> [agent]
#   agent : défaut reviewer pour revue, agent principal (build) pour revue-adverse
# Variable : MODEL (défaut amazon-bedrock/eu.anthropic.claude-sonnet-4-6)
set -euo pipefail
work="${1:?usage: lancer-opencode.sh <copie> <revue|revue-adverse> <spec> [agent]}"
cmd="${2:?commande}"
spec="${3:?spécification}"
default_agent=""; [ "$cmd" = "revue" ] && default_agent="reviewer"
agent="${4:-$default_agent}"
model="${MODEL:-amazon-bedrock/eu.anthropic.claude-sonnet-4-6}"
file="$work/.opencode/commands/$cmd.md"
[ -f "$file" ] || { echo "KO : $file absent"; exit 1; }

prompt=""
in_front=0; seen_front=0
while IFS= read -r line; do
  if [ "$line" = "---" ] && [ "$seen_front" -eq 0 ]; then
    if [ "$in_front" -eq 0 ]; then in_front=1; continue; else in_front=0; seen_front=1; continue; fi
  fi
  [ "$in_front" -eq 1 ] && continue
  line="${line//\$ARGUMENTS/$spec}"
  if [[ "$line" =~ ^\!\`(.*)\`$ ]]; then
    out="$(cd "$work" && bash -c "${BASH_REMATCH[1]}")"
    prompt+="$out"$'\n'
  else
    prompt+="$line"$'\n'
  fi
done < "$file"

cd "$work"
args=(run --model "$model")
[ -n "$agent" ] && args+=(--agent "$agent")
opencode "${args[@]}" "$prompt"
EOF
chmod +x "$HOME/lancer-opencode.sh"
```

Lancer ensuite `"$HOME/lancer-opencode.sh" "$WORK" revue 002-responsable-priorite-haute`.

Remise à zéro avant la démonstration suivante : rejouer l'étape « Reconstruire l'état de départ » (le `git reset --hard` retire aussi les deux commits locaux).
:::

## Démonstration 8 : lancer une revue adverse {.tp}

`/revue-adverse` lance le reviewer, puis un contradicteur par finding de sévérité haute dans le même tour. Chaque finding arrive avec un verdict et sa preuve. Branche `demo/revue-defauts`, règle R3 corrigée.

### Reconstruire l'état de départ

Prérequis : `git`, `make`, `jq`, `docker` avec Compose, `uv`, `gh` connecté (`gh auth status`) avec le droit de créer un dépôt privé et un accès en lecture à `imihalcea/tickets-api`, une clé SSH enregistrée sur GitHub (les clones passent par l'URL SSH), le port 5432 libre. Claude Code 2.1.310 connecté à un abonnement Anthropic, ou Open Code v2.0.32 avec des identifiants Amazon Bedrock (`AWS_PROFILE` ou clés d'accès, région européenne, accès au modèle `eu.anthropic.claude-sonnet-4-6`). Le modèle est `claude-sonnet-4-6` pour les deux outils : option `--model` et `settings.json` pour Claude Code, champ `model` des agents pour Open Code.

Le dépôt de session est un dépôt privé, copie miroir du dépôt de référence. Le bloc le crée s'il manque, en clone la copie de travail dans `$WORK` et remet l'état d'origine de la branche, même si une démonstration précédente a laissé des fichiers. Les fichiers de la revue et la règle R3 corrigée se posent dans les deux étapes suivantes.

```bash
export SESSION=demo
export REFERENCE=imihalcea/tickets-api
export TARGET="$REFERENCE-$SESSION"
export WORK="$HOME/travail/tickets-api-$SESSION"

if ! gh repo view "$TARGET" >/dev/null 2>&1; then
  gh repo create "$TARGET" --private --description "Dépôt de session $SESSION"
  tmp=$(mktemp -d)
  git clone --mirror "$(gh repo view "$REFERENCE" --json sshUrl -q .sshUrl)" "$tmp/reference.git"
  git -C "$tmp/reference.git" push --mirror "$(gh repo view "$TARGET" --json sshUrl -q .sshUrl)"
  rm -rf "$tmp"
fi
if [ ! -d "$WORK/.git" ]; then
  mkdir -p "$HOME/travail"
  git clone "$(gh repo view "$TARGET" --json sshUrl -q .sshUrl)" "$WORK"
fi

cd "$WORK"
git fetch --quiet origin
git checkout -- . && git clean -fdq -e .venv -e node_modules
git checkout demo/revue-defauts
git reset --hard origin/demo/revue-defauts
make db-up
uv sync
make test
```

::: attendu
`make test` affiche `57 passed`. Les quatre défauts de la branche ne font échouer aucun test : la revue est le seul filet.
:::

::: indice
Contenu utilisé du dépôt de référence, branche `demo/revue-defauts` :

- `AGENTS.md` : pile (Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, `uv`), commandes et trois règles d'équipe (accès à la base dans `adapters/outbound/` seulement, un test nominal et un test d'erreur par route, aucun secret en dur) dont dérivent R1 à R3.
- `specs/002-responsable-priorite-haute/spec.md` : exigence FR-004, un ticket de priorité `high` garde un responsable.
- `src/tickets/adapters/outbound/notifications.py` : ligne 6, `NOTIFY_TOKEN = "ntfy_9f3a7c21e0b44d8f"` (défaut R3).
- `src/tickets/adapters/inbound/http/routers/tickets.py` : route `assign_ticket` (`PATCH /tickets/{id}/assignee`), qui lit et écrit en base par `unit._session` sans appeler le domaine (défauts R1 et R4).
- `tests/integration/test_tickets_api.py` : aucun test de la route d'attribution (défaut R2).
- `tests/conftest.py` : ligne 6, `monkeypatch.setenv("NOTIFY_TOKEN", "test-token-0000")`, valeur factice (cas voisin de la démonstration 7).
- `Makefile` : `make db-up` (Docker Compose, PostgreSQL sur le port 5432), `make test` (`uv run pytest`), `make lint`.
- `opencode.json` : modèle `amazon-bedrock/eu.anthropic.claude-sonnet-4-6` et serveur MCP `github`, sans objet ici.

Dépôt de session déjà créé par une démonstration précédente : les deux blocs `if` ne font rien. Port 5432 pris par un autre conteneur (par exemple `tickets-api-db-1`) : l'arrêter avant `make db-up`. Dépôt de référence inaccessible : `gh auth status`, puis demander l'accès à `imihalcea/tickets-api`.
:::

### Écrire les règles, R3 corrigée

Le fichier de règles de la démonstration 7 après correction : R3 limitée aux identifiants émis de `src/`. Les fichiers restent non commités.

```bash
cd "$WORK"
mkdir -p revue
cat > revue/regles.md <<'EOF'
# Règles de revue

Fichier lu par le reviewer et le contradicteur, commun à Claude Code et Open Code. Chaque règle a cinq champs : énoncé, vérification, violation, conforme, sévérité.

## R1 Accès à la base hors du routeur

Énoncé : le code de `adapters/inbound/` ne touche ni session, ni requête SQL, ni table. L'accès à la base vit dans `adapters/outbound/`.
Vérification : chercher dans le diff, sous `adapters/inbound/`, un import de `tables`, un accès à `_session` ou une requête SQL.
Violation : `row = unit._session.get(TicketRow, ticket_id)` dans un routeur
Conforme : `AssignTicket(uow).execute(ticket_id, payload.assignee)` dans un routeur
Sévérité : haute

## R2 Un test nominal et un test d'erreur par route

Énoncé : toute route ajoutée ou modifiée arrive avec un test nominal et un test d'erreur dans `tests/integration/`.
Vérification : pour chaque route du diff, chercher dans `tests/integration/` un test qui l'appelle avec succès et un test qui l'appelle en erreur.
Violation : route `PATCH /tickets/{id}/assignee` sans aucun test d'intégration
Conforme : `test_assign_ticket_nominal` et `test_assign_ticket_unknown_returns_404`
Sévérité : moyenne

## R3 Aucun secret en clair

Énoncé : aucun identifiant émis (jeton, mot de passe, clé) en dur dans `src/`.
Vérification : chercher dans le diff de `src/` un littéral qui a la forme d'un identifiant émis : préfixe de fournisseur suivi d'au moins seize caractères hexadécimaux. Les fichiers de `tests/` sont exclus.
Violation : `API_TOKEN = "ntfy_9f3a7c21e0b44d8f"`
Conforme : `API_TOKEN = settings.api_token` ; dans `tests/`, `monkeypatch.setenv("API_TOKEN", "test-token-0000")`
Sévérité : haute

## R4 Conformité à la spécification

Énoncé : un ticket de priorité haute garde un responsable (spécification 002, FR-004) : création, changement de priorité et retrait du responsable sont refusés si le résultat est un ticket `high` sans responsable.
Vérification : lire la spécification donnée en argument, puis chercher dans le diff une route ou un cas d'usage qui contourne `domain/` pour modifier le responsable ou la priorité.
Violation : `PATCH /tickets/{id}/assignee` avec `{"assignee": null}` sur un ticket `high` répond 200
Conforme : la même requête répond 422 et le responsable reste inchangé
Sévérité : haute
EOF
mkdir -p revue
cat > revue/finding.schema.json <<'EOF'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Finding de revue",
  "type": "object",
  "required": ["regle", "fichier", "ligne", "resume", "scenario", "severite"],
  "additionalProperties": false,
  "properties": {
    "regle": { "type": "string", "enum": ["R1", "R2", "R3", "R4"] },
    "fichier": { "type": "string" },
    "ligne": { "type": "integer", "minimum": 1 },
    "resume": { "type": "string" },
    "scenario": { "type": "string", "minLength": 1 },
    "severite": { "type": "string", "enum": ["haute", "moyenne", "basse"] }
  }
}
EOF
```

::: attendu
`jq empty revue/finding.schema.json` ne dit rien et `grep -c "^## R" revue/regles.md` affiche `4`. Dans `revue/regles.md`, R3 commence par « aucun identifiant émis ».
:::

### Déclarer le reviewer et la commande /revue

Le reviewer lit sans rien modifier. La commande injecte les règles et le diff dans le prompt, puis lance le reviewer.

::: claude-code
Agent, commande et permissions du projet. `.claude/settings.json` remplace celui de la branche (mêmes entrées, plus `cat` et `grep`).

```bash
cd "$WORK"
mkdir -p .claude/agents
cat > .claude/agents/reviewer.md <<'EOF'
---
name: reviewer
description: Applique les règles de revue à un diff et rend des findings
tools: Read, Grep, Glob
model: claude-sonnet-4-6
maxTurns: 20
---

Tu appliques les règles de revue (revue/regles.md) au diff reçu. Tu ne modifies rien.

Pour chaque violation, rends un finding : un objet JSON conforme à revue/finding.schema.json
(regle, fichier, ligne, resume, scenario, severite). Le scénario est l'entrée concrète qui produit
le défaut. Pas de scénario, pas de finding. La sévérité est celle de la règle.

Lis le code autour de la ligne signalée avant de conclure. Rends la liste des findings, un objet
JSON par ligne, sans préambule. Sans règle violée, ne rends rien.
EOF
mkdir -p .claude/commands
cat > .claude/commands/revue.md <<'EOF'
---
description: Relit un diff contre les règles de revue
argument-hint: [nom de la spécification]
allowed-tools: Bash(cat *) Bash(git diff *)
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

Lance le sous-agent reviewer sur ce diff avec ces règles et la spécification
specs/$ARGUMENTS/spec.md. Affiche ses findings tels quels.
EOF
mkdir -p .claude
cat > .claude/settings.json <<'EOF'
{
  "model": "claude-sonnet-4-6",
  "permissions": {
    "allow": [
      "Bash(make test *)",
      "Bash(make lint *)",
      "Bash(uv run pytest *)",
      "Bash(uv run ruff *)",
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(cat *)",
      "Bash(grep *)"
    ]
  }
}
EOF
```

Ouvrir `claude --model claude-sonnet-4-6` une fois dans la copie de travail et accepter le dialogue de confiance du dossier, puis quitter.
:::

::: opencode
Agent et commande en forme v2 (`permissions` en tableau, `mode: subagent`).

```bash
cd "$WORK"
mkdir -p .opencode/agents
cat > .opencode/agents/reviewer.md <<'EOF'
---
description: Applique les règles de revue à un diff et rend des findings
mode: subagent
model: amazon-bedrock/eu.anthropic.claude-sonnet-4-6
steps: 20
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: webfetch, resource: "*", effect: deny }
---

Tu appliques les règles de revue (revue/regles.md) au diff reçu. Tu ne modifies rien.

Pour chaque violation, rends un finding : un objet JSON conforme à revue/finding.schema.json
(regle, fichier, ligne, resume, scenario, severite). Le scénario est l'entrée concrète qui produit
le défaut. Pas de scénario, pas de finding. La sévérité est celle de la règle.

Lis le code autour de la ligne signalée avant de conclure. Rends la liste des findings, un objet
JSON par ligne, sans préambule. Sans règle violée, ne rends rien.
EOF
mkdir -p .opencode/commands
cat > .opencode/commands/revue.md <<'EOF'
---
description: Relit un diff contre les règles de revue
agent: reviewer
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

Applique ces règles à ce diff et à la spécification specs/$ARGUMENTS/spec.md.
Rends tes findings tels quels.
EOF
opencode debug agents | jq -r '.[] | select(.id=="reviewer") | "\(.id)\t\(.mode)"'
```

:::

::: attendu
Claude Code : aucune sortie, les fichiers sont lus au lancement. Open Code : la dernière commande affiche `reviewer` puis `subagent`. `opencode debug agents` liste aussi les règles `edit`, `shell` et `webfetch` du reviewer en `deny`.
:::

::: indice
Sans dialogue de confiance accepté, `claude -p` ignore les `permissions.allow` du projet (avertissement « this workspace has not been trusted ») et le reviewer subit des refus de lecture : coût doublé à l'essai (0,51 contre 0,24 USD). Cette précaution ne concerne pas la session interactive.
:::

### Déclarer le contradicteur et la commande /revue-adverse

Le contradicteur essaie de réfuter un finding et rend un verdict (confirmé, plausible ou réfuté) avec une preuve. Il ne modifie rien. La commande lance le reviewer, puis un contradicteur par finding de sévérité haute.

::: claude-code
Agent et commande, en plus de ceux de l'étape précédente. La limite aux commandes de lecture et `make test` passe par `permissions.allow` du projet (déjà posé).

```bash
cd "$WORK"
mkdir -p .claude/agents
cat > .claude/agents/contradicteur.md <<'EOF'
---
name: contradicteur
description: Tente de réfuter un finding en lisant le code et en lançant les tests
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
model: claude-sonnet-4-6
maxTurns: 20
---

Tu reçois un finding. Prouve qu'il est faux : rejoue son scénario d'échec. Si un test existant
le couvre, lance-le avec `make test` et cite sa sortie ; sinon cite la ligne de code qui produit
le défaut.
Rends un verdict (confirmé, plausible ou réfuté) avec sa preuve : sortie de commande
ou ligne de code citée. Un verdict sans preuve n'est pas accepté.

Lance seulement des commandes de lecture ou `make test`. Tu ne modifies aucun fichier.
Réponse, sans préambule : `verdict: <confirmé|plausible|réfuté>`, puis `preuve:` sur une ou
deux lignes.
EOF
mkdir -p .claude/commands
cat > .claude/commands/revue-adverse.md <<'EOF'
---
description: Revue suivie d'un contradicteur par finding de sévérité haute
argument-hint: [nom de la spécification]
allowed-tools: Bash(cat *) Bash(git diff *)
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

1. Lance le sous-agent reviewer sur ce diff avec ces règles et la spécification
   specs/$ARGUMENTS/spec.md.
2. Pour chaque finding de sévérité haute, lance dans le même tour un sous-agent
   contradicteur qui reçoit ce finding seul.
3. Affiche chaque finding avec son verdict et sa preuve. Les findings de sévérité moyenne ou
   basse sont affichés sans contradicteur.
EOF
```
:::

::: opencode
Agent et commande. Pas de champ `agent` dans la commande : l'agent principal (`build`) doit lancer deux sous-agents. Le contradicteur ne peut lancer que `make test*` et `grep *`.

```bash
cd "$WORK"
mkdir -p .opencode/agents
cat > .opencode/agents/contradicteur.md <<'EOF'
---
description: Tente de réfuter un finding en lisant le code et en lançant les tests
mode: subagent
model: amazon-bedrock/eu.anthropic.claude-sonnet-4-6
steps: 20
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: shell, resource: "make test*", effect: allow }
  - { action: shell, resource: "grep *", effect: allow }
  - { action: webfetch, resource: "*", effect: deny }
---

Tu reçois un finding. Prouve qu'il est faux : rejoue son scénario d'échec. Si un test existant
le couvre, lance-le avec `make test` et cite sa sortie ; sinon cite la ligne de code qui produit
le défaut.
Rends un verdict (confirmé, plausible ou réfuté) avec sa preuve : sortie de commande
ou ligne de code citée. Un verdict sans preuve n'est pas accepté.

Lance seulement `make test` ou `grep`. Tu ne modifies aucun fichier.
Réponse, sans préambule : `verdict: <confirmé|plausible|réfuté>`, puis `preuve:` sur une ou
deux lignes.
EOF
mkdir -p .opencode/commands
cat > .opencode/commands/revue-adverse.md <<'EOF'
---
description: Revue suivie d'un contradicteur par finding de sévérité haute
---

Règles de revue :

!`cat revue/regles.md`

Diff à relire (branche courante contre origin/main) :

!`git diff origin/main...HEAD`

1. Lance le sous-agent reviewer sur ce diff avec ces règles et la spécification
   specs/$ARGUMENTS/spec.md.
2. Pour chaque finding de sévérité haute, lance dans le même tour un sous-agent
   contradicteur qui reçoit ce finding seul.
3. Affiche chaque finding avec son verdict et sa preuve. Les findings de sévérité moyenne ou
   basse sont affichés sans contradicteur.
EOF
opencode debug agents | jq -r '.[] | select(.id=="reviewer" or .id=="contradicteur") | "\(.id)\t\(.mode)"'
```
:::

::: attendu
Open Code : la dernière commande affiche `contradicteur` et `reviewer`, tous deux `subagent`. Claude Code : aucune sortie, les fichiers sont lus au lancement.
:::

### Lancer la revue adverse

::: claude-code
```console
$ cd "$WORK"
$ claude --model claude-sonnet-4-6
```
:::

::: opencode
```console
$ cd "$WORK"
$ opencode
```
:::

Prompt, dans la session :

```prompt
/revue-adverse 002-responsable-priorite-haute
```

::: attendu
Le reviewer rend ses findings (cinq objets si R1 est scindé en deux), puis un contradicteur par finding de sévérité haute part dans le même tour : trois ou quatre selon le découpage de R1. R2 (sévérité moyenne) s'affiche sans contradicteur. Verdicts attendus, en général tous « confirmé » : R3 avec `NOTIFY_TOKEN = "ntfy_9f3a7c21e0b44d8f"` ligne 6 et l'usage ligne 14 ; R4 avec `assign_ticket` qui n'appelle jamais la garde du domaine (lignes 59 à 63) ; R1 avec les lignes 14, 59 et 63 du routeur.

Les contradicteurs citent des lignes de code lues (`grep -n`, lecture) et relancent rarement `make test` ou une requête HTTP. Aucun n'écrit un fichier ni ne subit un refus de permission. L'agent principal reformate les verdicts (titres, rapport) au lieu de les afficher tels quels. Sous Claude Code, les contradicteurs partent dans le même tour ; sous Open Code, leurs exécutions se chevauchent.
:::

::: indice
Claude Code, mode non interactif (le prompt précède `--allowedTools`, option variadique) :

```bash
claude -p "/revue-adverse 002-responsable-priorite-haute" --model claude-sonnet-4-6 --output-format json \
  --allowedTools "Bash(cat *)" "Bash(grep *)" "Bash(git diff *)" "Bash(git log *)" "Bash(make test*)" "Bash(uv run pytest *)"
```

Le JSON donne `total_cost_usd`.

Constaté sur Open Code v2.0.32, comportement que la documentation ne décrit pas : `opencode run` (mode non interactif) ne développe ni `/revue-adverse` ni les blocs `` !`…` `` : le script suivant assemble le prompt de la commande puis lance `opencode run`. À poser une fois, hors de la copie.

```bash
cat > "$HOME/lancer-opencode.sh" <<'EOF'
#!/usr/bin/env bash
# Exécution non interactive sous Open Code v2.0.32 : `opencode run` ne développe ni /revue ni !`cmd`.
# Ce script lit le fichier de la commande, retire le frontmatter, remplace $ARGUMENTS, exécute les
# blocs !`cmd` dans la copie de travail, puis lance opencode run avec le prompt assemblé.
# Usage : lancer-opencode.sh <copie de travail> <revue|revue-adverse> <spécification> [agent]
#   agent : défaut reviewer pour revue, agent principal (build) pour revue-adverse
# Variable : MODEL (défaut amazon-bedrock/eu.anthropic.claude-sonnet-4-6)
set -euo pipefail
work="${1:?usage: lancer-opencode.sh <copie> <revue|revue-adverse> <spec> [agent]}"
cmd="${2:?commande}"
spec="${3:?spécification}"
default_agent=""; [ "$cmd" = "revue" ] && default_agent="reviewer"
agent="${4:-$default_agent}"
model="${MODEL:-amazon-bedrock/eu.anthropic.claude-sonnet-4-6}"
file="$work/.opencode/commands/$cmd.md"
[ -f "$file" ] || { echo "KO : $file absent"; exit 1; }

prompt=""
in_front=0; seen_front=0
while IFS= read -r line; do
  if [ "$line" = "---" ] && [ "$seen_front" -eq 0 ]; then
    if [ "$in_front" -eq 0 ]; then in_front=1; continue; else in_front=0; seen_front=1; continue; fi
  fi
  [ "$in_front" -eq 1 ] && continue
  line="${line//\$ARGUMENTS/$spec}"
  if [[ "$line" =~ ^\!\`(.*)\`$ ]]; then
    out="$(cd "$work" && bash -c "${BASH_REMATCH[1]}")"
    prompt+="$out"$'\n'
  else
    prompt+="$line"$'\n'
  fi
done < "$file"

cd "$work"
args=(run --model "$model")
[ -n "$agent" ] && args+=(--agent "$agent")
opencode "${args[@]}" "$prompt"
EOF
chmod +x "$HOME/lancer-opencode.sh"
```

Lancer ensuite `"$HOME/lancer-opencode.sh" "$WORK" revue-adverse 002-responsable-priorite-haute`.

Le script lance l'agent principal (`build`), seul à pouvoir lancer deux sous-agents. Repli si le modèle ou le réseau échoue : lire un à un les défauts dans le code et dire le verdict attendu, « confirmé », avec la ligne citée.

```console
$ grep -n NOTIFY_TOKEN src/tickets/adapters/outbound/notifications.py
$ sed -n 56,66p src/tickets/adapters/inbound/http/routers/tickets.py
$ grep -c "/assignee" tests/integration/test_tickets_api.py
```

Sorties : `notifications.py:6` porte le littéral `ntfy_9f3a7c21e0b44d8f` ; le routeur lit puis écrit en base par `unit._session` dans `assign_ticket` ; le dernier `grep` affiche `0`.
:::

### Comparer le coût

Relever le coût de la revue adverse (`/usage` sous Claude Code, coût affiché de la session sous Open Code), puis relancer la revue sans contradicteur dans la même copie :

```prompt
/revue 002-responsable-priorite-haute
```

::: attendu
La revue adverse coûte plus que la revue sans contradicteur : chaque contradicteur est un sous-agent de plus, avec sa fenêtre de contexte neuve (instructions fixes et lectures). Le coût se lit dans `/usage` (Claude Code) ou dans le coût affiché de la session (Open Code, session principale seule : l'écart réel est plus grand).
:::

::: indice
Sans contradicteur en mode non interactif : `claude -p "/revue 002-responsable-priorite-haute" --model claude-sonnet-4-6 --output-format json --allowedTools "Bash(cat *)" "Bash(grep *)" "Bash(git diff *)" "Bash(git log *)"` ; sous Open Code, `"$HOME/lancer-opencode.sh" "$WORK" revue 002-responsable-priorite-haute` (script de l'indice de l'étape « Lancer la revue adverse »). Remise à zéro : rejouer l'étape « Reconstruire l'état de départ ».
:::

## Glossaire : revue et findings {kicker="Glossaire"}

- **Revue automatisée** : exécution de l'agent de code qui relit un diff ; l'humain tranche
- **Finding** : remarque localisée rendue par une revue automatisée sur un diff
- **Sévérité** : niveau d'un finding, haute, moyenne ou basse
- **Scénario d'échec** : entrée concrète qui produit le défaut décrit par le finding
- **Reviewer** : sous-agent en lecture seule qui applique les règles de revue et rend des findings

::: sources
- [Claude Code, Code Review](https://code.claude.com/docs/en/code-review)
- [Claude Code, Review locally with /code-review](https://code.claude.com/docs/en/code-review-local)
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : règles et faux positifs {kicker="Glossaire"}

- **Règle d'équipe** : phrase de `AGENTS.md` qui dit quoi faire, sans vérification ni exemple
- **Règle de revue** : énoncé que le diff peut violer, avec vérification, exemple de violation, exemple conforme et sévérité
- **Vérification** : ce que la revue lit pour décider si le diff viole la règle
- **Identifiant émis** : jeton, mot de passe ou clé délivré par un fournisseur, distinct d'une valeur factice de test
- **Faux positif** : finding sur un code conforme

::: sources
- Dépôt tickets-api, `AGENTS.md` et `revue/regles.md`
- [SWR-Bench, arXiv 2509.01494](https://arxiv.org/abs/2509.01494)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : modes et contradicteur {kicker="Glossaire"}

- **Mode de revue** : moment où le reviewer tourne, à la demande, sur la pull request ou avant le commit
- **Contradicteur** : sous-agent chargé de prouver qu'un finding est faux
- **Verdict** : réponse du contradicteur, confirmé, plausible ou réfuté, avec preuve
- **Revue adverse** : revue suivie d'un contradicteur par finding de sévérité haute
- **Code Review** : service hébergé d'Anthropic qui relit les pull requests GitHub, distinct de la commande `/code-review`

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents](https://opencode.ai/v2/docs/agents/)
- [Claude Code, Code Review](https://code.claude.com/docs/en/code-review)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::
