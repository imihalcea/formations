# Démonstration 1 : revue à la demande

Slide « Démonstration : revue à la demande ». Le reviewer relit la branche `demo/revue-defauts` de tickets-api contre `revue/regles.md` et rend des findings. Un finding sur un code conforme (`tests/conftest.py`) peut apparaître, il n'est pas attendu : il n'a pas été produit au rejeu (voir « Résultat observé »).

## Préalables

Claude Code 2.1.310 ou Open Code v2.0.32, modèle `claude-sonnet-5-5` ; `gh`, `docker`, `uv`, `jq`. Branche `demo/revue-defauts` : spec 002 livrée et quatre défauts plantés (commit `31ece52`). Sur la branche, `make test` donne 57 verts (relevé le 25 octobre 2026) : les défauts ne cassent aucun test, c'est la raison de la revue.

## Préparation

```
demos/07-revue-a-la-demande/session.sh <session>
```

**Création d'un dépôt GitHub privé (à vérifier avant séance).** `session.sh` appelle `../00-tickets-api/session.sh`, qui crée un dépôt GitHub privé pour la session : action sortante, non lancée par les agents de rédaction. Le formateur fait un essai à blanc de `session.sh` (session de test) avant la séance, puis supprime le dépôt de test.

`session.sh` crée la copie de session, se place sur `demo/revue-defauts` et copie `artefacts/` par-dessus, sans commit : le push vers le dépôt de référence (privé) attend la confirmation de l'utilisateur. La copie remplace `.claude/settings.json` (même contenu plus `Bash(cat *)` et `Bash(grep *)`).

| Fichier (`artefacts/`) | Rôle |
|---|---|
| `revue/regles.md` | R1 à R4 (cinq champs), commun aux deux outils ; R3 en première version |
| `revue/finding.schema.json` | schéma des six champs du finding |
| `.claude/agents/reviewer.md`, `.opencode/agents/reviewer.md` | reviewer en lecture seule |
| `.claude/agents/contradicteur.md`, `.opencode/agents/contradicteur.md` | contradicteur (démonstration 3) |
| `.claude/commands/revue.md`, `.opencode/commands/revue.md` | `/revue` |
| `.claude/commands/revue-adverse.md`, `.opencode/commands/revue-adverse.md` | `/revue-adverse` (démonstration 3) |
| `.claude/settings.json` | permissions Claude Code |

Contrôles sans modèle : `make check` dans ce dossier (JSON, `bash -n`, présence des règles R1 à R4 et des huit fichiers) ; dans la copie, `opencode debug agents` liste `reviewer` et `contradicteur` en `mode: subagent` avec leurs règles `edit` et `shell` ; `make test` : 57 verts.

Claude Code : ouvrir `claude` une fois dans la copie et accepter le dialogue de confiance. Sans cela, `claude -p` ignore les `permissions.allow` du projet (avertissement « Ignoring 9 permissions.allow entries… this workspace has not been trusted ») et le reviewer subit des refus de lecture.

Si le port 5432 est pris par un autre conteneur `tickets-api-db-1`, `make db-up` échoue : arrêter l'autre conteneur ou utiliser sa base.

## Déroulé

1. `git log --oneline origin/main..HEAD` : les commits de la branche (spec 002, défauts plantés ; une fusion de `main` peut s'y ajouter).
2. Lire `revue/regles.md` : R1 à R4.
3. Lancer, dans la copie de travail :
   - Claude Code : `claude --model claude-sonnet-5-5`.
   - Open Code, TUI : `opencode`.

   Puis le prompt exact :

   ```
   /revue 002-responsable-priorite-haute
   ```

4. Lire les appels de lecture du reviewer (fichiers ouverts autour des lignes signalées).
5. Parcourir les findings par sévérité.
6. Si un finding porte sur `tests/conftest.py` (code conforme), il annonce la démonstration 2. Sinon, dire que le modèle l'a écarté et montrer la ligne dans `sortie-reference.md` : la démonstration 2 se joue quand même (correction préventive).

## Rejeu non interactif

| Outil | Commande |
|---|---|
| Claude Code | `claude -p "/revue 002-responsable-priorite-haute" --model claude-sonnet-5-5 --allowedTools "Bash(cat *)" "Bash(grep *)" "Bash(git diff *)" "Bash(git log *)"` dans la copie. Le prompt vient avant `--allowedTools` (option variadique : placé après, il est absorbé et la commande échoue). `claude -p` développe la commande et démarre en mode Manual : les permissions manquantes refusent |
| Open Code | `make opencode SESSION=<session>` : `lancer-opencode.sh` assemble le prompt de `.opencode/commands/revue.md` (frontmatter retiré, `$ARGUMENTS` remplacé, blocs `` !`cmd` `` exécutés) puis lance `opencode run --model amazon-bedrock/eu.anthropic.claude-sonnet-5-5 --agent reviewer`. v2.0.32 ne développe ni `/revue` ni `` !`…` `` en `opencode run` |

À vérifier en séance : la forme `git diff origin/main...HEAD | opencode run --agent reviewer "…"` (diff par l'entrée standard) n'a pas été exécutée ; le script assemble le prompt lui-même.

## Résultat observé (rejeu du 25 octobre 2026, `claude-sonnet-4-6`)

Attendu d'après les défauts plantés : R3 sur `notifications.py` (`NOTIFY_TOKEN`, ligne 6), R4 sur `assign_ticket` (`PATCH /tickets/{id}/assignee` avec `{"assignee": null}` sur un ticket `high` : 200 au lieu de 422, scénario confirmé par un test ad hoc le 25 octobre 2026), R1 sur le même routeur (`unit._session`, import de `TicketRow`), R2 sur la route sans test (quatre tests retirés de `tests/integration/test_tickets_api.py`).

| Outil | Exécutions | Findings | Durée, coût |
|---|---|---|---|
| Claude Code | 2 (puis 2 essais de contrôle) | 4 puis 5 : R1 (une ou deux fois, import ligne 14 et `_session` lignes 59-63), R2, R3 `notifications.py:6`, R4 (lignes 59 à 63 selon l'exécution) | 92 à 155 s, 0,24 à 0,51 USD |
| Open Code (`opencode run`) | 2 | 5 identiques en nombre : R1 ×2 (14 et 59), R2 (ligne 56 ou 57), R3 `notifications.py:6`, R4 (57 ou 62) | 14 s, 0,03 à 0,10 USD |

Constats :
- Le nombre de findings va de 4 à 5 selon que R1 est scindé en deux (import, accès à la session). Les lignes varient d'une exécution à l'autre, le contenu non.
- Le finding R3 sur `tests/conftest.py:6` (faux positif possible, non attendu) n'est rendu dans aucune des 4 exécutions. Un essai supplémentaire avec une vérification de R3 qui nomme les fichiers de test et « même factice » ne le produit pas non plus. Le reviewer n'ouvre pas `tests/conftest.py`, et la consigne « pas de scénario, pas de finding » écarte une valeur factice. Le faux positif n'est pas reproductible à la demande : prévoir le repli.
- Forme : le reviewer est invité à rendre un objet JSON par ligne sans préambule. Claude Code le reformate en texte français ou l'entoure d'un bloc ```json ; Open Code ajoute un résumé en prose avant le bloc. Le format n'est pas respecté à la lettre.
- Sans dialogue de confiance accepté, 2 refus de permission et un coût doublé (0,51 contre 0,24 USD, relectures après refus).

À vérifier en séance : appels de lecture du reviewer, `/usage`, exécution de `/revue` en TUI (le rejeu a utilisé `claude -p` et le script `lancer-opencode.sh`), question « le reviewer de mode `subagent` s'exécute-t-il dans la session courante » (Open Code, TUI).

Sortie de référence : `sortie-reference.md`.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Fichier d'agent | `.claude/agents/reviewer.md`, `tools: Read, Grep, Glob` | `.opencode/agents/reviewer.md`, `permissions` : `edit` et `shell` refusés |
| Commande | `.claude/commands/revue.md`, `allowed-tools` couvre `cat` et `git diff` | `.opencode/commands/revue.md`, `agent: reviewer` ; à voir en TUI : le reviewer, de mode `subagent`, s'exécute-t-il dans la session courante |
| Non interactif | `claude -p "/revue …"` | script `lancer-opencode.sh` |
| Spécification | `$ARGUMENTS` dans le texte de la commande, pas dans un bloc `` !`…` `` (substitution dans un bloc non documentée) | idem (Open Code substitue d'abord les arguments, puis exécute le bloc) |

## Repli

`sortie-reference.md` : montrer les findings attendus, puis le diff des défauts (`git diff origin/main...HEAD -- src tests`). Si l'agent ne répond pas, lire seulement `revue/regles.md` et les défauts.

## Remise à zéro

`demos/01-commun/reset.sh <session>` : annule la copie des artefacts et les modifications de l'agent. Relancer ensuite `session.sh`.
