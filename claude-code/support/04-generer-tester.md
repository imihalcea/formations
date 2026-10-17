# Générer, refactorer et tester

Changer le code sous le contrôle des tests

::: notes
Module 4, environ 65 min dont 35 de TP.
Le module 2 a présenté le mode plan, « donner à l'agent un moyen de vérifier », `/rewind` et `/undo` : ici on s'appuie dessus sans les redéfinir.
L'ordre des slides suit celui du TP : tests, refactoring, effort, génération, vérification, commit.
:::

## Un code sans filet {kicker="Tests"}

```python file="../fil-rouge/rooms/pricing.py" lines="21-28"
```

`compute_price` calcule chaque montant facturé, et aucun test ne la couvre.

::: notes
Extrait de `rooms/pricing.py`, lignes 21 à 28 : la boucle minute par minute des réservations de moins de 8 heures, en flottants, majorée après 19 h.
Le reste de la fonction : remise de 10 % au-delà de 4 heures, demi-tarif interne, majoration du week-end, forfait de 6 heures au-delà de 8 heures, puis `int(round(price))`.
Avant de toucher à cette fonction, il faut figer ce qu'elle fait : c'est l'objet des trois slides suivantes.
:::

## Faire écrire des tests {kicker="Tests"}

```prompt
Trouve les fonctions de rooms/ qu'aucun test ne couvre.
```

```prompt
Ajoute des tests pour rooms/pricing.py, avec ses cas limites, puis lance-les.
```

L'agent lit les tests existants et en reprend le style, le framework et les assertions.

::: sources
- [Claude Code, Common workflows : Work with tests](https://code.claude.com/docs/en/common-workflows#work-with-tests)
:::

::: notes
Prompts de la doc : « find functions in NotificationsService.swift that are not covered by tests », « add tests for the notification service », « add test cases for edge conditions in the notification service », « run the new tests and fix any failures ».
« Claude examines your existing test files to match the style, frameworks, and assertion patterns already in use. »
« When asking for tests, be specific about what behavior you want to verify. »
Fil rouge : pytest, fixtures `client` et `connection` dans `tests/conftest.py`.
:::

## Le test de caractérisation {kicker="Tests"}

Il décrit ce que le code fait aujourd'hui. La valeur attendue est la sortie actuelle, défauts compris.

```python
# illustration
def test_retrospective_in_cape():
    start = datetime(2027, 1, 11, 9, 0)
    end = datetime(2027, 1, 11, 10, 45)
    assert compute_price(CAPE, start, end, internal=True) == 2187
```

::: sources
- [Michael Feathers, Characterization Testing](https://michaelfeathers.silvrback.com/characterization-testing)
- [Wikipedia, Characterization test](https://en.wikipedia.org/wiki/Characterization_test)
:::

::: notes
Feathers : « The purpose of characterization testing is to document your system's actual behavior, not check for the behavior you wish your system had. » Puis : « We need to know when we are changing existing behavior regardless of whether we think it's right or not. »
Un comportement suspect reste dans le test tant qu'on n'a pas décidé que c'est un bug : « if you haven't determined that the behavior you've uncovered is a bug, it's often a good idea to leave the test in place. »
Terme introduit par Feathers dans Working Effectively with Legacy Code (Wikipedia).
L'exemple : 1h45 interne dans Cape (25 € de l'heure), montant exact 2187,5 centimes, `compute_price` renvoie 2187. Ne pas commenter l'écart ici : il revient à la slide « Un centime d'écart ».
:::

## Des données réelles en plus des cas inventés {kicker="Tests"}

Une implémentation plausible peut rater des cas limites. Les réservations de `seed.py` portent des montants déjà facturés : chacune devient un cas de test.

```prompt
Ajoute un test par réservation de rooms/seed.py, avec le montant que compute_price renvoie aujourd'hui.
```

::: sources
- [Claude Code, Best practices : Avoid common failure patterns](https://code.claude.com/docs/en/best-practices#avoid-common-failure-patterns)
:::

::: notes
Nom dans la doc : « The trust-then-verify gap. Claude produces a plausible-looking implementation that doesn't handle edge cases. » Remède : « Always provide verification (tests, scripts, screenshots). If you can't verify it, don't ship it. »
`seed.py` : sept réservations les 11 et 16 janvier 2027, dont un samedi (Workshop), une soirée (Steering committee), une journée entière (Training) et trois internes.
Ne pas annoncer que deux réservations internes de Cape tombent sur un demi-centime : l'écart doit apparaître au refactoring.
:::

## Refactorer à comportement constant {kicker="Refactoring"}

```prompt
Refactore compute_price de rooms/pricing.py en gardant le même comportement. Avance par petites étapes et lance uv run pytest après chacune.
```

Les tests de caractérisation définissent ce « même comportement ».

::: sources
- [Claude Code, Common workflows : Refactor code](https://code.claude.com/docs/en/common-workflows#refactor-code)
:::

::: notes
Prompt de la doc : « refactor utils.js to use ES2024 features while maintaining the same behavior », puis « run tests for the refactored code ».
Conseil de la doc : « Do refactoring in small, testable increments ».
Une petite étape qui casse un test se localise ; un refactoring en un seul diff, non.
:::

## Borner le refactoring {kicker="Refactoring"}

Sans consigne, l'agent peut « améliorer » le code au passage. Corriger l'arrondi de `compute_price` change des montants déjà facturés.

```prompt
Ne corrige aucun défaut au passage : signale-le dans un commentaire.
```

::: sources
- [Claude Platform, Prompting best practices : Overeagerness](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#overeagerness)
:::

::: notes
Prompt d'exemple de la doc : « Scope: Don't add features, refactor code, or make "improvements" beyond what was asked. A bug fix doesn't need surrounding code cleaned up. »
La doc attribue la tendance à Opus 4.5 et 4.6, sans nommer Sonnet 4.6 ; la consigne reste utile quel que soit le modèle.
Corriger l'arrondi relève d'une décision métier : les montants enregistrés en base ne seraient plus recalculables à l'identique.
:::

## Un centime d'écart {kicker="Refactoring"}

![Illustration : uv run pytest après un calcul direct, deux tests de caractérisation échouent, 2188 au lieu de 2187 pour Retrospective, 2812 au lieu de 2813 pour Supplier meeting](images/04-centime.svg)

::: sources
- [Python 3.14, Built-in functions : round](https://docs.python.org/3.14/library/functions.html#round)
:::

::: notes
Sortie réelle, condensée : un calcul direct écrit pour le support (illustration), testé contre les deux réservations internes de Cape.
Montants exacts : 2187,5 et 2812,5 centimes. La boucle accumule des flottants et tombe juste au-dessous ou juste au-dessus du demi-centime ; le calcul direct tombe pile dessus.
`round` arrondit alors au pair : « if two multiples are equally close, rounding is done toward the even choice ». 2187,5 donne 2188, 2812,5 donne 2812.
Un arrondi au demi supérieur ou une troncature échouent aussi, sur l'une ou l'autre réservation (tableau de `formateur/fil-rouge.md`).
Le diff du calcul direct se relit sans alerte : seul le test voit l'écart.
:::

## Quand un test échoue {kicker="Refactoring"}

Un test de caractérisation qui échoue signale un changement de comportement. On corrige le code, et le test reste tel quel.

```prompt
Si un test te paraît faux, signale-le au lieu de le modifier.
```

::: sources
- [Claude Platform, Prompting best practices : Avoid focusing on passing tests and hardcoding](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#avoid-focusing-on-passing-tests-and-hard-coding)
:::

::: notes
« Tests are there to verify correctness, not to define the solution. »
« Do not hard-code values or create solutions that only work for specific test inputs. »
« if any of the tests are incorrect, please inform me rather than working around them. »
Ici, la valeur attendue est le montant facturé : modifier le test reviendrait à changer la facture.
:::

## L'effort du modèle {kicker="Effort"}

L'effort règle la quantité de raisonnement et de travail que le modèle consacre à une demande. Sonnet 4.6 accepte `low`, `medium`, `high` et `max`. Claude Code démarre en `high`.

```json
{
  "model": "claude-sonnet-4-6",
  "output_config": { "effort": "high" }
}
```

::: sources
- [Claude Code, Model configuration : Adjust effort level](https://code.claude.com/docs/en/model-config#adjust-effort-level)
- [Claude Platform, Effort : Set the effort level, Effort levels](https://platform.claude.com/docs/en/build-with-claude/effort#set-the-effort-level)
:::

::: notes
Extrait d'une requête à l'API Messages, champ `output_config.effort` (illustration, `max_tokens` et `messages` omis).
« Effort is a behavioral signal, not a strict token budget. At lower effort levels, Claude still thinks on sufficiently difficult problems, but thinks less than it would at higher effort levels for the same problem. »
`xhigh` n'existe pas pour Sonnet 4.6 : Claude Code se replie sur le niveau supporté le plus proche en dessous, `high`.
Défaut `high` sur tous les modèles qui gèrent l'effort, sauf Opus 5.5, Sonnet 5.5 et Haiku 5.5 (`medium`) et Opus 4.7 (`xhigh`).
Côté API, la doc recommande `medium` pour Sonnet 4.6 en code agentique ; Claude Code reste en `high` par défaut.
« The effort scale is calibrated per model » : un même nom de niveau ne vaut pas la même chose d'un modèle à l'autre.
:::

## Régler l'effort {.compare kicker="Effort"}

::: claude-code
```console
$ claude --effort high
```

En session : `/effort high`. Le niveau s'affiche dans l'en-tête, à côté du modèle.
:::

::: opencode
Variantes du modèle : `/variants` ouvre la liste, `ctrl+t` passe à la suivante.

Sans variante choisie, Open Code n'envoie aucun réglage de raisonnement.
:::

::: sources
- [Claude Code, Model configuration : Set the effort level](https://code.claude.com/docs/en/model-config#set-the-effort-level)
- Open Code v2.0.26 : [`variant.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/variant.ts), [`keybind.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/config/keybind.ts), [`app.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/app.tsx), [`model-resolver.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/model-resolver.ts)
:::

::: notes
Claude Code : priorité à `CLAUDE_CODE_EFFORT_LEVEL`, `--effort` ou `/effort`, puis aux réglages (`modelSettings` par modèle, `effortLevel`), puis au défaut du modèle.
Persistance : un niveau tapé après `/effort`, ou validé par `Enter` dans le curseur, devient le défaut des sessions suivantes ; `s` dans le curseur l'applique à la session seule (v2.1.257). `--effort` vaut pour une session. `max` ne vaut que pour la session en cours, sauf par la variable d'environnement.
`/effort` sans argument ouvre un curseur ; `/effort auto` efface le niveau enregistré ; `/effort status` affiche le niveau actif. Le curseur existe aussi dans `/model` (flèches gauche et droite).
API sans `thinking` ni `effort` : Sonnet 4.6 tourne sans raisonnement (« Off » par défaut) et en effort `high` ([Thinking troubleshooting](https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting#supported-models)).
Open Code : variantes par défaut de Sonnet 4.6 `low`, `medium`, `high`, `max`, chacune avec le raisonnement adaptatif (`thinking: {type: "adaptive"}`) et l'effort. La liste réelle vient du catalogue models.dev quand il en fournit une.
Open Code : sans variante, ni `thinking` ni `effort` ne partent : raisonnement coupé, effort `high` par défaut de l'API. D'où la variante `high` imposée au TP 4.
Open Code : la variante choisie est enregistrée par modèle et reprise aux sessions suivantes. Elle s'affiche dans la ligne sous le prompt, après le modèle. `/variants` a pour alias `/effort` et `/thinking`. Variante fixée dans `opencode.json` : `"model": "anthropic/claude-sonnet-4-6#high"`, mais une préférence enregistrée l'emporte.
:::

## Ce que l'effort change {kicker="Effort"}

| Niveau | Usage conseillé |
|---|---|
| `low` | échange rapide, chaque résultat relu : esquisse, renommage |
| `high` | vérification importante, cas limites probables : bug dans un code existant |

L'effort agit sur tous les tokens de sortie, appels d'outils compris : durée et coût suivent.

::: sources
- [Claude Code, Model configuration : Choose an effort level](https://code.claude.com/docs/en/model-config#choose-an-effort-level)
- [Claude Platform, Effort : How effort works](https://platform.claude.com/docs/en/build-with-claude/effort#how-effort-works)
:::

::: notes
« Each level trades token spend against capability. »
`low` : « Quick exchanges where you review each result, such as brainstorming, a first sketch, or a small change like a rename ». `high` : « Work where verification matters or edge cases are likely, such as fixing a bug in an existing codebase ».
`medium`, sur un modèle dont le défaut est plus haut : « reduces token usage for cost-sensitive work that can trade off some intelligence ».
« The effort parameter affects all tokens in the response » : texte, appels d'outils et arguments, raisonnement quand il est actif. « Lower effort also means fewer and terser tool calls. »
Lien avec le module 1 : facturation au token sur l'API, quota consommé plus vite sur un abonnement.
Démonstration (#21) : le même refactoring en `low` et en `high`, durée, tokens et diff comparés, puis les tests.
:::

## Une spécification exploitable {kicker="Générer"}

Elle nomme les fichiers et les interfaces, dit ce qui sort du périmètre et finit par une vérification de bout en bout.

```prompt
Ajoute à GET /rooms/available, dans rooms/routes.py, un paramètre facultatif min_capacity : seules les salles d'au moins min_capacity places sont renvoyées. Hors périmètre : le schéma de la base et les autres routes. Ajoute les tests dans tests/test_routes.py, puis lance uv run pytest.
```

::: sources
- [Claude Code, Best practices : Let Claude interview you](https://code.claude.com/docs/en/best-practices#let-claude-interview-you)
:::

::: notes
« The most useful specs are self-contained: they name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step that proves the feature works. »
Spécification reprise au TP 4.
Pour une fonctionnalité plus large, la doc fait d'abord interroger le développeur par l'agent, puis écrire la spécification dans un fichier, exécutée dans une session neuve.
:::

## Planifier, puis implémenter {kicker="Générer"}

En mode plan, l'agent propose un plan sans rien modifier. `Ctrl+G` ouvre ce plan dans l'éditeur, pour le corriger avant l'implémentation.

```prompt
/plan Ajoute un filtre min_capacity à GET /rooms/available.
```

Un diff qui se décrit en une phrase se passe de plan.

::: sources
- [Claude Code, Best practices : Explore first, then plan, then code](https://code.claude.com/docs/en/best-practices#explore-first-then-plan-then-code)
- [Claude Code, Permission modes : Analyze before you edit with plan mode](https://code.claude.com/docs/en/permission-modes#analyze-before-you-edit-with-plan-mode)
:::

::: notes
`/plan` en préfixe ne vaut que pour ce prompt : « prefixing a single prompt with `/plan` ». Autres entrées : `Shift+Tab` jusqu'à `⏸ plan mode on` (rappel module 2), ou `claude --permission-mode plan` au lancement.
Approbation du plan : « Yes, and use auto mode » (ou « Yes, auto-accept edits » si auto n'est pas disponible), « Yes, manually approve edits », « No, keep planning ». L'approbation quitte le mode plan.
« Press `Ctrl+G` to open the plan in your text editor for direct editing before Claude proceeds. »
« If you could describe the diff in one sentence, skip the plan. »
Open Code : aucune commande `/plan` ; agent Plan par `Shift+Tab`, éditions refusées sauf sous `~/.opencode/plan`, shell libre. Aucun équivalent de `Ctrl+G` : `ctrl+x e` ouvre seulement le prompt dans l'éditeur ([`plan.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/plugin/plan.ts), [`keybind.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/config/keybind.ts)).
:::

## Le test avant le code {kicker="Générer"}

```prompt
Écris d'abord un test du filtre min_capacity, vérifie qu'il échoue, puis implémente le filtre.
```

Un test qui échoue avant l'implémentation montre qu'il vérifie le nouveau comportement.

::: sources
- [Claude Code, Best practices : Provide specific context in your prompts](https://code.claude.com/docs/en/best-practices#provide-specific-context-in-your-prompts)
:::

::: notes
Exemple de la doc, pour un bug : « write a failing test that reproduces the issue, then fix it ».
Un test écrit après coup peut passer sans rien vérifier, par exemple s'il interroge une salle qui passe le filtre de toute façon.
:::

## La boucle de vérification {kicker="Vérifier"}

| Où | Comment |
|---|---|
| dans le prompt | lancer la vérification et itérer dans le même message |
| sur la session | `/goal` : un évaluateur revérifie la condition après chaque tour |
| par un hook `Stop` | un script empêche la fin du tour tant qu'il échoue |
| par un second avis | un sous-agent cherche à réfuter le résultat |

::: sources
- [Claude Code, Best practices : Give Claude a way to verify its work](https://code.claude.com/docs/en/best-practices#give-claude-a-way-to-verify-its-work)
:::

::: notes
« Claude stops when the work looks done. » La boucle de vérification décide à sa place si le travail est fini.
`/goal` : « A separate evaluator re-checks it after every turn and Claude keeps working until the goal resolves. » Si l'agent piétine, Claude Code arrête l'exécution, objectif toujours posé.
Hook `Stop` : « runs your check as a script and blocks the turn from ending until it passes ». Hooks : module 6.
Second avis : « a fresh model try to refute the result, so the agent doing the work isn't the one grading it ».
Open Code v2.0.26 : aucun équivalent de `/goal` dans les commandes de la TUI ; la vérification passe par le prompt, ou par un plugin (module 6).
:::

## Exiger la preuve {kicker="Vérifier"}

```prompt
Lance uv run pytest -q et colle la sortie complète.
```

La commande et sa sortie restent dans la conversation : le développeur juge sur pièce.

::: sources
- [Claude Code, Best practices : Give Claude a way to verify its work](https://code.claude.com/docs/en/best-practices#give-claude-a-way-to-verify-its-work)
:::

::: notes
« Have Claude show evidence rather than asserting success: the test output, the command it ran and what it returned, or a screenshot of the result. »
Une phrase « tous les tests passent » ne dit ni quelle commande a tourné, ni sur quel état du code.
:::

## Relire dans un contexte neuf {.compare kicker="Vérifier"}

::: claude-code
```prompt
/code-review
```

Un sous-agent relit le diff courant dans un contexte neuf et renvoie les défauts trouvés.
:::

::: opencode
```prompt
/review
```

Relit les changements non commités, dans la session courante. Pour un contexte neuf : `/new`, puis `/review`.
:::

::: sources
- [Claude Code, Best practices : Add an adversarial review step](https://code.claude.com/docs/en/best-practices#add-an-adversarial-review-step)
- [Claude Code, Commands](https://code.claude.com/docs/en/commands)
- Open Code v2.0.26 : [`command.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/plugin/command.ts), [`review.txt`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/plugin/command/review.txt)
:::

::: notes
« Before treating a task as done, have a subagent review the diff in a fresh context and report gaps. »
`/code-review` est un skill intégré, alias `/review`. Il accepte aussi un numéro de PR, une branche ou un chemin, un niveau de `low` à `max`, et `--fix` pour appliquer les corrections.
« Tell the reviewer to flag only gaps that affect correctness or the stated requirements, and treat the rest as optional. »
Le relecteur n'a pas l'historique de la session : il juge le diff, sans les raisons données en cours de route.
Open Code : `/review` accepte un commit, une branche ou une PR ; sans argument, il lit `git diff`, `git diff --cached` et `git status --short`. Il s'exécute avec l'agent courant, sans sous-agent.
:::

## L'effort approfondit l'analyse, les tests jugent le résultat. {.statement kicker="Idée clé"}

::: notes
Découle du centime d'écart, de ce que l'effort change et de la boucle de vérification.
Ajouter : le centime d'écart passe la relecture à tout niveau d'effort, seul le test le voit.
:::

## Documenter le code {kicker="Documenter"}

```prompt
Ajoute des docstrings au format Google aux fonctions publiques de rooms/pricing.py, sans modifier leur code.
```

La consigne nomme le style et les fonctions visées, et exclut le code inchangé.

::: sources
- [Claude Code, Common workflows : Handle documentation](https://code.claude.com/docs/en/common-workflows#handle-documentation)
- [Claude Platform, Prompting best practices : Overeagerness](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#overeagerness)
:::

::: notes
Doc : « Specify the documentation style you want (JSDoc, docstrings, etc.) ». Prompts : « find functions without proper JSDoc comments in the auth module », « add JSDoc comments to the undocumented functions in auth.js ».
Prompt d'exemple de la doc plateforme : « Don't add docstrings, comments, or type annotations to code you didn't change. Only add comments where the logic isn't self-evident. »
:::

## Le message de commit {.compare kicker="Documenter"}

::: claude-code
Des instructions de commit intégrées guident l'agent. Chaque commit se termine par un trailer :

```text
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
:::

::: opencode
Aucune instruction de commit intégrée, aucun trailer. Les conventions de message s'écrivent dans le prompt ou dans `AGENTS.md`.
:::

::: sources
- [Claude Code, Settings reference : includeGitInstructions, attribution](https://code.claude.com/docs/en/settings-reference#includegitinstructions)
- Open Code v2.0.26 : [`system.txt`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/session/runner/prompt/system.txt), [`shell.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/tool/plugin/shell.ts)
:::

::: notes
`includeGitInstructions`, `true` par défaut : instructions intégrées pour les commits et les PR, et instantané de l'état git. À `false`, les deux disparaissent. `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` l'emporte pour une session.
Trailer par défaut : `Co-Authored-By: <name> <noreply@anthropic.com>`, où le nom est celui du modèle actif au moment du commit. Ici, d'après cette règle : `Claude Sonnet 4.6`.
`attribution.commit` remplace le trailer, `attribution: false` supprime toute attribution.
Aucune commande `/commit` intégrée dans la liste des commandes de Claude Code : on le demande en langage naturel, « commite ces changements avec un message qui les décrit ».
Open Code v2.0.26 : le prompt système et la description de l'outil shell ne disent rien de git pour les modèles Claude ; aucune occurrence de `Co-Authored-By` hors de l'intégration GitHub Actions. Aucune commande `/commit`.
:::

## TP 4 : tester, refactorer, générer {.tp duration="35 min"}

Figer `pricing.py` par des tests de caractérisation, la refactorer à comportement constant, puis implémenter un filtre de capacité sur `GET /rooms/available`. Le TP se termine par deux commits rédigés par l'agent.

Prérequis : TP 3 terminé et commité.

::: notes
Effort fixé à `high` dans les deux outils, pour des résultats comparables d'un poste à l'autre.
L'étape du refactoring prend la plus grande part du temps : viser 15 min pour les tests et le refactoring, 15 pour la spécification, 5 pour la relecture.
Si les tests passent tous après le calcul direct, vérifier que les réservations Retrospective et Supplier meeting figurent dans `tests/test_pricing.py`.
Si l'agent modifie une valeur attendue, renvoyer à la slide « Quand un test échoue ».
:::

### Lancer l'outil

::: claude-code
```console
$ cd ~/fil-rouge
$ claude --permission-mode default --model claude-sonnet-4-6 --effort high
```
:::

::: opencode
```console
$ cd ~/fil-rouge
$ opencode
```

Puis `/variants` et choisir `high`.
:::

::: attendu
Claude Code : `⏸ manual mode on` dans la barre d'état, effort `high` dans l'en-tête. Open Code : agent Build, Claude Sonnet 4.6, variante `high` sous le prompt.
:::

### Écrire les tests de caractérisation

```prompt
Écris tests/test_pricing.py : des tests de caractérisation de compute_price dans rooms/pricing.py. La valeur attendue est le résultat actuel de la fonction, même s'il paraît faux. Ajoute un test par réservation de rooms/seed.py, ce sont des montants déjà facturés, puis les cas limites que tu repères. Lance uv run pytest -q et montre la sortie.
```

::: attendu
`tests/test_pricing.py` contient les sept réservations de `seed.py`, dont Retrospective à 2187 et Supplier meeting à 2813, et des cas limites : durée nulle, soirée, 4 et 8 heures, week-end. Tous les tests passent.
:::

### Refactorer à comportement constant

```prompt
Refactore compute_price en gardant exactement le même comportement : remplace la boucle minute par minute par un calcul direct. Ne corrige aucun défaut au passage, signale-le dans un commentaire. Avance par petites étapes, lance uv run pytest -q après chacune et montre la sortie.
```

::: attendu
`compute_price` ne contient plus de boucle minute par minute. Si un test d'une réservation de Cape échoue d'un centime, l'agent corrige le code sans toucher au test et signale l'anomalie d'arrondi dans un commentaire. Tous les tests passent.
:::

::: indice
Si l'agent propose de modifier la valeur attendue d'un test, refuser l'édition avec la consigne « corrige le code, pas le test ».
:::

### Commiter

```prompt
Commite les tests et le refactoring avec un message qui les décrit.
```

::: claude-code
Lire la commande `git commit` proposée, puis Yes.
:::

::: opencode
Lire la commande `git commit` proposée, puis Allow once.
:::

::: attendu
`git log --oneline` montre trois commits. Sous Claude Code, le dernier se termine par un trailer `Co-Authored-By`.
:::

### Planifier la fonctionnalité

::: claude-code
Préfixer le prompt par `/plan` :

```prompt
/plan Ajoute à GET /rooms/available, dans rooms/routes.py, un paramètre facultatif min_capacity : seules les salles d'au moins min_capacity places sont renvoyées. Hors périmètre : le schéma de la base et les autres routes. Écris d'abord le test dans tests/test_routes.py et vérifie qu'il échoue, puis implémente le filtre et lance uv run pytest -q.
```
:::

::: opencode
`Shift+Tab` jusqu'à l'agent Plan, puis :

```prompt
Ajoute à GET /rooms/available, dans rooms/routes.py, un paramètre facultatif min_capacity : seules les salles d'au moins min_capacity places sont renvoyées. Hors périmètre : le schéma de la base et les autres routes. Écris d'abord le test dans tests/test_routes.py et vérifie qu'il échoue, puis implémente le filtre et lance uv run pytest -q.
```
:::

::: attendu
Le plan touche `rooms/routes.py` et `tests/test_routes.py`, sans modifier la base. Aucun fichier n'est modifié à cette étape.
:::

### Implémenter

::: claude-code
Approuver le plan par « Yes, manually approve edits », puis accepter chaque édition après lecture de son diff.
:::

::: opencode
`Shift+Tab` jusqu'à l'agent Build, puis :

```prompt
Implémente ce plan.
```
:::

::: attendu
Le nouveau test échoue d'abord, puis tous les tests passent. Dans un second terminal, avec l'API démarrée (`uv run uvicorn rooms.main:app --reload`), `curl "http://127.0.0.1:8000/rooms/available?starts_at=2027-01-11T11:00&ends_at=2027-01-11T12:00&min_capacity=5"` ne renvoie que la salle Atlas.
:::

### Relire dans un contexte neuf

::: claude-code
```prompt
/code-review
```
:::

::: opencode
```prompt
/new
```

```prompt
/review
```
:::

::: attendu
Une liste de défauts, ou aucun. Ne faire corriger que ceux qui touchent la correction du filtre.
:::

### Commiter la fonctionnalité

```prompt
Commite le filtre min_capacity et ses tests avec un message qui les décrit.
```

::: attendu
`git log --oneline` montre quatre commits.
:::

### Corrigé {.corrige}

`tests/test_pricing.py` fige les sept réservations de `seed.py` avec leur montant facturé, puis les cas limites :

```python file="../tp/tp04/tests/test_pricing.py" lines="18-41"
```

`compute_price` délègue le forfait journée et le tarif horaire à des fonctions dédiées. Les constantes en dur sont nommées :

```python file="../tp/tp04/rooms/pricing.py" lines="17-32"
```

Le tarif horaire se calcule par plage de tarif (avant 19 h, soirée, après minuit) au lieu de minute par minute. Un calcul direct `per_minute * count` fait échouer Retrospective et Supplier meeting d'un centime : l'addition en flottants reste isolée dans `_add_minutes`, avec l'anomalie signalée.

```python file="../tp/tp04/rooms/pricing.py" lines="43-74"
```

Le filtre `min_capacity` écarte les salles trop petites avant la recherche de conflits :

```python file="../tp/tp04/rooms/routes.py" lines="32-47"
```

```python file="../tp/tp04/tests/test_routes.py" lines="39-47"
```

La correction de l'arrondi change des montants déjà facturés : elle relève d'une décision métier et sort du refactoring.

## Glossaire {kicker="Glossaire"}

- **Test de caractérisation** : test qui fige le comportement actuel
- **Comportement constant** : mêmes sorties avant et après le refactoring
- **Effort** : quantité de raisonnement et de travail du modèle
- **Variante** : réglage d'effort d'un modèle dans Open Code

|||

- **Spécification** : fichiers, interfaces, hors périmètre, vérification
- **Boucle de vérification** : contrôle qui décide si le travail est fini
- **Relecture en contexte neuf** : diff relu par un sous-agent sans l'historique
- **Trailer** : ligne `Clé: valeur` en fin de message de commit

::: sources
- [Michael Feathers, Characterization Testing](https://michaelfeathers.silvrback.com/characterization-testing)
- [Claude Code, Model configuration](https://code.claude.com/docs/en/model-config), [Best practices](https://code.claude.com/docs/en/best-practices)
- [Git, git-interpret-trailers](https://git-scm.com/docs/git-interpret-trailers)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::
