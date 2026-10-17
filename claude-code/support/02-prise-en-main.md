# Prise en main de Claude Code

Lancer, autoriser, reprendre la main

::: notes
Module 2, environ 45 min dont 15 de TP.
Le module 1 a présenté le harnais et la boucle : ici on les montre à l'écran, sans les redéfinir.
Claude Code est supposé installé et configuré sur le poste : installation et authentification sont montrées, pas réalisées.
:::

## Installer et vérifier {kicker="Installation"}

```console
$ curl -fsSL https://claude.ai/install.sh | bash
$ claude --version
$ claude doctor
```

Les installations native et npm se mettent à jour automatiquement.

::: sources
- [Claude Code, Advanced setup : Install Claude Code, Verify your installation, Auto-updates](https://code.claude.com/docs/en/setup#install-claude-code)
:::

::: notes
`claude doctor` : diagnostic détaillé de l'installation.
Autres méthodes : Homebrew `brew install --cask claude-code`, WinGet `winget install Anthropic.ClaudeCode`, dépôts apt, dnf et apk signés, npm (Node.js 22 ou plus).
Homebrew, WinGet, apt, dnf et apk ne se mettent pas à jour seuls par défaut. Homebrew et WinGet : `CLAUDE_CODE_PACKAGE_MANAGER_AUTO_UPDATE=1`. apt, dnf, apk : mise à jour manuelle.
:::

## S'authentifier {.compare kicker="Installation"}

::: claude-code
Au premier lancement, connexion par le navigateur avec un compte Pro, Max, Team, Enterprise ou Console. `/status` affiche la méthode active.

```console
$ claude auth login
```
:::

::: opencode
Clé API Anthropic, saisie par `/connect` dans la session ou en ligne de commande. La variable `ANTHROPIC_API_KEY` est aussi lue.

```console
$ opencode auth login
```
:::

::: sources
- [Claude Code, Authentication : Log in to Claude Code, Authentication precedence](https://code.claude.com/docs/en/authentication#log-in-to-claude-code)
- [Claude Code, CLI reference](https://code.claude.com/docs/en/cli-reference#cli-commands)
- Open Code v2.0.26 : [`commands.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/cli/src/commands/commands.ts), [`app.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/app.tsx), [`integration.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/integration.ts)
:::

::: notes
Claude Code : `ANTHROPIC_API_KEY` définie, Claude Code demande s'il faut l'utiliser ; approuvée, elle passe avant l'abonnement (déjà vu au module 1). `/login` en session.
Précédence complète : identifiants cloud (Bedrock, Vertex, Foundry), `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_API_KEY`, `apiKeyHelper`, `CLAUDE_CODE_OAUTH_TOKEN`, puis l'abonnement de `/login`.
Open Code v2 : identifiants dans la table `credential` de `opencode.db`, sous `~/.local/share/opencode/` par défaut (`opencode debug paths db`). La doc du site parle encore d'`auth.json` (v1). Un identifiant enregistré passe avant la variable d'environnement.
Aucune connexion par abonnement Pro ou Max trouvée dans le code v2.0.26.
:::

## Choisir le modèle {.compare kicker="Installation"}

::: claude-code
Au lancement, pour la session :

```console
$ claude --model claude-sonnet-4-6
```

En session, `/model claude-sonnet-4-6` enregistre aussi le choix pour les sessions suivantes.
:::

::: opencode
En session, `/models` ouvre un sélecteur. Dans `opencode.json`, pour le projet :

```json
{ "model": "anthropic/claude-sonnet-4-6" }
```
:::

::: sources
- [Claude Code, Model configuration : Setting your model, Model aliases](https://code.claude.com/docs/en/model-config#setting-your-model)
- Open Code v2.0.26 : [`commands.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/cli/src/commands/commands.ts), [`config.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/schema/src/config.ts), [`app.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/app.tsx)
:::

::: notes
L'alias `sonnet` désigne la dernière Sonnet : Sonnet 5.5 sur l'API Anthropic aujourd'hui. D'où l'identifiant complet.
Claude Code : `/model` écrit le champ `model` des réglages utilisateur. Dans le sélecteur, `Enter` enregistre, `s` vaut pour la session seule. `--model` et `ANTHROPIC_MODEL` valent pour la session lancée.
Open Code v2 : `-m` existe seulement sur `opencode run`, pas sur la TUI (la doc v1 l'annonce encore). Sélecteur aussi par `<leader>m`.
:::

## Une boucle, plusieurs interfaces {.facts kicker="Installation"}

- **Terminal** commande `claude`
- **IDE** extensions VS Code et JetBrains
- **Desktop** application dédiée
- **Web** claude.ai/code

::: sources
- [Claude Code, How Claude Code works : Environments and interfaces](https://code.claude.com/docs/en/how-claude-code-works#environments-and-interfaces)
- [Claude Code, JetBrains IDEs](https://code.claude.com/docs/en/jetbrains)
:::

::: notes
« The agentic loop, tools, and capabilities are the same everywhere » : boucle, outils et capacités identiques partout.
JetBrains : le plugin lance `claude` dans le terminal intégré de l'IDE, sans copie propre du CLI.
Autres surfaces citées : Remote Control, Slack, pipelines CI/CD.
Tout le reste de la formation se fait dans le terminal.
:::

## Lancer dans le projet {kicker="Démarrage"}

```console
$ cd ~/fil-rouge
$ claude
```

Dans un dossier jamais approuvé, la boîte de dialogue de confiance liste d'abord les règles et les répertoires que le dossier accorderait.

::: sources
- [Claude Code, Security : Additional safeguards](https://code.claude.com/docs/en/security#additional-safeguards)
- [Claude Code, Permissions : Project allow rules and workspace trust](https://code.claude.com/docs/en/permissions#project-allow-rules-and-workspace-trust)
:::

::: notes
Nom dans la doc : « workspace trust dialog ». Libellé exact non documenté.
Confiance enregistrée pour la racine du dépôt git. Un dépôt imbriqué demande sa propre confiance. Dans le dossier home, confiance pour la session seulement : la boîte revient à chaque lancement.
Les serveurs MCP de `.mcp.json` ont leur propre demande. En `-p`, la boîte ne s'affiche jamais.
Open Code : `opencode` dans le répertoire, ou `opencode <chemin>`.
:::

## Ce que voit l'agent au démarrage {kicker="Démarrage"}

![Lancé dans le projet, l'agent voit les fichiers du répertoire, le terminal, l'état git, CLAUDE.md et le début de la mémoire automatique ; ailleurs, sur permission ou avec --add-dir](images/02-demarrage.svg)

::: sources
- [Claude Code, How Claude Code works : What Claude can access](https://code.claude.com/docs/en/how-claude-code-works#what-claude-can-access)
- [Claude Code, Permissions : Working directories](https://code.claude.com/docs/en/permissions#working-directories)
:::

::: notes
Mémoire automatique : les 200 premières lignes ou 25 Ko de `MEMORY.md`, à chaque session. Module 5.
Les extensions configurées (MCP, skills, sous-agents) sont aussi chargées.
`--add-dir` au lancement, `/add-dir` en session, `permissions.additionalDirectories` pour durer. `--add-dir` ne charge pas la plupart de la configuration `.claude/` du dossier ajouté.
Open Code v2 : hors du répertoire, permission `external_directory`, `allow` par défaut dans le code v2.0.26 (la doc v1 dit `ask`). Pas d'équivalent de `--add-dir`.
:::

## Un tour de boucle à l'écran {kicker="Démarrage"}

![Illustration d'un tour : le prompt, l'appel Bash à uv run pytest, la demande de permission, le résultat de 33 tests passés, la réponse](images/02-tour.svg)

::: sources
- [Claude Code, How Claude Code works : The agentic loop](https://code.claude.com/docs/en/how-claude-code-works#the-agentic-loop)
:::

::: notes
Rendu simplifié du terminal. Sortie réelle de `uv run pytest -q` sur le fil rouge : 33 tests.
`uv run pytest` lance une commande qui n'est pas en lecture seule : demande en mode Manual.
Chaque appel d'outil est affiché avant son résultat : c'est là que le développeur suit et interrompt.
:::

## Reprendre la main {.facts kicker="Contrôle"}

- **`Esc`** arrête l'agent et annule l'appel d'outil en cours
- **`Enter` pendant le travail** met le message en file, lu après les appels en cours
- **`Esc Esc`, `/rewind`** restaurent le code, la conversation ou les deux

::: sources
- [Claude Code, How Claude Code works : Interrupt and steer](https://code.claude.com/docs/en/how-claude-code-works#interrupt-and-steer)
- [Claude Code, Interactive mode : Queue messages while Claude works](https://code.claude.com/docs/en/interactive-mode#queue-messages-while-claude-works)
- [Claude Code, Checkpointing : Rewind and summarize](https://code.claude.com/docs/en/checkpointing#rewind-and-summarize)
:::

::: notes
Message en file : lu dans le même tour, dès la fin des appels d'outils en cours.
`Esc Esc` ouvre le menu seulement si la saisie est vide ; sinon il efface le brouillon.
Menu de `/rewind` : Restore code and conversation, Restore conversation, Restore code, Summarize from here, Summarize up to here, Never mind.
Open Code v2 : `Esc` deux fois en moins de 5 s interrompt. `/undo` revient avant le dernier message et restaure les fichiers, `/redo` refait.
:::

## Ce que les checkpoints ne couvrent pas {kicker="Contrôle"}

| Modification | Restaurée par `/rewind` |
|---|---|
| Édition par les outils de fichiers | oui |
| Fichier modifié par une commande Bash | non |
| Base de données, API, déploiement | non |

Git reste le filet pour les fichiers. Une action distante ne se défait pas.

::: sources
- [Claude Code, Checkpointing : Bash command changes not tracked](https://code.claude.com/docs/en/checkpointing#bash-command-changes-not-tracked)
- [Claude Code, How Claude Code works : Undo changes with checkpoints](https://code.claude.com/docs/en/how-claude-code-works#undo-changes-with-checkpoints)
:::

::: notes
Exemples de commandes Bash non suivies : `rm`, `mv`, `sed -i`, un script de génération.
Conservation : 100 derniers checkpoints par session, supprimés environ 30 jours après (`cleanupPeriodDays`). Ils survivent à la reprise d'une session.
Non restaurés non plus : éditions des sous-agents en arrière-plan, liens symboliques.
Open Code v2 : snapshots dans un dépôt git séparé, sous le répertoire de données ; `/undo` échoue hors d'un dépôt git (« Project is not a Git repository »).
:::

## Une demande de permission {kicker="Permissions"}

![Illustration d'une demande de permission pour uv run pytest : Yes ; Yes, and don't ask again for uv run pytest * ; Yes, and switch to auto mode ; No ; Esc pour annuler, Tab pour ajouter une consigne](images/02-permission.svg)

::: sources
- [Claude Code, Permissions : Permission system](https://code.claude.com/docs/en/permissions#permission-system)
- [Claude Code, Permissions : Add a comment when you answer a permission prompt](https://code.claude.com/docs/en/permissions#add-a-comment-when-you-answer-a-permission-prompt)
:::

::: notes
Redessinée d'après la capture de la doc, où la commande est `npm test`.
L'option 3 n'apparaît pas toujours : en Manual et `acceptEdits` quand le mode auto est disponible (v2.1.247 et suivantes), jamais pour une règle `ask`.
`Tab` sur Yes ou No ouvre un champ de commentaire, transmis à l'agent avec la réponse.
:::

## Ce qui demande une approbation {kicker="Permissions"}

| Outil | Approbation en mode Manual | « Don't ask again » |
|---|---|---|
| Lecture, recherche | non, dans le répertoire de travail | sans objet |
| Bash | oui, sauf commandes en lecture seule | durable, par dépôt et par commande |
| Édition de fichiers | oui | jusqu'à la fin de la session |
| WebFetch, WebSearch | oui | durable, par dépôt |

::: sources
- [Claude Code, Permissions : Permission system, Read-only commands](https://code.claude.com/docs/en/permissions#permission-system)
:::

::: notes
Commandes en lecture seule, sans demande dans tous les modes : `ls`, `cat`, `echo`, `pwd`, `head`, `tail`, `grep`, `find`, `wc`, `which`, `diff`, `stat`, `du`, `cd`, formes en lecture seule de `git`. Liste non configurable.
Règle durable écrite dans `.claude/settings.local.json` à la racine du dépôt git. Claude Code ajoute ce fichier aux exclusions git globales la première fois qu'il l'écrit.
WebFetch : domaines de documentation préapprouvés sans demande ; règle durable par dépôt et par domaine.
:::

## Six modes de permission {kicker="Modes"}

| Mode | Passe sans demande |
|---|---|
| `default`, affiché Manual | lectures |
| `acceptEdits` | lectures, éditions, commandes courantes sur les fichiers (`mkdir`, `mv`…) |
| `plan` | lectures, plus les commandes que le classifieur approuve |
| `auto` | tout, vérifié par un classifieur |
| `dontAsk` | outils préapprouvés ; le reste est refusé |
| `bypassPermissions` | tout |

`Shift+Tab` change de mode en session, `--permission-mode` fixe le mode de départ.

::: sources
- [Claude Code, Permission modes : Available modes, Switch permission modes](https://code.claude.com/docs/en/permission-modes#available-modes)
:::

::: notes
`plan` : l'agent explore et propose un plan sans modifier. Le classifieur n'y intervient que si le mode auto est disponible.
Cycle de `Shift+Tab` : depuis `auto`, `default`, puis `acceptEdits`, puis `plan`. `bypassPermissions` s'y ajoute s'il est activé, `auto` vient en dernier. `dontAsk` n'y figure jamais.
Barre d'état : `⏸ manual mode on`, `⏵⏵ accept edits on`, `⏸ plan mode on`, `⏵⏵ auto mode on`.
`bypassPermissions` : la doc le réserve aux environnements isolés (conteneur, VM sans accès internet).
:::

## Auto, mode de départ depuis la v2.1.283 {kicker="Modes"}

Un classifieur, modèle distinct, examine chaque action avant son exécution. Exemples de ce qu'il bloque par défaut :

- télécharger et exécuter du code (`curl | bash`)
- envoyer des données sensibles vers l'extérieur
- déployer ou migrer en production
- `git push --force`, `git reset --hard`

::: sources
- [Claude Code, Permission modes : Eliminate prompts with auto mode, What the classifier blocks by default](https://code.claude.com/docs/en/permission-modes#eliminate-prompts-with-auto-mode)
:::

::: notes
Depuis la v2.1.283 : mode de départ des sessions interactives dans le terminal et dans VS Code, sur tous les plans et fournisseurs.
Modèles compatibles sur l'API Anthropic : Opus 4.6 ou plus, Sonnet 4.6 ou plus, Haiku 5.5, Fable. Sonnet 4.6 convient donc.
La liste complète compte une vingtaine d'entrées : infrastructure partagée, IAM, feature flags de production, `terraform destroy`…
`defaultMode: "auto"` n'agit pas depuis les réglages du projet. Un administrateur Team ou Enterprise peut couper le mode (`permissions.disableAutoMode`).
Au TP : `--permission-mode default`, sinon aucune demande n'apparaît.
:::

## Ce qui reste soumis à demande {.facts kicker="Modes"}

- **Règle `ask`** demande dans tous les modes
- **`rm` sur un chemin critique** demande dans tous les modes : racine, home, répertoire de travail
- **Chemins protégés** `.git`, `.claude`, `.bashrc` : jamais approuvés d'office, sauf en `bypassPermissions`

::: sources
- [Claude Code, Permission modes : Actions no mode auto-approves](https://code.claude.com/docs/en/permission-modes#actions-no-mode-auto-approves)
- [Claude Code, Permission modes : Protected paths, Critical paths](https://code.claude.com/docs/en/permission-modes#protected-paths)
:::

::: notes
Chemin critique : aucune règle allow ni hook ne l'approuve ; en `bypassPermissions`, demande avec délai dans le terminal. Une règle deny le bloque toujours.
Chemins protégés : demande en Manual et `acceptEdits`, classifieur en `auto`, refus en `dontAsk`. Liste partielle : `.git`, `.claude` (avec exceptions), `.vscode`, `.idea`, `.husky`, `.bashrc`, `.zshrc`, `.gitconfig`, `.mcp.json`.
Autres demandes systématiques : l'outil `AskUserQuestion`, les outils MCP marqués `requiresUserInteraction`.
:::

## Règles allow, ask, deny {kicker="Règles"}

```json
{
  "permissions": {
    "allow": ["Bash(uv run pytest *)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Read(./.env)"]
  }
}
```

Ordre d'évaluation : deny, puis ask, puis allow ; la première règle qui correspond décide. Claude Code applique ces règles lui-même, quelle que soit la demande du modèle.

::: sources
- [Claude Code, Permissions : Manage permissions, Wildcard patterns](https://code.claude.com/docs/en/permissions#manage-permissions)
:::

::: notes
Exemple de syntaxe (illustration) ; la doc donne `Bash(npm run *)` et `Read(./.env)`.
« Permission rules are enforced by Claude Code, not by the model. »
`/permissions` liste les règles et le fichier d'où vient chacune.
Rappel module 1 : `Read(./.env)` ne bloque pas une commande Bash qui lit le fichier elle-même.
:::

## Où vivent les réglages {kicker="Règles"}

| Portée | Fichier | Pour qui |
|---|---|---|
| Géré | `managed-settings.json`, MDM, console | toute l'organisation |
| Local | `.claude/settings.local.json` | soi, dans ce projet |
| Projet | `.claude/settings.json` | l'équipe, versionné |
| Utilisateur | `~/.claude/settings.json` | soi, dans tous les projets |

Du plus prioritaire au moins prioritaire. Pour les permissions, un deny l'emporte quel que soit son niveau.

::: sources
- [Claude Code, Settings : Settings precedence](https://code.claude.com/docs/en/settings#settings-precedence)
- [Claude Code, Permissions : Settings precedence](https://code.claude.com/docs/en/permissions#settings-precedence)
:::

::: notes
Entre géré et local : l'option de ligne de commande `--settings`.
Les variables d'environnement ne forment pas un niveau de cette pile.
Le fichier local reste hors de git : Claude Code l'ajoute aux exclusions globales quand il le crée. Créé à la main, l'ajouter soi-même au `.gitignore`.
:::

## Open Code : mêmes notions, autres noms {.compare kicker="Open Code"}

::: claude-code
Six modes, `Shift+Tab`.

Règles dans `settings.json` : deny, puis ask, puis allow.

Réponses : une fois, ou durable pour le dépôt.

`/permissions` liste les règles.
:::

::: opencode
Agents Build et Plan, `Shift+Tab` ; Plan refuse les éditions.

Règles dans `opencode.json` : la dernière qui correspond l'emporte.

Réponses : Allow once, Always allow (durable pour le projet), Reject.

`--auto` accepte tout ce qui n'est pas refusé.
:::

::: sources
- Open Code v2.0.26 : [`permission.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/permission.ts), [`plan.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/plugin/plan.ts), [`config/plugin/agent.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/config/plugin/agent.ts), [`keybind.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/config/keybind.ts), [`tui/src/util/permission.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/util/permission.ts), [`commands.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/cli/src/commands/commands.ts)
- [Claude Code, Permissions](https://code.claude.com/docs/en/permissions#manage-permissions), [Permission modes](https://code.claude.com/docs/en/permission-modes)
:::

::: notes
Constats tirés du code v2.0.26 ; la doc du site (v1) diffère sur la touche (Tab), les droits de Plan (edit et bash à `ask`) et la durée de « always » (session).
Par défaut tout est permis, sauf la lecture des `*.env` et `*.env.*`, qui demande. Plan ajoute `edit` à `deny` et laisse passer le shell.
Les règles de `opencode.json` s'ajoutent après celles de chaque agent. Un deny reste prioritaire sur les règles « always » enregistrées.
Clé native v2 : `permissions`, tableau ordonné. La clé v1 `permission` (objet par outil) reste acceptée et migrée, `bash` devient `shell`.
« Always allow » est enregistré dans la base `opencode.db`, pour le projet. Aucun équivalent de `/permissions` ; `/settings` règle seulement l'acceptation automatique.
Reject accepte un message, renvoyé au modèle.
:::

## Explorer avant de modifier {kicker="Bonnes pratiques"}

En mode plan, l'agent lit et propose sans rien modifier. Les questions sont celles qu'on poserait à un collègue :

```prompt
Comment une réservation est-elle enregistrée, de la route à la base ?
```

```prompt
Où sont détectés les conflits de créneaux, et quels tests les couvrent ?
```

::: sources
- [Claude Code, Best practices : Explore first, then plan, then code](https://code.claude.com/docs/en/best-practices#explore-first-then-plan-then-code)
:::

::: notes
« Use plan mode to separate exploration from execution. »
`Shift+Tab` jusqu'à `⏸ plan mode on`, ou `--permission-mode plan`.
Open Code : agent Plan, qui refuse les éditions mais laisse passer le shell en v2.0.26.
Exploration détaillée : module 3.
:::

## Donner à l'agent un moyen de vérifier {kicker="Bonnes pratiques"}

Le développeur vérifie, l'agent aussi : une commande qu'il lance lui-même, tests, build ou linter.

```prompt
Corrige le test qui échoue, relance uv run pytest et montre la sortie.
```

::: sources
- [Claude Code, Best practices : Give Claude a way to verify its work](https://code.claude.com/docs/en/best-practices#give-claude-a-way-to-verify-its-work)
:::

::: notes
Découle de l'idée clé du module 1 : le développeur relit, teste et répond de ce qu'il commite.
« Give Claude a check it can run: tests, a build, a screenshot to compare. » Sans vérification possible, le développeur devient lui-même la boucle de vérification.
Demander la sortie de la commande : la preuve reste dans la conversation.
Boucle de vérification : module 4.
:::

## Une session par tâche {kicker="Bonnes pratiques"}

`/clear` vide le contexte entre deux tâches sans lien. Une session se reprend plus tard :

```console
$ claude -c     # dernière session du répertoire
$ claude -r     # choix dans une liste
```

::: sources
- [Claude Code, Best practices : Manage context aggressively, Resume conversations](https://code.claude.com/docs/en/best-practices#manage-context-aggressively)
- [Claude Code, CLI reference](https://code.claude.com/docs/en/cli-reference#cli-flags)
:::

::: notes
Chaque session neuve repart d'un contexte vide (module 1, slide sur le contexte).
`claude -r "<id ou nom>"` reprend une session précise.
Open Code v2 : `/new` ouvre une session neuve, `opencode -c` reprend la dernière, `opencode -s <id>`, `/sessions` (alias `/resume`).
:::

## /init génère un CLAUDE.md {kicker="Bonnes pratiques"}

```prompt
/init
```

Claude Code analyse le dépôt et écrit les commandes de build et de test et les conventions qu'il découvre. Un `CLAUDE.md` existant reçoit des propositions d'amélioration.

::: sources
- [Claude Code, Memory : Set up a project CLAUDE.md](https://code.claude.com/docs/en/memory#set-up-a-project-claude-md)
- [Claude Code, Best practices : Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
:::

::: notes
Montré sans être lancé : le `CLAUDE.md` du fil rouge s'écrit au TP 5.
`CLAUDE_CODE_NEW_INIT=1` : parcours interactif (CLAUDE.md, skills, hooks).
Open Code : `/init` crée ou met à jour `AGENTS.md`, et lit un `CLAUDE.md` existant.
:::

## Le mode de permission fixe ce que l'agent fait sans demander. {.statement kicker="Idée clé"}

::: notes
Découle des slides sur la demande de permission, les modes et les règles.
Ajouter : les règles affinent le mode, les garde-fous restent quel que soit le réglage.
:::

## TP 2 : premier lancement {.tp duration="15 min"}

Lancer l'outil sur le projet fil rouge, faire lire le code et lancer des commandes, puis accepter, refuser et autoriser durablement une demande de permission. Le code reste inchangé.

Prérequis : Claude Code installé et connecté sur le poste, ou Open Code sur la VM avec la clé API Anthropic.

::: notes
Passer entre les postes : vérifier le modèle (`claude-sonnet-4-6`) et, sous Claude Code, le mode Manual dans la barre d'état.
Piège : Claude Code lancé sans `--permission-mode default` démarre en `auto` et ne demande rien.
Piège : Open Code lancé avec `--auto` accepte tout.
L'agent peut choisir WebFetch au lieu de `curl` pour interroger l'API : lui redemander `curl`.
:::

### Installer uv

```console
$ curl -LsSf https://astral.sh/uv/0.13.1/install.sh | sh
```

Ouvrir ensuite un nouveau terminal, pour que `uv` soit dans le `PATH`. Sans `curl` : `wget -qO- https://astral.sh/uv/0.13.1/install.sh | sh`.

::: attendu
`uv --version` affiche `uv 0.13.1`.
:::

### Préparer le projet

Extraire l'archive fournie, qui crée `~/fil-rouge` et le support `~/claude-code.html`, puis :

```console
$ unzip ~/Documents/claude-code.zip -d ~
$ cd ~/fil-rouge
$ uv sync
$ git init
$ git add .
$ git commit -m "État initial"
```

::: attendu
`uv sync` télécharge Python 3.14 si besoin et installe les dépendances. `git log` montre un commit.
:::

::: indice
Sans `unzip` : `python3 -m zipfile -e ~/Documents/claude-code.zip ~`. Avec Claude Code sur le poste, copier d'abord l'archive depuis la VM dans `~/Documents`.
:::

### Lancer l'outil

::: claude-code
```console
$ claude --permission-mode default --model claude-sonnet-4-6
```

Accepter la boîte de dialogue de confiance.
:::

::: opencode
```console
$ opencode
```

Le `opencode.json` du projet fixe le modèle. Ne pas utiliser `--auto`.
:::

::: attendu
Claude Code : la barre d'état affiche `⏸ manual mode on`. Open Code : l'agent Build et le modèle Claude Sonnet 4.6 sont affichés.
:::

### Faire décrire le projet

```prompt
Décris la structure de ce projet : modules, rôle de chacun, point d'entrée.
```

::: attendu
L'agent lit les fichiers sans demander de permission et cite les modules de `rooms/`.
:::

### Refuser, puis accepter une commande

```prompt
Lance la suite de tests.
```

Refuser la demande avec la consigne « ajoute l'option -q », puis accepter une seule fois la demande suivante.

::: claude-code
Refus : se placer sur No, `Tab`, saisir la consigne, `Enter`. Acceptation : Yes.
:::

::: opencode
Refus : Reject, avec la consigne en message. Acceptation : Allow once.
:::

::: attendu
L'agent tient compte de la consigne et propose `uv run pytest -q`. Une fois acceptée, la sortie indique `33 passed`.
:::

### Autoriser durablement

Dans un second terminal, remplir la base et démarrer l'API :

```console
$ cd ~/fil-rouge
$ uv run python -m rooms.seed
$ uv run uvicorn rooms.main:app --reload
```

Revenir à l'outil :

```prompt
Avec curl, liste les salles exposées par l'API sur http://127.0.0.1:8000.
```

::: claude-code
Choisir « Yes, and don't ask again for » suivi du motif proposé.
:::

::: opencode
Choisir Always allow.
:::

::: attendu
L'agent liste trois salles.
:::

### Vérifier que la règle s'applique

```prompt
Avec curl, donne le planning du 11 janvier 2027 (GET /schedule?day=2027-01-11).
```

::: attendu
L'agent affiche les réservations du jour sans nouvelle demande de permission.
:::

### Retrouver la règle enregistrée

::: claude-code
```prompt
/permissions
```

La règle figure aussi dans le fichier local :

```console
$ cat .claude/settings.local.json
```
:::

::: opencode
Open Code n'a pas de commande qui liste les règles. « Always allow » est enregistré pour le projet dans la base d'Open Code : quitter, relancer `opencode` et redemander le planning.
:::

::: attendu
Claude Code : une règle `Bash(curl …)` dans `allow`, venue de `.claude/settings.local.json`. Open Code : aucune demande après la relance. Dans les deux cas, `git status` ne signale aucune modification.
:::

### Corrigé {.corrige}

Aucun code n'est modifié et aucun commit n'est ajouté.

Les lectures de fichiers passent sans demande. `uv run pytest -q` et `curl` en déclenchent une, parce que ce ne sont pas des commandes en lecture seule (Claude Code) ou parce que `opencode.json` met `bash` à `ask` (Open Code).

Le refus accompagné d'une consigne réoriente l'agent sans relancer la conversation.

La règle durable vit hors du dépôt versionné : `.claude/settings.local.json` est exclu de git par Claude Code, et Open Code l'enregistre dans sa base.

## Glossaire {kicker="Glossaire"}

- **Répertoire de travail** : dossier de lancement, accessible sans demande
- **Confiance du dossier** : accord donné au premier lancement dans un dossier
- **Permission** : accord pour un appel d'outil
- **Mode de permission** : ce qui passe sans demande

|||

- **Classifieur** : modèle qui examine les actions en mode auto
- **Règle allow, ask, deny** : décision fixée pour un outil et un motif
- **Checkpoint** : état des fichiers avant une édition de l'agent
- **Chemin protégé** : fichier jamais approuvé d'office, sauf en `bypassPermissions`

::: sources
- [Claude Code, Permissions](https://code.claude.com/docs/en/permissions), [Permission modes](https://code.claude.com/docs/en/permission-modes)
- [Claude Code, Checkpointing](https://code.claude.com/docs/en/checkpointing), [Security](https://code.claude.com/docs/en/security)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::
