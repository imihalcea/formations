# Démonstration 12 : analyse d'échec

Slide « Démonstration : analyse d'échec ». La branche `demo/build-casse` déclare la colonne `assignee` dans `tables.py` sans migration Alembic : `ci` échoue, le journal de CI est long, l'analyse d'échec nomme la cause et propose la migration en commentaire de la pull request. Le workflow `analyse-echec.yml` (événement `workflow_run`) est montré et commité dans le dépôt de session ; `ci/analyser-echec.sh <outil>` rejoue ses étapes sur le poste. Seul le workflow `ci` tourne chez GitHub.

## Préalables

Claude Code 2.1.310 (abonnement) ou Open Code v2.0.32 (Amazon Bedrock), modèle `claude-sonnet-5-5` ; `gh` connecté, `docker`, `uv`, `jq`, `timeout`. Branche vérifiée le 25 octobre 2026 sur une base neuve : `19 failed, 42 passed`, erreur `psycopg.errors.UndefinedColumn: column "assignee" of relation "tickets" does not exist` (12 fois) et `column tickets.assignee does not exist` (14 fois au rejeu Open Code), 6597 lignes de sortie locale. Le plan annonçait 19 tests en erreur : le chiffre est confirmé en échecs, sur une base de test sans migration appliquée.

Piège local : sur une base de test déjà migrée par un autre passage (migration 0002 appliquée), les tests échouent avec `Can't locate revision identified by '0002'` (21 erreurs) au lieu de `UndefinedColumn`. Le piège se produit aussi après la démonstration 10 : un passage de l'agent y a réinitialisé la base partagée `tickets_test`, restée en migration `0002`. Repartir d'une base `tickets_test` neuve avant la démonstration : `docker compose down -v && make db-up`.

## Préparation

```
demos/12-analyse-echec/session.sh <session> <claude|opencode>
```

Actions sortantes (essai à blanc par le formateur avant la séance) : création du dépôt privé `imihalcea/tickets-api-<session>` et push d'un commit sur sa branche `main`, qui ajoute `.claude/agents/diagnostiqueur.md`, `.opencode/agents/diagnostiqueur.md`, `ci/analyser-echec.sh` et `.github/workflows/analyse-echec.yml` du seul outil choisi (un workflow `workflow_run` est lu sur la branche par défaut). La copie de travail est ensuite placée sur `demo/build-casse`.

| Fichier | Rôle |
|---|---|
| `workflows/analyse-echec.claude-code.yml`, `.opencode.yml` | `on: workflow_run` (`workflows: [ci]`, `types: [completed]`), `if: conclusion == 'failure'`, `permissions` (`contents: read`, `actions: read`, `pull-requests: write`), `concurrency`, `timeout-minutes: 10`, appel du script, `upload-artifact` avec `if: always()` |
| `ci/analyser-echec.sh` | exécution de `ci` trouvée (ou donnée), « rien à analyser » si elle n'a pas échoué ; `gh run view --log-failed` ; agent sans `GH_TOKEN` ; commentaire par `gh pr comment` ; rien n'est poussé |
| `artefacts/.claude/agents/diagnostiqueur.md`, `.opencode/agents/diagnostiqueur.md` | agent en lecture seule : cause avec la ligne du journal, fichiers, correctif en diff |
| `reference/20260907_0002_ticket_assignee.py` | migration de repli, vérifiée : copiée dans `migrations/versions/`, `make test` donne 61 verts |

Claude Code : accepter le dialogue de confiance du dossier une fois en interactif, sinon les `permissions.allow` du projet sont ignorées (message `Ignoring … permissions.allow entries`).

Contrôles sans modèle : `make check` (syntaxe, YAML, agents, script du job avec faux `gh` et faux `claude` : journal tronqué, commentaire posté, exécution réussie ignorée).

## Déroulé

Dans la copie (`cd ~/travail/tickets-api-<session>`), branche `demo/build-casse`.

1. Ouvrir la pull request (commandes copiables) :

   ```
   gh pr create --base main --head demo/build-casse --fill
   gh run view <id> --log-failed
   ```

   `gh run list --workflow ci --limit 1` donne `<id>` ; attendre la fin avec `gh run watch <id>`. `ci` échoue (job `test`).
2. Faire défiler le journal avec la salle : le nombre de lignes s'affiche avec `gh run view <id> --log-failed | wc -l` (chez GitHub : à relever en séance ; sur le poste, `uv run pytest -q` donne 6597 lignes pour 19 échecs).
3. Lire `.github/workflows/analyse-echec.yml` (`git show origin/main:.github/workflows/analyse-echec.yml`) : `workflow_run`, condition d'échec, droits, durée. Dire que le fichier est lu sur la branche principale, pas sur celle de la pull request.
4. Jouer le job sur le poste :
   - Claude Code : `git checkout origin/main -- ci .claude .opencode && ci/analyser-echec.sh claude`
   - Open Code : `git checkout origin/main -- ci .claude .opencode && ci/analyser-echec.sh opencode`

   Sans `.claude .opencode`, la branche `demo/build-casse` ne porte pas l'agent : sous Open Code, `Error: Agent not found: "diagnostiqueur"` (code 1). En CI le dépôt extrait est `main`, qui porte l'agent.

   Le script affiche la taille du journal passé à l'agent, puis poste le commentaire.
5. Lire le commentaire sur la pull request (`gh pr view --comments`) : cause nommée, migration en diff.
6. Constater que rien n'est poussé : `git status` et `gh pr view --json commits -q '.commits | length'` inchangés.
7. Appliquer le correctif localement avec la commande personnalisée de la branche, puis pousser.

   7a. Lancer `/fix-until-green`. Claude Code : `claude --model claude-sonnet-5-5 --allowedTools "Bash(make *)" "Bash(uv run *)"`, puis coller `/fix-until-green`. La commande déclare `allowed-tools: Bash(make test *)` seulement, et le sous-agent `implementeur` a besoin de `make migrate`, `uv run alembic`, `ls` et `grep` : sans ces motifs, le 1er essai du rejeu (non interactif) s'est arrêté sans migrer (8 refus, migration écrite et jamais exécutée). Avec eux : 154 s, 61 tests verts. En interactif, accepter les demandes de permission revient au même.

   7b. Variante Open Code (non rejoué) : lancer `opencode --model amazon-bedrock/eu.anthropic.claude-sonnet-5-5`, puis coller `/fix-until-green` dans la TUI ; `opencode run` ne développe pas la commande (voir le runbook de la démonstration 4). Texte à coller si la commande n'est pas développée : `Lis .opencode/commands/fix-until-green.md et applique-la : fais passer make test, sans modifier tests/.`

   7c. `git push`, puis `gh run watch` : `ci` verte. `ci/analyser-echec.sh <outil>` répond « rien à analyser ».

   7d. Repli sans modèle : `cp <dépôt de formation>/demos/12-analyse-echec/reference/20260907_0002_ticket_assignee.py src/tickets/adapters/outbound/postgres/migrations/versions/` puis `git add`, commit, push.

   Piège : le hook RTK du poste réécrit les commandes `Bash` en `rtk …` et peut faire manquer les motifs de `--allowedTools` (7a) : à vérifier hors RTK.

## Résultat attendu

Cause nommée : colonne `assignee` déclarée dans `tables.py` sans migration, avec la ligne `UndefinedColumn` du journal ; diff d'une migration Alembic qui ajoute `tickets.assignee` (`String(100)`, `nullable=True`, suite de la révision `0001`) ; aucun commit poussé par le job. Observé au rejeu du 25 octobre 2026 avec un journal local : `sortie-reference.md`.

## Relevé au rejeu du 25 octobre 2026 (claude-sonnet-4-6)

Le journal de CI de GitHub n'existait pas : un faux `gh` a rejoué la sortie locale de `uv run pytest -q` avec le préfixe `test  Run make test  `.

| Point | Claude Code | Open Code |
|---|---|---|
| journal | 6597 lignes, 3000 passées (216 783 octets) ; première `UndefinedColumn` à la ligne 11 du journal tronqué | 6597 lignes, 3000 passées (210 769 octets) |
| cause et diff | cause juste (`tables.py` ligne 20, `Mapped[str \| None]`), migration `0002` avec `down_revision = "0001"`, `String(100)`, `nullable=True` ; `git apply --check` sans erreur | cause juste, mais le diff modifiait la migration `0001` : agent corrigé depuis (nouvelle migration exigée) |
| ligne du journal citée | non (prose seulement) : instruction ajoutée à l'agent | oui, deux lignes `UndefinedColumn` |
| durée, tokens, coût | 15 s ; 5 tours ; 0,58 USD | 8 s ; non mesuré (`--format json` non branché) |
| préambule | sans objet | une phrase de préambule partait dans le commentaire : interdite dans l'agent |
| `/fix-until-green` | 154 s, 0,53 USD, 61 verts avec `--allowedTools` (voir l'étape 7) | non rejoué (TUI) |

Reste à relever en séance : nombre de lignes du journal chez GitHub (`wc -l`), format réel des colonnes, `workflow_run`, `git push` et retour au vert. Après la modification de l'agent et du prompt, les deux sorties du tableau sont à rejouer une fois par outil.

Limite à dire : dans un vrai job `workflow_run`, le dépôt extrait est `main`, qui ne contient pas la colonne `assignee` ; l'agent déduit alors le type de la colonne du seul journal. Sur le poste, la copie de travail est la branche, et l'agent lit `tables.py`.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Workflow | `analyse-echec.claude-code.yml` : `./ci/analyser-echec.sh claude`, `MAX_TURNS` | `analyse-echec.opencode.yml` : `./ci/analyser-echec.sh opencode` |
| Étape de l'agent de code | `claude -p … --model claude-sonnet-5-5 --max-turns 6 --output-format json --allowedTools Read Grep Glob`, journal en entrée standard | `opencode run --model amazon-bedrock/eu.anthropic.claude-sonnet-5-5 --agent diagnostiqueur`, journal en entrée standard |
| Agent | `.claude/agents/diagnostiqueur.md`, `tools: Read, Grep, Glob` | `.opencode/agents/diagnostiqueur.md`, `permissions` : `edit`, `shell`, `webfetch` refusés |

L'action `anthropics/claude-code-action@v1` (entrées `prompt` et `claude_args: --allowedTools …`) est la variante non retenue : un seul script sert les deux outils. Jamais deux `opencode run` en parallèle.

## Repli

`sortie-reference.md` pour la forme du commentaire. Si `gh pr create` échoue ou si `ci` ne tourne pas : `ci/analyser-echec.sh <outil> <exécution> <pull request>` sur une exécution existante, ou `DRY_RUN=1` pour afficher le commentaire sans le poster. Si le modèle ne répond pas : montrer la ligne d'erreur dans le journal (`gh run view <id> --log-failed | grep -m1 UndefinedColumn`), lire `reference/20260907_0002_ticket_assignee.py` comme correctif attendu et l'appliquer (étape 7, repli sans modèle). La branche `demo/build-casse-done` du plan n'existe pas dans tickets-api : sa création est une action sortante laissée au formateur.

## Remise à zéro

`gh pr close <numéro>`, `git checkout -- . && git clean -fd -e .venv`, `rm -rf analyse-sortie`, `git reset --hard origin/demo/build-casse` si le correctif a été commité ; `docker compose down -v && make db-up`. Pour repartir d'un dépôt neuf, utiliser une nouvelle session.
