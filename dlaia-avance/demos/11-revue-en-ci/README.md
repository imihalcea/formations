# Démonstration 11 : revue en CI

Slide « Démonstration : revue en CI ». Une pull request sur `demo/revue-defauts` reçoit les findings du reviewer (module 2) en commentaires, sans commande de revue. Le workflow `revue.yml` est montré et commité dans le dépôt de session ; il n'est pas exécuté par un runner (machine qui exécute un job), faute d'identifiants de modèle chez GitHub. `ci/lancer-job.sh <outil>` rejoue sur le poste les étapes du job. Seuls `lint` et `test` du workflow `ci` tournent chez GitHub.

## Préalables

Claude Code 2.1.310 (abonnement) ou Open Code v2.0.32 (Amazon Bedrock), modèle `claude-sonnet-4-6` ; `gh` connecté, `docker`, `uv`, `jq`, `timeout`. Branche `demo/revue-defauts` : spec 002 et quatre défauts plantés (démonstration 7).

## Préparation

```
demos/11-revue-en-ci/session.sh <session> <claude|opencode>
```

Actions sortantes (essai à blanc par le formateur avant la séance, puis suppression du dépôt de test) : création du dépôt privé `imihalcea/tickets-api-<session>` (copie de la référence) et push d'un commit sur sa branche `main`. Ce commit ajoute `revue/` (règles, schéma), les deux `reviewer.md`, `ci/lancer-job.sh`, `ci/valider-findings.sh` et `.github/workflows/revue.yml` du seul outil choisi. Le job relit ces fichiers sur `main` : la branche relue ne les porte pas. La copie de travail est ensuite placée sur `demo/revue-defauts`.

| Fichier | Rôle |
|---|---|
| `workflows/revue.claude-code.yml`, `revue.opencode.yml` | déclencheur `pull_request` (`opened`, `synchronize`, `ready_for_review`), brouillons exclus, `permissions` (`contents: read`, `pull-requests: write`), `concurrency`, `timeout-minutes: 10`, appel du script, `upload-artifact` avec `if: always()` ; seul l'argument du script diffère (`MAX_TURNS` en plus pour Claude Code) |
| `ci/lancer-job.sh` | brouillon refusé ; `git checkout origin/main -- revue .claude .opencode` ; diff `origin/main...HEAD` ; agent de code sans `GH_TOKEN` ; validation ; un `gh api …/pulls/N/comments` par finding (commentaire général si la ligne est hors du diff) |
| `ci/valider-findings.sh` | écarte prose, balises et objets hors schéma, rend les findings valides |

Contrôles sans modèle : `make check` (syntaxe, YAML, validation sur sept objets dont cinq invalides, script du job avec faux `gh` et faux `claude` : règles lues sur `main`, deux commentaires, brouillon refusé). Chez le formateur : `gh repo view imihalcea/tickets-api-<session>`, `make test` sur la branche (57 verts, relevé du 25 octobre 2026).

Claude Code : accepter le dialogue de confiance du dossier une fois en interactif. Open Code : jamais deux `opencode run` en parallèle ; pas de modification de `.opencode/plugins/` sur cette branche.

## Déroulé

Dans la copie (`cd ~/travail/tickets-api-<session>`), branche `demo/revue-defauts`.

1. Pousser la branche et ouvrir la pull request (prompt exact, copiable) :

   ```
   gh pr create --base main --head demo/revue-defauts --title "Responsable obligatoire sur les tickets de priorité haute" --fill
   ```
2. `gh pr checks --watch` : `lint` et `test` démarrent chez GitHub, sans identifiants de modèle.
3. Lire `.github/workflows/revue.yml` et `ci/lancer-job.sh` tels que la préparation les a commités sur `main` (`git show origin/main:.github/workflows/revue.yml`, `git show origin/main:ci/lancer-job.sh`) : déclencheur, brouillon exclu, droits, `timeout-minutes`, appel du script. Ne pas dire quelle version de ces fichiers GitHub lit pour `pull_request` (non établi par la documentation consultée). Dans le script : règles prises sur `main` à l'étape 1, agent sans jeton d'écriture à l'étape 3, publication à l'étape 5.
4. Jouer le job sur le poste (à dire : un runner GitHub auto-hébergé où le harnais est déployé exécute ce même script) :
   - Claude Code : `git checkout origin/main -- ci && ci/lancer-job.sh claude`
   - Open Code : `git checkout origin/main -- ci && ci/lancer-job.sh opencode`
5. Lire les commentaires sur la pull request (`gh pr view --comments` ou l'onglet « Files changed »), l'archive locale `revue-sortie/` (`findings.jsonl`, `resume.txt`, `metriques.json` pour Claude Code).
6. `gh pr ready --undo` (brouillon) puis relancer `ci/lancer-job.sh <outil>` : « en brouillon : pas de revue », aucun appel au modèle. `gh pr ready` pour revenir.

## Résultat attendu

Les findings du module 2 en commentaires de pull request : R1 (routeur qui touche la session), R2 (route sans test), R3 (jeton dans `notifications.py`), R4 (retrait du responsable d'un ticket `high` accepté). Aucune fusion bloquée. Valeurs relevées au rejeu du 25 octobre 2026 (faux `gh`, sans GitHub) : `sortie-reference.md`.

## Relevé au rejeu du 25 octobre 2026 (claude-sonnet-4-6)

Un faux `gh` journalise les écritures ; création de la pull request, `gh pr checks`, workflow chez GitHub et commentaires réels n'ont pas été joués.

| Point | Claude Code | Open Code |
|---|---|---|
| findings postés | 4 valides sur 4 : R1 `routers/tickets.py:59`, R2 `routers/tickets.py:56`, R3 `notifications.py:6`, R4 `routers/tickets.py:62` | 4 : R1 et R4 sur `routers/tickets.py:55`, R2 sur `tests/integration/test_tickets_api.py:87` (le finding vise le fichier de tests), R3 `notifications.py:6` |
| durée du job | 146 s, donc `timeout-minutes: 10` (600 s) laisse une marge de 4 | 16 s |
| tokens, coût | 0,51 USD, 5 tours | non mesuré (`--format json` non branché) |
| `--max-turns 6` | suffit : `subtype` `success`, `num_turns` 5 | sans objet |
| diff en entrée standard | vu : les findings portent sur des lignes du diff (619 lignes) | vu |
| prose avant le JSON | sans objet | « I'll read the review rules… » écartée par la validation |

Reste à voir en séance : acceptation des lignes par l'API réelle (commentaire en ligne ou commentaire général), exécution de `lint` et `test` chez GitHub, `gh pr ready --undo`. Claude Code : `git checkout origin/main -- revue .claude .opencode` laisse des fichiers indexés (`A`) dans la copie, sans conséquence. Brouillon : `Pull request <N> en brouillon : pas de revue.`, aucun appel au modèle.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Workflow | `revue.claude-code.yml` : `./ci/lancer-job.sh claude`, `MAX_TURNS` | `revue.opencode.yml` : `./ci/lancer-job.sh opencode` |
| Étape de l'agent de code | `claude -p … --model claude-sonnet-4-6 --max-turns 6 --output-format json --allowedTools Read Grep Glob`, diff en entrée standard | `opencode run --model amazon-bedrock/eu.anthropic.claude-sonnet-4-6 --agent reviewer`, diff en entrée standard |
| Bornes | `timeout-minutes`, `concurrency`, `--max-turns` | `timeout-minutes`, `concurrency`, `steps: 20` du fichier d'agent |
| Authentification en CI | non jouée : identifiants sur la machine du runner (ou action `anthropics/claude-code-action@v1` avec `ANTHROPIC_API_KEY`, `CLAUDE_CODE_OAUTH_TOKEN` ou Bedrock) ; usage de l'abonnement Max en CI : conditions d'utilisation non lues, ne pas l'affirmer | non jouée : identifiants Bedrock sur la machine du runner |

Réserves à dire : un runner auto-hébergé n'est sûr que sur un dépôt privé ou pour des pull requests sans fork ; la documentation consultée ne dit pas quelle version du fichier de workflow GitHub lit pour `pull_request` : ne pas l'affirmer, et relire à la main les changements de `.github/workflows/` et de `ci/` ; une pull request peut les modifier ; enregistrement du runner non joué.

## Repli

`sortie-reference.md` : findings attendus et forme du commentaire. Si le modèle ne répond pas : jouer `make check` (faux agent, vrais commentaires simulés) et montrer les findings de la démonstration 7 (`../07-revue-a-la-demande/sortie-reference.md`). Si `gh pr create` échoue (dépôt, droits) : lire le workflow et le script, puis jouer `ci/lancer-job.sh` avec le numéro d'une pull request existante (`ci/lancer-job.sh <outil> <numéro>`).

## Remise à zéro

`gh pr close <numéro>`, `git checkout -- . && git clean -fd -e .venv`, `rm -rf revue-sortie`. Pour repartir d'un dépôt neuf, utiliser une nouvelle session.
