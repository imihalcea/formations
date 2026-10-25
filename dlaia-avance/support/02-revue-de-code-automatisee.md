# Revue de code automatisée

Une revue automatisée relit un diff contre des règles écrites, rend des findings vérifiables et tient en trois modes.

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
Bloc relevé sur la branche `demo/revue-defauts` de tickets-api le 25 octobre 2026 : deux commits (spec 002 livrée, défauts plantés). Le sujet du deuxième commit est tronqué (`[…]`). Un troisième commit, celui des fichiers de la revue (`revue/`, agents, commandes), s'ajoute avec les démonstrations : mettre le bloc à jour au rejeu (trois commits, nouveau `--stat`).
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
Bloc : illustration du format (fichier, ligne, résumé, sévérité), rédigée d'après le code réel de la branche (`NOTIFY_TOKEN` à la ligne 6 de `notifications.py`) ; le finding réellement rendu est à relever à la démonstration 1.
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
Les défauts de la branche `demo/revue-defauts` sont tirés de ces quatre lignes (un par ligne) : la démonstration 1 les retrouve.
Exemple de comportement : la spécification 002 (FR-004) refuse un ticket de priorité haute sans responsable, y compris par retrait du responsable.
:::

## Limites mesurées des revues automatisées {.figures kicker="Périmètre"}

- **19 %** score F1, meilleur outil de revue
- **20 à 32 %** défauts corrigés, un outil
- **41 %** défauts corrigés, quatre outils

Deux mesures de 2025 et 2026.

::: sources
- [SWR-Bench, arXiv 2509.01494, table 4](https://arxiv.org/pdf/2509.01494)
- [c-CRAB, arXiv 2603.23448](https://arxiv.org/pdf/2603.23448)
:::

::: notes
Chiffres relus dans les PDF le 25 octobre 2026. Précision : part des remarques qui touchent un vrai défaut. Rappel : part des vrais défauts que les remarques touchent. Le score F1 combine les deux (moyenne harmonique).
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
Remarque pour l'animation : la règle 3 vise aussi « les tests ou les fixtures », ce qui sert la démonstration de faux positif.
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
Première version de R3 dans `revue/regles.md` : traduction littérale de la règle 3 d'`AGENTS.md`, cinq champs. Cette version est celle qui doit produire le faux positif de la démonstration 1 (valeur factice de `tests/conftest.py`, non rendue au rejeu) : ne pas la corriger avant la section « Faux positifs ».
Point de vigilance : la phrase d'`AGENTS.md` vise aussi les tests. La réécriture de la démonstration 2 réduit la règle aux identifiants émis et exclut `tests/` ; c'est un choix de l'équipe, pas une lecture de la règle d'origine.
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

Illustration : le finding R4 de la démonstration.

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
Open Code v2 : champs `description`, `agent`, `model`, `subagent` (l'ancien `subtask` est un alias déprécié) ; `$ARGUMENTS` et `$1`, `$2` ; les blocs `` !`…` `` s'exécutent à l'évaluation de la commande, hors du flux de permissions des outils de l'agent. `agent: reviewer` désigne l'agent qui exécute la commande : si le reviewer, de mode `subagent`, s'exécute bien dans la session courante ou dans une session enfant, c'est à relever à la démonstration 1 (TUI).
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
Open Code v2.0.32 : `opencode run` envoie le message tel quel, il ne développe ni `/revue` ni `` !`…` `` ; la commande personnalisée ne sert donc pas en mode non interactif. Le script assemble le prompt (règles, diff) et lance `opencode run --agent reviewer`. L'entrée standard s'ajoute au message : constaté les 18 et 20 octobre 2026 (voir `formateur/equivalences.md`), non documenté, signalé comme tel : la page v1 (`opencode.ai/docs/cli/`) décrit `--agent`, `--model`, `--format`, la page v2 (`opencode.ai/v2/docs/cli/`) ne les détaille pas. À confirmer par `opencode run --help` au rejeu. La forme `git diff … | opencode run --agent reviewer` avec l'entrée standard n'a pas été exécutée : à vérifier en séance (le runbook passe par `lancer-opencode.sh`).
Le module 3 reprend ces deux formes dans le hook pre-commit et dans le job de CI.
:::

## Démonstration : revue à la demande {kicker="Modes"}

```prompt
/revue 002-responsable-priorite-haute
```

Observer : les fichiers que le reviewer ouvre, puis les findings classés par sévérité.

::: notes
Démonstration 1, runbook `demos/07-revue-a-la-demande/`. Branche `demo/revue-defauts`, après `make db-up` et `make test`.
Déroulé : 1. `git log --oneline origin/main..HEAD` : les commits à relire. 2. Lire `revue/regles.md` (R1 à R4). 3. Lancer le prompt. 4. Lire les appels de lecture du reviewer. 5. Parcourir les findings par sévérité. 6. Si un finding porte sur un code conforme (`tests/conftest.py`), la section suivante le traite ; sinon, dire que le modèle l'a écarté et montrer sa ligne dans `sortie-reference.md`.
Claude Code : commande développée dans la session. Open Code : TUI pour `/revue` ; pour le rejeu, script qui assemble le prompt et lance `opencode run --agent reviewer` (v2.0.32 ne développe pas `/revue` en non interactif).
Résultat attendu : R3 sur `notifications.py` (jeton `NOTIFY_TOKEN`), R4 sur le routeur qui accepte de retirer le responsable d'un ticket `high` (422 attendu), R1 sur le routeur qui écrit en base (`unit._session`, import de `TicketRow`), R2 sur la route d'attribution dont les quatre tests ont été retirés. Un finding R3 sur `tests/conftest.py` (faux positif) s'ajoute si le modèle le rend ; ce n'est pas un attendu.
Repli : `demos/07-revue-a-la-demande/sortie-reference.md`.
Résultat observé (rejeu du 25 octobre 2026, `claude-sonnet-4-6`, une exécution automatisée par outil, rejeu manuel à faire) : R1, R2, R3 `notifications.py:6` et R4 rendus par les deux outils. Quatre ou cinq findings selon que R1 est scindé en deux (import ligne 14, accès `_session`) ; les lignes varient d'une exécution à l'autre, le contenu non. Le finding R3 sur `tests/conftest.py` n'est rendu dans aucune des quatre exécutions : le reviewer n'ouvre pas ce fichier et la règle « pas de scénario, pas de finding » écarte une valeur factice. Même résultat avec une vérification de R3 qui nomme les fichiers de test. Le faux positif n'est donc pas garanti : prévoir le repli. Coût : 0,24 à 0,51 USD (Claude Code), 0,03 à 0,10 USD (Open Code, session principale). Forme : le reviewer est invité à répondre en JSON sans préambule ; Claude Code reformate en texte, Open Code ajoute une phrase de résumé. À vérifier en séance (TUI) : appels de lecture du reviewer, `/usage`, question de la session courante (Open Code).
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
Finding attendu sur la ligne 6 de `tests/conftest.py` : valeur factice qui ne donne accès à aucun service. Libellé de l'illustration, jamais rendu au rejeu du 25 octobre 2026 (quatre exécutions, deux outils) : si la démonstration 1 ne le produit pas, annoncer que le modèle écarte ici ce que la règle, à la lettre, signalerait.
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
Cas de la démonstration : « règle appliquée à un cas voisin » (la règle sur les secrets déclenchée par une valeur de test) et « exemple manquant » (aucun exemple conforme dans `tests/`).
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
Réécriture de la démonstration 2, commitée dans `revue/regles.md` : forme d'un identifiant émis (le jeton planté `ntfy_9f3a…` a un préfixe de fournisseur et seize caractères hexadécimaux ; `test-token-0000` n'a ni l'un ni l'autre), exclusion de `tests/`, exemple conforme. La règle corrigée est versionnée : la correction profite à toutes les revues suivantes, au poste, en pull request et avant le commit.
Contrepartie à montrer : l'exclusion de `tests/` supprime aussi la détection d'un vrai secret commité dans un test. C'est un choix de l'équipe, à nommer à voix haute. Repli : `make -C demos/08-faux-positif repli SESSION=<session>` (règle R3 corrigée).
Bloc `diff` : différence de `revue/regles.md` entre les deux versions de R3 (règle de référence, `demos/08-faux-positif/reference/`). La règle réellement écrite par l'agent varie de mots et d'exemples ; le motif, lui, doit couvrir `ntfy_…` (séparateur `_`).
:::

## Démonstration : corriger la règle R3 {kicker="Faux positifs"}

```prompt
Réécris la règle R3 de revue/regles.md : elle continue de signaler tout identifiant émis écrit en clair dans src/ (préfixe de fournisseur, séparateur - ou _, au moins seize caractères hexadécimaux), exclut tests/ et donne un exemple conforme dans tests/. Commite la modification.
```

```prompt
/revue 002-responsable-priorite-haute
```

Observer : la règle R3 écrite, puis le finding sur `notifications.py` qui survit.

::: notes
Démonstration 2, runbook `demos/08-faux-positif/`. Branche `demo/revue-defauts`, règles de la démonstration 1 (R3 en première version).
Déroulé : 1. Rappeler le finding sur `tests/conftest.py` s'il a été rendu. 2. Premier prompt : réécriture de R3 et commit ; relire `git diff HEAD~1 -- revue/regles.md` (le script de session commite `revue/` avant, sinon git montre un fichier entier créé). 3. Relancer `/revue`. 4. Comparer les findings à ceux de la démonstration 1.
Résultat attendu : R3 sur `notifications.py` conservé, avec R4, R1 et R2 ; le faux positif disparu s'il existait. Repli : `make -C demos/08-faux-positif repli SESSION=<session>` (patch de la règle de référence).
Résultat observé (rejeu du 25 octobre 2026, une exécution par outil) : le prompt d'origine (« elle ne vise que les identifiants émis ») a donné, sous Claude Code, un motif à tiret qui ne reconnaît pas `ntfy_9f3a…` (le modèle l'a pourtant signalé à la relance) et, sous Open Code, une règle de format inversée qui fait perdre R3 `notifications.py`. Le prompt de la slide est la version durcie (« continue de signaler », séparateur `-` ou `_`) : une exécution sous Claude Code, règle correcte ; Open Code non rejoué : à vérifier en séance. Faux positif absent au départ : sa disparition n'est pas démontrable, la démonstration vérifie que le vrai finding survit. Quatre findings sous Claude Code (R1 scindé en deux objets donne cinq), une relance. Contrepartie de l'exclusion de `tests/` : à dire à voix haute, aucune commande ne la montre.
Variante : réécrire la règle à la main devant la salle, plus lisible que par prompt.
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

Tu reçois un finding. Prouve qu'il est faux : rejoue son scénario d'échec.
Si un test existant le couvre, lance-le avec `make test`.
Rends un verdict (confirmé, plausible ou réfuté) avec sa preuve :
sortie de commande ou ligne de code citée.
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
  - { action: shell, resource: "grep *", effect: allow }
---

Tu reçois un finding. Prouve qu'il est faux : rejoue son scénario d'échec.
Si un test existant le couvre, lance-le avec `make test`.
Rends un verdict (confirmé, plausible ou réfuté) avec sa preuve :
sortie de commande ou ligne de code citée.
```
:::

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents (v2)](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Fichiers : `.claude/agents/contradicteur.md`, `.opencode/agents/contradicteur.md`.
Open Code : les règles se lisent dans l'ordre, la dernière qui correspond l'emporte : refus général de `shell`, puis exceptions pour `make test*` et `grep *`. Les ressources `shell` sont du texte de commande avec jokers ; la forme `make test*` et `grep *` suit la syntaxe documentée, sans exemple équivalent dans la doc ; à confirmer en séance (la commande réellement lancée par le sous-agent doit correspondre).
Claude Code : `Bash` y est autorisé en entier. La doc dit qu'un motif dans `disallowedTools` retire l'outil entier, et ne montre pas de motif dans `tools` : la restriction aux seuls tests passe par des règles `permissions.allow` du projet (`Bash(make test *)`, `Bash(grep *)`) ou par un hook `PreToolUse` dans le fichier de l'agent (module 3). `disallowedTools` retire `Write` et `Edit`, mais pas les écritures par `Bash` : à dire en salle, la lecture seule de Claude Code est ici moins stricte que celle d'Open Code.
Observé au rejeu du 25 octobre 2026 : les contradicteurs des deux outils ont cité des lignes de code lues (`Read`, `grep -n`) sans lancer `make test` ni requête, y compris pour R4 (« la lecture suffit ») ; la consigne « rejoue son scénario d'échec » seule ne déclenche pas de test, d'où la ligne ajoutée sur le test existant (non rejouée : à vérifier en séance). Aucun appel `bash` côté Open Code : les motifs `make test*` et `grep *` restent à vérifier en séance (TUI). Le fichier réel du contradicteur est un peu plus long que l'extrait.
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
Les coûts sont des mesures du formateur, la source Subagents ne porte que le contexte neuf. Valeurs du rejeu automatisé du 25 octobre 2026 (`claude-sonnet-4-6`, une exécution par mode et par outil, branche `demo/revue-defauts`, règle R3 corrigée), à remplacer par celles du rejeu manuel. Méthode : Claude Code, `total_cost_usd` du JSON de `claude -p --output-format json` (revue sans contradicteur : 0,24 USD sur la copie de la démonstration 1, 0,44 USD sur celle de la démonstration 2 ; revue adverse : 0,61 USD, soit 1,4 à 2,6 fois) ; Open Code, coût de la session principale dans le JSON de `opencode run --format json` (0,08 contre 0,19 USD, environ 2,4 fois). Le coût des sous-agents Open Code n'est pas dans ce JSON : l'écart réel est plus grand. Durées : 92 à 144 s contre 96 s (Claude Code), 15 s contre 74 s (Open Code). À relever en séance : `/usage` en session interactive, coût affiché en fin de session.
Doc Claude Code : chaque sous-agent démarre avec une fenêtre de contexte neuve (prompt système du sous-agent, message de tâche, fichiers `CLAUDE.md`, état git). Une revue adverse lance un sous-agent de plus par finding de sévérité haute, chacun avec ses instructions fixes et ses lectures : elle coûte plus qu'une revue sans contradicteur. Module 1 : même constat pour l'orchestrateur.
:::

## Démonstration : revue adverse {kicker="Contradicteur"}

```prompt
/revue-adverse 002-responsable-priorite-haute
```

Observer : un contradicteur par finding de sévérité haute, puis chaque verdict et sa preuve.

::: notes
Démonstration 3, runbook `demos/09-contradicteur/`. Branche `demo/revue-defauts` avec la règle R3 de la démonstration 2 (ou après le repli : `make -C demos/08-faux-positif repli SESSION=<session>`).
Déroulé : 1. Lire `.claude/agents/contradicteur.md` (ou `.opencode/agents/contradicteur.md`). 2. Lancer le prompt. 3. Observer un contradicteur par finding de sévérité haute, lancés dans le même tour (trois ou quatre selon que R1 est scindé). 4. Lire chaque verdict et sa preuve. 5. Noter le coût (slide précédente).
Résultat attendu : le secret de `notifications.py` et la contradiction avec la spécification 002 (retrait du responsable) confirmés avec une ligne de code citée ; la violation d'architecture (le routeur écrit en base) confirmée ou plausible ; R2 (sévérité moyenne) reste sans contradicteur.
Repli : `demos/09-contradicteur/sortie-reference.md`.
Résultat observé (rejeu du 25 octobre 2026, `claude-sonnet-4-6`, rejeu manuel à faire) : Claude Code, 4 contradicteurs lancés dans le même tour (R1 en deux findings, R3, R4), 96 s ; Open Code, 3 contradicteurs dont les exécutions se chevauchent (démarrages à 980,7, 984,3 et 986,1 s, fins à 987,3, 990,4 et 994,9 s), 74 s. Tous les verdicts sont « confirmé » (R1 aussi, pas « plausible ») avec des lignes de code citées ; aucun test rejoué. R2 affiché sans contradicteur. Aucune écriture, aucun refus de permission. L'agent principal reformate les verdicts (titres, résumé ; sous Open Code, markdown avec emojis) au lieu de les afficher tels quels. Coût : voir la slide précédente.
Open Code : TUI pour `/revue-adverse` ; pour le rejeu non interactif, `opencode run` ne développe pas la commande, le script assemble le prompt.
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
