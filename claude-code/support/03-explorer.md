# Explorer et comprendre un code existant

Chercher, expliquer, modifier sous contrôle

::: notes
Module 3, environ 50 min dont 20 de TP.
Le module 2 a présenté le mode plan, la demande de permission avec `Tab` et les checkpoints : ici on s'appuie dessus sans les redéfinir.
Le fil rouge : `rooms`, API FastAPI de réservation de salles de réunion (salles, réservations, conflits de créneaux, tarif, export CSV).
:::

## Une exploration à l'écran {kicker="Recherche"}

![Illustration : la question sur le chevauchement des réservations, un grep sur overlaps, la lecture de conflicts.py, puis d'une plage de routes.py, et une réponse qui cite fichier et ligne](images/03-exploration.svg)

::: sources
- [Claude Code, Tools reference : Glob tool behavior, Read tool behavior](https://code.claude.com/docs/en/tools-reference#glob-tool-behavior)
:::

::: notes
Rendu simplifié du terminal. La sortie de `grep -rn overlaps rooms/` est réelle (4 lignes, la première affichée) ; les numéros de ligne aussi : `check_availability` en ligne 21 de `conflicts.py`, l'appel dans `book` en ligne 50 de `routes.py`.
L'agent enchaîne seul : chercher le symbole, lire le fichier trouvé, lire seulement la plage utile de l'appelant, répondre.
Aucune demande de permission : `grep` est en lecture seule, `Read` ne demande rien dans le répertoire de travail.
:::

## Les outils de lecture {kicker="Recherche"}

| Outil | Rôle | Demande en mode Manual |
|---|---|---|
| `Read` | lit un fichier ou une plage de lignes | non |
| `grep`, `find` par Bash | cherchent un motif, un nom de fichier | non |
| `LSP` | définitions, références, erreurs de type | non |

Sous Linux, macOS et WSL, `grep` et `find` remplacent les outils `Grep` et `Glob`.

::: sources
- [Claude Code, Tools reference : Glob tool behavior, LSP tool behavior](https://code.claude.com/docs/en/tools-reference#glob-tool-behavior)
- [Claude Code, Permissions : Read-only commands](https://code.claude.com/docs/en/permissions#read-only-commands)
:::

::: notes
« In Claude's shell those two commands run embedded versions of `bfs` and `ugrep` » : les recherches passent dans les hooks et les règles de permission comme des appels `Bash`.
`Grep` et `Glob` reviennent si on les nomme dans `--tools` ou `--allowedTools` au lancement ; une règle allow dans les réglages ne suffit pas. Ils reviennent aussi quand Bash est retiré.
`find` avec `-exec`, `-delete` ou `-fprint` déclenche une demande.
`LSP` reste inactif tant qu'aucun plugin de code intelligence n'est installé pour le langage.
Colonne « demande » : chemins dans le répertoire de travail.
:::

## Open Code : des outils dédiés {.compare kicker="Recherche"}

::: claude-code
`Read`, puis `grep` et `find` par Bash, avec `ugrep` et `bfs` embarqués.

Lectures et recherches passent sans demande en mode Manual.
:::

::: opencode
Outils `read`, `grep` et `glob`. `grep` et `glob` reposent sur ripgrep, qui respecte `.gitignore`.

Par défaut, tous les outils passent sans demande.
:::

::: sources
- [Claude Code, Tools reference : Glob tool behavior](https://code.claude.com/docs/en/tools-reference#glob-tool-behavior)
- [Open Code, Tools : read, grep, glob, Internals](https://opencode.ai/docs/tools/#internals)
- Open Code v2.0.26 : [`read.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/tool/plugin/read.ts), [`grep.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/tool/plugin/grep.ts), [`glob.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/tool/plugin/glob.ts)
:::

::: notes
Open Code : un fichier `.ignore` à la racine force l'inclusion de chemins exclus par `.gitignore`.
`glob` trie les chemins par date de modification.
`read` lit aussi un dossier, dont il renvoie la liste.
Le `opencode.json` du fil rouge ne touche qu'à `bash` et `edit` : la lecture reste libre.
:::

## Lire par plages {kicker="Recherche"}

Un appel `Read` renvoie au plus 25 000 tokens et refuse un fichier entier de plus de 256 Ko. Au-delà, l'agent lit par pages ou cherche un motif.

```prompt
Lis seulement la fonction book de rooms/routes.py.
```

::: sources
- [Claude Code, Tools reference : Large files](https://code.claude.com/docs/en/tools-reference#large-files)
:::

::: notes
Lecture par pages : paramètres `offset` et `limit` de `Read`.
Fichier au-dessus de la limite de tokens : première page, avec la mention `PARTIAL view`.
Limite réglable : `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS`. Depuis la v2.1.296, `allow_large: true` lit un gros fichier en un seul appel.
Rappel module 1 : chaque lecture reste dans le contexte de la session. Lire une plage coûte moins que lire le fichier.
:::

## Le sous-agent Explore {.compare kicker="Recherche"}

::: claude-code
Sous-agent en lecture seule : `Write` et `Edit` lui sont refusés. Il explore dans son propre contexte, seul son résumé revient.

L'agent choisit le niveau : quick, medium ou very thorough.
:::

::: opencode
Sous-agent `explore`, qui ne modifie aucun fichier. Il s'appelle aussi à la main par `@explore`.

Mêmes niveaux ; le shell lui reste autorisé.
:::

::: sources
- [Claude Code, Subagents : Built-in subagents](https://code.claude.com/docs/en/sub-agents#built-in-subagents)
- [Open Code, Agents : Explore](https://opencode.ai/docs/agents/#use-explore)
- Open Code v2.0.26 : [`plugin/agent.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/plugin/agent.ts)
:::

::: notes
Explore tourne sur le modèle de la conversation principale : Sonnet 4.6 ici.
Il démarre sans les `CLAUDE.md` ni l'état git. Il ne se reprend pas : « one-shot », sans identifiant d'agent.
Demande explicite possible : « Avec le sous-agent Explore, trouve où sont calculés les tarifs. »
Open Code : trois sous-agents intégrés, General, Explore, Scout.
:::

## Désigner un fichier avec @ {.compare kicker="Expliquer"}

::: claude-code
```prompt
Explique la logique de @rooms/conflicts.py
```

Le contenu du fichier entre dans la conversation sans appel `Read`. Un dossier donne sa liste de fichiers.
:::

::: opencode
Même syntaxe, avec recherche approchée du chemin. Une plage de lignes se désigne ainsi :

```prompt
Explique @rooms/routes.py#44-61
```
:::

::: sources
- [Claude Code, Common workflows : Reference files and directories](https://code.claude.com/docs/en/common-workflows#reference-files-and-directories)
- [Open Code, TUI : File references](https://opencode.ai/docs/tui/#file-references)
- Open Code v2.0.26 : [`prompt/parse.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/prompt/parse.ts)
:::

::: notes
Claude Code : fichier inclus s'il tient dans la limite de `Read` (25 000 tokens) ; un fichier texte de plus de 256 Ko ne l'est pas.
`@` ajoute aussi les `CLAUDE.md` du dossier du fichier et de ses parents.
Open Code : la syntaxe de plage vient du code v2.0.26, la doc du site ne la mentionne pas.
:::

## Du général au particulier {kicker="Expliquer"}

La documentation propose cette progression :

1. une vue d'ensemble du projet ;
2. les motifs d'architecture ;
3. les modèles de données ;
4. une zone précise, comme la détection des conflits.

```prompt
Donne-moi une vue d'ensemble de ce projet.
```

::: sources
- [Claude Code, Common workflows : Get a quick codebase overview](https://code.claude.com/docs/en/common-workflows#get-a-quick-codebase-overview)
:::

::: notes
Prompts de la doc : « give me an overview of this codebase », « explain the main architecture patterns used here », « what are the key data models? », « how is authentication handled? ».
Chaque réponse oriente la question suivante.
:::

## Suivre un traitement de bout en bout {kicker="Expliquer"}

```prompt
Trace le traitement de POST /bookings, de la route jusqu'à sqlite3.
```

La réponse suit les appels de `book` : validation du créneau, recherche des conflits, calcul du tarif, insertion.

::: sources
- [Claude Code, Common workflows : Find relevant code](https://code.claude.com/docs/en/common-workflows#find-relevant-code)
:::

::: notes
Adapté de l'exemple de la doc : « trace the login process from front-end to database ».
Chemin réel : `routes.py` (`book`), `conflicts.py` (`validate_slot`, `check_availability`), `pricing.py` (`compute_price`), `repository.py` (`add_booking`), `db.py`.
Premier prompt du TP 3.
:::

## Expliquer une dépendance {kicker="Expliquer"}

```python file="../fil-rouge/rooms/db.py" lines="54-60"
```

```prompt
D'où vient la connexion reçue par book, et quand est-elle fermée ?
```

::: sources
- [Claude Code, Best practices : Ask codebase questions](https://code.claude.com/docs/en/best-practices#ask-codebase-questions)
- [FastAPI, Dependencies with yield](https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/#early-exit-and-scope)
:::

::: notes
« Ask Claude questions you'd ask a senior engineer. » « No special prompting required: ask questions directly. »
Réponse attendue : `routes.py` déclare `Connection = Annotated[sqlite3.Connection, Depends(get_connection)]` ; FastAPI appelle `get_connection` à chaque requête et injecte la valeur du `yield`.
Fermeture : le code après `yield` s'exécute après l'envoi de la réponse (scope `"request"`, valeur par défaut pour une dépendance avec `yield`). Avec `scope="function"`, avant l'envoi.
FastAPI 0.143.3 dans le `uv.lock` du fil rouge.
:::

## Une explication se vérifie {kicker="Contrôle"}

```prompt
Pour chaque affirmation, donne le fichier et la ligne.
```

Rouvrir ensuite le code cité. L'agent peut se tromper avec assurance.

::: sources
- [Claude Code, Communications kit : Best practices](https://code.claude.com/docs/en/communications-kit#security-and-admin)
:::

::: notes
Citation : « Review diffs before committing; Claude can be confidently wrong ». Puis : « treat it like a sharp junior, not an oracle ».
La doc formule le conseil pour les diffs ; l'appliquer à une explication est une pratique, aucune page ne la recommande telle quelle.
Une référence fausse se voit en une lecture ; une explication sans référence ne se vérifie pas.
:::

## Une demande exploitable {kicker="Reformuler"}

| Stratégie | Vague | Exploitable (illustration) |
|---|---|---|
| Délimiter | ajoute des tests pour export.py | teste export.py pour un jour sans réservation |
| Désigner les sources | pourquoi pricing.py est-il si compliqué ? | résume l'historique git de pricing.py |
| Montrer un motif | ajoute une route | ajoute une route sur le modèle de GET /schedule |
| Décrire le symptôme | corrige l'export | le CSV du 16 janvier est vide, reproduis-le par un test |

::: sources
- [Claude Code, Best practices : Provide specific context in your prompts](https://code.claude.com/docs/en/best-practices#provide-specific-context-in-your-prompts)
:::

::: notes
Les quatre stratégies de la doc : scope the task, point to sources, reference existing patterns, describe the symptom.
Exemples de la doc : « add tests for foo.py » devient « write a test for foo.py covering the edge case where the user is logged out. avoid mocks. » ; « fix the login bug » devient « users report that login fails after session timeout. check the auth flow in src/auth/, especially token refresh. write a failing test that reproduces the issue, then fix it ».
Exemples de la colonne de droite inventés sur le fil rouge ; le symptôme du 16 janvier n'existe pas dans le code.
:::

## Reformuler en cours de route {kicker="Reformuler"}

Partir de ce qu'on veut, puis affiner d'après la réponse :

```prompt
Ajoute la durée des réservations au CSV du planning.
```

```prompt
Calcule la durée dans export.py, dans une fonction duration_minutes.
```

Un refus de permission avec consigne réoriente l'agent de la même façon.

::: sources
- [Claude Code, How Claude Code works : It's a conversation](https://code.claude.com/docs/en/how-claude-code-works#its-a-conversation)
- [Claude Code, Permissions : Add a comment when you answer a permission prompt](https://code.claude.com/docs/en/permissions#add-a-comment-when-you-answer-a-permission-prompt)
:::

::: notes
« You don't need perfect prompts. Start with what you want, then refine » ; « When the first attempt isn't right, you don't start over. You iterate. »
Rappel module 2 : `Tab` sur No ouvre le champ de consigne ; `Esc` ou un message mis en file réorientent aussi.
Les deux prompts reprennent l'étape de modification du TP 3 (illustration).
:::

## Une modification ciblée {kicker="Modifier"}

`Edit` remplace une chaîne exacte, présente une seule fois dans le fichier. `Write` crée un fichier ou l'écrase avec le contenu complet.

```text
Edit(rooms/export.py)
  old_string  booking.ends_at.isoformat(),
  new_string  booking.ends_at.isoformat(),
              duration_minutes(booking),
```

::: sources
- [Claude Code, Tools reference : Edit tool behavior, Write tool behavior](https://code.claude.com/docs/en/tools-reference#edit-tool-behavior)
:::

::: notes
Appel simplifié (illustration) : paramètres réels `file_path`, `old_string`, `new_string`.
« It doesn't use regex or fuzzy matching. » Si la chaîne apparaît plusieurs fois, l'édition échoue ; l'agent élargit la chaîne ou demande `replace_all`.
Lecture préalable : obligatoire pour Opus 4.6, Haiku 4.5 et les modèles antérieurs ; la doc ne nomme pas Sonnet 4.6. Une lecture par `cat` ou `grep` dans Bash compte aussi.
`Write` ne fusionne rien : sur un fichier existant, tout le contenu est remplacé.
Open Code : outils `edit`, `write` et `patch`, tous couverts par la permission `edit`.
:::

## Le diff avant l'acceptation {kicker="Modifier"}

![Illustration d'une demande d'édition de rooms/export.py : le diff qui ajoute duration_minutes(booking), puis Yes, Yes allow all edits during this session, No](images/03-diff.svg)

::: sources
- [Claude Code, Changelog : v2.1.257, v2.1.274](https://code.claude.com/docs/en/changelog)
- Open Code v2.0.26 : [`session/permission.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/routes/session/permission.tsx)
:::

::: notes
Schéma redessiné, à remplacer par une capture réelle : la doc ne décrit pas la demande d'édition, seul le changelog nomme « the Edit permission prompt's diff view ». Libellés des options à confirmer sur la capture.
Rappel module 2 : « don't ask again » pour les éditions vaut jusqu'à la fin de la session.
Open Code : diff affiché dans la demande quand `edit` est à `ask`, ce que fait le `opencode.json` du fil rouge. Par défaut, les éditions passent sans demande.
Avec IDE connecté, option « view diff in your IDE ».
:::

## Relire avec /diff {.compare kicker="Modifier"}

::: claude-code
`/diff` montre l'arbre de travail contre `HEAD` : éditions de l'agent et tout ce qui n'est pas commité. Une vue par tour isole les éditions de chaque tour.
:::

::: opencode
`/diff`, en v2, avec quatre vues : All, Committed, Uncommitted, Last turn.
:::

::: sources
- [Claude Code, Interactive mode : Review changes with /diff](https://code.claude.com/docs/en/interactive-mode#review-changes-with-diff)
- Open Code v2.0.26 : [`diff-viewer.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/feature-plugins/system/diff-viewer.tsx)
:::

::: notes
Vue par tour : construite à partir des éditions de fichiers de l'agent, hors git. Un fichier modifié par une commande Bash n'apparaît que dans la vue `Current`.
Dialogue classique : flèches pour choisir le fichier, `Enter` pour son diff, `Esc` pour revenir.
Panneau en rendu plein écran : v2.1.287 et un terminal d'au moins 110 colonnes ; `Ctrl+X B` passe des changements de la session aux changements non commités, puis à tout depuis la branche par défaut.
Rendu Open Code à vérifier sur la VM.
:::

## Borner l'exploration {kicker="Contrôle"}

Une demande d'enquête sans périmètre fait lire des centaines de fichiers et remplit le contexte. Le remède : un périmètre étroit, ou un sous-agent.

```prompt
Avec un sous-agent, liste les routes de rooms/routes.py sans test dans tests/test_routes.py.
```

::: sources
- [Claude Code, Best practices : Avoid common failure patterns](https://code.claude.com/docs/en/best-practices#avoid-common-failure-patterns)
:::

::: notes
Nom dans la doc : « The infinite exploration ». « Scope investigations narrowly or use subagents so the exploration doesn't consume your main context. »
Le sous-agent lit autant de fichiers, mais dans son propre contexte : la session principale ne reçoit que le résumé.
:::

## Une explication vaut ce que valent ses références au code. {.statement kicker="Idée clé"}

::: notes
Découle de l'exploration à l'écran (réponse avec fichier et ligne), de la vérification des explications et de la relecture du diff.
Ajouter : le même contrôle vaut pour une modification, relue dans son diff avant acceptation.
:::

## TP 3 : explorer et modifier {.tp duration="20 min"}

Faire expliquer le traitement d'une réservation et l'injection de la connexion, puis ajouter la durée au CSV du planning en relisant chaque diff. Le TP se termine par un commit.

Prérequis : TP 2 terminé, base remplie par `rooms.seed`.

::: notes
Vérifier le mode Manual sous Claude Code : sans demande, pas de diff à relire.
Open Code : sans `edit` à `ask` dans `opencode.json`, l'édition passe sans demande.
Si la première proposition convient déjà, refuser quand même avec la consigne : l'étape porte sur le refus.
Open Code : si Reject n'ouvre pas de champ de message dans la session principale, envoyer la consigne en nouveau prompt.
:::

### Lancer l'outil

::: claude-code
```console
$ cd ~/fil-rouge
$ claude --permission-mode default --model claude-sonnet-4-6
```
:::

::: opencode
```console
$ cd ~/fil-rouge
$ opencode
```
:::

::: attendu
Claude Code : `⏸ manual mode on` dans la barre d'état. Open Code : agent Build, modèle Claude Sonnet 4.6.
:::

### Tracer une réservation

```prompt
Trace le traitement de POST /bookings, de la route jusqu'à sqlite3. Pour chaque étape, donne le fichier et la ligne.
```

::: attendu
L'agent lit les fichiers sans demande de permission. La réponse cite `rooms/routes.py`, `rooms/conflicts.py`, `rooms/pricing.py` et `rooms/repository.py`, avec des numéros de ligne.
:::

### Vérifier une référence

Ouvrir dans l'IDE deux des lignes citées et comparer avec l'explication.

::: attendu
Le code cité correspond à l'explication. Sinon, signaler l'écart à l'agent et lui demander de corriger.
:::

### Expliquer la dépendance

```prompt
D'où vient la connexion reçue par book dans rooms/routes.py, et quand est-elle fermée ?
```

::: attendu
L'agent cite `get_connection` dans `rooms/db.py`, injectée par `Depends`, et la fermeture dans le bloc `finally`, après la réponse.
:::

### Demander la modification

```prompt
Ajoute une colonne duration_minutes, durée en minutes, au CSV de GET /schedule.csv, entre ends_at et amount.
```

Lire le diff de la première demande d'édition, puis la refuser avec la consigne « calcule la durée dans une fonction duration_minutes de export.py ».

::: claude-code
Se placer sur No, `Tab`, saisir la consigne, `Enter`.
:::

::: opencode
Reject, avec la consigne en message.
:::

::: attendu
La nouvelle proposition définit `duration_minutes` dans `rooms/export.py` et l'appelle dans la ligne du CSV.
:::

### Relire et accepter

Accepter chaque édition une fois, après lecture de son diff, puis relire l'ensemble :

```prompt
/diff
```

::: claude-code
Yes à chaque demande.
:::

::: opencode
Allow once à chaque demande.
:::

::: attendu
Le diff ne touche que `rooms/export.py`, et éventuellement un fichier de test.
:::

### Vérifier le résultat

```prompt
Lance uv run pytest -q et montre la sortie.
```

Dans un second terminal, avec l'API démarrée (`uv run uvicorn rooms.main:app --reload`) :

```console
$ curl "http://127.0.0.1:8000/schedule.csv?day=2027-01-11"
```

::: attendu
Les tests passent. L'en-tête du CSV est `room,title,starts_at,ends_at,duration_minutes,amount`, et la ligne « Team sync » porte une durée de 60.
:::

### Commiter

```console
$ git add .
$ git commit -m "Export : durée des réservations dans le CSV du planning"
```

::: attendu
`git log --oneline` montre deux commits.
:::

### Corrigé {.corrige}

`rooms/export.py` définit `duration_minutes(booking)`, qui renvoie `(booking.ends_at - booking.starts_at)` en minutes entières, et ajoute la colonne entre `ends_at` et `amount`, dans l'en-tête comme dans chaque ligne.

Les lectures et l'explication passent sans demande de permission. Chaque édition en déclenche une, avec son diff : en mode Manual sous Claude Code, par la règle `edit` à `ask` du `opencode.json` sous Open Code.

Le refus avec consigne réoriente l'agent sans relancer la session.

## Glossaire {kicker="Glossaire"}

- **Outil de lecture** : `Read`, ou `grep` et `find` par Bash
- **Lecture par plage** : lecture de quelques lignes d'un fichier
- **Sous-agent** : agent lancé par la session, dans son propre contexte
- **Explore** : sous-agent intégré, en lecture seule

|||

- **Mention @** : fichier inclus dans le prompt
- **`Edit`** : remplacement d'une chaîne exacte dans un fichier
- **Diff** : différence entre deux états d'un fichier
- **Périmètre d'une demande** : fichiers et question qu'elle délimite

::: sources
- [Claude Code, Tools reference](https://code.claude.com/docs/en/tools-reference), [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code, Common workflows](https://code.claude.com/docs/en/common-workflows), [Best practices](https://code.claude.com/docs/en/best-practices)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::
