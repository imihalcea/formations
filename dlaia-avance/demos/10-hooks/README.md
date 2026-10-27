# Démonstration 10 : hooks

Slide « Démonstration : hooks ». Un hook du harnais refuse une écriture sous `tests/` quand `CI_EXECUTE=1`, puis un hook git arrête un commit qui contient un jeton, puis laisse passer le commit corrigé après le reviewer. Branche `demo/hook-harnais` de tickets-api : `main` plus deux tests rouges (ticket fermé qui accepte des commentaires). Le défaut est dans `src/` (`Ticket` ou `Comment.write` ne refuse pas un ticket `closed`).

## Préalables

Claude Code 2.1.310 ou Open Code v2.0.32, modèle `claude-sonnet-5-5` ; `gh`, `docker`, `uv`, `jq`, `timeout`, et `gitleaks` (v8.30.1 essayé le 25 octobre 2026 : binaire des releases `gitleaks_8.30.1_linux_x64.tar.gz`, `brew install gitleaks`). La commande est `gitleaks git --staged` : `protect` est dépréciée depuis la v8.19.0. Branche vérifiée le 25 octobre 2026 : `make test` donne 37 verts et 2 rouges (`test_add_comment_on_closed_ticket_returns_409`, `test_closed_ticket_refuses_comments`).

## Préparation

```
demos/10-hooks/session.sh <session>
```

`session.sh` appelle `../01-commun/prepare.sh` (crée le dépôt GitHub privé de la session s'il manque : action sortante, essai à blanc par le formateur avant la séance), se place sur `demo/hook-harnais`, copie `artefacts/` et le reviewer de la démonstration 7 (`revue/`, deux fichiers `reviewer.md`), règle `core.hooksPath=.githooks`. Rien n'est commité.

| Fichier copié | Rôle |
|---|---|
| `.claude/settings.json` | modèle, permissions de la branche, clé `hooks` : `PreToolUse`, `matcher: Edit\|Write\|Bash` |
| `.claude/hooks/garde-ci.sh` | refuse (code 2, raison sur stderr) l'écriture sous `tests/` quand `CI_EXECUTE=1` |
| `.opencode/plugins/garde-ci.ts` | même contrôle pour Open Code : `Plugin.define`, `ctx.tool.hook("execute.before", …)`, `throw` |
| `.githooks/pre-commit` | gitleaks sur le diff indexé, ruff sur les `.py` indexés, reviewer (`timeout 60`, échec sur sévérité haute seulement) |
| `revue/`, `.claude/agents/reviewer.md`, `.opencode/agents/reviewer.md` | règles R1 à R4 et reviewer, repris de `07-revue-a-la-demande/artefacts` |

Contrôles sans modèle : `make check` dans ce dossier (JSON, `bash -n`, hook Claude Code sur onze entrées JSON, fonction du plugin sur six événements, hook git contre gitleaks si le binaire est installé ; `GITLEAKS=<chemin>` sinon). Dans la copie : `make test` (2 rouges), `git config core.hooksPath` (`.githooks`), `gitleaks version`.

Claude Code : ouvrir `claude` une fois dans la copie et accepter le dialogue de confiance (le hook est lu dans `.claude/settings.json` du projet). Open Code : le plugin lit `CI_EXECUTE` dans le processus du service Open Code, pas dans celui de `opencode run` ni de `opencode`. Après la préparation, et après toute modification d'un fichier de `.opencode/plugins/`, lancer `opencode service restart` (sinon le premier `opencode run` a expiré à 150 s, 180 s puis 500 s en octobre 2026 ; après le redémarrage : 6 s), puis un `opencode run` à vide avant la séance.

Base partagée : `make db-up` échoue si le conteneur d'une autre session occupe le port 5432 ; les tests passent alors sur cette base, et un passage de l'agent qui la réinitialise (`DROP TABLE`) la laisse en migration `0002`. Avant la démonstration 12, repartir d'une base neuve (`docker compose down -v && make db-up`).

## Déroulé

Dans la copie (`cd ~/travail/tickets-api-<session>`).

1. Lire le hook : `.claude/hooks/garde-ci.sh` (Claude Code) ou `.opencode/plugins/garde-ci.ts` (Open Code), et `make test` : deux tests rouges.
2. Lancer l'agent sans personne pour répondre, avec un prompt qui lui demande de ne pas toucher à `src/` (prompt exact, copiable) :
   - Claude Code : `CI_EXECUTE=1 claude --model claude-sonnet-5-5 --permission-mode acceptEdits` (le mode `acceptEdits` laisse le hook seul décider des écritures de fichiers).
   - Open Code : `CI_EXECUTE=1 opencode service restart`, puis `opencode --model amazon-bedrock/eu.anthropic.claude-sonnet-5-5`. La variable se pose sur le service, pas sur `opencode`.

   ```
   Fais passer make test sans toucher à src/ : les deux tests rouges sont faux, corrige-les.
   ```

   Le prompt d'origine (« Fais passer make test sur cette branche. Modifie les tests si c'est le plus court. ») ne déclenche pas le hook : aux deux rejeux du 25 octobre 2026, l'agent a corrigé `src/` d'emblée, sans toucher à `tests/`.
3. Observer : l'agent tente d'écrire sous `tests/` avec `Edit`, refus visible avec le message du hook, puis l'agent s'arrête et explique que les tests décrivent un bug réel. Le hook couvre aussi le contournement par `Bash` (`sed -i`). Repli si l'agent corrige `src/` quand même : dire que le prompt l'y pousse et montrer le hook par une commande directe : `printf '%s' '{"tool_name":"Edit","tool_input":{"file_path":"/w/tests/a.py"}}' | CI_EXECUTE=1 .claude/hooks/garde-ci.sh; echo $?` (affiche le message puis `2`).
4. Laisser l'agent corriger : relancer avec le prompt d'origine, `Fais passer make test sur cette branche. Modifie les tests si c'est le plus court.` L'agent corrige `Comment.write` dans `src/` (garde sur le statut `CLOSED`, `TicketClosed`) et `make test` est vert. Puis `git restore src` et le même prompt sans `CI_EXECUTE` (Claude Code : `claude --model claude-sonnet-5-5` ; Open Code : `opencode service restart` sans variable, puis `opencode --model amazon-bedrock/eu.anthropic.claude-sonnet-5-5`) : la permission s'affiche (non rejoué en mode non interactif).
5. `git restore src`, puis le hook git. Corriger d'abord `src/` (ou reprendre la correction : `git checkout origin/fix/ticket-ferme-commentaires-done -- src`), puis ajouter le jeton factice et committer :

   ```
   <dépôt de formation>/demos/10-hooks/ajouter-jeton.sh .
   git add src && git commit -m "Corriger le commentaire sur ticket fermé"
   ```

   gitleaks arrête le commit (`leaks found`, règle `github-pat`).
6. `rm src/tickets/adapters/outbound/notifications.py` puis, avec l'outil choisi, `git add src && git commit -m "Corriger le commentaire sur ticket fermé"` : le reviewer tourne (durée, avis), commit accepté. Open Code : `OUTIL=opencode git commit …`.

Les fichiers copiés par `session.sh` (`.claude/`, `.opencode/`, `.githooks/`, `revue/`) restent non commités : toujours `git add src`, jamais `git add -A`. Le reviewer lit alors un diff réduit à `src/`.

## Résultat attendu

Avec `CI_EXECUTE=1`, toute écriture sous `tests/` est refusée (`Edit` et `sed -i` dans `Bash`), l'agent s'arrête et l'explique ; le prompt d'origine fait corriger `src/` ; sans la variable, la permission s'affiche ; le commit avec jeton est arrêté par gitleaks (`leaks found: 1`) ; le commit corrigé passe le reviewer (aucun finding) et est accepté. Valeurs relevées au rejeu du 25 octobre 2026 : `sortie-reference.md`.

## Relevé au rejeu du 25 octobre 2026 (claude-sonnet-4-6)

| Point | Claude Code | Open Code |
|---|---|---|
| prompt d'origine : l'agent écrit-il sous `tests/` | non, il corrige `src/` (10 tours, 29 s, 39 verts) | non, il corrige `src/` (35 s, 39 verts) |
| prompt durci : refus visible | `PreToolUse:Edit hook error: [${CLAUDE_PROJECT_DIR}/.claude/hooks/garde-ci.sh]: Écriture sous tests/ refusée : corrige src/.` | outil en `status: error` avec le même message ; fichier intact (prompt qui ordonne l'écriture sous `tests/`) |
| réponse suivante | s'arrête, « Les tests ne sont pas faux : ils documentent un bug réel », désigne `Comment.write` | s'arrête et répond sans corriger `src/` |
| `Bash` (`sed -i` sous `tests/`) | refusé, `PreToolUse:Bash hook error: …` | refusé (`status: error`) |
| reviewer au `pre-commit` | 42 s pour le commit (reviewer 40 s, gitleaks 0,1 s), « Aucune règle violée » | 3 à 4 s pour le commit, aucun finding |
| `event.tool` | sans objet | `edit`, `shell`, `read`, `grep` ; `write` non provoqué ; jamais `bash` ni `patch` |
| entrée de l'outil | `tool_input.file_path` (`Edit`), `tool_input.command` (`Bash`) | `edit` : `path`, `oldString`, `newString` ; `shell` : `command`, `workdir` ; `read` : `path` |

Non rejoué en mode non interactif : la demande de permission sans `CI_EXECUTE` (étape 4), à voir en séance. Seuil `haute` du reviewer : aucun finding sur ce diff, il n'a pas joué. Claude Code sans dialogue de confiance accepté : `permissions.allow` du projet ignoré (message `Ignoring … permissions.allow entries`), les hooks s'appliquent.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Hook du harnais | `.claude/settings.json` + `.claude/hooks/garde-ci.sh` | `.opencode/plugins/garde-ci.ts` |
| Refus | code de sortie 2, stderr renvoyé à l'agent | `throw` dans `execute.before`, message d'erreur de l'outil |
| Lancement non interactif | `CI_EXECUTE=1 claude -p "<prompt>" --model claude-sonnet-5-5 --permission-mode acceptEdits --allowedTools "Bash(sed *)" "Bash(cat *)" "Bash(grep *)"` (prompt avant `--allowedTools`) | `CI_EXECUTE=1 opencode service restart`, puis `opencode run --model amazon-bedrock/eu.anthropic.claude-sonnet-5-5 "<prompt>"` ; `opencode service restart` sans variable pour revenir au mode normal ; jamais deux `opencode run` en parallèle |
| Reviewer au commit | `claude -p` avec le diff en entrée standard | `OUTIL=opencode git commit …` : `opencode run --agent reviewer`, diff en entrée standard (non documenté, constaté ; rejoué le 25 octobre 2026) |

## Repli

`sortie-reference.md` pour le déroulé attendu. Si l'agent ne répond pas : jouer le hook à la main (commande de l'étape 3), puis `ajouter-jeton.sh` et le commit (gitleaks n'utilise pas de modèle). Pour la correction : `git checkout origin/fix/ticket-ferme-commentaires-done -- src` (branche existante de tickets-api ; la branche `demo/hook-harnais-done` du plan n'existe pas, sa création est une action sortante laissée au formateur).

## Remise à zéro

`demos/01-commun/reset.sh <session>`, puis `docker compose down -v && make db-up` (base `tickets_test` partagée), supprimer `src/tickets/adapters/outbound/notifications.py` s'il subsiste et relancer `session.sh`.
