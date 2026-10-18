# Prompting efficace, CLAUDE.md, mémoire et contexte projet

Ce que l'agent sait au début de chaque session

::: notes
Module 5, 3h30 : environ 1h40 de slides et de démonstrations, pause de 15 min après l'idée clé « CLAUDE.md consigne ce que le code ne dit pas », puis 1h30 de TP.
Notions déjà vues, à ne pas redéfinir : context rot et compaction (module 1), `/clear`, `claude -c` et `/init` (module 2), les quatre stratégies de la demande exploitable et `@` (module 3), la spécification exploitable et la relecture par sous-agent (module 4).
Quatre parties : la demande, CLAUDE.md, la mémoire automatique, le contexte de la session ; puis le partage en équipe.
:::

## Le test du collègue {kicker="Prompting"}

Un prompt se juge comme une consigne laissée à un collègue compétent qui ignore la tâche. S'il serait perdu, le modèle aussi.

```prompt
Ajoute les réservations récurrentes.
```

Le collègue demanderait la fréquence, la date de fin et le sort d'une occurrence en conflit.

::: sources
- [Claude Platform, Prompting best practices : Be clear and direct](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#be-clear-and-direct)
:::

::: notes
« Golden rule: Show your prompt to a colleague with minimal context on the task and ask them to follow it. If they'd be confused, Claude will be too. »
« Think of Claude as a brilliant but new employee who lacks context on your norms and workflows. »
Rappel module 3 : délimiter, désigner les sources, montrer un motif, décrire le symptôme.
Les réservations récurrentes sont la fonctionnalité du TP 5 : la version exploitable du prompt s'y écrit.
La page vise l'API et énumère les modèles Fable et Mythos comme modèles actuels, sans nommer Sonnet 4.6 dans cette phrase.
:::

## Donner la raison {kicker="Prompting"}

Une consigne motivée se généralise aux cas qu'elle ne nomme pas. Sans la raison, puis avec (illustration) :

```prompt
Les montants sont des entiers.
```

```prompt
Les montants sont des centimes entiers : une somme de flottants dérive d'un centime sur certaines factures.
```

::: sources
- [Claude Platform, Prompting best practices : Add context to improve performance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#add-context-to-improve-performance)
:::

::: notes
Exemple de la doc : « NEVER use ellipses » devient « Your response will be read aloud by a text-to-speech engine, so never use ellipses since the text-to-speech engine will not know how to pronounce them. »
« Claude is smart enough to generalize from the explanation. »
La raison renvoie au centime d'écart du module 4. Elle couvre aussi un calcul intermédiaire en flottants, que la consigne seule ne vise pas.
:::

## Le verbe décide de l'action {kicker="Prompting"}

```prompt
Peux-tu suggérer des améliorations pour compute_price ?
```

```prompt
Améliore la lisibilité de compute_price.
```

Le premier prompt obtient parfois des suggestions sans aucune modification. Le second fait modifier le code.

::: sources
- [Claude Platform, Prompting best practices : Tool usage](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#tool-usage)
:::

::: notes
« If you say "can you suggest some changes," Claude will sometimes provide suggestions rather than implementing them, even if making changes might be what you intended. »
Exemples de la doc : « Can you suggest some changes to improve this function? » (« Claude will only suggest »), « Change this function to improve its performance. » (« Claude will make the changes »).
Inversement, pour une simple analyse, le dire : « explique sans rien modifier », ou le mode plan.
:::

## Dire quoi faire {kicker="Prompting"}

Une consigne positive décrit le résultat attendu. Un interdit laisse le modèle deviner par quoi le remplacer.

| Interdit | Consigne positive |
|---|---|
| N'utilise pas de Markdown dans ta réponse. | Rédige ta réponse en paragraphes de prose continue. |

::: sources
- [Claude Platform, Prompting best practices : Control the format of responses](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#control-the-format-of-responses)
:::

::: notes
Doc : « Tell Claude what to do instead of what not to do ». Exemple traduit : « Do not use markdown in your response » ; « Your response should be composed of smoothly flowing prose paragraphs. »
Autres leviers de la même section : balises de format (« Write the prose sections of your response in <smoothly_flowing_prose_paragraphs> tags »), et un prompt écrit dans le style de la sortie voulue : un prompt sans Markdown réduit le Markdown de la réponse.
Transposition : « Ne corrige pas l'arrondi » laisse ouvert ce qu'il faut faire ; « Signale l'anomalie d'arrondi dans un commentaire » le dit (module 4).
:::

## Séparer les parties de la demande {kicker="Prompting"}

```prompt
<context>
GET /schedule.csv exporte le planning d'un jour en CSV (rooms/export.py).
</context>
<instructions>
Ajoute GET /schedule.ics, qui exporte le même planning au format iCalendar.
</instructions>
```

Une balise par partie évite que le modèle confonde consigne et contexte. Les noms sont libres, et restent les mêmes d'un prompt à l'autre.

::: sources
- [Claude Platform, Prompting best practices : Structure prompts with XML tags](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#structure-prompts-with-xml-tags)
:::

::: notes
Illustration, hors trajectoire du fil rouge : aucune route iCalendar n'est prévue.
« XML tags help Claude parse complex prompts unambiguously, especially when your prompt mixes instructions, context, examples, and variable inputs. »
« Use consistent, descriptive tag names across your prompts. » Imbriquer quand le contenu a une hiérarchie : `<documents>`, puis `<document index="n">`.
Noms de balises en anglais, comme dans la doc ; le texte reste en français.
:::

## Montrer des exemples {kicker="Prompting"}

```prompt
Une erreur métier renvoie un 409 dans ce format :
<examples>
<example>{"error": "The end must come after the start"}</example>
<example>{"error": "A booking must fit within a single day"}</example>
</examples>
```

Des exemples fixent le format plus sûrement qu'une description. La documentation en conseille trois à cinq, variés.

::: sources
- [Claude Platform, Prompting best practices : Use examples effectively](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#use-examples-effectively)
:::

::: notes
Messages réels de `rooms/conflicts.py`, levés par `BookingError` et traduits en 409 par `main.py`.
Doc : exemples « Relevant », « Diverse » (cas limites, variété pour éviter un motif involontaire), « Structured » (balises `<example>`, plusieurs dans `<examples>`).
Doc : trois à cinq exemples, « for best results ». Deux ici pour tenir sur la slide.
On peut demander à Claude d'évaluer la diversité des exemples ou d'en générer d'autres.
:::

## Les données longues en tête {kicker="Prompting"}

Le document long d'abord, la question à la fin.

```prompt
<log>
… 400 lignes de uvicorn …
</log>
Pourquoi POST /bookings renvoie-t-il 500 à partir de 10 h 12 ?
```

Jusqu'à 30 % de qualité en plus dans les tests d'Anthropic.

::: sources
- [Claude Platform, Prompting best practices : Long context prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#long-context-prompting)
:::

::: notes
Illustration : le log et l'incident sont inventés.
Seuil de la doc : « large documents or data-rich inputs (20k+ tokens) ».
« Queries at the end can improve response quality by up to 30 percent in tests, especially with complex, multidocument inputs. » La doc ne publie ni le protocole ni l'effectif.
Autres conseils de la section : un `<document>` par fichier avec `<source>` et `<document_content>` ; demander d'abord les citations utiles, puis la réponse.
:::

## Apporter le contenu {.compare kicker="Prompting"}

::: claude-code
```console
$ cat error.log | claude -p "explique cette erreur"
```

En session : `@fichier`, une URL, une image collée.
:::

::: opencode
```console
$ cat error.log | opencode run "explique cette erreur"
```

En session : `@fichier`, une URL (outil `webfetch`), une image collée.
:::

::: sources
- [Claude Code, Best practices : Provide rich content](https://code.claude.com/docs/en/best-practices#provide-rich-content)
- Open Code v2.0.26 : [`run.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/cli/src/run/run.ts), [`clipboard.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/clipboard.ts), [`webfetch.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/tool/plugin/webfetch.ts)
:::

::: notes
Doc Claude Code : « Pipe in data by running `cat error.log | claude -p "explain this error"` », « Paste images directly », « Give URLs for documentation and API references. Use `/permissions` to allowlist frequently used domains. »
Cinquième voie de la doc : laisser Claude chercher lui-même, par Bash, MCP ou lecture de fichiers.
Ordre du message reçu : le prompt d'abord, puis le contenu du pipe, dans les deux outils. Claude Code : constaté le 18 octobre 2026 (v2.1.302, `claude-sonnet-4-6`, modèle invité à recopier son message), la doc ne le précise pas. Open Code : `message + "\n" + piped` dans `run.ts`, constaté par le même essai.
La question arrive donc avant les données, à l'inverse de la slide précédente. Sans effet notable sur un court log ; au-delà de 20 000 tokens, préférer `@fichier` dans un prompt qui pose la question à la fin.
Entrée standard limitée à 10 Mo dans Claude Code ([Headless](https://code.claude.com/docs/en/headless#pipe-data-through-claude)).
Open Code : le presse-papiers est lu en `image/png` puis en texte. Rendu du collage d'image à vérifier sur la VM.
:::

## Ce que la demande ne dit pas, l'agent le devine. {.statement kicker="Idée clé"}

::: notes
Découle des slides précédentes : collègue sans contexte, raison absente, verbe ambigu, interdit sans alternative, données mal placées.
Transition : une partie de ce contexte se répète à chaque session. Elle s'écrit une fois, dans un fichier lu au démarrage.
:::

## Chaque session repart de zéro {.facts kicker="CLAUDE.md"}

- **CLAUDE.md** instructions écrites par le développeur
- **Mémoire automatique** notes que Claude écrit pour lui-même

::: sources
- [Claude Code, Memory](https://code.claude.com/docs/en/memory)
:::

::: notes
« Each Claude Code session begins with a fresh context window. Two mechanisms carry knowledge across sessions ».
Les deux se chargent au début de chaque conversation.
Rappel module 1 : une nouvelle session repart sans l'historique des précédentes.
Open Code : `AGENTS.md`, aucune mémoire automatique (slides suivantes).
:::

## Ce qu'est CLAUDE.md {kicker="CLAUDE.md"}

Un fichier Markdown lu au début de chaque session. Il arrive comme un message utilisateur, après le prompt système : Claude le suit au mieux, sans garantie.

```markdown
# Conventions
- Montants en centimes entiers (int), jamais de float
- SQL toujours paramétré
```

::: sources
- [Claude Code, Memory : CLAUDE.md vs auto memory](https://code.claude.com/docs/en/memory#claude-md-vs-auto-memory)
- [Claude Code, Memory : Claude isn't following my CLAUDE.md](https://code.claude.com/docs/en/memory#claude-isnt-following-my-claude-md)
:::

::: notes
Extrait du `CLAUDE.md` visé au TP 5 (illustration).
« CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions. »
« Claude treats them as context, not enforced configuration. »
Aucun format imposé : titres et listes, plus faciles à suivre qu'un paragraphe dense.
Consigne au niveau du prompt système : `--append-system-prompt`, au lancement, plutôt pour les scripts.
:::

## Ce que /init produit {kicker="CLAUDE.md"}

```markdown
## Commands
uv run uvicorn rooms.main:app --reload       # start dev server
uv run pytest                                # run all tests

## Architecture
1. `routes.py` receives the HTTP request and uses `get_connection` …
2. `repository.py` runs all SQL …
```

`/init` décrit ce que le code montre. Le workflow de l'équipe, la raison des choix et les interdits restent à écrire.

::: sources
- [Claude Code, Memory : Set up a project CLAUDE.md](https://code.claude.com/docs/en/memory#set-up-a-project-claude-md)
:::

::: notes
Extrait réel : `claude -p "/init"` sur une copie du fil rouge, `claude-sonnet-4-6`, Claude Code v2.1.302, 18 octobre 2026. Fichier de 35 lignes ; la sortie varie d'une exécution à l'autre.
Le fichier généré contenait aussi : `ROOMS_DB`, les migrations par `PRAGMA user_version`, les fixtures de test, les règles de tarification, « amount in cents » sans la raison.
Rien sur le workflow (tests avant commit, branches), aucun interdit.
`/init` résume et sélectionne : il a aussi omis des conventions visibles dans le code du fil rouge (dates sans fuseau horaire, requêtes SQL à paramètres `?` plutôt que par concaténation, erreurs au format `{"error": "..."}`). Une convention importante se vérifie dans le fichier généré, même quand le code la montre.
Doc : « Refine from there with instructions Claude wouldn't discover on its own. » Un `CLAUDE.md` existant reçoit des propositions d'amélioration au lieu d'être écrasé.
Le flux de données pas à pas relève de la description fichier par fichier, que la slide « Ce qui y entre, ce qui en sort » classe dans « Exclure ».
Transition : `/init` lit le code, il produit donc ce que le code dit déjà. Le reste s'écrit à la main.
:::

## Ce que le code ne dit pas {.facts kicker="CLAUDE.md"}

- **Le workflow** vérifications avant commit, branches, messages
- **Les décisions** et la raison de chacune
- **Les interdits et les pièges** ce qui casse sans que le code le montre
- **L'environnement** variables requises, services à lancer

::: sources
- [Claude Code, Best practices : Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
- [Claude Code, Memory : My CLAUDE.md is too large](https://code.claude.com/docs/en/memory#my-claude-md-is-too-large)
- [AGENTS.md](https://agents.md/)
:::

::: notes
Liste partielle, regroupée à partir des sources.
Best practices : « Include Bash commands, code style, and workflow rules. This gives Claude persistent context it can't infer from code alone. »
Memory : `/doctor` retire d'un `CLAUDE.md` ce que Claude peut déduire du code (arborescence, dépendances, vue d'architecture) et garde « pitfalls, rationale, and conventions that differ from tool defaults ».
agents.md, sections courantes : « Project overview, Build and test commands, Code style guidelines, Testing instructions, Security considerations », puis « Commit messages or pull request guidelines, security gotchas, large datasets, deployment steps: anything you'd tell a new teammate belongs here too. »
Le code montre l'état actuel. L'intention, l'interdit et l'ordre des opérations n'y figurent nulle part : un agent qui les déduit du code en reproduit aussi les défauts.
Le README s'adresse aux humains, `AGENTS.md` et `CLAUDE.md` à l'agent (agents.md).
:::

## Ce qui y entre, ce qui en sort {kicker="CLAUDE.md"}

Extrait du tableau de la documentation :

| Inclure | Exclure |
|---|---|
| commandes que Claude ne devine pas | ce que la lecture du code révèle |
| règles de style qui s'écartent des défauts | conventions standard du langage |
| décisions d'architecture propres au projet | description fichier par fichier |
| pièges qui ne vont pas de soi | évidences comme « écrire du code propre » |

::: sources
- [Claude Code, Best practices : Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
:::

::: notes
Lignes omises du tableau : « Testing instructions and preferred test runners », « Repository etiquette (branch naming, PR conventions) », « Developer environment quirks (required env vars) » côté inclure ; « Detailed API documentation (link to docs instead) », « Information that changes frequently », « Long explanations or tutorials » côté exclure.
« This gives Claude persistent context it can't infer from code alone. »
Une connaissance utile seulement de temps en temps va dans un skill (module 6).
:::

## Un fichier type {kicker="CLAUDE.md"}

```markdown
# Workflow
- Lancer `uv run pytest` avant chaque commit
- Une branche par ticket : feat/<numéro>-<sujet>

# Décisions
- Montants en centimes entiers (int) : un float perd des centimes

# Interdits
- Jamais de HTTPException hors de rooms/routes.py
- Ne jamais modifier une migration déjà livrée
```

Chaque ligne porte une consigne que la lecture du code ne donne pas.

::: sources
- [Claude Code, Best practices : Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
:::

::: notes
Illustration sur le fil rouge ; la convention de branche est inventée.
La doc donne un exemple de même forme : sections `# Code style` et `# Workflow`, une consigne par ligne.
La raison après les deux-points sert au cas imprévu : Claude l'applique à une situation que la règle ne cite pas (slide « Donner la raison »).
Centimes : rappel du centime d'écart du module 4.
:::

## Compléter après /init {kicker="CLAUDE.md"}

```console
> Ajoute à CLAUDE.md : lancer uv run pytest avant chaque commit
```

Demander l'ajout en session ou éditer le fichier. Avec `CLAUDE_CODE_NEW_INIT=1`, `/init` pose lui-même des questions pour combler les manques.

::: sources
- [Claude Code, Memory : Set up a project CLAUDE.md](https://code.claude.com/docs/en/memory#set-up-a-project-claude-md)
- [Claude Code, Memory : View and edit with /memory](https://code.claude.com/docs/en/memory#view-and-edit-with-memory)
:::

::: notes
Prompt d'illustration.
Doc : « To add instructions to CLAUDE.md instead, ask Claude directly, like "add this to CLAUDE.md," or edit the file yourself ». Sans nommer le fichier, « retiens que… » part dans la mémoire automatique (section Mémoire).
`CLAUDE_CODE_NEW_INIT=1` : « explores your codebase with a subagent, fills in gaps via follow-up questions, and presents a reviewable proposal before writing any files ». Propose aussi skills et hooks (module 6).
Open Code : demander l'ajout à `AGENTS.md` en session, ou éditer le fichier.
:::

## Une ligne, une question {kicker="CLAUDE.md"}

> Retirer cette ligne ferait-il commettre une erreur à Claude ?

Si la réponse est non, la ligne part. Un fichier trop long noie les règles qui comptent. Cible : moins de 200 lignes.

::: sources
- [Claude Code, Best practices : Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
- [Claude Code, Memory : Write effective instructions](https://code.claude.com/docs/en/memory#write-effective-instructions)
:::

::: notes
« For each line, ask: "Would removing this cause Claude to make mistakes?" If not, cut it. Bloated CLAUDE.md files cause Claude to ignore your actual instructions! »
« target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence. »
Avertissement au démarrage et dans `/status` au-delà de la longueur recommandée. Un fichier de plus de 4 Mio est ignoré.
Symptômes de la doc : une règle ignorée signale un fichier trop long ; une question dont la réponse est dans le fichier signale une formulation ambiguë.
:::

## Des consignes vérifiables {kicker="CLAUDE.md"}

| Vague | Vérifiable |
|---|---|
| Format code properly | Use 2-space indentation |
| Test your changes | Run `npm test` before committing |
| Gère bien les montants | Montants en centimes entiers (`int`) |

Une consigne vérifiable se contrôle sur le diff.

::: sources
- [Claude Code, Memory : Write effective instructions](https://code.claude.com/docs/en/memory#write-effective-instructions)
:::

::: notes
Deux premières lignes : exemples de la doc. Troisième : transposée au fil rouge (illustration).
« Write instructions that are concrete enough to verify ». Troisième exemple de la doc : « "API handlers live in `src/api/handlers/`" instead of "Keep files organized" ».
Structure : regrouper sous des titres Markdown et des listes.
:::

## Une consigne ignorée : « IMPORTANT » {kicker="CLAUDE.md"}

```markdown
- IMPORTANT : jamais de HTTPException hors de rooms/routes.py
```

Si Claude ignore régulièrement une consigne, la marquer « IMPORTANT ». Marquer beaucoup de lignes annule l'effet.

::: sources
- [Claude Code, Best practices : Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
:::

::: notes
Illustration sur une convention du fil rouge.
« If Claude keeps skipping one instruction, add emphasis such as "IMPORTANT" to that line alone. If you emphasize many lines, none of them stands out. »
Autre cause d'une consigne ignorée : une contradiction. « if two instructions contradict each other, Claude may pick one arbitrarily. » (Memory, Write effective instructions). Vérifier aussi les `CLAUDE.md` des sous-répertoires et `.claude/rules/`.
Règle utilisateur et règle projet contradictoires : aucune ne l'emporte, Claude peut suivre l'une ou l'autre.
:::

## Quand enrichir le fichier {kicker="CLAUDE.md"}

- Claude refait la même erreur
- une revue relève ce que Claude aurait dû savoir
- la même correction revient d'une session à l'autre
- un nouveau collègue aurait besoin du même contexte

::: sources
- [Claude Code, Memory : When to add to CLAUDE.md](https://code.claude.com/docs/en/memory#when-to-add-to-claude-md)
:::

::: notes
« Treat CLAUDE.md as the place you write down what you'd otherwise re-explain. »
Libellés de la doc : « Claude makes the same mistake a second time », « A code review catches something Claude should have known about this codebase », « You type the same correction or clarification into chat that you typed last session », « A new teammate would need the same context to be productive ».
Une procédure en plusieurs étapes, ou une consigne propre à une partie du code : skill ou règle par chemin.
:::

## Où vivent les fichiers {kicker="Portées"}

| Portée | Fichier | Partagé avec |
|---|---|---|
| Géré | `/etc/claude-code/CLAUDE.md` | toute l'organisation |
| Utilisateur | `~/.claude/CLAUDE.md` | soi, dans tous les projets |
| Projet | `./CLAUDE.md` ou `./.claude/CLAUDE.md` | l'équipe, par git |
| Local | `./CLAUDE.local.md` | soi, dans ce projet |

::: sources
- [Claude Code, Memory : Choose where to put CLAUDE.md files](https://code.claude.com/docs/en/memory#choose-where-to-put-claude-md-files)
:::

::: notes
Chemin géré sous Linux et WSL. macOS : `/Library/Application Support/ClaudeCode/CLAUDE.md` ; Windows : `C:\Program Files\ClaudeCode\CLAUDE.md`. Un fichier géré ne peut pas être exclu.
Variante gérée : clé `claudeMd` dans `managed-settings.json`, sans effet dans les réglages utilisateur, projet ou local.
`CLAUDE.local.md` : à ajouter soi-même au `.gitignore`.
Rappel module 2 : même découpage pour les réglages, de géré à utilisateur.
:::

## L'ordre de chargement {kicker="Portées"}

![Au lancement dans ~/fil-rouge, le CLAUDE.md géré, puis celui de l'utilisateur, puis celui du projet, puis CLAUDE.local.md, lu en dernier ; rooms/CLAUDE.md se charge quand Claude lit ou modifie un fichier de rooms/](images/05-chargement.svg)

::: sources
- [Claude Code, Memory : How CLAUDE.md files load](https://code.claude.com/docs/en/memory#how-claude-md-files-load)
:::

::: notes
Tous les fichiers trouvés sont concaténés : aucun n'en remplace un autre. Du plus large au plus précis, donc l'instruction la plus proche du répertoire de lancement est lue en dernier.
Remontée : le répertoire courant et chacun de ses parents ; un `~/CLAUDE.md` serait lu entre l'utilisateur et le projet.
Dans chaque répertoire, `CLAUDE.local.md` passe après `CLAUDE.md`.
Sous-répertoires : chargés quand Claude lit, écrit ou modifie un fichier du sous-répertoire, y compris par `cat` ou `head` sur un seul fichier.
`rooms/CLAUDE.md` n'existe pas dans le fil rouge (illustration).
Monorepo : `claudeMdExcludes` écarte les fichiers d'autres équipes.
:::

## Importer avec @ {kicker="Portées"}

```markdown
Présentation du projet : @README.md
```

Le fichier importé se charge au lancement, avec le CLAUDE.md qui l'importe. L'import range le contenu sans réduire le contexte consommé.

::: sources
- [Claude Code, Memory : Import additional files](https://code.claude.com/docs/en/memory#import-additional-files)
- [Claude Code, Memory : How CLAUDE.md files load](https://code.claude.com/docs/en/memory#how-claude-md-files-load)
:::

::: notes
Chemin relatif au fichier qui importe, pas au répertoire de travail. Imports récursifs, quatre niveaux au plus.
Entre backticks, `` `@README` `` reste du texte ; les blocs de code ne sont pas analysés.
Import hors du répertoire de travail (par exemple `@~/.claude/mes-consignes.md`) : boîte d'approbation la première fois dans le projet.
Les commentaires HTML de bloc (`<!-- … -->`) sont retirés avant l'injection : notes pour les mainteneurs, sans coût en tokens.
Open Code : aucun import par `@` dans `AGENTS.md` (slide « Open Code : AGENTS.md »).
:::

## Citer sans importer {kicker="Portées"}

```markdown
- Avant toute migration, lire docs/migrations.md
```

Sans `@`, le chemin reste du texte : l'agent ouvre le fichier quand la consigne s'applique. Open Code se comporte de même.

::: sources
- [Claude Code, Best practices : Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
- [Open Code, Rules : Manual Instructions in AGENTS.md](https://opencode.ai/docs/rules/#manual-instructions-in-agentsmd)
:::

::: notes
Illustration : le fil rouge n'a pas de `docs/migrations.md`.
Best practices, colonne « Exclude » : « Detailed API documentation (link to docs instead) ».
Doc Open Code : apprendre à l'agent à lire les fichiers cités « on a need-to-know basis ».
Constaté le 18 octobre 2026, `claude-sonnet-4-6`, Claude Code v2.1.302 et Open Code v2.0.26 : fichier d'instructions citant `docs/base.md` pour les questions sur la base. Question sur `main.py` : seul `main.py` est lu. Question sur la base : lecture de `docs/base.md`, puis réponse.
La consigne dit quand lire : un chemin sans condition ne déclenche aucune lecture fiable.
:::

## Des règles par chemin {kicker="Portées"}

```markdown
---
paths:
  - "tests/**/*.py"
---
- Un test de route passe par la fixture client (TestClient)
```

Une règle de `.claude/rules/` avec `paths` se charge quand Claude lit un fichier qui correspond. Open Code n'a pas d'équivalent.

::: sources
- [Claude Code, Memory : Path-specific rules](https://code.claude.com/docs/en/memory#path-specific-rules)
- Open Code v2.0.26 : [`tool/plugin/read.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/tool/plugin/read.ts)
:::

::: notes
Fichier `.claude/rules/tests.md` (illustration).
Chargement par Read, Write ou Edit sur un fichier correspondant, ou par `cat` ou `head` sur un seul fichier.
Sans `paths`, une règle se charge au lancement, avec la priorité de `.claude/CLAUDE.md`. `paths` est le seul champ lu du frontmatter.
Glob : `**/*.ts`, `src/**/*`, accolades `src/**/*.{ts,tsx}`.
Règles utilisateur dans `~/.claude/rules/`, chargées avant celles du projet.
Open Code v2.0.26 : après une lecture, un `AGENTS.md` du sous-répertoire du fichier lu s'ajoute aux instructions (constaté le 18 octobre 2026) ; aucun filtrage par motif de chemin.
:::

## La divulgation progressive {kicker="Portées"}

![Trois niveaux de chargement : au lancement, le CLAUDE.md racine et ses imports ; à la lecture d'un fichier, rooms/CLAUDE.md et les règles avec paths ; quand la tâche l'exige, un fichier cité sans @ ou un skill](images/05-divulgation.svg)

Le fichier racine garde ce qui sert à chaque session et indique où trouver le reste.

::: sources
- [Claude Code, Memory : My CLAUDE.md is too large](https://code.claude.com/docs/en/memory#my-claude-md-is-too-large)
- [Claude Code, Best practices : Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
- [Anthropic, Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
:::

::: notes
Synthèse des slides précédentes : sous-répertoires, `@`, chemin cité, règles par chemin.
Terme repris d'Anthropic pour les skills : « Progressive disclosure is the core design principle […] skills let Claude load information only as needed ». Le même principe s'applique aux fichiers d'instructions.
Memory : « Use path-scoped rules to load instructions only when Claude works with matching files, or trim content that isn't needed in every session. Splitting into `@path` imports helps organization but doesn't reduce context ».
Best practices : « For domain knowledge or workflows that are only relevant sometimes, use skills instead. Claude loads them on demand without bloating every conversation. »
Gain : moins de tokens à chaque tour, et des consignes du niveau 01 mieux suivies (cible de moins de 200 lignes).
Open Code v2.0.26 : niveau 01 `AGENTS.md`, niveau 02 `AGENTS.md` de sous-répertoire après une lecture, sans règles par chemin ; niveau 03 fichier cité (constaté).
:::

## Vérifier ce qui est chargé {kicker="Portées"}

```console
$ claude -p "/context" --model claude-sonnet-4-6
…
### Memory Files

| Type    | Path                   | Tokens |
|---------|------------------------|--------|
| User    | ~/.claude/CLAUDE.md    | 895    |
| Project | ~/fil-rouge/CLAUDE.md  | 585    |
```

Un fichier absent de cette liste n'a pas été chargé.

::: sources
- [Claude Code, Memory : Claude isn't following my CLAUDE.md](https://code.claude.com/docs/en/memory#claude-isnt-following-my-claude-md)
:::

::: notes
Sortie réelle, condensée et chemins raccourcis : copie du fil rouge après `/init`, Claude Code v2.1.302. En session, `/context` affiche une grille colorée et la même liste.
« If one is missing there, Claude can't see it. »
Un `CLAUDE.md` de sous-répertoire n'apparaît pas ici : il se charge à la demande, avec une ligne `Loaded` dans le terminal.
`/memory` liste aussi les fichiers et permet de les ouvrir.
Open Code : aucune commande équivalente.
:::

## Open Code : AGENTS.md {kicker="Portées"}

| | Claude Code | Open Code v2.0.26 |
|---|---|---|
| fichier lu | `CLAUDE.md`, sinon `AGENTS.md` | `AGENTS.md` seul |
| créé par `/init` | `CLAUDE.md` | `AGENTS.md` |
| import par `@` | oui | non |

Un fichier commun aux deux outils s'appelle donc `AGENTS.md`.

::: sources
- [Claude Code, Memory : AGENTS.md](https://code.claude.com/docs/en/memory#agents-md)
- Open Code v2.0.26 : [`config/plugin/instruction.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/config/plugin/instruction.ts), [`plugin/command.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/plugin/command.ts)
- [Open Code, Rules](https://opencode.ai/docs/rules/)
:::

::: notes
Claude Code lit `AGENTS.md` quand aucun `CLAUDE.md`, `.claude/CLAUDE.md` ni `CLAUDE.local.md` n'existe dans le répertoire de travail ou au-dessus ; v2.1.277 et suivantes. Ligne affichée : `no CLAUDE.md found; AGENTS.md loaded: …`.
Si les deux fichiers existent, Claude Code ne lit que `CLAUDE.md`. Réglage **Project instructions** dans `/config` pour lire les deux.
Open Code v2.0.26 : `AGENTS.md` du répertoire courant jusqu'à la racine du projet, plus `~/.config/opencode/AGENTS.md`.
La doc Open Code (v1) annonce un repli sur `CLAUDE.md` et un champ `instructions` dans `opencode.json`. Le code v2.0.26 ne contient ni l'un ni l'autre : le champ est décodé, puis jamais lu. Constaté le 18 octobre 2026 avec Open Code v2.0.26 et `claude-sonnet-4-6` : un `CLAUDE.md` seul est ignoré, même cité dans `instructions` ; un `AGENTS.md` est lu.
Avec `AGENTS.md`, une consigne propre à Claude Code passe par un `CLAUDE.md` qui commence par `@AGENTS.md` ; Open Code ignore alors ce `CLAUDE.md`.
:::

## CLAUDE.md : règles et workflow absents du code. {.statement kicker="Idée clé"}

::: notes
Découle de la sortie de `/init`, de « Ce que le code ne dit pas », du tableau inclure/exclure et de la question posée à chaque ligne.
Ajouter : une consigne vague ou noyée dans un long fichier ne sera pas suivie ; ce qui ne sert pas à chaque session se charge à la demande (divulgation progressive).
Pause de 15 min.
:::

## La mémoire automatique {kicker="Mémoire"}

Claude prend des notes pour lui-même au fil du travail. Il omet ce que disent le code, l'historique git et les CLAUDE.md.

| Type | Contenu |
|---|---|
| `user` | rôle, expertise, préférences de travail |
| `feedback` | corrections reçues, approches confirmées |
| `project` | travaux en cours, échéances, décisions |
| `reference` | où trouver l'information hors du projet |

::: sources
- [Claude Code, Memory : Auto memory](https://code.claude.com/docs/en/memory#auto-memory)
:::

::: notes
Le type est enregistré dans le champ `type` du frontmatter de chaque note.
« Claude skips anything it can derive from the codebase, such as architecture, file paths, or debugging fixes. It also skips anything your CLAUDE.md files already say. »
Pas de note à chaque session : Claude juge si l'information servira plus tard.
Active par défaut en local. Couper : bascule dans `/memory` (`autoMemoryEnabled` dans `~/.claude/settings.json`), `"autoMemoryEnabled": false` dans les réglages d'un projet, ou `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.
Montrée en démonstration ; hors du TP, faute d'équivalent Open Code.
:::

## Où vit la mémoire {kicker="Mémoire"}

```text
~/.claude/projects/<projet>/memory/
├── MEMORY.md             # index, une ligne par note
├── user_role.md
└── feedback_testing.md
```

Au démarrage, seuls les 200 premières lignes ou 25 Ko de `MEMORY.md` sont lus. Les notes restent sur la machine.

::: sources
- [Claude Code, Memory : Storage location](https://code.claude.com/docs/en/memory#storage-location)
- [Claude Code, Memory : How it works](https://code.claude.com/docs/en/memory#how-it-works)
:::

::: notes
`<projet>` dérive du dépôt git : worktrees et sous-répertoires partagent une seule mémoire.
Les fichiers de sujet (`user_role.md`…) ne se chargent pas au démarrage : Claude les lit à la demande.
Au-delà de la limite, l'écriture réussit, mais Claude Code demande à Claude de réécrire l'index, car la suite serait perdue au prochain chargement.
Aucun partage entre machines ni avec les environnements cloud. Les notes échappent au nettoyage des transcriptions (`cleanupPeriodDays`).
Messages dans l'interface : « Saved 2 memories », « Recalled 2 memories ».
Emplacement modifiable : `autoMemoryDirectory`.
:::

## Consulter et corriger {kicker="Mémoire"}

```prompt
/memory
```

```prompt
Retiens que je lance toujours les tests avec uv run pytest -q.
```

« Retiens… » écrit dans la mémoire automatique. « Ajoute à CLAUDE.md… » écrit dans le fichier du projet.

::: sources
- [Claude Code, Memory : View and edit with /memory](https://code.claude.com/docs/en/memory#view-and-edit-with-memory)
:::

::: notes
`/memory` liste les CLAUDE.md, CLAUDE.local.md et emplacements de mémoire, bascule la mémoire automatique et ouvre son dossier. Un fichier choisi s'ouvre dans l'éditeur ; s'il n'existe pas, il est créé.
Exemples de la doc : « always use pnpm, not npm », « remember that the API tests require a local Redis instance » ; pour le fichier : « add this to CLAUDE.md ».
Formulation française : comportement à confirmer en démonstration (#25).
Les notes sont du Markdown : les lire, les corriger ou les supprimer à la main.
:::

## CLAUDE.md ou mémoire {kicker="Mémoire"}

| | CLAUDE.md | Mémoire automatique |
|---|---|---|
| Qui écrit | le développeur | Claude |
| Contenu | instructions et règles | apprentissages et préférences |
| Portée | projet, utilisateur ou organisation | un dépôt, sur une machine |
| Partage | git | aucun |

Open Code n'a pas de mémoire automatique.

::: sources
- [Claude Code, Memory : CLAUDE.md vs auto memory](https://code.claude.com/docs/en/memory#claude-md-vs-auto-memory)
- [Claude Code, Memory : Storage location](https://code.claude.com/docs/en/memory#storage-location)
- [Open Code, Config](https://opencode.ai/docs/config/)
:::

::: notes
Doc : « Use CLAUDE.md files when you want to guide Claude's behavior. Auto memory lets Claude learn from your corrections without manual effort. »
Ce qui doit valoir pour toute l'équipe passe par CLAUDE.md : la mémoire reste personnelle.
Open Code : aucune option de mémoire dans la configuration documentée, aucune trace d'un index de mémoire dans le code v2.0.26.
Les sous-agents peuvent avoir leur propre mémoire (champ `memory`) : module 6.
:::

## Le contexte se remplit {kicker="Contexte"}

Chaque message, fichier lu et sortie de commande reste dans le contexte. À mesure qu'il se remplit, Claude peut « oublier » des consignes anciennes et commettre plus d'erreurs.

::: sources
- [Claude Code, Best practices](https://code.claude.com/docs/en/best-practices)
:::

::: notes
« Claude's context window fills up fast, and performance degrades as it fills. »
« A single debugging session or codebase exploration might generate and consume tens of thousands of tokens. »
« When the context window is getting full, Claude may start "forgetting" earlier instructions or making more mistakes. The context window is the most important resource to manage. »
Rappel module 1 : context rot. Les deux slides suivantes en montrent la mesure.
:::

## Plus de texte, moins de précision {kicker="Contexte"}

![Exactitude de Claude 3.5 Sonnet selon la longueur du texte autour de l'information cherchée : 85 % à 1 000 tokens, 84 % à 2 000, 78 % à 4 000, 62 % à 8 000, 46 % à 16 000, 30 % à 32 000](images/05-longueur.svg)

Claude 3.5 Sonnet (2024), même question à chaque longueur : seul le texte autour s'allonge.

::: sources
- [Modarressi et al., NoLiMa : Long-Context Evaluation Beyond Literal Matching, ICML 2025](https://arxiv.org/abs/2502.05167)
- [Hong, Troynikov, Huber, Context Rot, Chroma, 2025](https://research.trychroma.com/context-rot)
:::

::: notes
NoLiMa, tableau 3 : 13 modèles annoncés à 128K tokens ou plus. Une information (l'« aiguille ») est cachée dans un long texte sans rapport ; la question ne reprend aucun mot de l'aiguille, le modèle doit faire le lien. Score de référence de Claude 3.5 Sonnet en contexte court : 87,5 %. Longueur effective (score au-dessus de 85 % de la référence) : 4K, pour 200K annoncés.
« At 32K, for instance, 11 models drop below 50% of their strong short-length baselines. » GPT-4o passe de 99,3 % à 69,7 %.
Chroma (juillet 2025) : 18 modèles, dont Claude Sonnet 4 et Opus 4, tâches volontairement simples. Test LongMemEval : même question avec seulement les passages utiles (~300 tokens) ou avec tout l'historique de conversation (~113 000 tokens). Tous les modèles réussissent mieux la version courte. Chez Claude, l'écart vient surtout de réponses du type « impossible à déterminer ».
Pourquoi : chaque token est mis en relation avec tous les autres, soit n² relations pour n tokens ; l'attention se dilue quand n grandit (Anthropic, Effective context engineering for AI agents). « While some models exhibit more gentle degradation than others, this characteristic emerges across all models. »
Modèle de 2024 : la slide « Sonnet 4.6 : le même effet, plus loin » donne l'échelle actuelle.
:::

## Lost in the middle {kicker="Contexte"}

![Exactitude selon la position du document qui contient la réponse parmi 20 : 76 % en 1re position, 57 % en 5e, 54 % en 10e, 55 % en 15e, 63 % en 20e ; 56 % sans aucun document](images/05-milieu.svg)

GPT-3.5 Turbo (2023) trouve moins bien une réponse placée au milieu du contexte.

::: sources
- [Liu et al., Lost in the Middle : How Language Models Use Long Contexts, TACL 2024](https://arxiv.org/abs/2307.03172)
:::

::: notes
Expérience : question de NaturalQuestions, 20 documents (~4 000 tokens) dont un seul contient la réponse ; on déplace ce document. Tableau 6, GPT-3.5 Turbo : 75,8 / 57,2 / 53,8 / 55,4 / 63,2 %. Sans document : 56,1 % ; avec le seul bon document : 88,3 %.
Au milieu, le modèle fait moins bien que sans aucun document : les 19 autres le gênent.
Courbe en U : début (biais de primauté) et fin (biais de récence) mieux exploités. Même forme à 10 et 30 documents, et pour les modèles à contexte étendu.
Claude 1.3, même test : 59,9 / 55,9 / 56,8 / 57,2 / 60,1 %, U plus plat.
Modèles de 2023. Retenir la forme, pas les chiffres. Aucune mesure publiée de la position pour Sonnet 4.6 trouvée (recherche du 18 octobre 2026).
Lien avec « Les données longues en tête » : documents en haut, question à la fin. Dans une longue session, le milieu, ce sont les anciennes sorties d'outils et les échanges passés.
:::

## Sonnet 4.6 : le même effet, plus loin {kicker="Contexte"}

![Score MRCR v2 à 8 aiguilles : de 128 000 à 256 000 tokens, Sonnet 4.5 obtient 11 % et Sonnet 4.6 91 % ; de 512 000 à 1 million de tokens, Sonnet 4.5 obtient 19 % et Sonnet 4.6 65 %](images/05-sonnet46.svg)

Sonnet 4.6 garde 91 % jusqu'à 256 000 tokens, puis baisse. L'effet demeure, à une autre échelle.

::: sources
- [Anthropic, Claude Sonnet 4.6 System Card, 2.16 Long context, février 2026](https://anthropic.com/claude-sonnet-4-6-system-card)
- [Claude Code, Best practices](https://code.claude.com/docs/en/best-practices)
:::

::: notes
MRCR v2 (OpenAI) : retrouver la 2e ou la 4e occurrence d'une demande parmi des demandes identiques dans une longue conversation ; variante à 8 aiguilles, « the hardest setting ». Tableau 2.16.A, réflexion étendue à 64k : Sonnet 4.6 90,6 % (tranche 128K à 256K) et 65,1 % (512K à 1M) ; Sonnet 4.5 10,8 % et 18,5 %. Opus 4.6 : 91,9 % et 78,3 %.
Tranche 1M : une partie des problèmes dépasse la limite de l'API ; sur le sous-ensemble sous 1M tokens, Sonnet 4.6 obtient 71,3 %.
Aucune tranche sous 128K publiée : on ne sait pas où commence la baisse.
Claude Code avec `claude-sonnet-4-6` : fenêtre de 200K, compaction avant la limite. Une session reste dans la première tranche.
La doc Claude Code de 2026 décrit toujours la dégradation : « performance degrades as it fills » (slide « Le contexte se remplit »). Un benchmark ne mesure pas une session de code : `/clear` et sessions courtes restent la règle.
Comparaison avec les slides précédentes : la baisse commençait vers 4K à 8K tokens pour Claude 3.5 Sonnet (2024), elle apparaît ici au-delà de 256K.
:::

## Ce qu'occupe une session {kicker="Contexte"}

```console
$ claude -p "/context" --model claude-sonnet-4-6
Tokens: 21.1k / 200k (11%)
| System prompt      | 6.6k   |
| System tools       | 9.7k   |
| Memory files       | 1.5k   |
| Skills             | 2.2k   |
| Messages           | 8      |
| Free space         | 145.9k |
| Autocompact buffer | 33k    |
```

Avant le premier message, 21 000 tokens sont déjà pris. Open Code n'a pas de commande équivalente.

::: sources
- [Claude Code, Context window : Check your own session](https://code.claude.com/docs/en/context-window#check-your-own-session)
:::

::: notes
Sortie réelle, condensée : copie du fil rouge après `/init`, Claude Code v2.1.302. Lignes omises : outils MCP et outils différés, propres au poste du relevé.
`/context` en session : grille colorée par catégorie, suggestions d'optimisation, liste des CLAUDE.md et fichiers de mémoire chargés. `/context all` détaille chaque élément.
« Autocompact buffer » : marge réservée à la compaction automatique.
Le nombre de skills et de serveurs MCP installés pèse sur ce total.
:::

## Deux dérives {kicker="Contexte"}

| Dérive | Remède |
|---|---|
| une session mêle des tâches sans lien | `/clear` entre deux tâches |
| deux corrections ratées sur le même point | `/clear`, puis un meilleur prompt |

::: sources
- [Claude Code, Best practices : Avoid common failure patterns](https://code.claude.com/docs/en/best-practices#avoid-common-failure-patterns)
- [Claude Code, Best practices : Course-correct early and often](https://code.claude.com/docs/en/best-practices#course-correct-early-and-often)
:::

::: notes
Noms dans la doc : « The kitchen sink session », « Correcting over and over ».
« If you've corrected Claude more than twice on the same issue in one session, the context is cluttered with failed approaches. Run `/clear` and start fresh with a more specific prompt that incorporates what you learned. A clean session with a better prompt almost always outperforms a long session with accumulated corrections. »
Le meilleur prompt reprend ce que les échecs ont appris : c'est la partie prompting du module.
Rappel module 2 : `claude -c` reprend la dernière session, `/clear` la ferme et en ouvre une vide.
:::

## La compaction {kicker="Contexte"}

À l'approche de la limite, Claude Code remplace la conversation par un résumé structuré. Avec `claude-sonnet-4-6`, sans la variante `[1m]`, la limite est de 200 000 tokens.

::: sources
- [Claude Code, Model configuration : Default auto-compact thresholds](https://code.claude.com/docs/en/model-config#default-auto-compact-thresholds)
- [Claude Code, Context window : What the timeline shows](https://code.claude.com/docs/en/context-window#what-the-timeline-shows)
:::

::: notes
« Sonnet 4.6 and Opus 4.6 without extended context compact at the 200K boundary ».
`/compact` « replaces the conversation with a structured summary ». La passe automatique fonctionne de la même façon.
Variante `claude-sonnet-4-6[1m]` : fenêtre d'un million de tokens ; accès complet sur l'API, crédits d'usage sur tous les abonnements. Hors du support : modèle unique sans `[1m]`.
`/autocompact` suivi d'un nombre de tokens règle le seuil de déclenchement (v2.1.221 et suivantes). `DISABLE_AUTO_COMPACT=1` coupe la passe automatique.
Le résumé hérite du réglage de raisonnement de la session (v2.1.198).
:::

## Ce qui survit à la compaction {kicker="Contexte"}

| Contenu | Après compaction |
|---|---|
| CLAUDE.md racine, règles sans `paths` | relus sur le disque |
| mémoire automatique | relue sur le disque |
| fichiers lus ou modifiés | cinq relus, les plus récents |
| consignes données dans la conversation | résumées avec le reste |

::: sources
- [Claude Code, Context window : What survives compaction](https://code.claude.com/docs/en/context-window#what-survives-compaction)
- [Claude Code, Memory : Instructions seem lost after /compact](https://code.claude.com/docs/en/memory#instructions-seem-lost-after-compact)
:::

::: notes
Lignes omises : prompt système et style de sortie (toujours appliqués), état git relu, plan du mode plan relu, skills invoqués réinjectés (5 000 tokens par skill, 25 000 au total), commandes et sous-agents en arrière-plan qui continuent.
Règles avec `paths` et `CLAUDE.md` de sous-répertoires : rechargés à la demande, donc absents jusqu'au prochain fichier correspondant.
Fichier relu de plus de 5 000 tokens : seul son chemin revient (`Referenced file`).
« If an instruction disappeared after compaction, it was given only in conversation ».
:::

## Orienter le résumé {kicker="Contexte"}

```prompt
/compact Garde la liste des fichiers modifiés et les commandes de test.
```

La même consigne, écrite dans CLAUDE.md, vaut pour chaque compaction. `/rewind`, puis Summarize from here, ne résume que la fin de la conversation.

::: sources
- [Claude Code, Best practices : Manage context aggressively](https://code.claude.com/docs/en/best-practices#manage-context-aggressively)
:::

::: notes
Exemples de la doc : « `/compact Focus on the API changes` » ; dans CLAUDE.md : « "When compacting, always preserve the full list of modified files and any test commands" ».
Summarize from here condense à partir du message choisi et garde le début intact ; Summarize up to here condense le début et garde les derniers messages en entier.
Compacter avec une consigne avant une longue tâche : « The summary keeps what you choose instead of what the automatic pass guesses is important. »
:::

## Garder le contexte propre {kicker="Contexte"}

```prompt
Avec un sous-agent, trouve comment les conflits de créneaux sont détectés.
```

```prompt
/btw quelle variable désigne la base de données ?
```

Le sous-agent lit dans son propre contexte et ne renvoie qu'un résumé. La réponse de `/btw` n'entre pas dans l'historique.

::: sources
- [Claude Code, Best practices : Use subagents for investigation](https://code.claude.com/docs/en/best-practices#use-subagents-for-investigation)
- [Claude Code, Interactive mode : Side questions with /btw](https://code.claude.com/docs/en/interactive-mode#side-questions-with-btw)
:::

::: notes
Rappel module 3 : sous-agent Explore, borner l'exploration.
`/btw` répond à partir de ce qui est déjà dans la conversation, sans outil : il ne lit aucun fichier. Utilisable pendant que Claude travaille. Réponse dans un encart qui se ferme par `Esc`.
« Use `/btw` to ask about what Claude already knows from this session; use a subagent to go find out something new. »
Réponse attendue ici : `ROOMS_DB`, si un fichier qui la mentionne a déjà été lu dans la session.
:::

## Repartir d'une session neuve {kicker="Contexte"}

L'état d'un travail long vit dans les fichiers et dans git. Une session neuve le retrouve si le prompt dit où chercher.

```prompt
Lis SPEC.md et git log --oneline, lance uv run pytest -q, puis reprends la première tâche non faite.
```

::: sources
- [Claude Platform, Prompting best practices : Workflows across multiple context windows](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#workflows-across-multiple-context-windows)
:::

::: notes
Illustration : aucun `SPEC.md` dans le fil rouge.
« When a context window is cleared, consider starting with a brand new context window rather than using compaction. Claude's latest models are extremely effective at discovering state from the local filesystem. »
Exemples de la doc : « Review progress.txt, tests.json, and the git logs. », « Manually run through a fundamental integration test before moving on to implementing new features. »
« Use git for state tracking ». Rappel module 4 : la spécification écrite dans un fichier, exécutée dans une session neuve.
:::

## Open Code : session et compaction {.compare kicker="Contexte"}

::: claude-code
`/clear` (alias `/new`) ouvre une conversation vide.

`/compact [instructions]`, `/context`, `/btw`.
:::

::: opencode
`/new` ouvre une session vide.

`/compact` sans instructions, aucune commande `/context`, `/btw`. Compaction automatique : `compaction.auto` dans `opencode.json`.
:::

::: sources
- [Claude Code, Commands](https://code.claude.com/docs/en/commands)
- Open Code v2.0.26 : [`app.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/app.tsx), [`routes/session/index.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/routes/session/index.tsx), [`btw.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/feature-plugins/prompt/btw.tsx), [`config/compaction.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/schema/src/config/compaction.ts)
- [Open Code, Config : Compaction](https://opencode.ai/docs/config/#compaction)
:::

::: notes
Open Code v2.0.26 : `/compact` appelle la compaction avec le modèle et la variante courants, sans texte. L'alias `/summarize` de la doc v1 n'apparaît pas dans le code de la TUI.
Le résumé d'Open Code laisse de côté `AGENTS.md` et les conventions : la session suivante les reçoit à jour, séparément (`session/compaction.ts`).
`/clear` existe aussi dans Open Code v2.0.26 : il ferme les onglets de session et revient à l'accueil.
`/btw` d'Open Code : réponse unique à partir du contexte de la session, sans outil, hors historique (« without adding to the conversation »).
Schéma v2 de `compaction` : `auto`, `keep.tokens`, `buffer`. Variable `OPENCODE_DISABLE_AUTOCOMPACT` dans la doc CLI.
:::

## Une grande fonctionnalité : la spécification d'abord {kicker="Spécification"}

```prompt
Je veux ajouter une liste d'attente aux salles complètes. Interroge-moi en détail avec l'outil AskUserQuestion sur les cas limites et les compromis, puis écris la spécification complète dans SPEC.md.
```

L'agent pose les questions, le développeur tranche. Une session neuve implémente ensuite `SPEC.md`.

::: sources
- [Claude Code, Best practices : Let Claude interview you](https://code.claude.com/docs/en/best-practices#let-claude-interview-you)
:::

::: notes
Illustration : aucune liste d'attente dans le fil rouge.
« For larger features, have Claude interview you first. » Prompt de la doc : « Don't ask obvious questions, dig into the hard parts I might not have considered. Keep interviewing until we've covered everything, then write a complete spec to SPEC.md. »
« Once the spec is complete, start a fresh session to execute it. The new session has clean context focused entirely on implementation ». Lien avec la slide « Repartir d'une session neuve ».
Rappel module 4 : une spécification nomme fichiers et interfaces, dit ce qui sort du périmètre, finit par une vérification de bout en bout. « Time spent making the spec precise pays off more than time spent watching the implementation. »
Open Code : demander l'entretien sans nommer `AskUserQuestion`, outil propre à Claude Code.
:::

## Le Spec Driven Development {kicker="Spécification"}

![Spec Kit : constitution une fois par projet, puis specify, plan, tasks, implement et converge à chaque fonctionnalité, implement et converge répétés jusqu'à Converged](images/05-sdd.svg)

La spécification dit quoi et pourquoi, le plan dit comment. Chaque étape écrit un fichier, relu avant la suivante.

::: sources
- [GitHub, Spec Kit : Spec-Driven Development](https://github.com/github/spec-kit#spec-driven-development)
- [GitHub, Spec Kit : spec-driven.md](https://github.com/github/spec-kit/blob/main/spec-driven.md)
:::

::: notes
Sujet traité en détail dans une formation dédiée : ici, le principe et l'outil seulement.
README : « Define what and why before deciding how to build it. SDD turns your requirements into a specification, a technical plan, and actionable tasks, then guides implementation against those artifacts. » « Constitution once per project; specify → plan → tasks → implement → converge per feature. » « Repeat implement → converge until convergence reports Converged. »
spec-driven.md : « treating specifications as the source of truth, with code as the generated output ». Fichiers d'une fonctionnalité dans `specs/<numéro>-<nom>/` : `spec.md`, `plan.md`, `tasks.md`.
La constitution joue un rôle voisin de CLAUDE.md : principes valables pour toutes les fonctionnalités.
Options : clarification, checklists, analyse de cohérence entre les fichiers.
:::

## Spec Kit dans les deux outils {kicker="Spécification"}

```console
$ uv tool install specify-cli
$ specify init --here --force --integration claude
```

La clé `claude` installe des skills dans `.claude/skills`, appelés par `/speckit-specify`. La clé `opencode` installe des commandes dans `.opencode/commands`.

::: sources
- [GitHub, Spec Kit : Get started](https://github.com/github/spec-kit#get-started)
- [Spec Kit, Integrations](https://github.github.io/spec-kit/reference/integrations.html)
- [Spec Kit, Existing projects](https://github.github.io/spec-kit/guides/existing-projects.html)
:::

::: notes
Spec Kit v1.2.1 (16 octobre 2026). Prérequis : Python 3.11 ou plus et uv, déjà présents depuis le TP 2.
`--here` : répertoire courant. `--force` : autorisé dans un répertoire non vide, peut remplacer des fichiers aux chemins gérés. La doc demande de commiter ou remiser le travail et de créer une branche avant.
Les étapes s'appellent dans le chat de l'agent, pas dans le terminal. Notation selon l'agent : `/speckit-specify` en mode skills, `/speckit.specify` en notation pointée des références.
Non testé sur le fil rouge.
:::

## Ce qui doit survivre à la session s'écrit dans un fichier. {.statement kicker="Idée clé"}

::: notes
Découle de ce qui survit à la compaction, de l'orientation du résumé, de la reprise dans une session neuve et de la spécification écrite avant l'implémentation.
Ajouter : une consigne donnée dans la conversation disparaît au `/clear` et se résume à la compaction.
:::

## Un fichier versionné {kicker="Équipe"}

```console
$ git add CLAUDE.md
$ echo "CLAUDE.local.md" >> .gitignore
```

CLAUDE.md se commite et se relit en revue, comme du code. Les préférences personnelles vont dans `CLAUDE.local.md`, hors de git.

::: sources
- [Claude Code, Best practices : Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
- [Claude Code, Memory : Choose where to put CLAUDE.md files](https://code.claude.com/docs/en/memory#choose-where-to-put-claude-md-files)
:::

::: notes
« Check CLAUDE.md into git so your team can contribute. The file compounds in value over time. »
« Treat CLAUDE.md like code: review it when things go wrong, prune it regularly ».
Exemples de contenu local dans la doc : URL de bac à sable, données de test préférées.
Worktrees : un `CLAUDE.local.md` ignoré n'existe que dans son worktree ; importer plutôt un fichier du home.
Équipe mixte : `AGENTS.md` commité à la place de `CLAUDE.md`.
:::

## Entretenir le fichier {kicker="Équipe"}

```prompt
/doctor prompt-audit
```

L'audit signale les consignes obsolètes, les références mortes et les contradictions, puis propose des corrections. Après chaque élagage, observer si le comportement change.

::: sources
- [Claude Code, Memory : Audit your instruction files](https://code.claude.com/docs/en/memory#audit-your-instruction-files)
- [Claude Code, Best practices : Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
:::

::: notes
`/doctor prompt-audit` : v2.1.283 et suivantes. Couvre CLAUDE.md, CLAUDE.local.md, AGENTS.md, et règles, skills, commandes, sous-agents de `.claude/` et `~/.claude/`. Un chemin en argument limite l'audit. Rien ne change sans demande explicite.
`/doctor` seul propose des coupes dans un CLAUDE.md commité : ce que Claude peut déduire du code (arborescence, dépendances, vue d'architecture).
« test changes by observing whether Claude's behavior actually shifts ».
Doc : « If Claude already does something correctly without the instruction, delete it or convert it to a hook. »
Open Code : aucun audit équivalent ; `/init` sur un `AGENTS.md` existant l'améliore en place.
:::

## Ce que CLAUDE.md ne garantit pas {kicker="Équipe"}

| Besoin | Mécanisme |
|---|---|
| bloquer une action à coup sûr | règle `deny` ou hook `PreToolUse` |
| agir à chaque édition | hook `PostToolUse` |
| procédure en plusieurs étapes | skill |

Hooks et skills : module 6.

::: sources
- [Claude Code, Memory : CLAUDE.md vs auto memory](https://code.claude.com/docs/en/memory#claude-md-vs-auto-memory)
- [Claude Code, Best practices : Set up hooks](https://code.claude.com/docs/en/best-practices#set-up-hooks)
- [Claude Code, Memory : When to add to CLAUDE.md](https://code.claude.com/docs/en/memory#when-to-add-to-claude-md)
:::

::: notes
« To block an action regardless of what Claude decides, use a PreToolUse hook instead. »
« Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens. »
« If an entry is a multi-step procedure or only matters for one part of the codebase, move it to a skill or a path-scoped rule instead. »
Rappel module 2 : les règles de permission sont appliquées par Claude Code, quel que soit le modèle.
Open Code : permissions de `opencode.json`, plugins pour les hooks (module 6).
:::

## TP 5 : contexte projet {.tp duration="1h30"}

Écrire le fichier de contexte du fil rouge, puis implémenter les réservations récurrentes à partir d'une demande structurée et vérifier que le code respecte ses conventions. Le TP se termine par deux commits.

Prérequis : TP 4 terminé et commité.

::: notes
Étapes de l'énoncé : #24.
Sous Claude Code, `/init` crée `CLAUDE.md` ; sous Open Code, `AGENTS.md`. Chaque outil garde son fichier, sans renommage.
La mémoire automatique reste hors du TP : aucun équivalent Open Code.
:::

### Générer le fichier de contexte

::: claude-code
```console
$ cd ~/fil-rouge
$ claude --permission-mode default --model claude-sonnet-4-6
```

```prompt
/init
```
:::

::: opencode
```console
$ cd ~/fil-rouge
$ opencode
```

```prompt
/init
```
:::

::: attendu
Un `CLAUDE.md` (Claude Code) ou un `AGENTS.md` (Open Code) à la racine du projet. Il donne les commandes `uv run` et décrit l'architecture, sans les conventions des dates, du SQL et des erreurs.
:::

## Glossaire {kicker="Glossaire"}

- **Balise XML** : délimite une partie du prompt
- **CLAUDE.md** : instructions lues au lancement
- **AGENTS.md** : instructions d'Open Code
- **Portée** : géré, utilisateur, projet ou local
- **Import** : `@chemin`, chargé au lancement
- **Lost in the middle** : milieu moins bien lu

|||

- **Règle par chemin** : liée à des fichiers
- **Divulgation progressive** : chargement à la demande
- **Mémoire automatique** : notes de Claude
- **Compaction** : conversation résumée
- **`/context`** : occupation du contexte
- **Spec Driven Development** : spécification avant le code

::: sources
- [Claude Code, Memory](https://code.claude.com/docs/en/memory), [Context window](https://code.claude.com/docs/en/context-window)
- [Claude Platform, Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Liu et al., Lost in the Middle](https://arxiv.org/abs/2307.03172)
- [GitHub, Spec Kit](https://github.com/github/spec-kit)
- Open Code v2.0.26 : [`config/plugin/instruction.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/config/plugin/instruction.ts)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::
