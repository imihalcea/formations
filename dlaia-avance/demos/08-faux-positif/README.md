# Démonstration 2 : corriger la règle R3

Slide « Démonstration : corriger la règle R3 ». La règle R3 est réécrite et commitée pour exclure `tests/`, puis la revue est relancée. Le faux positif de `tests/conftest.py` n'a pas été produit au rejeu : la démonstration montre alors que la correction garde le vrai finding.

## Préalables

Ceux de la démonstration 1 (`../07-revue-a-la-demande/README.md`). Avoir joué ou connaître la démonstration 1. Claude Code : dialogue de confiance accepté dans la copie (voir démonstration 1).

## Préparation

```
demos/08-faux-positif/session.sh <session>
```

**Création d'un dépôt GitHub privé (à vérifier avant séance).** `session.sh` appelle `../00-tickets-api/session.sh`, qui crée un dépôt GitHub privé pour la session : action sortante, non lancée par les agents de rédaction. Le formateur fait un essai à blanc de `session.sh` (session de test) avant la séance, puis supprime le dépôt de test.

Même état que la démonstration 1 : branche `demo/revue-defauts`, fichiers de la revue copiés, R3 en première version. Différence avec la démonstration 1 : `session.sh` commite `revue/regles.md` et `revue/finding.schema.json` dans la copie (commit local), pour que `git diff HEAD~1 -- revue/regles.md` après la réécriture ne montre que la différence de R3 (sans ce commit de départ, git affiche un fichier entier créé). Si la démonstration 1 vient d'être jouée dans la même copie, ne pas relancer `session.sh` : la copie est déjà prête.

`reference/regles-r3-corrigee.md` : `revue/regles.md` complet avec R3 corrigée. `reference/correctif-r3.patch` : la différence (appliquée par `git apply --check` sur la copie le 25 octobre 2026). `make check` vérifie que le patch donne exactement le fichier corrigé.

## Déroulé

1. Rappeler le finding R3 sur `tests/conftest.py` s'il a été rendu à la démonstration 1 ; sinon montrer sa ligne dans `../07-revue-a-la-demande/sortie-reference.md` et dire que la règle de départ le permet (« les tests ou les fixtures »).
2. Premier prompt, exact :

   ```
   Réécris la règle R3 de revue/regles.md : elle continue de signaler tout identifiant émis écrit en clair dans src/ (préfixe de fournisseur, séparateur - ou _, au moins seize caractères hexadécimaux), exclut tests/ et donne un exemple conforme dans tests/. Commite la modification.
   ```

   Le reviewer étant en lecture seule, c'est l'agent principal qui modifie le fichier. Relire `git diff HEAD~1 -- revue/regles.md` : la différence de R3 seule. Variante : réécrire la règle à la main devant la salle.
3. Relancer, avec le prompt exact (Open Code : TUI, ou `make -C demos/07-revue-a-la-demande opencode SESSION=<session>`) :

   ```
   /revue 002-responsable-priorite-haute
   ```

4. Comparer aux findings de la démonstration 1.
5. Nommer la contrepartie à voix haute : l'exclusion de `tests/` supprime aussi la détection d'un vrai secret commité dans un test.

## Résultat observé (rejeu du 25 octobre 2026, `claude-sonnet-4-6`)

Attendu : R3 réécrite et commitée ; relance de `/revue` avec R3 sur `notifications.py` conservé, R4, R1 et R2 rendus ; finding sur `tests/conftest.py` disparu s'il existait.

| Outil | Prompt 1 | Relance `/revue` |
|---|---|---|
| Claude Code | 19 s, 0,19 USD, commit sans refus (`--permission-mode acceptEdits`, `--allowedTools "Edit" "Write" "Bash(git add *)" "Bash(git commit *)"`) | 144 s, 0,44 USD : 4 findings (R1 haute, R2 moyenne, R3 `notifications.py:6`, R4 haute), R3 conservé |
| Open Code | 15 s, 0,10 USD, commit sans demande de permission | 16 s : 3 findings (R1, R2, R4), R3 `notifications.py` perdu ; après repli (`make repli`) : 5 findings dont R3 `notifications.py:6` |

Constats :
- Le finding sur `tests/conftest.py` n'existait pas au départ (démonstration 1) : sa disparition n'est pas démontrable. La démonstration vérifie que R3 sur `notifications.py` survit à la correction.
- Première version du prompt (« elle ne vise que les identifiants émis dans src/ ») : sous Claude Code, motif `[a-z]+-[0-9a-f]{16,}` à tiret, qui ne reconnaît pas `ntfy_9f3a7c21e0b44d8f` ; le modèle a signalé `ntfy_` à la relance en lisant l'énoncé plutôt que le motif. Sous Open Code, la règle devient une règle de format inversée (« tout identifiant émis doit respecter `<préfixe>_<16 hex minimum>` »), et la relance perd R3.
- Prompt durci (le prompt de ce runbook : « continue de signaler… séparateur - ou _ »), joué une fois sous Claude Code sur une copie : 0,14 USD, motif `[a-zA-Z]+[-_][0-9a-fA-F]{16,}`, exclusion de `tests/`, exemple conforme `tests/fakes.py`. Non rejoué sous Open Code : à vérifier en séance.
- Le nombre de findings est lu en objets : R1 scindé en deux donne 5 objets. Le « quatre » du plan compte quatre règles.
- Contrepartie de l'exclusion de `tests/` (un vrai secret commité dans un test) : à dire à voix haute, aucune commande ne la montre.
- Comparaison à la règle de référence : `reference/regles-r3-corrigee.md` (violation `ntfy_…`, conforme `monkeypatch.setenv(…)`) diffère de ce que l'agent écrit ; montrer la règle de référence si la sienne dérive.

## Variantes

Aucune différence entre Claude Code et Open Code pour la réécriture. La relance suit les variantes de la démonstration 1. Sous Claude Code, `claude -p` démarre en mode Manual : l'écriture de `revue/regles.md` et `git commit` ne sont pas dans `permissions.allow` ; au rejeu non interactif, ajouter `--permission-mode acceptEdits` et `Bash(git add *)`, `Bash(git commit *)` en `--allowedTools`, ou jouer le repli.

## Repli

`make -C demos/08-faux-positif repli SESSION=<session>` : applique `reference/correctif-r3.patch` et commite. La branche `demo/revue-defauts-done` du plan n'existe pas dans le dépôt de référence : sa création et son push attendent la confirmation de l'utilisateur ; ce patch en tient lieu.

## Remise à zéro

`git -C <copie> reset --hard origin/demo/revue-defauts` puis `demos/01-commun/reset.sh <session>`, et relancer `session.sh` (les commits de la règle et de départ sont locaux à la copie).
