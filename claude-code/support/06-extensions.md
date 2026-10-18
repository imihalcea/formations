# Étendre Claude Code : skills, slash commands et hooks

Enregistrer une fois ce qu'on demande souvent

::: notes
Module 6, 3h30 : environ 1h55 de slides et de démonstrations, pause de 15 min après l'idée clé sur les skills, puis 1h20 de TP.
Notions déjà vues, à ne pas redéfinir : règles de permission et portées des réglages (module 2), sous-agent Explore (module 3), hook `Stop` annoncé et `/code-review` (module 4), compaction, divulgation progressive et « Ce que CLAUDE.md ne garantit pas » (module 5).
Cinq parties : les quatre notions, les slash commands, les skills, les hooks, le partage en équipe.
Au TP, les stagiaires observent des extensions fournies, sans en écrire.
:::

## Quatre façons d'étendre l'outil {.facts kicker="Extensions"}

- **Slash command** prompt enregistré, lancé par `/nom`
- **Skill** instructions que l'agent charge quand la tâche s'y prête
- **Hook** commande que l'outil lance seul à un moment précis
- **Plugin** paquet qui regroupe les trois pour les partager

::: sources
- [Claude Code, Extend Claude Code : Match features to your goal](https://code.claude.com/docs/en/features-overview#match-features-to-your-goal)
- [Claude Code, Skills](https://code.claude.com/docs/en/skills)
- [Claude Code, Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code, Plugins](https://code.claude.com/docs/en/plugins/overview)
:::

::: notes
Doc, tableau : « Skill | Instructions, knowledge, and workflows Claude can use » ; « Hook | Script, HTTP request, MCP tool call, prompt, or subagent triggered by events | Automation that must run on every matching event ».
« Plugins are the packaging layer. A plugin bundles skills, hooks, subagents, and MCP servers into a single installable unit. »
Dans Claude Code, une slash command personnalisée s'écrit comme un skill (slide « Une slash command est un fichier Markdown »).
Le même tableau cite les sous-agents (module 3) et MCP, qui connecte l'agent à un service externe (« External data or actions ») : MCP reste hors du module.
:::

## Les extensions sont des fichiers du dépôt {kicker="Extensions"}

```text
.claude/
├── settings.json                  déclare les hooks
├── hooks/
│   ├── protect.sh                 avant chaque édition
│   └── check.sh                   après chaque édition
└── skills/
    ├── new-route/SKILL.md         slash command /new-route
    └── schema-migration/
        ├── SKILL.md               skill de migration
        └── reference.md
```

Extensions du fil rouge, examinées dans ce module.

::: sources
- [Claude Code, Explore the .claude directory : File reference](https://code.claude.com/docs/en/claude-directory#file-reference)
- Fil rouge : `tp/tp06/extensions/`
:::

::: notes
Ce sont les extensions copiées dans `~/fil-rouge` au début du TP 6.
La doc marque comme versionnés : `settings.json`, `skills/<name>/SKILL.md`, `commands/*.md`, `agents/*.md`, `rules/*.md`.
Équivalents Open Code dans le même dossier `extensions/` : `.opencode/commands/new-route.md`, `.opencode/plugins/run-tests.js`, `opencode.json`.
:::

## Choisir selon le besoin {kicker="Extensions"}

| Besoin | Extension |
|---|---|
| le même prompt revient pour lancer une tâche | slash command |
| une procédure resservira, mais pas à chaque session | skill |
| une action doit avoir lieu à chaque fois, sans le demander | hook |
| un second dépôt veut les mêmes extensions | plugin |

::: sources
- [Claude Code, Extend Claude Code : Build your setup over time](https://code.claude.com/docs/en/features-overview#build-your-setup-over-time)
:::

::: notes
Déclencheurs de la doc : « You keep typing the same prompt to start a task | Save it as a user-invocable skill » ; « You paste the same playbook or multi-step procedure into chat for the third time | Capture it as a skill » ; « You want something to happen every time without asking | Write a hook » ; « A second repository needs the same setup | Package it as a plugin ».
Premier déclencheur de la liste : « Claude gets a convention or command wrong twice | Add it to CLAUDE.md » (module 5).
Lignes omises : output style, MCP, code intelligence, sous-agent.
:::

## Ce que chaque extension ajoute au contexte {kicker="Extensions"}

| Extension | Au démarrage | À l'usage |
|---|---|---|
| CLAUDE.md | tout le fichier | |
| skill | sa description | son contenu |
| hook | rien | le texte qu'il renvoie |

Un hook s'exécute hors du modèle.

::: sources
- [Claude Code, Extend Claude Code : Context cost by feature](https://code.claude.com/docs/en/features-overview#context-cost-by-feature)
:::

::: notes
Doc : « Skills | Session start + when used | Descriptions at start, full content when used » ; « Hooks | On trigger | Nothing (runs externally) | Zero, unless hook returns additional context ».
Une slash command réservée à l'utilisateur (`disable-model-invocation: true`) ne coûte rien au démarrage : sa description reste hors du contexte.
Rappel module 5 : CLAUDE.md est relu à chaque requête, d'où la cible de moins de 200 lignes.
:::

## Les équivalents dans Open Code {.compare kicker="Extensions"}

::: claude-code
Slash command et skill : `.claude/skills/`.

Hook : déclaré dans `.claude/settings.json`.
:::

::: opencode
Slash command : `.opencode/commands/`. Skill : `.claude/skills/`, lu aussi par Open Code.

Aucun hook déclaratif : un formateur dans `opencode.json`, un plugin JavaScript pour le reste.
:::

::: sources
- [Claude Code, Skills : Where skills live](https://code.claude.com/docs/en/skills#where-skills-live)
- Open Code v2.0.26 : [`config/plugin/command.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/config/plugin/command.ts), [`config/plugin/compatibility.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/config/plugin/compatibility.ts), [`plugin/module.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/plugin/module.ts)
:::

::: notes
Détail de chaque équivalence en fin de partie : commandes, skills, hooks, partage.
Open Code v2.0.26 lit `.claude/skills/` et `.agents/skills/`, pas `.claude/commands/` ni `.claude/agents/` (`compatibility.ts` : `[...roots.claude, ...roots.agents].map((root) => path.join(root, "skills"))`).
La doc Open Code décrit la v1 ; la VM a la v2.0.26, dont le code fait foi (`formateur/equivalences.md`).
:::

## Une slash command est un fichier Markdown {kicker="Slash commands"}

```text
.claude/skills/new-route/SKILL.md      crée /new-route
.claude/commands/new-route.md          ancien emplacement, toujours lu
```

Le nom du répertoire, ou du fichier, devient le nom de la commande.

::: sources
- [Claude Code, Skills](https://code.claude.com/docs/en/skills)
- [Claude Code, Skills : Where skills live](https://code.claude.com/docs/en/skills#where-skills-live)
:::

::: notes
« Custom commands have been merged into skills. A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way. Your existing `.claude/commands/` files keep working. »
« a Markdown file in `.claude/commands/` is the older format and still works. It supports the same frontmatter except `name` and `paths`. »
Si les deux existent sous le même nom, le skill l'emporte.
Une commande et un skill sont donc le même objet : la différence tient à qui le déclenche (slide « Qui peut lancer un skill »).
:::

## En-tête et corps du fichier {kicker="Slash commands"}

```markdown file="../tp/tp06/extensions/.claude/skills/new-route/SKILL.md" lines="1-7"
```

L'en-tête, entre deux lignes `---`, décrit la commande en YAML (le frontmatter). Le corps est le prompt envoyé au modèle.

::: sources
- [Claude Code, Skills : Create your first skill](https://code.claude.com/docs/en/skills#create-your-first-skill)
- [Claude Code, Skills : Frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference)
:::

::: notes
« Every skill needs a `SKILL.md` file with two parts: YAML frontmatter between `---` markers that tells Claude when to use the skill, and markdown content with the instructions Claude follows when the skill runs. »
« All fields are optional. Only `description` is recommended so Claude knows when to use the skill. »
`argument-hint` s'affiche dans le menu `/` pendant la saisie. Un champ inconnu est ignoré sans erreur.
Prompt en anglais, comme le code du fil rouge.
:::

## Passer des arguments {kicker="Slash commands"}

```prompt
/new-route GET /stats occupancy rate of each room
```

Le texte qui suit `/new-route` remplace `$ARGUMENTS` dans le fichier. `$0` désigne le premier mot, `$1` le deuxième.

::: sources
- [Claude Code, Skills : Available string substitutions](https://code.claude.com/docs/en/skills#available-string-substitutions)
:::

::: notes
« `$ARGUMENTS` : All arguments passed when invoking the skill. When no placeholder receives an argument, Claude Code appends them as `ARGUMENTS: <value>`. »
« Access a specific argument by 0-based index » : `$ARGUMENTS[0]`, abrégé `$0`.
Autres substitutions : `${CLAUDE_SKILL_DIR}` (répertoire du skill), `${CLAUDE_SESSION_ID}`, `${CLAUDE_PROJECT_DIR}`.
Prompt utilisé au TP 6 pour ajouter `GET /stats`.
:::

## Insérer la sortie d'une commande shell {kicker="Slash commands"}

Dans le fichier, une commande entre `` !` `` et `` ` ``.

```markdown file="../tp/tp06/extensions/.claude/skills/new-route/SKILL.md" lines="8-9"
```

Claude Code exécute la commande quand on tape `/new-route`, avant d'envoyer le prompt.

|||

Dans le prompt reçu par le modèle, sa sortie.

```text
Existing routes:
21:@router.post("/rooms", status_code=201, response_model=RoomOut)
27:@router.get("/rooms", response_model=list[RoomOut])
32:@router.get("/rooms/available", response_model=list[RoomOut])
…
```

::: sources
- [Claude Code, Skills : Inject dynamic context](https://code.claude.com/docs/en/skills#inject-dynamic-context)
- [Claude Code, Skills : When an injected command fails](https://code.claude.com/docs/en/skills#when-an-injected-command-fails)
:::

::: notes
« The `` !`<command>` `` syntax runs shell commands before the skill content is sent to Claude. The command output replaces the placeholder, so Claude receives actual data, not the command itself. »
« A failed command aborts the entire skill invocation, not just its own placeholder. »
Forme sur plusieurs lignes : un bloc de code ouvert par ```` ```! ````. `"disableSkillShellExecution": true` coupe ces exécutions.
Usage courant : `git diff --stat`, `git status`, la branche courante.
:::

## Exemple complet : le fichier {kicker="Slash commands"}

```markdown file="../tp/tp06/extensions/.claude/skills/new-route/SKILL.md" lines="1-14"
```

::: sources
- [Claude Code, Skills : Create your first skill](https://code.claude.com/docs/en/skills#create-your-first-skill)
:::

::: notes
Fichier `.claude/skills/new-route/SKILL.md` du dossier `extensions/`, ouvert au TP 6.
Repérer les trois éléments vus : l'en-tête, `$ARGUMENTS`, `` !`…` ``.
:::

## Exemple complet : le prompt reçu {kicker="Slash commands"}

Après `/new-route GET /stats occupancy rate of each room` :

```text
Add this route to the rooms API: GET /stats occupancy rate of each room
Existing routes:
21:@router.post("/rooms", status_code=201, response_model=RoomOut)
27:@router.get("/rooms", response_model=list[RoomOut])
32:@router.get("/rooms/available", response_model=list[RoomOut])
43:@router.post("/bookings", status_code=201, response_model=BookingOut)
64:@router.delete("/bookings/{booking_id}", status_code=204)
70:@router.get("/schedule", response_model=list[BookingOut])
75:@router.get("/schedule.csv")
…
```

L'en-tête a disparu ; `$ARGUMENTS` et `` !`…` `` sont remplacés.

::: sources
- [Claude Code, Skills : Available string substitutions](https://code.claude.com/docs/en/skills#available-string-substitutions)
- [Claude Code, Skills : Inject dynamic context](https://code.claude.com/docs/en/skills#inject-dynamic-context)
:::

::: notes
Message relevé le 18 octobre 2026 dans le journal de session (`~/.claude/projects/…/<session>.jsonl`), Claude Code v2.1.302, `claude-sonnet-4-6`, sur une copie du fil rouge. Les quatre étapes suivent, identiques au fichier (remplacées par `…` sur la slide).
Claude Code ajoute en tête une ligne `Base directory for this skill: <chemin absolu du skill>` : elle permet au modèle de trouver les fichiers voisins du `SKILL.md` (`reference.md`, scripts).
Rejouer en direct : taper la commande, puis montrer le message dans le journal ou `ctrl+o` (vue détaillée).
:::

## Empêcher l'agent de la lancer seul {kicker="Slash commands"}

```yaml
disable-model-invocation: true
```

Seul l'utilisateur déclenche alors la commande. Cas d'usage : une commande qui modifie des fichiers ou déploie.

::: sources
- [Claude Code, Skills : Control who invokes a skill](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill)
- [Claude Code, Best practices : Create skills](https://code.claude.com/docs/en/best-practices#create-skills)
:::

::: notes
« Claude can't invoke the skill on its own. Use this for workflows with side effects or that you want to control timing, like `/commit`, `/deploy` ».
Best practices : « Use `disable-model-invocation: true` for workflows with side effects that you want to trigger manually. »
Effet vérifié le 18 octobre 2026 (Claude Code v2.1.302, `claude-sonnet-4-6`) sur le fil rouge : le modèle voit `schema-migration` dans sa liste de skills, pas `new-route`.
`allowed-tools` accorde des outils sans demande de permission pendant le tour qui lance la commande : « The grant clears when you send your next message. »
:::

## /code-review et /doctor sont des slash commands intégrées {kicker="Slash commands"}

Claude Code livre des commandes écrites comme des skills : `/code-review` (module 4), `/doctor`, `/loop`. `/skills` liste les skills disponibles.

::: sources
- [Claude Code, Skills : Bundled skills](https://code.claude.com/docs/en/skills#bundled-skills)
- [Claude Code, Commands](https://code.claude.com/docs/en/commands)
:::

::: notes
« Claude Code includes a set of bundled skills, such as `/doctor`, `/code-review`, `/batch`, `/debug`, `/loop`, and `/claude-api`. Bundled skills are prompt-based ».
Page Commands : les skills intégrés sont marqués « Skill » dans la colonne Purpose.
`/skills` : « List available skills. Type to filter the list by name, description, or source. Press `t` to sort by token count ».
`/reload-skills` relit les répertoires de skills sans redémarrer.
Les autres commandes intégrées (`/clear`, `/model`…) sont codées dans l'outil.
:::

## Open Code : commandes personnalisées {.compare kicker="Slash commands"}

::: claude-code
`.claude/skills/new-route/SKILL.md`

Premier argument : `$0`.
:::

::: opencode
`.opencode/commands/new-route.md`

Premier argument : `$1`. `$ARGUMENTS` et `` !`…` `` fonctionnent de même.
:::

::: sources
- Open Code v2.0.26 : [`config/plugin/command.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/config/plugin/command.ts), [`schema/config/command.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/schema/src/config/command.ts)
- [Open Code, Commands](https://opencode.ai/docs/commands/)
:::

::: notes
Code v2.0.26 : `.scan("{command,commands}/**/*.md", …)` dans chaque `.opencode/` et dans `~/.config/opencode/`. Nom de la commande : chemin relatif sans `.md`.
Arguments : `placeholderRegex = /\$(\d+)/g` ; le placeholder de plus haut numéro reçoit tous les arguments restants.
Frontmatter : `description`, `agent`, `model`, `subagent` (alias déprécié `subtask`) : la commande s'exécute alors dans une session enfant.
`.claude/commands/` n'est pas lu par Open Code. Aucun équivalent de `disable-model-invocation` : une commande Open Code n'est jamais lancée par le modèle.
Dans `opencode.json`, la clé v2 est `commands` ; la clé v1 `command` de la doc est migrée.
Le fil rouge fournit les deux fichiers, au même contenu.
:::

## Un prompt retapé souvent s'enregistre en slash command. {.statement kicker="Idée clé"}

::: notes
Découle de « Choisir selon le besoin » et de la partie : un fichier, des arguments, le contexte injecté, le déclenchement réservé à l'utilisateur.
Transition : le même fichier peut aussi être lancé par l'agent lui-même. C'est alors un skill.
:::

## Un skill charge des instructions quand la tâche le demande {kicker="Skills"}

La procédure de migration du schéma ne sert qu'aux tâches qui touchent la base. Dans un skill, elle n'entre dans le contexte que pour ces tâches.

Les skills suivent un format ouvert, Agent Skills, lu par plusieurs outils.

::: sources
- [Claude Code, Skills](https://code.claude.com/docs/en/skills)
- [Agent Skills](https://agentskills.io)
:::

::: notes
« Claude uses skills when relevant, or you can invoke one directly with `/skill-name`. »
« Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it. »
« Claude Code skills follow the Agent Skills open standard, which works across multiple AI tools. Claude Code extends the standard with additional features like invocation control, subagent execution, and dynamic context injection. »
Rappel module 5 : la divulgation progressive, niveau 03.
:::

## Ce que l'agent lit et à quel moment {kicker="Skills"}

![Trois niveaux : la description du skill est lue à chaque session ; le fichier SKILL.md quand le skill sert ; reference.md quand le SKILL.md y renvoie ; un script de scripts/ est exécuté sans être lu](images/06-skill.svg)

::: sources
- [Claude Code, Skills : Add supporting files](https://code.claude.com/docs/en/skills#add-supporting-files)
- [Claude Code, Skills : Control who invokes a skill](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill)
:::

::: notes
Tableau de la doc : « (default) | Yes | Yes | Description always in context, full skill loads when invoked ».
Arborescence d'exemple de la doc : « `SKILL.md` (required - overview and navigation) », « `reference.md` (detailed API docs - loaded when needed) », « `scripts/helper.py` (utility script - executed, not loaded) ».
Le skill de migration du fil rouge n'a pas de script : `scripts/` est cité pour compléter le schéma.
:::

## La description déclenche le skill {kicker="Skills"}

```yaml
description: Database stuff
```

```yaml file="../tp/tp06/extensions/.claude/skills/schema-migration/SKILL.md" lines="3-3"
```

Le modèle choisit un skill sur sa description : elle reprend les mots d'une demande, comme « column » ou « table ».

::: sources
- [Claude Code, Skills : Frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference)
- [Claude Code, Skills : Skill not triggering](https://code.claude.com/docs/en/skills#skill-not-triggering)
:::

::: notes
Première description : illustration d'une description trop vague.
Doc : « Check the description includes keywords users would naturally say ».
Description et `when_to_use` sont tronquées à 1 536 caractères dans la liste des skills. La liste entière dispose de 1 % de la fenêtre de contexte ; au-delà, les descriptions des skills les moins utilisés sont coupées en premier.
Les descriptions des skills, même anglaises, se déclenchent sur une demande en français : à vérifier en répétition (#35).
:::

## Le skill de migration du fil rouge {kicker="Skills"}

```markdown file="../tp/tp06/extensions/.claude/skills/schema-migration/SKILL.md" lines="6-14"
```

Les détails et un exemple de test vivent dans `reference.md`, lu à la demande.

::: sources
- [Claude Code, Skills : Add supporting files](https://code.claude.com/docs/en/skills#add-supporting-files)
- Fil rouge : `tp/tp06/extensions/.claude/skills/schema-migration/`
:::

::: notes
Le fil rouge versionne son schéma par `PRAGMA user_version` (`rooms/db.py`) : chaque entrée de `MIGRATIONS` fait passer à la version suivante.
Règle 1 : une migration déjà livrée ne se modifie pas, sinon une base déjà à cette version ne reçoit jamais le changement.
Doc : « Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files. »
Le TP 6 le déclenche par une demande qui ne le nomme pas : une colonne `equipment` sur les salles.
:::

## Qui peut lancer un skill {kicker="Skills"}

| En-tête | Utilisateur | Agent |
|---|---|---|
| (par défaut) | oui | oui |
| `disable-model-invocation: true` | oui | non |
| `user-invocable: false` | non | oui |

::: sources
- [Claude Code, Skills : Control who invokes a skill](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill)
:::

::: notes
« By default, both you and Claude can invoke any skill. »
`user-invocable: false` : « Only Claude can invoke the skill. Use this for background knowledge that isn't actionable as a command. » Le skill disparaît du menu `/`.
Une slash command est un skill de la deuxième ligne ; `schema-migration` est sur la première.
:::

## Skills personnels, de projet, d'entreprise {kicker="Skills"}

| Portée | Emplacement | Pour qui |
|---|---|---|
| Entreprise | répertoire des réglages gérés | toute l'organisation |
| Personnel | `~/.claude/skills/<nom>/SKILL.md` | soi, dans tous les projets |
| Projet | `.claude/skills/<nom>/SKILL.md` | l'équipe, par git |

À nom égal, le skill personnel l'emporte sur celui du projet.

::: sources
- [Claude Code, Skills : Where skills live](https://code.claude.com/docs/en/skills#where-skills-live)
- [Claude Code, Skills : Resolve skills that share a name](https://code.claude.com/docs/en/skills#resolve-skills-that-share-a-name)
:::

::: notes
« Enterprise over personal, and personal over project. With `deploy` in both `~/.claude/skills/` and the project's `.claude/skills/`, `/deploy` runs the personal one ».
Un skill de plugin est préfixé (`/plugin-name:skill-name`) : il ne masque aucun autre skill.
Le tableau de la doc cite aussi les skills imbriqués dans un sous-répertoire, ceux d'un répertoire ajouté et ceux du compte claude.ai.
Rappel module 2 : même découpage pour les réglages.
:::

## Un skill chargé reste dans la conversation {kicker="Skills"}

Le contenu du skill entre dans la conversation une fois, et Claude Code ne relit plus le fichier. Après une compaction (module 5), les 5 000 premiers tokens de chaque skill sont réinjectés.

::: sources
- [Claude Code, Skills : Skill content lifecycle](https://code.claude.com/docs/en/skills#skill-content-lifecycle)
:::

::: notes
« the rendered `SKILL.md` content enters the conversation as a single message and stays there across later turns. […] Claude Code does not re-read the skill file on later turns ».
« When the conversation is summarized to free context, Claude Code re-attaches the most recent invocation of each skill after the summary, keeping the first 5,000 tokens of each. Re-attached skills share a combined budget of 25,000 tokens. »
Conséquence : modifier un `SKILL.md` en cours de session n'affecte pas un skill déjà chargé. Le relancer.
Une consigne placée en tête du `SKILL.md` survit le mieux à la compaction.
:::

## Faire exécuter un skill par un sous-agent {kicker="Skills"}

```yaml
context: fork
```

Le skill tourne alors dans un sous-agent (module 3) : un contexte neuf, sans l'historique de la conversation. Ses instructions doivent se suffire à elles-mêmes.

::: sources
- [Claude Code, Skills : Run skills in a subagent](https://code.claude.com/docs/en/skills#run-skills-in-a-subagent)
:::

::: notes
« The subagent doesn't see your conversation history, so the skill's instructions have to stand on their own. »
« Despite the name, a skill with `context: fork` doesn't run in a fork of the current conversation ».
« `context: fork` only makes sense for skills with explicit instructions. » Le champ `agent` choisit le type de sous-agent (par exemple `Explore`).
Seul le résumé revient dans la session principale, comme pour Explore.
Un skill forké tourne en arrière-plan par défaut ; `background: false` fait attendre son résultat (v2.1.218 et suivantes).
:::

## Écrire son propre sous-agent {kicker="Skills"}

```markdown
---
name: migration-reviewer
description: Reviews schema migrations in rooms/db.py
tools: Read, Grep, Glob
memory: project
---
Check that no existing entry of MIGRATIONS was edited.
```

Fichier `.claude/agents/migration-reviewer.md` (illustration). Le corps devient le prompt système du sous-agent ; `memory: project` lui donne une mémoire versionnée.

::: sources
- [Claude Code, Subagents : Write subagent files](https://code.claude.com/docs/en/sub-agents#write-subagent-files)
- [Claude Code, Subagents : Enable persistent memory](https://code.claude.com/docs/en/sub-agents#enable-persistent-memory)
:::

::: notes
« Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions. »
« Only `name` and `description` are required. »
« Subagents receive only this system prompt plus basic environment details like the working directory, not the Claude Code system prompt. »
`memory: project` : notes dans `.claude/agent-memory/<nom>/`, versionnables ; `user` et `local` existent aussi. Engagement pris au module 5 (mémoire automatique).
Lancer à coup sûr : `@"migration-reviewer (agent)"` dans le prompt. `/agents` n'ouvre plus d'assistant depuis la v2.1.198 : demander à Claude de créer le fichier, ou l'écrire.
Open Code : `.opencode/agents/<nom>.md` avec `mode: subagent` ; `.claude/agents/` n'est pas lu.
:::

## Quand le skill ne se déclenche pas {kicker="Skills"}

```prompt
What skills are available?
```

Le skill absent de la réponse n'est pas chargé. Présent mais ignoré, il a une description à revoir, et `/schema-migration` le lance à la main.

::: sources
- [Claude Code, Skills : Skill not triggering](https://code.claude.com/docs/en/skills#skill-not-triggering)
:::

::: notes
Étapes de la doc : « Check the description includes keywords users would naturally say », « Verify the skill appears in `What skills are available?` », « Invoke it directly with `/skill-name` if the skill is user-invocable ».
En-tête YAML invalide : le skill se charge sans métadonnées ; `claude --debug` affiche l'erreur d'analyse. `/skill-doctor` (v2.1.252 et suivantes) diagnostique les skills.
Évaluer un skill : lancer les mêmes demandes avec et sans lui, dans des sessions neuves, et comparer.
Le skill est sauté alors que la règle doit tenir à chaque fois : la doc conseille d'en faire un hook (partie suivante).
:::

## Open Code : skills {.compare kicker="Skills"}

::: claude-code
`.claude/skills/schema-migration/`

Lancé par le modèle, ou par `/schema-migration`.
:::

::: opencode
Lit le même `.claude/skills/` : un seul fichier sert aux deux outils.

Lancé par le modèle, ou par `@schema-migration` et le dialogue `/skills`. La `description` est indispensable.
:::

::: sources
- Open Code v2.0.26 : [`config/plugin/compatibility.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/config/plugin/compatibility.ts), [`skill/instructions.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/skill/instructions.ts), [`prompt/autocomplete.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/component/prompt/autocomplete.tsx)
- [Open Code, Skills](https://opencode.ai/docs/skills/)
:::

::: notes
Emplacements lus en v2.0.26 : `.opencode/skills/`, `.claude/skills/`, `.agents/skills/` et leurs équivalents globaux (`~/.config/opencode/skills/`, `~/.claude/skills/`, `~/.agents/skills/`).
Sans `description`, le skill n'est jamais proposé au modèle : `skill.description === undefined || skill.autoinvoke === false ? [] : …`.
La doc v1 annonce `metadata.opencode/slash` pour exposer `/nom` : le code v2.0.26 ne le lit pas. Le dialogue `/skills` insère `@nom` dans le prompt.
`disable-model-invocation: true` est lu aussi par Open Code (`skill-file.ts`), comme `metadata.opencode/autoinvoke: false`.
Le modèle reçoit, avec le corps du skill, le répertoire de base et au plus dix fichiers du skill.
:::

## Un skill n'occupe le contexte que lorsqu'il sert. {.statement kicker="Idée clé"}

::: notes
Découle de « Ce que l'agent lit et à quel moment » et de « Un skill chargé reste dans la conversation » : la description est lue à chaque session, le contenu seulement à l'usage.
Conséquence pour CLAUDE.md (module 5) : une procédure utile de temps en temps en sort pour devenir un skill.
Pause de 15 min.
:::

## Un hook s'exécute sans que l'agent décide {kicker="Hooks"}

Une consigne de CLAUDE.md ou d'un skill est suivie au mieux par le modèle. Un hook est lancé par Claude Code à chaque événement prévu, quel que soit le choix du modèle.

::: sources
- [Claude Code, Hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code, Best practices : Set up hooks](https://code.claude.com/docs/en/best-practices#set-up-hooks)
:::

::: notes
Hooks guide : « deterministic control: certain actions always happen rather than relying on the LLM to choose to run them. »
Best practices : « Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens. » ; « Use hooks for actions that must happen every time with zero exceptions. »
Features overview : « An instruction like "never edit `.env`" in CLAUDE.md or a skill is a request, not a guarantee. A `PreToolUse` hook that blocks the edit is enforcement. »
Rappel module 5, slide « Ce que CLAUDE.md ne garantit pas ».
:::

## Un hook : un moment, un filtre, une commande {kicker="Hooks"}

![Un hook réunit trois éléments : l'événement, par exemple PostToolUse après l'exécution d'un outil ; le matcher, par exemple Edit|Write, qui désigne les outils visés ; la commande, par exemple .claude/hooks/check.sh](images/06-hook.svg)

::: sources
- [Claude Code, Hooks : Configuration](https://code.claude.com/docs/en/hooks#configuration)
:::

::: notes
« The configuration has three levels of nesting: 1. Choose a hook event […] 2. Add a matcher group […] 3. Define one or more hook handlers ».
Le matcher est une expression : `Edit|Write` vise les deux outils d'édition, `Bash` les commandes shell. Sans matcher, le hook vise tous les outils.
Cinq types de commande : `command` (script shell), `http`, `mcp_tool`, `prompt`, `agent` (expérimental). Le module ne montre que `command`.
Plusieurs hooks qui correspondent au même événement s'exécutent en parallèle.
:::

## Les principaux événements {kicker="Hooks"}

![Sélection d'événements dans l'ordre d'une session : SessionStart au démarrage, UserPromptSubmit à l'envoi d'un prompt, PreToolUse avant un outil, PostToolUse après un outil, Stop à la fin du tour ; UserPromptSubmit, PreToolUse et Stop peuvent bloquer](images/06-evenements.svg)

Sélection parmi une trentaine d'événements.

::: sources
- [Claude Code, Hooks : Hook lifecycle](https://code.claude.com/docs/en/hooks#hook-lifecycle)
- [Claude Code, Hooks : Exit code 2 behavior per event](https://code.claude.com/docs/en/hooks#exit-code-2-behavior-per-event)
:::

::: notes
Bloquer : `PreToolUse` refuse l'appel d'outil, `UserPromptSubmit` refuse le prompt, `Stop` empêche la fin du tour.
`PostToolUse` ne bloque pas : « Shows stderr to Claude; the tool already ran ».
Autres événements : `PermissionRequest`, `Notification`, `SubagentStop`, `PreCompact`, `PostCompact`, `SessionEnd`, `FileChanged`…
Exemple du guide : `SessionStart` avec le matcher `compact` réinjecte des consignes après chaque compaction.
:::

## Le hook du fil rouge dans settings.json {kicker="Hooks"}

```json file="../tp/tp06/extensions/.claude/settings.json" lines="14-24"
```

Après chaque `Edit` ou `Write`, Claude Code lance `check.sh`. `$CLAUDE_PROJECT_DIR` désigne la racine du projet.

::: sources
- [Claude Code, Hooks : Configuration](https://code.claude.com/docs/en/hooks#configuration)
- [Claude Code, Hooks : Reference scripts by path](https://code.claude.com/docs/en/hooks#reference-scripts-by-path)
:::

::: notes
Extrait de `.claude/settings.json` du fil rouge ; le même fichier déclare le hook `PreToolUse` de `protect.sh`.
« `${CLAUDE_PROJECT_DIR}`: the project root where the session started. » Les guillemets protègent un chemin qui contient des espaces.
Le script doit être exécutable (`chmod +x`).
`timeout` par défaut : 600 s pour un hook `command`.
Emplacements possibles : `~/.claude/settings.json`, `.claude/settings.json` (commité), `.claude/settings.local.json`, réglages gérés, plugin, frontmatter d'un skill ou d'un sous-agent. Les hooks de tous les niveaux s'additionnent.
:::

## Le hook reçoit l'action en JSON {kicker="Hooks"}

```json
{
  "hook_event_name": "PostToolUse",
  "tool_name": "Edit",
  "tool_input": { "file_path": "/home/dev/fil-rouge/rooms/routes.py" }
}
```

Le script lit ce JSON sur son entrée standard. `check.sh` en extrait le chemin du fichier avec `jq`.

::: sources
- [Claude Code, Hooks : Common input fields](https://code.claude.com/docs/en/hooks#common-input-fields)
- [Claude Code, Hooks : PostToolUse input](https://code.claude.com/docs/en/hooks#posttooluse-input)
:::

::: notes
Extrait réduit (illustration) : l'entrée contient aussi `session_id`, `cwd`, `permission_mode`, `tool_response`…
« File-tool `tool_input` paths arrive […] always absolute ».
`check.sh` : `jq -r '.tool_input.file_path // empty'`. `jq` doit être installé sur le poste.
:::

## Le code de retour du script décide de la suite {kicker="Hooks"}

| Code | Effet |
|---|---|
| 0 | succès, l'action suit son cours |
| 2 | blocage : l'action est refusée, le message d'erreur va au modèle |
| autre | erreur non bloquante : l'action suit son cours |

::: sources
- [Claude Code, Hooks : Exit code output](https://code.claude.com/docs/en/hooks#exit-code-output)
:::

::: notes
« Blocking error: your hook exits 2. On events that can block, Claude Code stops the action. »
« Non-blocking error: your hook exits with any other code […] The action goes ahead ».
Piège : « Exit code 1 without valid JSON output is a non-blocking error […] If your hook is meant to enforce a policy, use `exit 2`. »
Autre voie : sortie 0 avec un JSON sur stdout (`decision`, `permissionDecision`, `additionalContext`). Hors du module.
:::

## Ce que le modèle lit du hook {kicker="Hooks"}

Après un `PostToolUse`, la sortie standard va au journal de débogage : le modèle ne la voit pas. Avec le code 2, le message d'erreur lui parvient, et `check.sh` lui transmet ainsi l'échec de `pytest`.

```bash file="../tp/tp06/extensions/.claude/hooks/check.sh" lines="11-15"
```

::: sources
- [Claude Code, Hooks : Exit code 0](https://code.claude.com/docs/en/hooks#exit-code-0)
- [Claude Code, Hooks : Exit code 2 behavior per event](https://code.claude.com/docs/en/hooks#exit-code-2-behavior-per-event)
:::

::: notes
« For most events, Claude Code writes stdout to the debug log and doesn't show it in the transcript. The exceptions are `UserPromptSubmit`, `UserPromptExpansion`, `SessionStart`, and `PostModelSwitch` ».
« Claude never sees stderr from a hook that exits 0. […] To surface a warning to Claude from a `PostToolUse` or `PostToolUseFailure` hook, exit 2 instead so Claude sees the stderr even though the tool already ran. »
Constaté le 18 octobre 2026 (Claude Code v2.1.302, `claude-sonnet-4-6`, copie du fil rouge) : après une édition qui casse un test, Claude cite le message `Tests fail after editing …` et l'assertion en échec. L'édition reste appliquée : `PostToolUse` arrive après l'outil.
Autre voie : champ `additionalContext` d'une sortie JSON, plafonné à 10 000 caractères.
:::

## Bloquer la modification d'un fichier {kicker="Hooks"}

```bash file="../tp/tp06/extensions/.claude/hooks/protect.sh" lines="4-9"
```

Hook `PreToolUse` sur `Edit|Write`. L'agent reçoit la raison du refus et change d'approche.

::: sources
- [Claude Code, Hooks guide : Block edits to protected files](https://code.claude.com/docs/en/hooks-guide#block-edits-to-protected-files)
:::

::: notes
Adapté de l'exemple du guide, qui protège `.env`, `package-lock.json` et `.git/`.
« Claude receives feedback explaining why the edit was blocked, so it can adjust its approach. »
`uv.lock` est écrit par `uv` : une édition à la main le désynchronise de `pyproject.toml`.
Constaté le 18 octobre 2026 (Claude Code v2.1.302, `claude-sonnet-4-6`) : Claude rapporte le message `Blocked: uv.lock is generated by uv…`, et le fichier reste inchangé.
Une règle `deny` sur `Edit(uv.lock)` (module 2) produit le même blocage ; le hook permet une condition calculée et un message choisi.
:::

## Empêcher la fin du tour tant que les tests échouent {kicker="Hooks"}

Un hook `Stop` qui sort avec le code 2 empêche Claude de terminer : Claude reprend le travail. Le champ `stop_hook_active` signale une reprise, pour ne pas bloquer sans fin.

::: sources
- [Claude Code, Hooks guide : Stop hook hits the block cap](https://code.claude.com/docs/en/hooks-guide#stop-hook-hits-the-block-cap)
- [Claude Code, Hooks : Exit code 2 behavior per event](https://code.claude.com/docs/en/hooks#exit-code-2-behavior-per-event)
:::

::: notes
Rappel module 4 : vérification « par un hook `Stop` », qui « blocks the turn from ending until it passes ».
Guide : « Parse the `stop_hook_active` field […] exit early if it's `true` ». Claude Code plafonne à 8 blocages consécutifs.
Le guide montre la variante `"type": "agent"` : un sous-agent lance la suite de tests et juge le résultat.
Le fil rouge lance les tests après chaque édition (`PostToolUse`) : retour plus tôt, plus de lancements de `pytest`.
:::

## Un hook ne contourne pas les permissions {kicker="Hooks"}

Un hook peut refuser une action, même en mode `bypassPermissions`. Il ne peut pas autoriser ce qu'une règle de permission interdit.

::: sources
- [Claude Code, Hooks guide : Hooks and permission modes](https://code.claude.com/docs/en/hooks-guide#hooks-and-permission-modes)
:::

::: notes
« A hook that returns `permissionDecision: "deny"` blocks the tool even in `bypassPermissions` mode ».
« hooks […] can tighten restrictions but not loosen them past what permission rules allow. »
Rappel module 2 : règles `allow`, `ask`, `deny` et modes de permission.
:::

## Voir ce qu'un hook a fait {kicker="Hooks"}

```console
$ echo '{"tool_input":{"file_path":"uv.lock"}}' | .claude/hooks/protect.sh
Blocked: uv.lock is generated by uv. Edit pyproject.toml, then run uv lock.
$ echo $?
2
```

Le script se teste seul, hors session. En session, `/hooks` liste les hooks et `Ctrl+O` affiche leur résultat.

::: sources
- [Claude Code, Hooks guide : Hook error in output](https://code.claude.com/docs/en/hooks-guide#hook-error-in-output)
- [Claude Code, Hooks guide : Check what a hook did](https://code.claude.com/docs/en/hooks-guide#check-what-a-hook-did)
- [Claude Code, Hooks : The /hooks menu](https://code.claude.com/docs/en/hooks#the-%2Fhooks-menu)
:::

::: notes
Sortie réelle, 18 octobre 2026, à la racine de la copie du fil rouge.
`/hooks` : « a read-only browser for your configured hooks. The list labels each hook with where it comes from ».
`Ctrl+O` : « open the transcript view and look for the hook's outcome ».
Journal : `claude --debug` écrit dans `~/.claude/debug/<session-id>.txt`, sans rien afficher dans le terminal ; `/debug` l'active en cours de session.
:::

## Un hook s'exécute avec les droits de l'utilisateur {kicker="Hooks"}

Un hook lance n'importe quelle commande sur le poste : il se lit avant d'être accepté. Les hooks d'un dépôt attendent que l'utilisateur accepte le dossier, au premier lancement de Claude Code dans ce dossier.

::: sources
- [Claude Code, Hooks : Security considerations](https://code.claude.com/docs/en/hooks#security-considerations)
- [Claude Code, Hooks : Workspace trust](https://code.claude.com/docs/en/hooks#workspace-trust)
:::

::: notes
« Command hooks execute shell commands with your full user permissions. […] Review and test all hook commands before adding them to your configuration. »
Session interactive : « Claude Code holds back hooks from every settings file […] until you accept the workspace trust dialog ».
Piège : avec `-p` ou le SDK, aucune boîte de confiance : « hooks committed in a repository's `.claude/settings.json` run in a folder you've never trusted ». Lire `.claude/` d'un dépôt cloné avant un `claude -p` dedans.
`"disableAllHooks": true` coupe tous les hooks ; en entreprise, `allowManagedHooksOnly` ne garde que les hooks gérés.
:::

## Open Code : formateur et plugin {.compare kicker="Hooks"}

::: claude-code
`ruff` et `pytest` : hook `PostToolUse` dans `.claude/settings.json`.
:::

::: opencode
`ruff` : clé `formatter` de `opencode.json`. `pytest` : plugin JavaScript `.opencode/plugins/run-tests.js`, qui ajoute le résultat au retour de l'outil d'édition.
:::

::: sources
- Open Code v2.0.26 : [`config/plugin/formatter.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/config/plugin/formatter.ts), [`plugin/source-directory.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/plugin/source-directory.ts), [`promise/tool.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/plugin/src/promise/tool.ts)
- [Open Code, Formatters](https://opencode.ai/docs/formatters/)
:::

::: notes
Formateurs désactivés par défaut : « Formatters are disabled by default; enable them in your config ». Le `ruff` intégré exige `ruff` dans le `PATH` ; le fil rouge déclare donc `["uv", "run", "ruff", "format", "$FILE"]`.
Le formateur s'exécute dans l'outil d'édition lui-même (`write`, `edit`, `patch`), avant le plugin.
Plugins locaux : chaque fichier `.js` ou `.ts` de `.opencode/plugins/` (ou `plugin/`).
Aucune clé `hooks` dans la configuration d'Open Code.
:::

## Open Code : un plugin v2 {kicker="Hooks"}

```javascript file="../tp/tp06/extensions/.opencode/plugins/run-tests.js" lines="21-27"
```

Après chaque édition d'un fichier Python, le plugin lance `pytest` et ajoute le résultat au retour de l'outil, que lit le modèle.

::: sources
- Open Code v2.0.26 : [`plugin/module.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/plugin/module.ts), [`promise/tool.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/plugin/src/promise/tool.ts), [`permission.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/permission.ts)
:::

::: notes
Format v2 : « Plugin must export a default definition with an id and an effect or setup function. » Le format v1 de la doc (`export const MyPlugin = async (…) => ({ "tool.execute.before": … })`) est refusé.
`execute.after` reçoit `status`, `tool`, `input` et un `result` modifiable.
Bloquer un appel : `ctx.permission.hook("evaluate", …)` avec `effect = "deny"` et un `message`. L'effet d'un `throw` dans `execute.before` n'est pas établi en v2.0.26.
L'API v2 n'est pas documentée : ce plugin suit le code source du tag v2.0.26. Il se lit au TP, il ne s'écrit pas.
:::

## Une action à faire à chaque fois s'écrit dans un hook. {.statement kicker="Idée clé"}

::: notes
Découle de « Un hook s'exécute sans que l'agent décide », du code de retour et des deux exemples du fil rouge : formatage et tests après édition, refus d'éditer `uv.lock`.
Contrepartie : un hook exécute du code avec les droits de l'utilisateur.
:::

## Un workflow d'équipe {kicker="Équipe"}

![Chaîne du fil rouge : CLAUDE.md donne les conventions, la slash command /new-route écrit la route et son test, le hook formate et lance les tests après chaque édition, le skill schema-migration guide un changement de schéma](images/06-workflow.svg)

Chaque extension couvre une étape ; ensemble, elles portent les pratiques de l'équipe.

::: sources
- [Claude Code, Extend Claude Code](https://code.claude.com/docs/en/features-overview)
:::

::: notes
Synthèse des parties précédentes, sur la chaîne du TP 6.
CLAUDE.md : écrit au TP 5. Les trois autres : fournies au TP 6.
Doc : « Features range from always-on context that Claude sees every session, to on-demand capabilities you or Claude can invoke, to background automation that runs on specific events. »
:::

## Les extensions se commitent avec le code {kicker="Équipe"}

| Fichier | Partage |
|---|---|
| `.claude/settings.json` | commité, pour l'équipe |
| `.claude/skills/`, `.claude/agents/` | commités, pour l'équipe |
| `.claude/settings.local.json` | personnel, exclu de git |

::: sources
- [Claude Code, Explore the .claude directory : File reference](https://code.claude.com/docs/en/claude-directory#file-reference)
- [Claude Code, Settings : Share settings with your team](https://code.claude.com/docs/en/settings#share-settings-with-your-team)
:::

::: notes
« Commit `.claude/settings.json` so everyone who clones the repository gets the same permissions, hooks, and plugins. Each teammate can still override it for themselves in their own `.claude/settings.local.json` ».
Sont aussi marqués à commiter : `CLAUDE.md`, `rules/*.md`, `commands/*.md`, `.mcp.json`, `agent-memory/<name>/`.
Rappel module 2 : Claude Code ajoute `settings.local.json` aux exclusions git globales la première fois qu'il l'écrit ; créé à la main, il va dans `.gitignore`.
:::

## Réglages du projet et réglages personnels {kicker="Équipe"}

| Réglages | Fichier | S'appliquent à |
|---|---|---|
| imposés par l'organisation | `managed-settings.json` | tous les postes déployés |
| de la session | `claude --settings` | cette session |
| personnels du projet | `.claude/settings.local.json` | vous, dans ce projet |
| du projet | `.claude/settings.json` | toute l'équipe |
| personnels | `~/.claude/settings.json` | vous, dans tous les projets |

Pour une même clé, la ligne la plus haute l'emporte.

::: sources
- [Claude Code, Settings : Settings files and who they affect](https://code.claude.com/docs/en/settings#settings-files-and-who-they-affect)
- [Claude Code, Settings : Settings precedence](https://code.claude.com/docs/en/settings#settings-precedence)
:::

::: notes
Réglages imposés (« managed settings ») : déployés par l'organisation via un fichier `managed-settings.json` dans un répertoire système, une politique MDM ou la console claude.ai. « You don't create or edit it. » `/status`, ligne `Setting sources`, indique s'il y en a.
Les listes ne suivent pas cet ordre, elles s'additionnent : `permissions.allow`, hooks (source « Lists merge instead of overriding », https://code.claude.com/docs/en/settings#lists-merge-instead-of-overriding).
Ordre de la doc : « 1. Managed settings […] 2. Command line […] 3. Project local settings (`.claude/settings.local.json`) […] 4. Shared project settings (`.claude/settings.json`) […] 5. User settings (`~/.claude/settings.json`) ».
« When you set the same list key, such as `permissions.allow`, in more than one file, Claude Code combines the lists instead of picking one ».
Hooks : « Hook entries merge across settings levels rather than replacing each other ». Un hook commité ne se désactive pas un par un : seul `disableAllHooks` les coupe tous.
:::

## L'accord du premier lancement {kicker="Équipe"}

Au premier lancement dans un dossier, Claude Code demande s'il peut lui faire confiance. Les règles `allow`, les hooks et les marketplaces commités ne s'appliquent qu'après cet accord.

::: sources
- [Claude Code, Settings : A committed key doesn't reach teammates](https://code.claude.com/docs/en/settings#a-committed-key-doesnt-reach-teammates)
- [Claude Code, Hooks : Workspace trust](https://code.claude.com/docs/en/hooks#workspace-trust)
:::

::: notes
« `permissions.allow` rules, `permissions.additionalDirectories`, `extraKnownMarketplaces`, and most `env` values apply only after each teammate trusts the folder. »
Un collègue qui signale qu'un réglage commité « ne marche pas » n'a souvent pas accepté le dossier.
Au TP 6, l'accord est demandé après la copie des extensions.
:::

## Regrouper ses extensions dans un plugin {kicker="Équipe"}

```text
mon-plugin/
├── .claude-plugin/plugin.json      nom et version
├── skills/new-route/SKILL.md       /mon-plugin:new-route
└── hooks/hooks.json
```

Un plugin sert quand plusieurs dépôts veulent les mêmes extensions. Ses skills portent son nom en préfixe.

::: sources
- [Claude Code, Plugins : Create plugins](https://code.claude.com/docs/en/plugins/create)
- [Claude Code, Plugins](https://code.claude.com/docs/en/plugins/overview)
:::

::: notes
Illustration : le fil rouge n'a pas de plugin.
« A Claude Code plugin is a directory of skills, agents, hooks, MCP servers, or other components that Claude Code installs and loads as one unit. »
« Keep that standalone setup while it serves one project or only you. Make a plugin when you want to share the setup with teammates, install it in several projects, or publish versioned releases. »
« Only `plugin.json` goes inside `.claude-plugin/`. Components saved there don't load. »
Essai sans installation : `claude --plugin-dir ./mon-plugin` ; contrôle : `claude plugin validate ./mon-plugin`.
Les hooks n'ont pas de préfixe : un hook présent dans les réglages et dans le plugin s'exécute deux fois.
:::

## Installer un plugin depuis une marketplace {kicker="Équipe"}

```prompt
/plugin marketplace add anthropics/claude-code
/plugin install commit-commands@claude-plugins-official
```

Une marketplace est un dépôt qui liste des plugins dans `.claude-plugin/marketplace.json`. Celle d'Anthropic, `claude-plugins-official`, est ajoutée d'office.

::: sources
- [Claude Code, Plugins : Create a marketplace](https://code.claude.com/docs/en/plugins/create-marketplace)
- [Claude Code, Plugins : Install plugins](https://code.claude.com/docs/en/plugins/install)
- [Claude Code, Plugins : Get plugins from a marketplace](https://code.claude.com/docs/en/plugins/overview#get-plugins-from-a-marketplace)
:::

::: notes
Exemples de la doc. Une commande par prompt.
« A plugin marketplace is a directory or repository with a `.claude-plugin/marketplace.json` file that lists your plugins and where to fetch each one. »
« Claude Code adds Anthropic's official marketplace the first time you start an interactive terminal session, unless a managed policy blocks it. »
`/plugin install` en session ouvre la fiche du plugin pour choisir la portée : utilisateur, projet (entrée dans `.claude/settings.json`) ou local.
`/plugin` sans argument ouvre le menu des plugins.
:::

## Activer un plugin pour tout le dépôt {kicker="Équipe"}

```json
{
  "extraKnownMarketplaces": {
    "outils-equipe": {
      "source": { "source": "github", "repo": "mon-org/outils-equipe" }
    }
  },
  "enabledPlugins": { "new-route@outils-equipe": true }
}
```

Dans `.claude/settings.json`, ces deux clés déclarent la marketplace et activent le plugin pour chaque développeur du dépôt.

::: sources
- [Claude Code, Plugins : Require plugins per repository](https://code.claude.com/docs/en/plugins/org#require-plugins-per-repository)
:::

::: notes
Illustration : marketplace et organisation inventées.
« To cover one repository's contributors instead of your whole fleet, set `extraKnownMarketplaces` and `enabledPlugins` in that repository's `.claude/settings.json`. The `extraKnownMarketplaces` entries apply only in a folder the contributor has trusted ».
Portée projet : l'entrée commitée active le plugin, chaque collègue l'installe une fois (`claude plugin install <name>@<marketplace> --scope project`).
:::

## Un plugin s'exécute avec vos droits {kicker="Équipe"}

Un plugin activé est présent dans chaque session et peut exécuter du code sur le poste. Il se lit avant d'être installé, comme un hook.

::: sources
- [Claude Code, Plugins : What an enabled plugin adds to your sessions](https://code.claude.com/docs/en/plugins/overview#what-an-enabled-plugin-adds-to-your-sessions)
- [Claude Code, Plugins : Tell Anthropic's marketplaces from third-party ones](https://code.claude.com/docs/en/plugins/overview#tell-anthropics-marketplaces-from-third-party-ones)
:::

::: notes
« An enabled plugin is part of every session, not only the sessions where you use it. »
« Whatever the tier, a plugin you install can run code with your user privileges. »
Coût en contexte : les descriptions de ses skills entrent dans chaque session.
:::

## Open Code : partager ses extensions {.compare kicker="Équipe"}

::: claude-code
`.claude/` et `.mcp.json` commités. Plugins par marketplace.
:::

::: opencode
`opencode.json` et `.opencode/` commités. Plugins par paquet npm ou git, `opencode plugin add` ; aucune marketplace.
:::

::: sources
- Open Code v2.0.26 : [`config.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/config.ts), [`cli/src/commands/commands.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/cli/src/commands/commands.ts)
- [Open Code, Config](https://opencode.ai/docs/config/)
:::

::: notes
`.opencode/` contient `commands/`, `skills/`, `agents/`, `plugins/`. Configuration globale : `~/.config/opencode/`.
Ordre v2.0.26, du plus faible au plus fort : configuration distante, globale, `OPENCODE_CONFIG`, `opencode.json` du projet, `.opencode/`, `OPENCODE_CONFIG_CONTENT`. « Global entries sit below explicit and direct files; project directories rank above them. »
`opencode plugin add` : « Install a plugin and add it to the global configuration », à partir d'un « npm registry or Git package specifier ». Dans `opencode.json`, clé v2 `plugins` (la clé v1 `plugin` est migrée).
Pas d'équivalent de `.claude-plugin/plugin.json` dans le code v2.0.26.
:::

## Une extension partagée se relit comme du code. {.statement kicker="Idée clé"}

::: notes
Découle de « Un hook s'exécute avec les droits de l'utilisateur », de « Les extensions se commitent avec le code » et de « Un plugin s'exécute avec vos droits ».
Une extension commitée passe en revue de code comme le reste du dépôt.
:::

## TP 6 : observer des extensions {.tp duration="1h20"}

Copier dans le fil rouge les extensions fournies, puis les lister, les lire et les déclencher : une slash command, un skill et deux hooks. Aucune extension n'est à écrire. Le TP se termine par deux commits.

Prérequis : TP 5 terminé et commité.

::: notes
Étapes de l'énoncé : #28.
Les extensions viennent du dossier `extensions/` de l'archive : intégrées au fil rouge dès le départ, elles auraient fait tourner le hook pendant les TP 2 à 5.
Sous Open Code, le même dossier apporte `.opencode/commands/`, `.opencode/plugins/` et un `opencode.json` qui déclare le formateur.
:::

### Copier les extensions

```console
$ cp -r ~/extensions/. ~/fil-rouge/
$ cd ~/fil-rouge
$ git status --short
```

::: claude-code
```console
$ claude --permission-mode default --model claude-sonnet-4-6
```

Accepter le dossier quand Claude Code le demande.
:::

::: opencode
```console
$ opencode
```
:::

::: attendu
`git status` liste `.claude/` et `.opencode/` comme nouveaux, et `opencode.json` comme modifié.
:::

## Glossaire {kicker="Glossaire"}

- **Slash command** : prompt enregistré, lancé par `/nom`
- **Skill** : instructions chargées à la demande
- **Frontmatter** : en-tête YAML du fichier
- **Sous-agent** : agent au contexte séparé

|||

- **Hook** : commande lancée par l'outil
- **Événement** : moment qui déclenche le hook
- **Matcher** : filtre sur les outils visés
- **Plugin** : paquet d'extensions
- **Marketplace** : dépôt qui liste des plugins

::: sources
- [Claude Code, Skills](https://code.claude.com/docs/en/skills), [Hooks](https://code.claude.com/docs/en/hooks), [Plugins](https://code.claude.com/docs/en/plugins/overview)
- [Claude Code, Extend Claude Code](https://code.claude.com/docs/en/features-overview)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::
