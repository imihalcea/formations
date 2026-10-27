# Démonstration 3 : revue adverse

Slide « Démonstration : revue adverse ». `/revue-adverse` lance le reviewer, puis un contradicteur par finding de sévérité haute dans le même tour. Chaque finding arrive avec un verdict et sa preuve.

## Préalables

Ceux de la démonstration 1 (`../07-revue-a-la-demande/README.md`), dialogue de confiance de Claude Code compris. La règle R3 est celle de la démonstration 2.

## Préparation

```
demos/09-contradicteur/session.sh <session>
```

**Création d'un dépôt GitHub privé (à vérifier avant séance).** `session.sh` appelle `../00-tickets-api/session.sh`, qui crée un dépôt GitHub privé pour la session : action sortante, non lancée par les agents de rédaction. Le formateur fait un essai à blanc de `session.sh` (session de test) avant la séance, puis supprime le dépôt de test.

Appelle la session de la démonstration 1, puis remplace `revue/regles.md` par `../08-faux-positif/reference/regles-r3-corrigee.md` (non commité). Les agents `contradicteur` et les commandes `revue-adverse` viennent de `../07-revue-a-la-demande/artefacts/`.

Contrôles sans modèle : `make check` ; `opencode debug agents` dans la copie : `contradicteur` en `mode: subagent`, `shell` refusé sauf `make test*` et `grep *`.

## Déroulé

1. Lire `.claude/agents/contradicteur.md` (ou `.opencode/agents/contradicteur.md`) : verdict et preuve obligatoires, aucune écriture.
2. Lancer (Claude Code : `claude --model claude-sonnet-5-5` ; Open Code : TUI) le prompt exact :

   ```
   /revue-adverse 002-responsable-priorite-haute
   ```

3. Observer les contradicteurs lancés dans le même tour (un par finding de sévérité haute : trois ou quatre selon que R1 est scindé en deux findings).
4. Lire chaque verdict et sa preuve.
5. Noter le coût : `/usage` (Claude Code), coût affiché (Open Code), puis relancer `/revue` pour la comparaison (slide « Le coût d'une revue »).

Résultat attendu : verdicts confirmés avec une ligne de code citée pour R1, R3 et R4 ; R2 sans contradicteur ; trois ou quatre contradicteurs selon que R1 est scindé en deux findings.

## Rejeu non interactif

| Outil | Commande |
|---|---|
| Claude Code | `claude -p "/revue-adverse 002-responsable-priorite-haute" --model claude-sonnet-5-5 --output-format json --allowedTools "Bash(cat *)" "Bash(grep *)" "Bash(git diff *)" "Bash(git log *)" "Bash(make test*)" "Bash(uv run pytest *)"` (le JSON donne `total_cost_usd` ; le prompt précède `--allowedTools`) |
| Open Code | `../07-revue-a-la-demande/lancer-opencode.sh <copie> revue-adverse 002-responsable-priorite-haute` : agent par défaut (`build`), seul à pouvoir lancer deux sous-agents |

## Résultat observé (rejeu du 25 octobre 2026, `claude-sonnet-4-6`)

| Point | Claude Code | Open Code |
|---|---|---|
| Reviewer | 5 findings (R1 en deux, R2, R3, R4) | idem |
| Contradicteurs | 4 (`R1a`, `R1b`, `R3`, `R4`), lancés dans le même tour (appels espacés de 3 à 6 s) | 3 (R1, R3, R4), démarrages à 980,7, 984,3 et 986,1 s, fins à 987,3, 990,4 et 994,9 s : chevauchement |
| Verdicts | tous « confirmé » | tous « confirmé » |
| R2 (moyenne) | affiché sans contradicteur | idem |
| Durée, coût | 96 s, 0,61 USD | 74 s, 0,19 USD (session principale seule ; les sous-agents ne sont pas comptés) |

Constats :
- Aucune preuve par test rejoué : les contradicteurs citent des lignes de code lues (`grep -n`, `Read`). Aucun `make test` ni requête HTTP, y compris pour R4 (contradicteur Open Code : « Pas besoin de lancer les tests : la lecture suffit »). Les motifs `make test*` et `grep *` d'Open Code ne sont pas sollicités (aucun appel `bash` observé) : à vérifier en séance (TUI). Le prompt du contradicteur dit désormais « si un test existant le couvre, lance-le avec `make test` ; sinon cite la ligne de code » (non rejoué : à vérifier en séance).
- R1 : verdict « confirmé », pas « plausible ».
- Aucun contradicteur n'a écrit un fichier ni subi un refus de permission.
- Forme : le format `verdict:` / `preuve:` du contradicteur est reformaté par l'agent principal (titres « CONFIRMÉ », résumé ; sous Open Code, rapport en markdown avec emojis).
- Coût de la revue adverse face à la revue sans contradicteur (une exécution chacune) : Claude Code 0,61 contre 0,24 à 0,44 USD (1,4 à 2,6 fois) ; Open Code 0,19 contre 0,08 USD en session principale (environ 2,4 fois). Durée : 96 s contre 92 à 144 s (Claude Code), 74 s contre 15 s (Open Code).

Sortie de référence : `sortie-reference.md`.

## Variantes

| Point | Claude Code | Open Code |
|---|---|---|
| Restriction du contradicteur | `tools: Read, Grep, Glob, Bash`, `disallowedTools: Write, Edit` ; la limite aux tests passe par `permissions.allow` du projet | règles `shell` : refus général puis `make test*` et `grep *` |
| Commande | `allowed-tools: Bash(cat *) Bash(git diff *)` | pas de champ `agent` (l'agent principal doit lancer deux sous-agents) |
| Non interactif | `claude -p` développe la commande | script, agent `build` |

## Repli

`sortie-reference.md` : montrer verdicts et preuves attendus, puis lire une preuve dans le code (`grep -n "_session" src/tickets/adapters/inbound/http/routers/tickets.py`).

## Remise à zéro

`demos/01-commun/reset.sh <session>`, puis relancer `session.sh`.
