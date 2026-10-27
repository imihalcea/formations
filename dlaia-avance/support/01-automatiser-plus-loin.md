# Automatiser plus loin


## Les outils d'origine {kicker="Limitations"}

La première limitation de l'ouverture : l'agent de code n'a que ses outils d'origine, ceux fournis avec lui.

| Action | Claude Code | Open Code |
|---|---|---|
| Lire un fichier | `Read` | `read` |
| Écrire ou modifier | `Write`, `Edit` | `write`, `edit` |
| Exécuter une commande | `Bash` | `shell` |
| Chercher | `Grep`, `Glob` | `grep`, `glob` |

::: sources
- [Claude Code, Tools reference](https://code.claude.com/docs/en/tools-reference)
- [Open Code, Tools](https://opencode.ai/v2/docs/tools/)
:::

::: notes
Reprend la première ligne du tableau de l'ouverture, élargie : outils d'origine, une seule fenêtre de contexte, une seule exécution. Les trois situations suivantes illustrent chacune un volet, sur tickets-api.
Tableau : liste partielle. Claude Code a aussi `WebFetch`, `WebSearch`, `Agent` ; Open Code `webfetch`, `websearch`, `subagent`, `skill`, `execute` (page Tools v2, relevée le 25 octobre 2026). Rejeu du 25 octobre 2026 (Claude Code 2.1.310, Linux) : `Glob` et `Grep` figurent parmi les outils du fil principal et un sous-agent déclaré `tools: Read, Grep, Glob` les appelle. Le fil principal peut préférer `Bash grep` quand le `CLAUDE.md` de l'utilisateur le prescrit.
Le nom de l'outil sert dans les permissions et dans les listes d'outils d'un sous-agent : il revient aux sections suivantes.
:::

## Une information hors du dépôt {kicker="Limitations"}

| Hors de portée des outils d'origine |
|---|
| une issue GitHub |
| un schéma de base |
| une page web |

```console
$ claude
> Lis l'issue ouverte sur le ticket fermé et ses commentaires.
Aucun de mes outils ne lit une issue GitHub. Colle son texte ici.
```

Illustration : réponse type.

::: notes
Rappel : l'issue est la fiche GitHub du dépôt, distincte du ticket métier de tickets-api.
Le texte de la réponse est une illustration. Rejeu Claude Code 2.1.310, sans serveur MCP et `gh` caché : l'agent répond que le serveur MCP GitHub n'est pas connecté, puis essaie `gh`, `curl` avec `$GITHUB_TOKEN` et `python3` ; cinq `Bash` refusés par les permissions (69 s, 14 tours, 0,41 USD). Sans refus, il aurait lu l'issue par `curl`. Le shim ne cache que `gh`. Open Code : impasse non jouée ; sans `--standalone`, le MCP est indisponible et l'agent lit l'issue par `curl`.
Piège : si `gh` est installé et connecté, l'agent de code peut lancer `gh issue view` par l'outil `Bash` et lire l'issue. La limitation vaut pour les outils d'origine seuls ; la slide « MCP ou ligne de commande » y revient. Pour la démonstration de la section MCP, retirer `gh` du `PATH` de la session pour montrer l'état de départ.
Même limite pour un schéma de base (hors dépôt) et une page web : pas d'outil d'origine qui les lise sans permission supplémentaire.
:::

## Une fenêtre de contexte saturée {kicker="Limitations"}

![Barre de la fenêtre de contexte remplie aux trois quarts par des fichiers lus pendant l'exploration](images/01-fenetre-saturee.svg)

Illustration : un dépôt de taille réelle se lit en dizaines de fichiers avant la première modification.

::: notes
Illustration, pas une mesure. Chaque fichier lu entre en entier dans la fenêtre de contexte et y reste jusqu'à la fin de la session (ou à la compaction).
Conséquence à dire : plus la fenêtre est pleine, moins il reste de place pour le travail lui-même ; la section Sous-agents y répond.
Question probable : « et la compaction ? » Elle résume l'historique, donc perd du détail ; hors périmètre de ce module.
:::

## Arrêt malgré des tests rouges {kicker="Limitations"}

```console
$ make test
FAILED tests/integration/test_comments_api.py::test_add_comment_on_closed_ticket_returns_409
FAILED tests/unit/test_ticket.py::test_closed_ticket_refuses_comments
2 failed, 37 passed

> Il reste deux échecs liés au statut du ticket. Je m'arrête ici.
```

La phrase de fin est une illustration.

::: notes
Une seule exécution : l'agent de code décide lui-même d'arrêter. Rien dans le harnais ne l'oblige à relancer `make test` ni à continuer.
Sortie de `make test` relevée au rejeu sur la branche `fix/ticket-ferme-commentaires` (Claude Code) : `2 failed, 37 passed`, les deux échecs attendus. Phrase de fin : illustration, aucune phrase d'arrêt réelle relevée (les rejeux ont lancé la boucle directement).
Annonce de la section Boucles : un critère vérifiable décide de la fin, pas le modèle.
:::

## Trois limitations, trois sections {kicker="Limitations"}

Un mécanisme est un moyen d'étendre l'agent de code.

| Limitation | Ce qui la dépasse |
|---|---|
| information hors du dépôt | outils ajoutés |
| fenêtre de contexte saturée | fenêtres séparées |
| arrêt malgré des tests rouges | nouvel appel jusqu'à la réussite |

::: notes
Classement du support, pas une source externe. Les trois sections portent les noms serveur MCP, sous-agents et orchestrateur, boucles : définis dans leur section, ne pas les expliquer ici.
Les trois autres mécanismes prolongent ces sections : les garde-fous bornent les boucles, le SDK intègre l'agent de code dans un programme, l'interface reprend le serveur MCP avec un navigateur. Le module se clôt par une grille de choix.
Sigle MCP : développé à la section suivante.
:::

## Chaque situation observée appelle son propre mécanisme. {.statement kicker="Limitations"}

::: notes
Conclut les trois situations (information absente, fenêtre saturée, arrêt prématuré). Mécanisme par limitation : serveur MCP, sous-agents, boucles. Ordre des sections : MCP, sous-agents, orchestrateur, boucles, garde-fous, SDK, interface, choix.
:::

## Six mécanismes au programme {kicker="Limitations"}

| Mécanisme | Limitation qu'il aide à dépasser |
|---|---|
| serveur MCP | information hors du dépôt |
| sous-agents | fenêtre de contexte saturée |
| orchestrateur | fenêtre saturée, tâche trop longue pour une session |
| boucles | arrêt malgré des tests rouges |
| garde-fous | relances sans fin, tests contournés |
| SDK (bibliothèque qui pilote l'agent de code) | code déterministe qui décide, agent de code qui exécute |

::: notes
Classement du support, pas une source externe. Ordre des sections de la journée. Chaque terme est défini dans sa section : ne pas l'expliquer ici. L'interface web reprend le serveur MCP avec un navigateur. Les garde-fous et le SDK prolongent les boucles : ils ne répondent pas à une limitation de l'agent seul, ils encadrent ou intègrent la réponse.
:::

## Définition d'un serveur MCP {kicker="MCP"}

![L'agent de code échange avec un serveur MCP par le protocole MCP ; le serveur appelle l'API du service GitHub](images/01-serveur-mcp.svg)

MCP (Model Context Protocol) est un protocole commun entre un agent de code et un serveur qui lui expose des outils. Un serveur MCP est un programme qui expose des outils à l'agent de code par ce protocole.

::: sources
- [Model Context Protocol, Introduction](https://modelcontextprotocol.io)
- [Claude Code, MCP](https://code.claude.com/docs/en/mcp)
- [Open Code, MCP servers](https://opencode.ai/v2/docs/mcp-servers/)
:::

::: notes
Page d'accueil du MCP : « MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems. » La formulation de la slide la restreint au cas de l'agent de code.
Deux formes de serveur : distant (HTTP, ici l'URL GitHub) et local (processus lancé par l'agent de code, par exemple Playwright en fin de module).
Éviter « plugin » et « connecteur » : le lexique n'a que « serveur MCP ».
:::

## Un outil MCP {kicker="MCP"}

Un outil MCP a un nom, une description et des paramètres typés que le serveur déclare à l'agent de code.

```json
{
  "name": "issue_read",
  "description": "Get issue details",
  "inputSchema": {
    "properties": { "owner": "…", "repo": "…", "issue_number": "…", "method": "…" }
  }
}
```

Illustration d'après le README du serveur GitHub.

::: sources
- [MCP, Tools (spécification)](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [GitHub MCP Server, README](https://github.com/github/github-mcp-server)
:::

::: notes
Forme d'une définition d'outil : `name`, `description`, `inputSchema` (JSON Schema), selon la spécification (réponse à `tools/list`). L'extrait est reconstitué : le README donne l'outil `issue_read`, sa description « Get issue details », ses paramètres obligatoires `owner`, `repo`, `issue_number`, `method`, et les méthodes `get`, `get_comments`, `get_sub_issues`, `get_parent`, `get_labels`.
Liste réelle relevée au rejeu. Claude Code : 46 outils `mcp__github__*` (dont `issue_read`, `issue_write`, `add_issue_comment`, `create_pull_request`, `list_issues`, `get_me`, `search_issues`). Open Code : `search` du mode code liste `list_issues`, `issue_read` (méthodes `get`, `get_comments`), `add_issue_comment`, `update_issue_comment`. `get_issue` (support d'origine) n'existe pas. `/mcp` et `/mcps` non rejoués (session interactive).
Autres outils du serveur utiles plus loin : `issue_write` (create, update), `add_issue_comment`, `create_pull_request`.
:::

## Un appel d'outil MCP {kicker="MCP"}

![Séquence : le harnais liste les outils du serveur MCP, le modèle choisit issue_read, le harnais appelle le serveur, le résultat revient dans la fenêtre de contexte](images/01-appel-mcp.svg)

Certains outils avertisent au-delà de 10 000 tokens de résultat et coupe à 25 000.

::: sources
- [MCP, Tools (spécification)](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [Claude Code, MCP](https://code.claude.com/docs/en/mcp)
:::

::: notes
Étapes 1 à 3, découverte : au démarrage de la session, le harnais envoie `tools/list` au serveur, qui répond avec les définitions (nom, description, `inputSchema`, slide précédente). Le harnais les met à disposition du modèle ; elles occupent la fenêtre de contexte avant tout appel (slide « Coût en fenêtre de contexte »). La spécification prévoit aussi la notification `notifications/tools/list_changed` quand la liste change en cours de session.
Étapes 4 à 7, appel : le modèle ne parle jamais au serveur. Il demande l'outil, le harnais envoie `tools/call`, le serveur répond, le texte du résultat est ajouté à la fenêtre de contexte.
Seuil de Claude Code : variable `MAX_MCP_OUTPUT_TOKENS` pour changer le plafond de 25 000 ; au-delà de 50 000 caractères un résultat texte est écrit dans un fichier (doc MCP). Open Code : aucun plafond de sortie dans le schéma de configuration (code v2.0.32, `equivalences.md`).
Spécification : les clients devraient demander une confirmation humaine pour les opérations sensibles ; c'est le rôle des permissions, deux slides plus loin.
:::

## Brancher un serveur MCP {.compare kicker="MCP"}

Le jeton d'accès authentifie l'agent de code auprès du serveur.

::: claude-code
```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
    }
  }
}
```
:::

::: opencode
```json
{
  "mcp": {
    "servers": {
      "github": {
        "type": "remote",
        "url": "https://api.githubcopilot.com/mcp/",
        "headers": { "Authorization": "Bearer {env:GITHUB_TOKEN}" }
      }
    }
  }
}
```
:::

::: sources
- [Claude Code, MCP](https://code.claude.com/docs/en/mcp)
- [Open Code, MCP servers](https://opencode.ai/v2/docs/mcp-servers/)
- [GitHub MCP Server, README](https://github.com/github/github-mcp-server)
:::

::: notes
Fichiers : `.mcp.json` (Claude Code), `opencode.json` (Open Code). Claude Code : forme équivalente en ligne de commande `claude mcp add --transport http github https://api.githubcopilot.com/mcp/ --header "Authorization: Bearer ..."` (écrit `.mcp.json` avec `--scope project` ; portée par défaut `local`). `${VAR}` développé dans `url` et `headers` ; variable absente sans défaut : chargement avec avertissement. Un serveur de `.mcp.json` demande une permission en session interactive ; en `claude -p`, aucune invite (doc headless).
Open Code v2 : `mcp.servers.<nom>` ; `{env:NOM}` substitué, `$NOM` non développé ; la doc interdit la clé `enabled` (ancienne forme v1 `mcp.github` du dépôt tickets-api à porter). Aucune approbation de serveur de projet.
Jeton : lu dans une variable d'environnement, jamais écrit dans le fichier ; ici un PAT GitHub dans `GITHUB_TOKEN`. À ne pas confondre avec le token de la fenêtre de contexte.
Observé : Claude Code accepte l'en-tête statique `Authorization` (`status: connected`, 46 outils) ; en `claude -p`, aucune permission demandée pour le serveur de projet, alors que `claude mcp list` affiche `Pending approval`. Open Code v2.0.32 accepte la forme, mais le processus d'arrière-plan (`opencode serve --service`) n'hérite pas de l'environnement du shell : `{env:GITHUB_TOKEN}` y est vide et la connexion échoue (HTTP 400, « Authorization header is badly formatted »). `opencode run --standalone` transmet l'environnement et la connexion réussit.
:::

## Permissions des outils MCP {.compare kicker="MCP"}

Les règles `allow`, `ask`, `deny` s'appliquent par outil ou par serveur.

::: claude-code
```jsonc
// .claude/settings.json
{
  "permissions": {
    "allow": ["mcp__github__issue_read"],
    "ask": [
      "mcp__github__issue_write",
      "mcp__github__add_issue_comment",
      "mcp__github__create_pull_request"
    ]
  }
}
```
:::

::: opencode
```jsonc
// opencode.json
{
  "permissions": [
    { "action": "github_*", "resource": "*", "effect": "ask" },
    { "action": "github_issue_read", "resource": "*", "effect": "allow" }
  ]
}
```
:::

::: sources
- [Claude Code, Permissions](https://code.claude.com/docs/en/permissions)
- [Open Code, MCP servers](https://opencode.ai/v2/docs/mcp-servers/)
- [Open Code, Permissions](https://opencode.ai/v2/docs/permissions/)
:::

::: notes
Claude Code : ordre deny, puis ask, puis allow (« Rules are evaluated in order: deny, then ask, then allow »). Un `ask` sur `mcp__github__*` l'emporterait donc sur l'`allow` de la lecture : l'exemple liste les outils d'écriture un par un.
Doc Claude Code : joker en `allow` seulement après `mcp__<serveur>__` ; `mcp__*` vaut en `deny` ou `ask`.
Open Code v2 : tableau ordonné, la dernière règle qui correspond l'emporte, donc la règle large d'abord, l'exception ensuite. Sans règle : `ask`. Nom d'outil `<serveur>_<outil>`.
Le support d'origine mettait `github_*: allow` : revu, la lecture seule est autorisée, le reste demande.
Rejeu Claude Code : avec le seul `issue_read` en `allow`, l'agent appelle d'abord `get_me` et `list_issues`, hors de l'`allow` : refusés en `claude -p`, invite de permission en séance interactive. Open Code : en mode code (outil `execute`), l'appel s'écrit `tools.github.issue_read` ; les règles de permission gardent la forme `github_issue_read` (doc). Avec `--auto`, aucune invite n'est apparue pour les règles `ask` ; leur comportement en session interactive n'est pas rejoué.
:::

## MCP ou ligne de commande {kicker="MCP"}

`gh` est le client GitHub en ligne de commande.

| Critère | Serveur MCP | `gh` |
|---|---|---|
| Coût fixe en fenêtre | noms ou descriptions d'outils | aucun |
| Permissions | par outil | par commande, `Bash(gh issue view *)` |
| Résultat | structuré par le serveur | texte de la commande |
| À choisir quand | aucune commande n'existe | une commande suffit |

::: sources
- [Claude Code, MCP](https://code.claude.com/docs/en/mcp)
- [Claude Code, Permissions](https://code.claude.com/docs/en/permissions)
- [GitHub CLI, gh issue view](https://cli.github.com/manual/gh_issue_view)
:::

::: notes
Réponse à la question probable : « pourquoi un serveur MCP si `gh issue view --comments` existe ? » Pour lire une issue, `gh` suffit et coûte moins en contexte. Le serveur MCP apporte des outils sans équivalent en ligne de commande installé, ou des permissions plus fines par outil.
Comparaison du support (coût fixe, résultat structuré, À choisir quand) : pas une source externe. Règle de permission `Bash(gh issue view *)` : syntaxe `Bash(préfixe *)` de la doc Claude Code (le joker après une espace fait un préfixe).
Le dernier mot reste à la tâche : la grille de choix finale reprend ce critère.
:::

## Quelques serveurs MCP {kicker="MCP"}

Il existe des centaines de serveurs MCP, voire des milliers. Quatre exemples.

| Serveur | Éditeur | Ce qu'il permet |
|---|---|---|
| GitHub | GitHub | lire et écrire issues et pull requests |
| Playwright | Microsoft | naviguer, cliquer, capturer dans un navigateur |
| Context7 | Upstash | consulter la documentation à jour d'une bibliothèque |
| Sentry | Sentry (service connecté) | chercher des erreurs et analyser des performances |

::: sources
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Context7](https://github.com/upstash/context7)
- [Sentry MCP](https://mcp.sentry.dev/)
:::

::: notes
Quatre exemples parmi des centaines de serveurs MCP, voire des milliers (aucun recensement sourcé : le chiffre est un ordre de grandeur, à revérifier). URL distantes lues le 25 octobre 2026 : GitHub `https://api.githubcopilot.com/mcp/`, Context7 `https://mcp.context7.com/mcp` (clé d'API en en-tête `Authorization: Bearer`), Sentry `https://mcp.sentry.dev/mcp` (OAuth à la première connexion).
Outils Context7 : `resolve-library-id`, `query-docs`. Sentry : la page ne nomme pas d'éditeur explicitement (domaine sentry.dev) : d'où « service connecté ».
Les autres serveurs existent : le support n'en cite pas davantage.
:::

## Démonstration 1 : créer des issues par MCP {kicker="MCP"}

Un serveur MCP crée une issue par test en échec. Étapes : section Démonstrations, en fin de module.

::: notes
Démonstration 1, branche `fix/ticket-ferme-commentaires`. Ouvre la série : la suivante isole la lecture dans un sous-agent.
Relevé du 25 octobre 2026 avec l'ancien prompt (lecture d'une issue), non interactif, à refaire avec le prompt de création. Claude Code : 16 s, 5 tours, 0,079 USD ; fenêtre de 26,9k à 41,0k tokens (chiffres du poste, serveurs MCP et skills personnels compris). Open Code avec `--standalone` : 19 s, 7 étapes, 0,085 USD ; entrée par étape de 12 146 à 21 794 tokens.
Premier essai Claude Code écarté : le prompt ne donnait ni dépôt ni numéro, l'agent appelait `get_me` et `list_issues`, hors de l'`allow` (38 s, 0,25 USD). Open Code sans `--standalone` : jeton absent du processus d'arrière-plan, lecture de l'issue par `curl` en 12 s.
:::

## Un serveur MCP ajoute à l'agent de code des outils soumis aux permissions. {.statement kicker="MCP"}

::: notes
Conclut la section : définition, outil, appel, branchement, permissions, coût, comparaison avec `gh`, démonstration.
Transition : l'information entre maintenant, mais la fenêtre se remplit. Section suivante : isoler la lecture.
:::

## Définition d'un sous-agent {kicker="Sous-agents"}

![Deux fenêtres : le prompt descend de l'agent principal au sous-agent, le rapport remonte](images/01-sous-agent.svg)

Un sous-agent est un agent lancé par l'agent principal, l'agent de code qui reçoit la tâche. Seul son rapport revient.

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Doc Claude Code : « Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions » ; il « returns only the summary ». Open Code : le sous-agent s'exécute dans une session enfant au contexte neuf, par l'outil `subagent`.
Lexique : « agent principal » et « sous-agent », pas « agent parent » ni « agent enfant ».
:::

## Déclarer un sous-agent {.compare kicker="Sous-agents"}

Un fichier Markdown déclare le sous-agent : un en-tête de configuration, puis ses instructions fixes.

::: claude-code
```markdown
---
name: explorateur
description: Explore un périmètre du dépôt en lecture seule
tools: Read, Grep, Glob
---

Tu explores le dépôt, tu ne modifies rien, dix lignes au plus.
```
:::

::: opencode
```markdown
---
description: Explore un périmètre du dépôt en lecture seule
mode: subagent
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
---

Tu explores le dépôt, tu ne modifies rien, dix lignes au plus.
```
:::

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Fichiers : `.claude/agents/explorateur.md` (Claude Code), `.opencode/agents/explorateur.md` (Open Code). Extraits abrégés des fichiers de tickets-api (instructions fixes raccourcies : les vraies demandent aussi la forme du rapport en trois points). Claude Code : seuls `name` et `description` sont requis ; `tools` est une liste blanche ; `maxTurns` borne les tours du sous-agent.
Open Code v2 : le frontmatter reprend les champs de l'entrée de configuration `agents` ; `mode: subagent` ; `steps` est le nombre maximal d'étapes du modèle (à la dernière, les outils sont retirés et le modèle résume) ; les permissions sont dans `permissions`, il n'y a pas de champ `tools` en v2. Les fichiers actuels de tickets-api utilisent la forme v1 (`permission:` avec `edit: deny`) acceptée et migrée ; `opencode debug agents` la décode au rejeu (`mode: subagent`, `steps: 25`, refus de `edit`, `shell`, `webfetch`, `subagent`).
Invocation : Claude Code, en langage naturel (fonctionne) ou `@"explorateur (agent)"` (en `-p`, texte du prompt, l'agent lance bien `Agent` avec `subagent_type: explorateur` ; la mention interactive n'est pas vérifiée) ; Open Code, le modèle choisit d'après `description` et appelle l'outil `subagent` (`agent: "explorateur"`).
Le fichier réel fixe aussi `model: claude-sonnet-5-5` et 25 tours (`maxTurns`, `steps`), omis de l'extrait. Identifiant complet accepté : les six messages du sous-agent portent `claude-sonnet-5-5` (Claude Code) ; Open Code l'exécute sur `amazon-bedrock/eu.anthropic.claude-sonnet-5-5`.
Lecture seule : Claude Code, `tools` est une liste blanche, `disallowedTools` une liste noire appliquée d'abord ; les sous-agents intégrés Explore et Plan sont en lecture seule. Open Code : exemple « reviewer » de la doc, qui refuse `edit` et `shell` sur `*`. Intérêt : un sous-agent qui ne peut rien écrire ne corrompt rien pendant qu'il lit.
Rejeu sous Linux (Claude Code 2.1.310) : avec `tools: Read, Grep, Glob`, le sous-agent appelle `Grep` (2 fois), `Glob` (1) et `Read` (3), aucun `Bash`. Open Code : `grep`, `glob`, `read` ×3.
:::

## Le rapport remplace les fichiers lus {kicker="Sous-agents"}

| Mesure | Claude Code | Open Code |
|---|---|---|
| Tokens lus par le sous-agent | 15 017 | 38 335 |
| Tokens reçus par l'agent principal | environ 1,2k | environ 640 |

::: notes
Le sous-agent lit beaucoup de fichiers dans sa propre fenêtre et ne renvoie qu'un rapport d'une dizaine de lignes. Chiffres du rejeu de la démonstration suivante : tokens consommés par la session du sous-agent, tokens ajoutés à la fenêtre principale.
Méthode. Claude Code : `subagent_tokens` du harnais pour le sous-agent (6 outils, 18,9 s) ; contexte de l'agent principal de 32 397 à 33 575 tokens entre le premier et le dernier message, rapport compris (`/context` impossible en `-p`, la session se termine). Open Code : `opencode session export` de la session enfant (3 étapes, 38 335 tokens dont 23 365 lus en cache, 0,083 USD) ; fenêtre de l'agent principal de 12 146 à 12 790 tokens. Un seul passage par outil, rapports de 15 et 18 lignes au lieu de dix.
:::

## Démonstration 2 : déléguer à un sous-agent explorateur {kicker="Sous-agents"}

Un sous-agent explore le code et rend dix lignes. Étapes : section Démonstrations, en fin de module.

::: notes
Démonstration 2, branche `fix/ticket-ferme-commentaires`, la même que la démonstration 1. La suivante passe à l'orchestrateur sur `main`.
Relevé du 25 octobre 2026 avec l'ancien prompt (lecture d'une issue), non interactif, à refaire avec le prompt de création. Claude Code : 29 s, 0,22 USD, rapport de 15 lignes dont une phrase contradictoire ; sous-agent : 15 017 tokens lus (6 outils, 18,9 s), environ 1,2k reçus par l'agent principal (contexte de 32 397 à 33 575). Open Code : 13 s, 0,022 USD côté agent principal et 0,083 USD pour la session enfant, rapport de 18 lignes dont un fichier cité comme lu sans avoir été ouvert ; environ 38 000 tokens dont 23 365 en cache pour la session enfant, environ 640 reçus par l'agent principal.
Historique du prompt : avec « tel quel », l'agent principal a reformulé le rapport dans les deux outils ; dix lignes dépassées par les deux. Le prompt actuel n'a pas été rejoué.
:::

## Un sous-agent isole la lecture et ne renvoie que ce qui sert. {.statement kicker="Sous-agents"}

::: notes
Conclut la section : définition, fichier, lecture seule, rapport, démonstration.
Transition : un seul sous-agent explore ; plusieurs, avec des rôles différents, forment un orchestrateur.
:::

## Définition d'un orchestrateur {kicker="Orchestrateur"}

![Un orchestrateur au centre, quatre sous-agents autour : explorateur, testeur, implementeur, verificateur](images/01-orchestrateur.svg)

Un orchestrateur est un agent qui découpe une tâche, la délègue à des sous-agents et fait converger leurs rapports.

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents](https://opencode.ai/v2/docs/agents/)
:::

::: notes
L'orchestrateur ne modifie rien lui-même : seuls ses sous-agents écrivent. Il tourne comme agent principal de la session : `claude --agent orchestrateur` (cli-reference) ; Open Code, agent `mode: primary` (`default_agent` ou `--agent`).
Le terme « graphe dynamique » du support d'origine est abandonné.
Restriction des sous-agents lançables : Claude Code `tools: Agent(explorateur, testeur, implementeur, verificateur)` dans la définition de l'agent principal (valable seulement quand l'agent tourne comme fil principal) ; Open Code, règle `subagent` de `permissions`.
:::

## Les sous-agents de tickets-api {kicker="Orchestrateur"}

| Sous-agent | Rôle | Permissions |
|---|---|---|
| explorateur | explorer | lire |
| testeur | écrire les tests | écrire dans `tests/` |
| implementeur | écrire le code | écrire hors de `tests/` |
| verificateur | contrôler un critère | lire, lancer les tests |

::: sources
- Dépôt tickets-api du formateur, `.claude/agents/` et `.opencode/agents/`
:::

::: notes
Source lue dans le dépôt : testeur, hook `PreToolUse` `guard-path.sh only-tests` (Claude Code) ou règle `edit` sur `tests/**` (Open Code, forme v1 du dépôt) ; implementeur, hook `deny-tests` qui refuse `tests/`, `.github/`, `.claude/`, `.opencode/` ; verificateur, `Read, Grep, Glob, Bash` (Claude Code), `make test`, `make lint`, `uv run pytest`, `uv run ruff`, `git diff` et `git status` (Open Code).
Chaque sous-agent a une seule responsabilité et ses permissions : une permission d'écriture par rôle, pas de sous-agent qui écrit partout.
Le hook de périmètre est du module 3 ; ici on montre seulement les permissions.
:::

## Les étapes de l'orchestrateur {kicker="Orchestrateur"}

![Cinq étapes : trois explorateurs en parallèle, un testeur, un implementeur, trois verificateurs, puis le rapport](images/01-etapes-orchestrateur.svg)

Les cinq étapes sont écrites dans les instructions fixes de l'orchestrateur.

::: sources
- Dépôt tickets-api du formateur, `.claude/agents/orchestrateur.md` et `.opencode/agents/orchestrateur.md`
:::

::: notes
Lecture du fichier : étape 1 trois `explorateur` dans le même tour (périmètres `domain/` et `application/`, `adapters/`, `tests/`) ; étape 2 `testeur` écrit les tests rouges ; étape 3 `implementeur` rend `make test` et `make lint` verts ; étape 4 trois `verificateur`, un critère chacun ; un finding repart à `implementeur` puis les trois vérificateurs relancent, trois passages au plus ; étape 5 rapport en français.
Les tests sont écrits avant le code : le testeur n'a pas vu l'implémentation.
Extrait des instructions fixes de l'orchestrateur, étape 1 (abrégé) : « Lance dans le même tour trois explorateurs, chacun sur un périmètre. »
Claude Code : 20 sous-agents simultanés au plus par défaut ; au vingtième sous-agent en cours, un nouveau lancement échoue avec « Concurrent subagent limit reached » ; variable `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`. La page cite en exemple « in parallel using separate subagents ».
Open Code : la doc des agents ne décrit pas le parallélisme (sessions enfants en arrière-plan seulement). Observé : trois appels `subagent` dans le même tour sont lancés ensemble (`background: true`, créés à 0, 2 et 3 s). Sonde hors démonstration de douze sous-agents dans le même message : dix sessions simultanées, deux jamais démarrées après plus de deux minutes ; plafond de dix actifs, aucun réglage documenté trouvé. Jamais deux `opencode run` en parallèle.
Claude Code, rejeu : les trois explorateurs et chaque série de trois vérificateurs partent dans le même message (parallélisme effectif).
L'orchestrateur réel déclare aussi `Read` et `Bash` dans ses outils ; « ne modifie rien lui-même » est une instruction du prompt, non une restriction d'outils.
:::

## Le coût d'un orchestrateur {kicker="Orchestrateur"}

| Mesure | Claude Code | Open Code |
|---|---|---|
| Sous-agents lancés | 18 | 11 |
| Coût | 4,49 USD | 2,40 USD |
| Durée | 18 min | 6 min |

::: notes
Spécification 002, un passage par outil. Claude Code : 17:14:56 à 17:33:05, 96,7k tokens en sortie, 4,87 M en cache lu ; le plafond de 5 USD fixé à l'appel est presque atteint. Open Code : 357 s de session, orchestrateur 0,420 USD et sous-agents 1,979 USD ; le plus lourd, un implementeur de relance, 1,09 million de tokens. Un agent de code seul sur la même tâche n'a pas été mesuré : aucune comparaison chiffrée avec l'orchestrateur.
Chaque sous-agent facture ses instructions fixes (corps du fichier d'agent, fichier de contexte, état git) et son rapport : un orchestrateur coûte plus qu'un agent de code seul sur une tâche courte. Doc Claude Code : le sous-agent démarre avec un contexte neuf (prompt système, message de tâche, `CLAUDE.md`, état git).
Mesures : coût total du JSON de `claude -p` (Claude Code) ; `opencode session export` des sessions enfants (Open Code). Même tâche, deux exécutions, sur deux copies de travail. Les deux sorties ne se comparent pas strictement : 71 tests et 13 fichiers d'un côté, 70 tests et 11 fichiers de l'autre.
:::

## Quatre dérives d'un orchestrateur {kicker="Orchestrateur"}

Une dérive est un écart de comportement de l'agent de code que le garde-fou corrige.

| Dérive | Garde-fou |
|---|---|
| coût | `maxTurns` ou `steps` par sous-agent |
| redondance | un dossier par explorateur |
| contradiction | un critère par vérificateur |
| imbrication | un sous-agent ne lance pas de sous-agent |

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Coût : `maxTurns` (frontmatter Claude Code) ou `steps` (Open Code). Redondance : deux explorateurs sur le même dossier lisent deux fois la même chose, d'où le découpage par dossier de l'étape 1. Contradiction : deux vérificateurs sur le même critère peuvent se contredire, d'où un critère chacun.
Imbrication (un sous-agent qui lance un sous-agent) : Claude Code autorise trois niveaux sous le fil principal d'après la doc (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`, `1` coupe l'imbrication). Rejeu hors démonstration, avec un agent `imbriqueur` (`tools: Agent, Read`) : par défaut il lance l'explorateur et en reçoit le rapport (deux niveaux, 0,22 USD) ; avec `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` il n'appelle plus `Agent` et lit le fichier lui-même (0,08 USD). Le troisième niveau n'a pas été joué. L'orchestrateur réel n'imbrique rien : les 18 appels viennent du fil principal.
Open Code v2.0.32 : imbrication refusée par défaut. Message exact du rejeu : « Subagent depth limit reached (1). Increase "experimental.subagent_depth" to allow nested subagents. » Réglage : `experimental.subagent_depth`. La doc des agents d'Open Code ne chiffre pas la profondeur : la valeur vient du comportement observé.
Définition de « dérive » : celle du support, pas une source externe.
:::

## Démonstration 3 : livrer une spécification avec un orchestrateur {kicker="Orchestrateur"}

Un orchestrateur livre la spécification 002. Étapes : section Démonstrations, en fin de module.

::: notes
Démonstration 3, branche `main` (spécification 002 écrite, code absent). La suivante repart de la branche `fix/ticket-ferme-commentaires` avec une base de test remise à zéro.
Relevé du 25 octobre 2026. Claude Code (`claude -p`) : 18 appels `Agent` (5 explorateurs, 3 testeurs, 4 implementeurs, 6 verificateurs), tous depuis le fil principal ; testeur (30 tours) et implementeur (40 tours) à leur limite au premier passage ; findings sur le lint, sur deux tests de la spécification 001 cassés, puis sur le scénario 8 ; 71 tests verts, 13 fichiers, 18 min, 4,49 USD ; le compte rendu annonce trois passes de vérification, deux observées. Open Code (`opencode run --agent orchestrateur`) : main rendue après 16 s, orchestration terminée après 357 s ; 11 sous-agents, 70 tests verts, 11 fichiers, 2,40 USD ; le compte rendu annonce 26 tests ajoutés, 33 réellement. Annoncer « 70 ou 71 tests » et « 11 ou 13 fichiers ».
La branche livrée de référence compte 61 tests et douze fichiers. Imbrication : voir la slide des dérives.
:::

## Un orchestrateur répartit le travail et ne garde que les rapports. {.statement kicker="Orchestrateur"}

::: notes
Conclut la section : définition, permissions, étapes, parallélisme, coût, dérives, démonstration.
Transition : une exécution unique, avec des sous-agents. Reste l'arrêt prématuré : la section Boucles.
:::

## Des tâches toujours plus longues {.facts kicker="Boucles"}

- **Tous les 131 jours, la durée des tâches double** on confie à l'agent de code des tâches de plus en plus complexes
- **Mais leur taux de réussite est de 50 %** une tâche longue sur deux n'est pas menée à bien en une seule exécution

::: sources
- [METR, Time Horizon 1.1 (29 janvier 2026)](https://metr.org/blog/2026-01-29-time-horizon-1-1/)
- [METR, Measuring AI Ability to Complete Long Tasks](https://arxiv.org/abs/2503.14499)
:::

::: notes
Terme de l'étude : « horizon de tâche », durée humaine d'une tâche qu'un modèle mène à bien avec 50 % de réussite (définition de l'article d'origine, arXiv 2503.14499, non du billet 1.1). Source : METR, Time Horizon 1.1, 29 janvier 2026. Doublement post-2023 : 130,8 jours, intervalle [107, 161] (tableau d'annexe), « 131 jours » dans le texte, contre 165 jours pour la version 1.
À dire : tous les 131 jours, la durée des tâches qu'un modèle sait faire double, donc on lui confie des tâches de plus en plus complexes. Mais le taux de réussite est de 50 % : une fois sur deux, la tâche n'aboutit pas. Il faut une commande qui dise quand c'est fini : c'est la section suivante.
Réserves : la mesure dépend de la composition des tâches ; la page `metr.org/time-horizons` précise ne plus être mise à jour (8 septembre 2026).
:::

## Un critère vérifiable {kicker="Boucles"}

Un critère vérifiable est une commande dont le code de retour (0 si elle réussit) dit si le travail est fini.

| Critère | Commande |
|---|---|
| tests | `make test` |
| style | `make lint` |
| format | `uv run ruff format --check .` |

::: notes
Code de retour 0 : fini ; autre valeur : pas fini. `make test` lance `uv run pytest`, `make lint` lance `uv run ruff check .` et `uv run ruff format --check .` (Makefile de tickets-api).
Dans un dépôt compilé, la compilation (code de retour du compilateur) serait un troisième critère.
Un critère se choisit avant de lancer la boucle ; le tableau n'est pas exhaustif.
:::

## Définition d'une boucle {kicker="Boucles"}

![L'agent de code corrige, le critère vérifiable rend un code ; 0 termine la boucle, sinon une relance](images/01-boucle.svg)

Une boucle relance l'agent de code tant qu'un critère vérifiable n'est pas satisfait. Chaque nouvel appel est une relance.

::: sources
- [Claude Code, /goal](https://code.claude.com/docs/en/goal)
- [Claude Code, Headless](https://code.claude.com/docs/en/headless)
:::

::: notes
Un agent de code seul s'arrête quand il estime avoir fini. La boucle déplace la décision de fin sur une commande.
Doc `/goal` : « completion is decided by a fresh model rather than the one doing the work » : même idée, avec un juge modèle plutôt qu'une commande. Voir la slide « Une boucle par commande ».
:::

## Une boucle par commande {.compare kicker="Boucles"}

Une commande personnalisée est un prompt enregistré dans un fichier du dépôt, lancé par /nom. Celle-ci relance l'agent de code jusqu'à la réussite des tests.

::: claude-code
`.claude/commands/fix-until-green.md`

```markdown
---
allowed-tools: Bash(make test *)
---

Objectif : $ARGUMENTS

Relance `make test` après chaque correction, cinq fois au plus.
```
:::

::: opencode
`.opencode/commands/fix-until-green.md`

```markdown
---
agent: implementeur
---

Objectif : $ARGUMENTS

Relance `make test` après chaque correction, cinq fois au plus.
```
:::

::: sources
- [Claude Code, Skills (commandes)](https://code.claude.com/docs/en/skills)
- [Claude Code, /goal](https://code.claude.com/docs/en/goal)
- [Open Code, Commands (v2, page relevée le 25 octobre 2026)](https://opencode.ai/v2/docs/commands/)
:::

::: notes
Extraits abrégés des fichiers de tickets-api (le vrai fichier injecte aussi `!`make test | tail -40``, la sortie des tests, dans le prompt). La commande est un prompt : le nombre maximal de relances (cinq) est une instruction du prompt que le modèle suit, donc un garde-fou faible ; la section Garde-fous le complète.
Claude Code : `/goal <condition>` boucle jusqu'à ce qu'un petit modèle juge la condition satisfaite après chaque tour ; fonctionne en `claude -p` ; se borne par une clause (« or stop after 20 turns »). Exemple : `/goal make test réussit ou stop after 20 turns`. Le juge ne lance pas de commande : il lit ce que l'agent a montré dans la conversation.
Open Code : aucune commande équivalente à `/goal` documentée ; `opencode run` envoie le message tel quel sans développer `/commande` (équivalences). Au rejeu, l'agent lit lui-même `.opencode/commands/fix-until-green.md` avec `read` et suit le texte, sans l'`agent: implementeur` du frontmatter. Le développement natif se joue en session interactive. Claude Code développe la commande en `claude -p`.
:::

## Une boucle par script {.compare kicker="Boucles"}

Un script shell relance l'agent de code en mode non interactif, sans session ouverte : un prompt en entrée, le résultat en sortie.

```bash
for i in $(seq 1 "$max"); do
  make test >/dev/null 2>&1 && exit 0
  # relance de l'agent de code
done
```

::: claude-code
```bash
claude -p --agent implementeur --permission-mode acceptEdits "$objectif"
```
:::

::: opencode
```bash
opencode run --agent implementeur "$objectif"
```
:::

::: sources
- [Claude Code, Headless](https://code.claude.com/docs/en/headless)
- [Claude Code, CLI reference](https://code.claude.com/docs/en/cli-reference)
- Open Code v2.0.32, sortie de `opencode run --help`
:::

::: notes
Squelette tiré de `scripts/loop.sh` de tickets-api (version Open Code : `opencode run --agent implementeur "..."` avec la sortie de `make test` dans le prompt). Le critère est dans le script, pas dans le prompt.
Variante Claude Code : écrite pour ce support, non rejouée (le rejeu a lancé la commande `/fix-until-green`, non ce script). En `claude -p` sans mode de permission, une action qui demande une permission est refusée (v2.1.302 et suivantes) : d'où `--permission-mode acceptEdits` ; `Bash` demande aussi une règle `allow` (`make test` déjà dans `.claude/settings.json`).
Open Code : `opencode run --help` (v2.0.32) liste `--agent` et `--auto`, sans option de tours ni de budget (la page CLI v2 ne documente aucun drapeau de `run`). `opencode run` rejette d'office toute action `ask` (« This non-interactive run cannot ask the user for permission ») ; `--auto` approuve tout sauf `deny`.
:::

## Airbnb : migration de tests {.figures kicker="Boucles"}

- **3 500** fichiers de tests
- **6 semaines** pour tout migrer
- **97 %** migrés par automatisation

Chaque étape est validée par un critère vérifiable, relancée jusqu'à la réussite ou jusqu'au nombre maximal de relances.

::: sources
- [Airbnb Tech Blog, Accelerating Large-Scale Test Migration with LLMs](https://airbnb.tech/?p=366)
:::

::: notes
Source primaire consultée le 25 octobre 2026. Citations : « nearly 3.5K React component test files » migrés d'Enzyme vers React Testing Library ; « we finished the entire migration in just 6 weeks » ; fichiers passés « from 75% to 97% » par l'automatisation ; « retry steps multiple times until they passed or we reached a limit » ; « moving the file to the next state only after validation on the previous state passed ». Les 3 % restants : traités hors automatisation.
Date de publication : la page ne la porte pas dans son texte (courant 2025, mars selon la presse spécialisée). Méthode : relances avec le dernier état du fichier et les erreurs de validation.
:::

## Ce que reçoit chaque relance {kicker="Boucles"}

![Une étape Airbnb : l'agent corrige, la vérification rend un verdict ; en cas d'échec, relance avec les erreurs et le fichier à jour](images/01-relance-airbnb.svg)

L'agent corrige à partir de l'échec, sans repartir de zéro. La boucle s'arrête à la réussite ou au nombre maximal de relances.

::: sources
- [Airbnb Tech Blog, Accelerating Large-Scale Test Migration with LLMs](https://airbnb.tech/infrastructure/accelerating-large-scale-test-migration-with-llms/)
:::

::: notes
Source consultée le 27 octobre 2026. Chaque fichier traverse des étapes dans l'ordre : conversion, Jest, lint et tsc, terminé. Un fichier avance seulement quand la vérification de son étape passe ; les fichiers sont indépendants, donc traités en parallèle, et une étape se rejoue seule.
À chaque relance, le prompt est reconstruit avec les erreurs de la vérification qui vient d'échouer et la dernière version du fichier. Nombre maximal de relances réglable. Fichiers simples ou moyens : quelques relances, la plupart avant 10.
D'après l'article, relancer a mieux marché que peaufiner le prompt (« brute force »). Les fichiers complexes ont reçu un contexte enrichi (40 000 à 100 000 tokens : composant, test, erreurs, tests voisins du dossier, exemples) ; ce qui a compté le plus : choisir les bons fichiers voisins.
Chiffres de la campagne : environ 75 % des fichiers migrés au premier passage (4 heures), 97 % après quatre jours de cycles « échantillonner 5 à 10 fichiers, ajuster, relancer tout ». Fichiers restants (moins de 100, certains relancés 50 à 100 fois) : corrigés à la main en une semaine environ.
Lecture pour le module : le critère décide de la fin, l'erreur renvoyée guide la relance, la limite évite la boucle sans fin (section Garde-fous). Un script reproduit le schéma : il reconstruit le prompt à chaque tour, car chaque appel `claude -p` repart d'une session vide.
:::

## Le code de retour d'une commande remplace l'avis du modèle sur la fin. {.statement kicker="Boucles"}

::: notes
Conclut la section : horizon de tâche, critère, définition, commande, script, cas Airbnb, contenu d'une relance.
Transition : une boucle sans nombre maximal de relances peut tourner longtemps ou contourner son critère. Section suivante.
:::

## Définition d'un garde-fou {kicker="Garde-fous"}

![Une boucle entourée de quatre garde-fous : relances, coût, délai, fichiers](images/01-garde-fou.svg)

Un garde-fou est une limite posée hors du modèle, qui arrête ou borne l'agent de code.

::: sources
- [Claude Code, Permissions](https://code.claude.com/docs/en/permissions)
- [Open Code, Agents](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Hors du modèle : appliqué par le harnais, le script ou le système, pas demandé dans un prompt. Un nombre maximal de relances écrit dans une commande est une instruction du prompt ; le même nombre compté par le script est un garde-fou.
Quatre familles du schéma : nombre de relances, coût, délai, fichiers autorisés.
:::

## Trois dérives d'une boucle {kicker="Garde-fous"}

| Dérive | Garde-fou |
|---|---|
| relances sans fin | `for` borné + `--max-turns` par appel |
| fin décidée par le modèle | critère vérifiable |
| tests contournés | écriture interdite dans `tests/` |

::: sources
- [Claude Code, /goal](https://code.claude.com/docs/en/goal)
- [Claude Code, CLI reference](https://code.claude.com/docs/en/cli-reference)
:::

::: notes
Sans critère vérifiable, l'agent de code « stops when it judges the work done » (doc `/goal`) : le modèle décide de sa fin. Avec `/goal`, un modèle distinct juge la condition après chaque tour ; avec une commande, le code de retour tranche.
Relances sans fin : un `for` borné dans le script, `--max-turns` sur chaque appel (Claude Code) ; Open Code : `steps` et `timeout`, slide suivante. Tests contournés : la règle de refus est définie deux slides plus loin.
:::

## Limiter un appel {.compare kicker="Garde-fous"}

Chaque appel de l'agent de code se limite par ses propres options.

::: claude-code
```bash
claude -p --max-turns 20 --max-budget-usd 2 "$objectif"
```
:::

::: opencode
`.opencode/agents/implementeur.md`

```yaml
steps: 40
```

```bash
timeout 600 opencode run --agent implementeur "$objectif"
```
:::

::: sources
- [Claude Code, CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Open Code, Agents](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Claude Code : `--max-turns` et `--max-budget-usd` (mode `-p` seulement). Au plafond : sortie 1, JSON `is_error: true`, `subtype` `error_max_turns` ou `error_max_budget_usd`. Relevé du poste : `--max-turns 1` a produit `num_turns: 2`, et un plafond de 0,0001 $ a été dépassé (0,044 $) : le plafond n'est pas exact (doc : « leave headroom »). Sous-agents comptés dans le budget.
Open Code v2.0.32 : aucune option de tours, de budget ni de délai dans `opencode run --help`. `steps` limite les étapes d'un agent ; le délai se pose à l'extérieur (`timeout`, commande système). Le coût s'observe après coup : `--format json` donne les tokens par `step_finish` pour la session principale, `opencode session export <id>` le `cost` et les tokens des sessions enfants (relevé au rejeu : 0,22 USD pour la boucle).
:::

## Un test désactivé masque l'échec {kicker="Garde-fous"}

Un diff liste les lignes ajoutées et retirées d'un fichier.

```diff
--- a/tests/unit/test_add_comment.py
+++ b/tests/unit/test_add_comment.py
+@pytest.mark.skip(reason="à revoir")
 def test_add_comment_refuses_closed_ticket():
```

Illustration : `make test` compte le test à part, sans échec.

::: sources
- [pytest, Skipping tests](https://docs.pytest.org/en/stable/how-to/skipping.html)
:::

::: notes
Diff inventé (illustration). Doc pytest : « pytest counts and lists skip and xfail tests separately » : un test ignoré n'est pas un échec.
Aucune tentative de modifier ou de désactiver les tests aux deux rejeux : pas de diff réel, la slide reste sur l'illustration.
Contournements du même ordre : suppression du test, assertion affaiblie, `make test` remplacé.
:::

## Protéger les tests {.compare kicker="Garde-fous"}

Une règle de refus interdit à l'agent de code de modifier les tests.

::: claude-code
`.claude/settings.json`

```json
{
  "permissions": {
    "deny": ["Edit(tests/**)"]
  }
}
```
:::

::: opencode
`.opencode/agents/implementeur.md`

```yaml
permissions:
  - { action: edit, resource: "*", effect: allow }
  - { action: edit, resource: "tests/*", effect: deny }
```
:::

::: sources
- [Claude Code, Permissions](https://code.claude.com/docs/en/permissions)
- [Open Code, Permissions](https://opencode.ai/v2/docs/permissions/)
:::

::: notes
Claude Code : les règles `Edit` s'appliquent à tous les outils intégrés qui modifient des fichiers ; `Write(...)` en règle de chemin ne correspond jamais. Chemin sans préfixe : relatif au répertoire courant, syntaxe gitignore. Une règle `deny` prime sur `allow`. Limite à dire : un `sed -i tests/...` par `Bash` n'est pas couvert par `Edit` ; ajouter une règle `Bash` ou un hook (module 3). Le dépôt tickets-api garde un hook `PreToolUse` pour l'implementeur.
Attention : la règle globale bloque aussi le testeur de l'orchestrateur ; dans la démonstration de la boucle, seul l'implementeur travaille.
Open Code v2 : dernière règle correspondante gagnante, règle large d'abord. Le joker `*` couvre aussi `/` (doc Permissions) : `tests/*` suffit. Sondes du rejeu : `tests/*` et `tests/**` refusent tous deux `tests/unit/test_ticket.py`, `tests/integration/test_comments_api.py` et `tests/__init__.py` (`Permission denied: edit`) ; l'outil `write` relève de l'action `edit` ; `--auto` n'écarte pas les `deny`. Les fichiers du dépôt sont en forme v1 (`edit: "tests/**": deny`), migrée.
Rejeu Claude Code : un `Edit` sur `tests/unit/test_ticket.py` est refusé (« File is in a directory that is denied by your permission settings »), même en `-p` dans un dépôt non approuvé ; les règles `allow` du dépôt sont en revanche ignorées tant qu'il n'est pas approuvé. Via l'implementeur et `Bash(sed *)`, le sous-agent a refusé de lui-même de modifier `tests/` : le contournement `sed -i` n'a pas été démontré.
:::

## La relecture humaine reste nécessaire {kicker="Garde-fous"}

| Garde-fou | Mesure | Ne mesure pas |
|---|---|---|
| critère vérifiable | les tests passent | l'intention du correctif |
| règle de refus sur `tests/` | tests intacts | l'intention du correctif |
| nombre maximal de relances | durée de la boucle | l'intention du correctif |
| relecture du diff | tout ce que les autres omettent | ce que le diff ne montre pas |

::: notes
Le code de retour mesure la réussite des tests ; la relecture du diff mesure le reste (nommage, périmètre, effets de bord). Le garde-fou ne remplace pas la revue : le module 2 la traite.
Dernière ligne : la relecture couvre ce que les trois autres garde-fous omettent.
:::

## Démonstration 4 : boucle de correction sous garde-fous {kicker="Garde-fous"}

Une commande boucle jusqu'à des tests verts. Étapes : section Démonstrations, en fin de module.

::: notes
Démonstration 4, branche `fix/ticket-ferme-commentaires` (deux tests rouges). Suit la démonstration 3 : la base de test est remise à zéro avant. La suivante change de sujet, l'interface web.
Relevé du 25 octobre 2026 avec l'ancien prompt (lecture d'une issue), non interactif, à refaire avec le prompt de création. Claude Code : 42 s, 0,29 USD, une relance, pas d'échec persistant à montrer ; correctif de trois lignes dans `src/tickets/domain/ticket.py`, sans la méthode `ensure_accepts_comments` de la branche corrigée. Open Code : 43 s, 0,22 USD (agent principal 0,049, sous-agent 0,172), même diff limité à `ticket.py` ; le shell du sous-agent refuse `cd <chemin> && make test`, c'est l'agent principal qui lance `make test`. Aucune tentative de contourner les tests dans les deux outils.
Premier essai écarté : base de test contaminée par la démonstration 3, l'agent avait réécrit une migration.
:::

## Un script ou le harnais arrête l'agent de code sans le consulter. {.statement kicker="Garde-fous"}

::: notes
Conclut la section : définition, dérives, options par appel, test désactivé, protection des tests, relecture.
Transition : jusqu'ici la boucle est une commande ou un script shell. Un programme peut aussi piloter l'agent de code : le SDK.
:::

## Définition d'un SDK {kicker="SDK"}

![Un programme appelle le SDK, qui pilote l'agent de code](images/01-sdk.svg)

Le programme décide quand lancer l'agent de code et lit sa réponse.

::: sources
- [Claude Code, Agent SDK quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart)
- [Open Code, README du SDK (v2.0.32)](https://github.com/anomalyco/opencode/blob/v2.0.32/packages/sdk/README.md)
:::

::: notes
SDK : Software Development Kit, bibliothèque qui pilote l'agent de code depuis un programme. Le sigle développé figure aussi sur l'étiquette du schéma.
Claude Code : Claude Agent SDK (SDK d'Anthropic), paquet `@anthropic-ai/claude-agent-sdk` (TypeScript, Node 18+) ou `claude-agent-sdk` (Python 3.10+). Le SDK embarque un binaire Claude Code.
Open Code : paquet `@opencode/sdk` du dépôt v2.0.32, « In-process OpenCode host for Promise and Effect applications » (npm donne 2.1.4 le 25 octobre 2026). L'ancien paquet `@opencode-ai/sdk` est celui de la v1.
:::

## Un premier appel au SDK {.compare kicker="SDK"}

Un appel envoie un prompt à l'agent de code.

::: claude-code
Claude Agent SDK, le SDK d'Anthropic pour Claude Code.

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Corrige les tests en échec",
  options: { allowedTools: ["Read", "Edit", "Bash"], permissionMode: "acceptEdits" },
})) {
  if (message.type === "result") console.log(message.subtype);
}
```
:::

::: opencode
`@opencode/sdk`, le SDK d'Open Code.

```typescript
import { OpenCode } from "@opencode/sdk"

await using opencode = await OpenCode.create()
const session = await opencode.sessions.create({ location: { directory: process.cwd() } })
await opencode.sessions.prompt({ sessionID: session.id, text: "Corrige les tests en échec" })
```
:::

::: sources
- [Claude Code, Agent SDK quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart)
- [Open Code, README du SDK (v2.0.32)](https://github.com/anomalyco/opencode/blob/v2.0.32/packages/sdk/README.md)
:::

::: notes
Claude Code : adapté de l'exemple du quickstart (`query`, `allowedTools`, `permissionMode`). Authentification : clé `ANTHROPIC_API_KEY`, ou `CLAUDE_CODE_USE_BEDROCK=1` avec identifiants AWS. La doc interdit d'offrir la connexion claude.ai (abonnement) dans un produit bâti sur le SDK : l'abonnement de Claude Code ne suffit pas pour un programme bâti sur le SDK, prévoir une clé ou Bedrock.
Open Code : `OpenCode.create()`, `sessions.create`, `sessions.prompt` du README v2.0.32 ; le README ne donne aucune signature de type ni l'option pour choisir un agent.
:::

## Quand utiliser un SDK {kicker="SDK"}

Le SDK mêle du code déterministe, qui décide, et l'agent de code, qui exécute.

| Forme | Tient le critère vérifiable | Sortie | Usage |
|---|---|---|---|
| commande personnalisée | le prompt | texte de la session | session interactive |
| script shell | le script | code de retour | automatisation simple |
| SDK | le programme | messages typés | intégration dans un programme |

::: notes
Comparaison du support, pas une source externe. Le critère vérifiable par le script ou le programme est un garde-fou ; dans la commande, il reste une instruction du prompt.
Question probable : « SDK ou `claude -p` ? » `claude -p` suffit pour une boucle shell ; le SDK sert quand le programme doit décider entre deux appels, structurer ses résultats ou traiter les messages.
Transition : jusqu'ici, la vérification porte sur des tests. Un défaut visible seulement dans un navigateur échappe aux tests : section Interface.
:::

## Un défaut d'interface {kicker="Interface"}

![Interface web de tickets-api : un bandeau fixe recouvre le bouton Ajouter](images/01-defaut-interface.svg)

L'API répond 201 et les tests passent.

::: notes
Illustration schématique de l'interface web de la branche `feat/front` de tickets-api, à 1280x720 : un bandeau en `position: fixed` recouvre le bouton « Ajouter ». Le bandeau jaune porte le texte « Maintenance prévue samedi 20 h : l'API sera indisponible dix minutes. », masque le titre et rogne le formulaire ; la slide montre un schéma, la capture réelle se fait pendant la démonstration.
Le front est minimal, servi sur `/ui`. Le défaut est planté : l'API et les tests sont corrects.
:::

## Ce que les tests omettent {kicker="Interface"}

| `make test` vérifie | `make test` ne vérifie pas |
|---|---|
| le code de statut de l'API | le rendu de la page |
| les données enregistrées | la visibilité du bouton |
| les règles métier | le clic sur le bouton |

::: notes
Un test d'API n'affiche aucun rendu. Pour voir la page, l'agent de code a besoin d'un navigateur : un serveur MCP en pilote un.
Les tests restent le critère vérifiable de la boucle : ils ne couvrent pas ce défaut.
:::

## Un serveur MCP de navigateur {kicker="Interface"}

| Action | Outil Playwright |
|---|---|
| ouvrir une adresse | `browser_navigate` |
| lire la page | `browser_snapshot` |
| cliquer | `browser_click` |
| capturer | `browser_take_screenshot` |

Liste partielle.

::: sources
- [Playwright MCP, README](https://github.com/microsoft/playwright-mcp)
:::

::: notes
Playwright MCP, publié par Microsoft : serveur MCP local qui pilote un navigateur. Tableau : liste partielle (le README en liste une vingtaine, dont `browser_resize`, `browser_type`, `browser_fill_form`, `browser_wait_for`). Appelés au rejeu. Claude Code : `browser_resize`, `browser_navigate` (4), `browser_take_screenshot` (5), `browser_fill_form`, `browser_click`, `browser_evaluate` (4) ; `browser_snapshot` existe mais n'a pas été choisi (le serveur écrit des fichiers `page-*.yml`). Open Code : `browser_resize`, `browser_navigate`, `browser_snapshot` (avec `boxes: true`), `browser_take_screenshot`, `browser_click`, `browser_run_code_unsafe` ; un `browser_click` avec `target: "ref=e6"` échoue, `target: "#titre"` fonctionne.
Option `--headless` : navigateur sans fenêtre (par défaut avec fenêtre), fonctionne sans interface graphique aux deux rejeux ; `--isolated` : profil en mémoire. Noms d'outils côté agent : `mcp__playwright__browser_navigate` (Claude Code) ; `tools.playwright.browser_navigate` par l'outil `execute` (Open Code), `playwright_browser_navigate` seulement dans les règles de permission.
Redimensionner à 1280x720 par `browser_resize` ou par le prompt.
:::

## Brancher Playwright {.compare kicker="Interface"}

La déclaration suit la forme de la section MCP.

::: claude-code
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@0.0.83", "--browser", "chromium", "--headless", "--isolated"]
    }
  }
}
```
:::

::: opencode
```json
{
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": ["npx", "@playwright/mcp@0.0.83", "--browser", "chromium", "--headless", "--isolated"]
      }
    }
  }
}
```
:::

::: sources
- [Playwright MCP, README](https://github.com/microsoft/playwright-mcp)
- [Claude Code, MCP](https://code.claude.com/docs/en/mcp)
- [Open Code, MCP servers](https://opencode.ai/v2/docs/mcp-servers/)
:::

::: notes
Fichiers : `.mcp.json` (Claude Code), `opencode.json` (Open Code). Configuration écrite à l'étape de la démonstration. Serveur local : processus lancé par l'agent de code. Claude Code : `command` et `args` (sans `type`, une entrée vaut stdio). Open Code v2 : `type: "local"`, `command` en tableau. `--isolated` (profil en mémoire) est confirmé dans le README de Playwright MCP.
Sans `--browser`, la version 0.0.83 cible le canal `chrome` (Google Chrome système, `/opt/google/chrome/chrome`) et échoue avec « Chromium distribution 'chrome' is not found » (constaté le 26 octobre 2026). L'aide du serveur liste `chrome`, `firefox`, `webkit` et `msedge` pour `--browser` ; `chromium` n'y figure pas, mais la version 0.0.83 l'accepte (appel `browser_navigate` réussi le 26 octobre 2026). Le navigateur s'installe par `npx @playwright/mcp@0.0.83 install-browser chromium` ; `npx playwright install chromium` ne suffit pas (révision différente de celle que le serveur attend).
Le serveur de projet de `.mcp.json` demande une permission en session interactive de Claude Code. Claude Code : `.mcp.json` de la démonstration ; Open Code : `opencode.json` de la démonstration.
:::

## Constater, corriger, vérifier {kicker="Interface"}

![Trois étapes en boucle : constater par une capture, corriger la feuille de style, vérifier par une nouvelle capture](images/01-cycle-interface.svg)

La vérification est une capture lue par l'agent de code.

::: notes
Le critère n'est plus un code de retour mais une capture que l'agent de code lit. Un défaut restant déclenche une nouvelle correction.
Ouverture sur la boucle : la vérification visuelle est une relance avec une capture comme critère. À conserver sous contrôle humain : jugement du rendu final.
:::

## Démonstration 5 : corriger un bandeau par MCP {kicker="Interface"}

Un serveur MCP de navigateur vérifie le correctif. Étapes : section Démonstrations, en fin de module.

::: notes
Démonstration 5, branche `feat/front`. Dernière démonstration du module : elle lie MCP et interface.
Relevé du 25 octobre 2026, non interactif, avec un prompt sans URL ni clic. Claude Code : 155 s, 33 tours, 0,72 USD ; clic sur `#ajouter` réussi malgré le bandeau (ajout de « Bug de connexion ») ; correctif `body { margin: 0; padding-top: 64px; }`, le bandeau reste fixe, contrairement au correctif de référence (`position: static`) ; cinq captures, les deux premières sur l'ancienne feuille de style (cache). Open Code : 77 s, 37 étapes, 0,415 USD ; défaut constaté par coordonnées (bandeau `0,0,1280,65`) ; correctif `main { padding: 72px 16px 32px; }` ; aucun clic sur « Ajouter » ; `opencode.json` modifié par l'agent pour ajouter `--browser chromium`.
Les agents trouvaient l'URL par `curl` sur `localhost:8000/ui/` : elle figure maintenant dans le prompt.
:::

## L'agent de code contrôle le rendu qu'il vient de corriger. {.statement kicker="Interface"}

::: notes
Conclut la section : défaut, limite des tests, serveur de navigateur, branchement, cycle, démonstration.
Transition : six mécanismes vus ; reste à choisir lequel employer.
:::

## Six mécanismes d'extension {kicker="Choix"}

![L'agent de code et son harnais au centre, six mécanismes autour : serveur MCP, sous-agents, orchestrateur, boucles, SDK, garde-fous](images/01-harnais-etendu.svg)

::: notes
Récapitulatif visuel : le harnais de la formation initiale reste le centre ; chaque mécanisme l'étend sans le remplacer. Reprise de chaque mécanisme en une phrase : outils (MCP), fenêtres séparées (sous-agents), répartition (orchestrateur), fin décidée par une commande (boucles), pilotage par code (SDK), limites hors du modèle (garde-fous).
:::

## Grille de choix {kicker="Choix"}

| Question | Agent de code seul | Boucle | Orchestrateur |
|---|---|---|---|
| Longueur de la tâche | courte | moyenne | longue |
| Critère vérifiable | aucun | oui | oui, par sous-agent |
| Découpage | aucun | aucun | indépendant par dossier |
| Garde-fou | permissions | relances, tests protégés | `maxTurns` ou `steps` par sous-agent |
| Exemple tickets-api | renommer un champ (illustration) | tests rouges à corriger | spécification 002 |

::: notes
Grille du support, pas une source externe. Trois questions : la tâche tient-elle dans une session ? existe-t-il une commande qui dit « fini » ? le travail se découpe-t-il en parties indépendantes ?
Le serveur MCP et le SDK ne figurent pas en colonne : le premier ajoute des outils à n'importe quelle colonne, le second relève de l'intégration dans un programme.
Lien avec la slide « MCP ou ligne de commande » : même arbitrage, coût contre capacité.
:::

## Le mécanisme se choisit d'après la tâche, avant tout lancement. {.statement kicker="Choix"}

::: notes
Conclut le schéma des six mécanismes et la grille de choix.
Le module 2 reprend l'autre côté : le code produit doit être relu.
:::

## Démonstration 1 : créer des issues par MCP {.tp}

Un serveur MCP GitHub permet à l'agent de code de créer des issues. Branche `fix/ticket-ferme-commentaires` de `tickets-api`.

### Préparer le dépôt de session

```bash
bash demos/01-commun/preparer-session.sh
bash demos/01-commun/preparer-session.sh 28-10-b
```

::: attendu
`make test` affiche `2 failed, 37 passed`. Les échecs sont `test_add_comment_on_closed_ticket_returns_409` et `test_closed_ticket_refuses_comments`.
:::

::: indice
Port 5432 pris par un autre projet (conteneur `tickets-api-db-1`) : `docker stop tickets-api-db-1` avant `make db-up`. `docker compose down -v` supprime le volume de la base de ce dépôt : la base repart de zéro. `make test` échoue sur une erreur de connexion si Postgres n'a pas fini de démarrer : le relancer après quelques secondes.

La remise à zéro (`git checkout -- .` puis `git clean`) restaure les fichiers de configuration du dépôt (`.mcp.json`, `.claude/settings.json`, `opencode.json`) et supprime ceux que les étapes ajoutent.

Open Code lit la région Bedrock dans sa configuration utilisateur, par exemple `~/.config/opencode/opencode.jsonc` :

```json
{
  "$schema": "https://opencode.ai/config.json",
  "providers": { "amazon-bedrock": { "settings": { "region": "eu-west-1" } } }
}
```
:::

### Déclarer le serveur MCP

Le jeton est lu dans l'environnement du shell, jamais écrit dans un fichier.

```console
$ export GITHUB_TOKEN=$(gh auth token)
```

::: claude-code
Fichiers `.mcp.json` et `.claude/settings.json` à la racine de la copie de travail. Les trois outils de lecture sont autorisés, les trois outils d'écriture demandent une confirmation.

```bash
cd "$WORK"
cat > .mcp.json <<'EOF'
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
    }
  }
}
EOF
cat > .claude/settings.json <<'EOF'
{
  "model": "claude-sonnet-5-5",
  "permissions": {
    "allow": [
      "Bash(make test *)",
      "Bash(make lint *)",
      "Bash(uv run pytest *)",
      "Bash(uv run ruff *)",
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "mcp__github__issue_read",
      "mcp__github__list_issues",
      "mcp__github__get_me"
    ],
    "ask": [
      "mcp__github__issue_write",
      "mcp__github__add_issue_comment",
      "mcp__github__create_pull_request"
    ]
  }
}
EOF
```

Lancer `claude --model claude-sonnet-5-5`, autoriser le serveur du projet à l'invite de permission, puis taper `/mcp`.
:::

::: opencode
Fichier `opencode.json` à la racine de la copie de travail, en forme v2 (`mcp.servers`, `permissions` en tableau, la dernière règle correspondante l'emporte).

```bash
cd "$WORK"
cat > opencode.json <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "amazon-bedrock/eu.anthropic.claude-sonnet-5-5",
  "instructions": [".specify/memory/constitution.md"],
  "mcp": {
    "servers": {
      "github": {
        "type": "remote",
        "url": "https://api.githubcopilot.com/mcp/",
        "headers": { "Authorization": "Bearer {env:GITHUB_TOKEN}" }
      }
    }
  },
  "permissions": [
    { "action": "github_*", "resource": "*", "effect": "ask" },
    { "action": "github_issue_read", "resource": "*", "effect": "allow" },
    { "action": "github_list_issues", "resource": "*", "effect": "allow" },
    { "action": "github_get_me", "resource": "*", "effect": "allow" }
  ]
}
EOF
opencode mcp list
```

Lancer `opencode` depuis le même shell (celui qui porte `GITHUB_TOKEN`), puis taper `/mcps`.
:::

::: attendu
Le serveur `github` figure dans la liste (`/mcp` sous Claude Code, `✓ github` à `opencode mcp list` et `/mcps` sous Open Code). L'en-tête `Authorization` statique est accepté.
:::

::: indice
Open Code v2 lance un processus d'arrière-plan qui n'hérite pas de l'environnement du shell : sans `GITHUB_TOKEN` de ce côté, le serveur échoue (`Authorization header is badly formatted`) et l'agent contourne par `curl`. En non interactif, ajouter `--standalone` à `opencode run` (option présente dans l'aide locale de la v2.0.32). En session interactive, vérifier `opencode mcp list` avant de commencer. Sous Claude Code, sans `list_issues` ni `get_me` dans `allow`, l'agent est bloqué par les permissions.
:::

### Créer les issues par le serveur MCP

Relever d'abord la taille de la fenêtre de contexte : `/context` sous Claude Code ; sous Open Code, aucune commande équivalente documentée, noter le coût du premier tour.

```prompt
Lance `make test`. Pour chaque test en échec, crée avec le serveur MCP github, sans gh ni curl, une issue dans le dépôt courant : titre court, comportement constaté, comportement attendu, nom du test. Ne modifie aucun fichier.
```

::: attendu
`make test` affiche `2 failed, 37 passed`. L'agent demande l'autorisation à chaque création d'issue (`issue_write` est en `ask`) et en crée deux, une par test en échec : `test_add_comment_on_closed_ticket_returns_409` (un ticket fermé accepte un commentaire, la réponse est 201 au lieu de 409) et `test_closed_ticket_refuses_comments`. Noms d'outils : `mcp__github__issue_write` sous Claude Code, `tools.github.issue_write` par l'outil `execute` sous Open Code.
:::

::: indice
Remplacer `<propriétaire>/tickets-api-<session>` par le dépôt de session (`gh repo view --json nameWithOwner -q .nameWithOwner`). Sans le dépôt dans le prompt, l'agent appelle `get_me` pour le deviner. Open Code v2 lance un processus d'arrière-plan qui n'hérite pas de l'environnement du shell : sans `GITHUB_TOKEN` de ce côté, le serveur échoue (`Authorization header is badly formatted`) et l'agent contourne par `curl` ; en session interactive, vérifier `opencode mcp list` avant de commencer. Repli si le réseau ou le jeton échoue : créer les deux issues avec `gh issue create --repo "$TARGET"`.
:::

### Comparer avec gh et contrôler

Dans un autre terminal, sans le faux `gh`, puis dans la copie de travail :

```console
$ gh issue list --repo "$TARGET" --json number,title
$ git status --short
```

Relever la fenêtre de contexte après le prompt (`/context` sous Claude Code).

::: attendu
`gh` liste les deux issues créées par le serveur MCP. `git status` ne liste que les fichiers de configuration posés à l'étape 02 (`.mcp.json` et `.claude/settings.json`, ou `opencode.json`) : l'agent n'a rien modifié. La fenêtre de contexte a grossi de plusieurs milliers de tokens (outils MCP, sortie des tests et contenu des issues).
:::

::: indice
Remise à zéro avant la démonstration suivante : `cd "$WORK" && git checkout -- . && git clean -fdq -e .venv -e node_modules`. Elle restaure les fichiers de configuration du dépôt. Les issues créées restent dans le dépôt de session : les fermer (`gh issue close`) avant de rejouer l'étape.
:::

## Démonstration 2 : déléguer à un sous-agent explorateur {.tp}

Un sous-agent explore le code des commentaires et rend dix lignes à l'agent principal. Branche `fix/ticket-ferme-commentaires`.

### Préparer la démonstration

La démonstration 1 a déjà créé le dépôt de session, la copie de travail, la base et les dépendances, et défini `SESSION`, `TARGET` et `WORK` dans le shell. Elle a aussi posé des fichiers non commités (serveur MCP, permissions) : ils sont retirés pour que la fenêtre de contexte de départ ne contienne pas les outils MCP. Dans un nouveau terminal, relancer d'abord `bash demos/01-commun/preparer-session.sh` et recopier les variables qu'il affiche.

```bash
cd $WORK
git checkout -- . && git clean -fdq -e .venv -e node_modules
git status --short
make db-up
make test
```

::: claude-code
Le sous-agent `explorateur` est dans le dépôt (`.claude/agents/explorateur.md`), sans changement. Le modèle est désigné par `--model claude-sonnet-5-5` au lancement et par le `.claude/settings.json` du dépôt.
:::

::: opencode
Le dépôt porte l'explorateur en forme v1. Écrire un `opencode.json` qui fixe le modèle (sans serveur MCP, donc sans jeton), puis remplacer l'explorateur par la forme v2 (`permissions` en tableau, quatre refus) :

```bash
cat > opencode.json <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "amazon-bedrock/eu.anthropic.claude-sonnet-5-5",
  "instructions": [".specify/memory/constitution.md"]
}
EOF
mkdir -p .opencode/agents
cat > .opencode/agents/explorateur.md <<'EOF'
---
description: Explore un périmètre du dépôt en lecture seule et rend un rapport de dix lignes au plus
mode: subagent
steps: 25
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: webfetch, resource: "*", effect: deny }
  - { action: subagent, resource: "*", effect: deny }
---

Tu explores le dépôt `tickets-api` pour répondre à une question précise, dans le
périmètre de fichiers indiqué par le prompt. Tu lis avec `read`, `grep` et `glob`.
Tu ne modifies rien et tu ne proposes aucun correctif.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse : dix lignes au plus (compte-les avant de répondre), sans préambule ni conclusion.

1. Fichiers lus, chemins relatifs à la racine du dépôt (jamais de chemin absolu).
   Cite comme lu un fichier seulement si tu l'as ouvert avec `read`.
2. Réponse à la question, un fait par ligne, chaque fait avec son fichier et sa ligne.
3. Ce qui manque ou contredit `AGENTS.md`, la constitution ou la spec, si tu l'as vu.

Aucun bloc de code.
EOF
opencode debug agents
```
:::

::: attendu
`make test` affiche `2 failed, 37 passed`. Sous Open Code, `opencode debug agents` liste `explorateur`, mode `subagent`, `steps` 25, quatre refus.
:::

::: indice
Port 5432 pris par un autre projet `tickets-api` : `docker stop tickets-api-db-1`, puis relancer `make db-up`. La remise à zéro restaure `opencode.json` et `.claude/settings.json` du dépôt : l'`opencode.json` de ce bloc est à réécrire à chaque reprise.
:::

### Lire le fichier de l'agent

::: claude-code
```console
$ cat .claude/agents/explorateur.md
```

Contenu attendu :

```markdown
---
name: explorateur
description: Explore un périmètre du dépôt en lecture seule et rend un résumé de dix lignes au plus
tools: Read, Grep, Glob
model: claude-sonnet-5-5
maxTurns: 25
---

Tu explores le dépôt `tickets-api` pour répondre à une question précise, dans le
périmètre de fichiers indiqué par la consigne. Tu lis avec `Read`, `Grep` et `Glob`.
Tu ne modifies rien et tu ne proposes aucun correctif.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse : dix lignes au plus, sans préambule ni conclusion.

1. Fichiers lus, chemins relatifs à la racine du dépôt.
2. Réponse à la question, un fait par ligne, chaque fait avec son fichier et sa ligne.
3. Ce qui manque ou contredit `AGENTS.md`, la constitution ou la spec, si tu l'as vu.

Aucun bloc de code.
```
:::

::: opencode
```console
$ cat .opencode/agents/explorateur.md
```

Le contenu est celui écrit à l'étape précédente.
:::

::: attendu
Le fichier limite l'agent à la lecture (`tools: Read, Grep, Glob` et `maxTurns: 25` sous Claude Code ; `steps: 25` et quatre refus sous Open Code) et fixe le format du rapport : fichiers lus, faits avec fichier et ligne, écarts.
:::

::: indice
L'agent doit apparaître dans `/agents` sous Claude Code et dans `opencode debug agents` sous Open Code. Absent : le fichier n'est pas au chemin indiqué, ou son en-tête YAML est invalide (premier et dernier `---` sur leur propre ligne).
:::

### Lancer l'agent principal

::: claude-code
```console
$ claude --model claude-sonnet-5-5
```

Relever la fenêtre de contexte : `/context`.
:::

::: opencode
```console
$ opencode
```

Open Code n'a pas de commande équivalente à `/context` : noter le coût affiché.
:::

::: attendu
Une session interactive s'ouvre sur le modèle `claude-sonnet-5-5`. La fenêtre de départ est relevée.
:::

::: indice
Modèle affiché différent de `claude-sonnet-5-5` : sous Claude Code, relancer avec `--model claude-sonnet-5-5` ; sous Open Code, vérifier le champ `model` d'`opencode.json`. Erreur d'authentification sous Open Code : contrôler les identifiants AWS et la région Bedrock.
:::

### Déléguer l'exploration

```prompt
Délègue à l'explorateur l'exploration de tout ce qui touche aux commentaires d'un ticket. Question : où vérifier le statut du ticket avant d'ajouter un commentaire ? Réponds en recopiant son rapport mot pour mot, sans le reformuler, le mettre en forme ni le commenter, et sans rien ajouter avant ou après.
```

::: attendu
Rapport de dix à vingt lignes, recopié tel quel. Il désigne `Comment.write` (`src/tickets/domain/ticket.py`, ligne 72), qui ne vérifie pas `ticket.status`, appelée par `AddComment.execute` (`src/tickets/application/comments.py`, lignes 23 à 26), et signale `TicketClosed` (`errors.py`, ligne 21) déclarée mais jamais levée. Le point de vérification du statut est donc dans le domaine, appelé depuis le cas d'usage.
:::

::: indice
Le langage naturel déclenche la délégation dans les deux outils. Sous Claude Code, `@"explorateur (agent)"` fonctionne aussi en non interactif ; la mention en session interactive est à vérifier à la main. Si le rapport dépasse dix lignes, l'annoncer comme « une quinzaine de lignes » ou durcir les instructions de l'explorateur. Le rapport peut citer comme lu un fichier non ouvert : le signaler. Repli : ouvrir `src/tickets/application/comments.py` et `src/tickets/domain/ticket.py` et lire les passages cités ci-dessus.
:::

### Montrer la session du sous-agent et mesurer

Ouvrir la session du sous-agent : le panneau d'agents sous Claude Code, la session enfant sous Open Code. Relever la fenêtre de l'agent principal après le rapport.

::: claude-code
`/context` après le rapport.
:::

::: opencode
```console
$ opencode session export <id de la session enfant>
```

La commande figure dans l'aide locale de la v2.0.32 (`opencode session --help`).
:::

::: attendu
Le sous-agent lit beaucoup, l'agent principal reçoit peu : la fenêtre de l'agent principal grossit de l'ordre du millier de tokens, alors que la session du sous-agent en lit plusieurs milliers. `git status --short` ne liste que les fichiers de configuration posés à l'étape 01 (aucun sous Claude Code) : l'explorateur ne modifie rien.
:::

::: indice
Remise à zéro : `git checkout -- . && git clean -fdq -e .venv -e node_modules`.
:::

## Démonstration 3 : livrer une spécification avec un orchestrateur {.tp}

L'orchestrateur répartit la spécification 002 entre cinq agents. Branche `main` de `tickets-api` : spécification écrite, code absent.

### Se placer sur main

Le dépôt de session, la base et les dépendances viennent des démonstrations 1 et 2 (variables `SESSION`, `TARGET` et `WORK` incluses). La remise à zéro retire leurs fichiers non commités. La spécification 002 est écrite dans `specs/002-responsable-priorite-haute/`, le code est absent. Démonstration la plus longue et la plus coûteuse : la lancer une fois.

```bash
cd $WORK
git checkout -- . && git clean -fdq -e .venv -e node_modules
git checkout main
make db-up
make test
```

Les cinq agents (`orchestrateur`, `explorateur`, `testeur`, `implementeur`, `verificateur`) sont dans le dépôt : `.claude/agents/` et `.opencode/agents/`.

::: claude-code
Poser le `.claude/settings.json` : le modèle et les commandes de test et de lecture autorisées. L'orchestrateur se lance par `--agent` à l'étape 03.

```bash
mkdir -p .claude
cat > .claude/settings.json <<'EOF'
{
  "model": "claude-sonnet-5-5",
  "permissions": {
    "allow": [
      "Bash(make test *)",
      "Bash(make lint *)",
      "Bash(uv run pytest *)",
      "Bash(uv run ruff *)",
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ]
  }
}
EOF
```
:::

::: opencode
Un `opencode.json` désigne l'orchestrateur comme agent par défaut, pour que la session interactive démarre dessus. Il ne déclare aucun serveur MCP, donc aucun jeton. Les quatre sous-agents du dépôt sont en forme v1 : les remplacer par la forme v2 (`permissions` en tableau, la dernière règle correspondante l'emporte). L'orchestrateur est écrit à l'étape 02.

````bash
cat > opencode.json <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "amazon-bedrock/eu.anthropic.claude-sonnet-5-5",
  "instructions": [".specify/memory/constitution.md"],
  "default_agent": "orchestrateur"
}
EOF
mkdir -p .opencode/agents
cat > .opencode/agents/explorateur.md <<'EOF'
---
description: Explore un périmètre du dépôt en lecture seule et rend un rapport de dix lignes au plus
mode: subagent
steps: 25
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: webfetch, resource: "*", effect: deny }
  - { action: subagent, resource: "*", effect: deny }
---

Tu explores le dépôt `tickets-api` pour répondre à une question précise, dans le
périmètre de fichiers indiqué par le prompt. Tu lis avec `read`, `grep` et `glob`.
Tu ne modifies rien et tu ne proposes aucun correctif.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse : dix lignes au plus (compte-les avant de répondre), sans préambule ni conclusion.

1. Fichiers lus, chemins relatifs à la racine du dépôt (jamais de chemin absolu).
   Cite comme lu un fichier seulement si tu l'as ouvert avec `read`.
2. Réponse à la question, un fait par ligne, chaque fait avec son fichier et sa ligne.
3. Ce qui manque ou contredit `AGENTS.md`, la constitution ou la spec, si tu l'as vu.

Aucun bloc de code.
EOF
cat > .opencode/agents/testeur.md <<'EOF'
---
description: Écrit les tests d'une spec sous tests/, rouges avant le code ; ne touche jamais à src/
mode: subagent
steps: 30
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: edit, resource: "tests/*", effect: allow }
  - { action: shell, resource: "*", effect: deny }
  - { action: shell, resource: "make *", effect: allow }
  - { action: shell, resource: "uv run *", effect: allow }
  - { action: shell, resource: "git status*", effect: allow }
  - { action: shell, resource: "git diff*", effect: allow }
  - { action: webfetch, resource: "*", effect: deny }
  - { action: subagent, resource: "*", effect: deny }
---

Tu écris les tests d'une fonctionnalité à partir de sa spec et des scénarios
d'acceptation, avant que le code existe. Tu suis les règles d'`AGENTS.md` : une règle
métier nouvelle a son test dans `tests/unit/` avec les doubles de `tests/fakes.py` ;
chaque route ajoutée ou modifiée a un test nominal et un test d'erreur dans
`tests/integration/`. Tu reprends le style et les fixtures des tests existants.

Tu ne modifies aucun fichier hors de `tests/`. Les tests que tu écris échouent tant
que le code n'existe pas : c'est attendu, tu ne cherches pas à les faire passer.

Avant de rendre la main : `make lint` vert, `uv run pytest --collect-only -q` sans
erreur de collecte.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse, sans préambule :

- Fichiers modifiés : liste des chemins.
- Tests ajoutés : un nom par ligne, avec le scénario de la spec qu'il couvre.
- Résultat : la dernière ligne de `make test`, rouge attendu.
EOF
cat > .opencode/agents/implementeur.md <<'EOF'
---
description: Modifie le code de l'application sous src/ et fait passer make lint et make test ; ne touche jamais aux tests
mode: subagent
steps: 40
permissions:
  - { action: edit, resource: "*", effect: allow }
  - { action: edit, resource: "tests/*", effect: deny }
  - { action: edit, resource: ".github/*", effect: deny }
  - { action: edit, resource: ".opencode/*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: shell, resource: "make *", effect: allow }
  - { action: shell, resource: "uv run *", effect: allow }
  - { action: shell, resource: "git status*", effect: allow }
  - { action: shell, resource: "git diff*", effect: allow }
  - { action: shell, resource: "git log*", effect: allow }
  - { action: webfetch, resource: "*", effect: deny }
  - { action: subagent, resource: "*", effect: deny }
---

Tu implémentes ou corriges le code de l'application dans `src/tickets/`, en respectant
l'architecture hexagonale décrite dans `AGENTS.md` : règle métier dans `domain/`, cas
d'usage dans `application/`, routes dans `adapters/inbound/http/`, base dans
`adapters/outbound/postgres/` avec une migration Alembic écrite à la main.

Les tests sont ta cible, jamais ton chantier : tu ne modifies aucun fichier sous
`tests/`. Si un test te paraît faux, tu le dis dans ta réponse et tu t'arrêtes.

Avant de rendre la main : `make lint` et `make test` verts (lance chaque commande
seule, sans `cd` ni `&&`), ou l'explication précise de ce qui bloque.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse, sans préambule :

- Cause : une phrase.
- Fichiers modifiés : liste des chemins.
- Résultat : la dernière ligne de `make test` et de `make lint`.
EOF
cat > .opencode/agents/verificateur.md <<'EOF'
---
description: Vérifie un seul critère sur le code en place et rend un finding ou un verdict conforme ; lecture seule
mode: subagent
steps: 25
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: shell, resource: "make test*", effect: allow }
  - { action: shell, resource: "make lint*", effect: allow }
  - { action: shell, resource: "uv run pytest*", effect: allow }
  - { action: shell, resource: "uv run ruff*", effect: allow }
  - { action: shell, resource: "git diff*", effect: allow }
  - { action: shell, resource: "git status*", effect: allow }
  - { action: webfetch, resource: "*", effect: deny }
  - { action: subagent, resource: "*", effect: deny }
---

Tu vérifies un seul critère, celui que le prompt te donne : une commande qui doit
passer, ou une règle de la spec, de la constitution ou d'`AGENTS.md` qui doit être
respectée par le code en place. Tu lis le code et le diff, tu lances la commande
autorisée, tu ne modifies rien.

Un finding ne se rend qu'avec une référence écrite dans le dépôt et un scénario
d'échec concret : sans les deux, le verdict est conforme.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse, sans préambule, dans ce format exact :

```
verdict: conforme | finding
critere: <le critère vérifié, en une ligne>
reference: <fichier et section de la spec, de la constitution ou d'AGENTS.md ; ou la commande lancée>
fichier: <chemin ou aucun>
ligne: <numéro ou aucun>
resume: <une phrase>
scenario: <entrée, action, résultat observé, résultat attendu ; ou aucun>
```
EOF
````
:::

::: attendu
`make test` affiche 37 tests verts. Sous Open Code, `opencode debug agents` (à lancer après l'étape 02) liste `orchestrateur` en mode `primary` et les quatre sous-agents en mode `subagent`.
:::

::: indice
Base de test : l'orchestrateur ajoute une migration Alembic (`assignee`) et laisse la base partagée à la révision `0002`, ce qui fait échouer les démonstrations suivantes (erreurs `alembic`). `docker compose down -v` suivi de `make db-up` la ramène à l'état de `main` ; le faire avant la démonstration 4, ou employer une base dédiée. Port 5432 pris par un autre projet : `docker stop tickets-api-db-1`.

Sous Open Code, ne pas ajouter `temperature` à l'en-tête du `verificateur` : avec la v2.0.32, `opencode debug agents` montre alors les `permissions` déplacées dans le corps de la requête, donc sans effet sur les droits de l'agent.

Spécification `specs/002-responsable-priorite-haute/spec.md`, numérotation des scénarios d'acceptation : 1 à 4 pour le scénario utilisateur 1, 5 à 8 pour le scénario utilisateur 2 (le scénario 8 passe la priorité d'un ticket avec responsable à haute).

```markdown
# Spécification : Responsable des tickets de priorité haute

**Feature** : `002-responsable-priorite-haute`

**Créée le** : 2026-09-07

**Statut** : Brouillon, en attente de planification

**Entrée** : « Fonctionnalité 002 : responsable des tickets de priorité haute. Un ticket
peut recevoir un responsable ; un ticket de priorité haute sans responsable est refusé
avec 422, à la création comme au changement de priorité. »

## Scénarios utilisateur et tests *(obligatoire)*

### Scénario 1 : Attribuer un responsable à un ticket (Priorité : P1)

Un agent désigne la personne qui prend en charge un ticket, à la création ou plus tard.
Le responsable apparaît dans le détail et dans la liste des tickets.

**Pourquoi cette priorité** : sans responsable, la règle de la priorité haute ne peut pas
s'appliquer.

**Test indépendant** : créer un ticket avec un responsable, le relire, changer le
responsable, le relire.

**Scénarios d'acceptation** :

1. **Étant donné** un ticket ouvert sans responsable, **quand** un agent attribue
   « alice », **alors** le ticket affiche « alice » comme responsable.
2. **Étant donné** un ticket avec responsable « alice », **quand** un agent attribue
   « bob », **alors** le responsable devient « bob ».
3. **Étant donné** un ticket fermé, **quand** on tente d'attribuer un responsable,
   **alors** la demande est refusée comme règle métier violée (409).
4. **Étant donné** un identifiant inconnu, **quand** on attribue un responsable,
   **alors** la réponse est 404.

---

### Scénario 2 : Exiger un responsable pour la priorité haute (Priorité : P2)

Un ticket de priorité haute a toujours un responsable. Le système refuse toute
situation qui laisserait un ticket haute priorité sans responsable.

**Pourquoi cette priorité** : c'est la règle métier qui motive la fonctionnalité ; elle
dépend du scénario 1.

**Test indépendant** : créer un ticket haute priorité sans responsable et vérifier le
refus ; créer le même avec responsable et vérifier l'acceptation.

**Scénarios d'acceptation** :

1. **Étant donné** aucun ticket, **quand** on crée un ticket de priorité haute sans
   responsable, **alors** la création est refusée comme invalide (422) et aucun ticket
   n'existe.
2. **Étant donné** aucun ticket, **quand** on crée un ticket de priorité haute avec
   responsable « alice », **alors** le ticket est créé.
3. **Étant donné** un ticket de priorité normale sans responsable, **quand** on passe sa
   priorité à haute, **alors** la demande est refusée (422) et la priorité reste normale.
4. **Étant donné** un ticket de priorité normale avec responsable, **quand** on passe sa
   priorité à haute, **alors** la priorité devient haute.

### Cas limites

- Responsable composé d'espaces seulement : traité comme absent.
- Retrait du responsable d'un ticket de priorité haute : refusé (422).
- Changement de priorité de haute vers normale : autorisé, le responsable reste.
- Le changement de priorité n'existe pas dans la fonctionnalité 001 : il est introduit
  ici.

## Exigences *(obligatoire)*

### Exigences fonctionnelles

- **FR-001** : Un ticket PEUT porter un responsable, texte de 1 à 100 caractères ;
  l'absence est représentée explicitement.
- **FR-002** : Le système DOIT permettre d'attribuer, de changer ou de retirer le
  responsable d'un ticket dont le statut est autre que fermé.
- **FR-003** : Le système DOIT permettre de changer la priorité d'un ticket dont le
  statut est autre que fermé.
- **FR-004** : Le système DOIT refuser toute opération dont le résultat serait un ticket
  de priorité haute sans responsable : création, changement de priorité, retrait du
  responsable.
- **FR-005** : Le responsable DOIT apparaître dans le détail et dans la liste des
  tickets ; les tickets existants sans responsable restent valides tant que leur
  priorité est basse ou normale.

### Entités clés

- **Ticket** : gagne un attribut responsable, facultatif, contraint par la priorité.

## Critères de succès *(obligatoire)*

### Résultats mesurables

- **SC-001** : 100 % des tentatives de ticket haute priorité sans responsable sont
  refusées, sans écriture.
- **SC-002** : Les tickets existants restent consultables sans migration manuelle des
  données.
- **SC-003** : Chaque nouvelle opération dispose d'un scénario nominal et d'un scénario
  d'erreur automatisés.

## Hypothèses

- Le responsable est un texte libre, sans annuaire ni authentification.
- Aucune notification du responsable dans cette fonctionnalité.
- La règle s'applique uniquement à la priorité haute.
```
:::

### Lire les instructions fixes

::: claude-code
```console
$ cat .claude/agents/orchestrateur.md
```

Contenu attendu :

```markdown
---
name: orchestrateur
description: Livre une spec en répartissant exploration, tests, implémentation et vérification entre sous-agents ; ne modifie rien lui-même
tools: Agent(explorateur, testeur, implementeur, verificateur), Read, Bash
model: claude-sonnet-5-5
maxTurns: 60
---

Tu livres la fonctionnalité nommée dans la consigne : sa spec est le `spec.md` du
dossier `specs/NNN-nom/` qui porte ce numéro ; sans numéro, prends le dossier pointé
par `.specify/feature.json`. Tu ne lis pas le code toi-même et tu ne modifies aucun
fichier : tu découpes, tu délègues avec l'outil `Agent`, tu fais converger.

Avant de commencer : lis la spec, et note ses scénarios d'acceptation avec leurs codes
HTTP. Ce sont tes critères de vérification.

Étape 1, explorer. Lance dans le même tour trois `explorateur`, chacun sur un
périmètre, avec la question : que faut-il ajouter ou modifier ici pour livrer la spec ?
Périmètres : `src/tickets/domain/` et `src/tickets/application/` ;
`src/tickets/adapters/` ; `tests/`. Ne lance rien d'autre tant que les trois résumés
ne sont pas revenus.

Étape 2, tester. Délègue à `testeur` l'écriture des tests de la spec, rouges avant le
code, en lui transmettant les scénarios d'acceptation et les trois résumés.

Étape 3, implémenter. Délègue à `implementeur` la livraison du code, en lui
transmettant la spec, les trois résumés et la liste des tests à faire passer. Il rend
`make test` et `make lint` verts.

Étape 4, vérifier. Lance dans le même tour trois `verificateur`, un critère chacun :
`make test` passe ; `make lint` passe ; chaque scénario d'acceptation de la spec est
respecté par le code en place, codes HTTP compris. Si un vérificateur rend un finding,
renvoie le finding tel quel à `implementeur`, puis relance les trois vérificateurs.
Trois passages de vérification au plus : au troisième, tu t'arrêtes et tu rapportes ce
qui reste.

Étape 5, rendre compte. En français, sans préambule : fichiers modifiés ; tests ajoutés ; findings
rencontrés et leur sort ; nombre de passages de vérification ; ce qui reste à faire
par un humain, dont la relecture du diff et la pull request.
```
:::

::: opencode
Écrire l'orchestrateur en forme v2 : seul l'outil de délégation change (`subagent` à la place de `Agent`), les droits passent en tableau `permissions`.

```bash
cat > .opencode/agents/orchestrateur.md <<'EOF'
---
description: Livre une spec en répartissant exploration, tests, implémentation et vérification entre sous-agents ; ne modifie rien lui-même
mode: primary
steps: 60
permissions:
  - { action: edit, resource: "*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: shell, resource: "make test*", effect: allow }
  - { action: shell, resource: "make lint*", effect: allow }
  - { action: shell, resource: "git status*", effect: allow }
  - { action: shell, resource: "git diff*", effect: allow }
  - { action: shell, resource: "cat *", effect: allow }
  - { action: webfetch, resource: "*", effect: deny }
  - { action: subagent, resource: "*", effect: deny }
  - { action: subagent, resource: "explorateur", effect: allow }
  - { action: subagent, resource: "testeur", effect: allow }
  - { action: subagent, resource: "implementeur", effect: allow }
  - { action: subagent, resource: "verificateur", effect: allow }
---

Tu livres la fonctionnalité nommée dans le prompt : sa spec est le `spec.md` du
dossier `specs/NNN-nom/` qui porte ce numéro ; sans numéro, prends le dossier pointé
par `.specify/feature.json`. Tu ne lis pas le code toi-même et tu ne modifies aucun
fichier : tu découpes, tu délègues avec l'outil `subagent`, tu fais converger.

Avant de commencer : lis la spec, et note ses scénarios d'acceptation avec leurs codes
HTTP. Ce sont tes critères de vérification.

Étape 1, explorer. Lance dans le même tour trois `explorateur`, chacun sur un
périmètre, avec la question : que faut-il ajouter ou modifier ici pour livrer la spec ?
Périmètres : `src/tickets/domain/` et `src/tickets/application/` ;
`src/tickets/adapters/` ; `tests/`. Ne lance rien d'autre tant que les trois rapports
ne sont pas revenus.

Étape 2, tester. Délègue à `testeur` l'écriture des tests de la spec, rouges avant le
code, en lui transmettant les scénarios d'acceptation et les trois rapports.

Étape 3, implémenter. Délègue à `implementeur` la livraison du code, en lui
transmettant la spec, les trois rapports et la liste des tests à faire passer. Il rend
`make test` et `make lint` verts.

Étape 4, vérifier. Lance dans le même tour trois `verificateur`, un critère chacun :
`make test` passe ; `make lint` passe ; chaque scénario d'acceptation de la spec est
respecté par le code en place, codes HTTP compris. Si un vérificateur rend un finding,
renvoie le finding tel quel à `implementeur`, puis relance les trois vérificateurs.
Trois passages de vérification au plus : au troisième, tu t'arrêtes et tu rapportes ce
qui reste.

Étape 5, rendre compte. En français, sans préambule : fichiers modifiés ; tests ajoutés ; findings
rencontrés et leur sort ; nombre de passages de vérification ; ce qui reste à faire
par un humain, dont la relecture du diff et la pull request.
EOF
opencode debug agents
cat .opencode/agents/orchestrateur.md
```
:::

::: attendu
Cinq étapes fixes : trois explorations dans le même tour, tests rouges, implémentation, trois vérifications dans le même tour, compte rendu. L'orchestrateur ne modifie aucun fichier. Les droits d'écriture et de commande sont dans l'en-tête (`tools` sous Claude Code, `permissions` sous Open Code).
:::

::: indice
Chaque étape du corps est un tour de l'orchestrateur : si l'une des cinq manque à la lecture, le fichier a été modifié. Sous Claude Code, `Agent(explorateur, testeur, implementeur, verificateur)` est la liste des seuls sous-agents lançables.

Les trois autres agents de Claude Code, tels qu'ils figurent dans le dépôt (`testeur` et `implementeur` portent un hook `PreToolUse` qui limite leur périmètre d'écriture) :

```markdown
---
name: testeur
description: Écrit les tests d'une spec sous tests/, rouges avant le code ; ne touche jamais à src/
tools: Read, Grep, Glob, Edit, Write, Bash
model: claude-sonnet-5-5
maxTurns: 30
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: ".claude/hooks/guard-path.sh only-tests"
---

Tu écris les tests d'une fonctionnalité à partir de sa spec et des scénarios
d'acceptation, avant que le code existe. Tu suis les règles d'`AGENTS.md` : une règle
métier nouvelle a son test dans `tests/unit/` avec les doubles de `tests/fakes.py` ;
chaque route ajoutée ou modifiée a un test nominal et un test d'erreur dans
`tests/integration/`. Tu reprends le style et les fixtures des tests existants.

Tu ne modifies aucun fichier hors de `tests/`. Les tests que tu écris échouent tant
que le code n'existe pas : c'est attendu, tu ne cherches pas à les faire passer.

Avant de rendre la main : `make lint` vert, `uv run pytest --collect-only -q` sans
erreur de collecte.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse, sans préambule :

- Fichiers modifiés : liste des chemins.
- Tests ajoutés : un nom par ligne, avec le scénario de la spec qu'il couvre.
- Résultat : la dernière ligne de `make test`, rouge attendu.
```

```markdown
---
name: implementeur
description: Modifie le code de l'application sous src/ et fait passer make lint et make test ; ne touche jamais aux tests
tools: Read, Grep, Glob, Edit, Write, Bash
model: claude-sonnet-5-5
maxTurns: 40
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: ".claude/hooks/guard-path.sh deny-tests"
---

Tu implémentes ou corriges le code de l'application dans `src/tickets/`, en respectant
l'architecture hexagonale décrite dans `AGENTS.md` : règle métier dans `domain/`, cas
d'usage dans `application/`, routes dans `adapters/inbound/http/`, base dans
`adapters/outbound/postgres/` avec une migration Alembic écrite à la main.

Les tests sont ta cible, jamais ton chantier : tu ne modifies aucun fichier sous
`tests/`. Si un test te paraît faux, tu le dis dans ta réponse et tu t'arrêtes.

Avant de rendre la main : `make lint` et `make test` verts, ou l'explication précise de
ce qui bloque.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse, sans préambule :

- Cause : une phrase.
- Fichiers modifiés : liste des chemins.
- Résultat : la dernière ligne de `make test` et de `make lint`.
```

````markdown
---
name: verificateur
description: Vérifie un seul critère sur le code en place et rend un finding ou un verdict conforme ; lecture seule
tools: Read, Grep, Glob, Bash
model: claude-sonnet-5-5
maxTurns: 25
---

Tu vérifies un seul critère, celui que la consigne te donne : une commande qui doit
passer, ou une règle de la spec, de la constitution ou d'`AGENTS.md` qui doit être
respectée par le code en place. Tu lis le code et le diff, tu lances la commande
autorisée, tu ne modifies rien.

Un finding ne se rend qu'avec une référence écrite dans le dépôt et un scénario
d'échec concret : sans les deux, le verdict est conforme.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse, sans préambule, dans ce format exact :

```
verdict: conforme | finding
critere: <le critère vérifié, en une ligne>
reference: <fichier et section de la spec, de la constitution ou d'AGENTS.md ; ou la commande lancée>
fichier: <chemin ou aucun>
ligne: <numéro ou aucun>
resume: <une phrase>
scenario: <entrée, action, résultat observé, résultat attendu ; ou aucun>
```
````

Le hook `.claude/hooks/guard-path.sh` (mode `only-tests` pour le testeur, `deny-tests` pour l'implémenteur) :

```bash
#!/usr/bin/env bash
# Hook PreToolUse des sous-agents implementeur (deny-tests) et testeur (only-tests).
# Équivalent des règles `edit` par chemin de .opencode/agents/*.md.
set -euo pipefail
mode="${1:?mode}"
path="$(jq -r '.tool_input.file_path // empty')"
rel="${path#"$CLAUDE_PROJECT_DIR"/}"
deny() { echo "Écriture refusée : $rel ($1)" >&2; exit 2; }
case "$mode" in
  deny-tests) case "$rel" in tests/*|.github/*|.claude/*|.opencode/*) deny "hors du périmètre de implementeur";; esac ;;
  only-tests) case "$rel" in tests/*) ;; *) deny "testeur écrit sous tests/ seulement";; esac ;;
esac
```
:::

### Lancer l'orchestrateur

::: claude-code
```console
$ claude --agent orchestrateur --model claude-sonnet-5-5
```
:::

::: opencode
```console
$ opencode
```
:::

::: attendu
La session démarre sur l'agent `orchestrateur`.
:::

::: indice
Jouer en session interactive. Sous Claude Code, `claude -p` est resté bloqué 20 minutes après le résultat final (observé une fois). Sous Open Code, `opencode run --agent orchestrateur` rend la main dès que les trois explorations partent en arrière-plan, alors que l'orchestration continue. Si les invites de permission ralentissent la démonstration, ajouter `--permission-mode acceptEdits` à la commande de Claude Code.
:::

### Déléguer la livraison

```prompt
Livre la spécification 002 en suivant tes étapes.
```

Observer : explorations lancées dans le même tour, tests rouges du testeur, implémentation, vérifications par série de trois, remarque éventuellement renvoyée à l'implémentation.

::: attendu
Le nombre de sous-agents, de tests et de fichiers dépend de l'exécution. Claude Code lance plus de dix sous-agents (explorateurs, testeurs, implementeurs, verificateurs), tous depuis le fil principal, avec des findings renvoyés à l'implémentation. Open Code lance une dizaine de sous-agents, trois explorations et trois vérifications dans le même tour. Fin : tests verts, lint propre. Le compte rendu de l'orchestrateur peut annoncer des nombres inexacts (tests ajoutés, passes de vérification) : les contrôler à l'étape suivante.
:::

::: indice
Sous Claude Code, si un sous-agent tente d'écrire hors de son périmètre, le hook affiche `Écriture refusée : <chemin> (…)`. L'imbrication d'un sous-agent dans un sous-agent est refusée par défaut sous Open Code (`Subagent depth limit reached (1)`).

Repli si la livraison échoue ou dure trop : passer sur la branche livrée de référence et dérouler ses changements.

```console
$ git checkout origin/feat/responsable-priorite-haute-done
$ make test
$ git diff main..HEAD --stat
```

Résultat de référence : 61 tests verts, et douze fichiers modifiés, dont la migration `20260907_0002_ticket_assignee.py` :

```text
 README.md                                        |  5 +-
 .../adapters/inbound/http/routers/tickets.py     | 26 ++++++-
 src/tickets/adapters/inbound/http/schemas.py     | 11 +++
 .../versions/20260907_0002_ticket_assignee.py    | 25 +++++++
 .../adapters/outbound/postgres/repositories.py   |  3 +
 src/tickets/adapters/outbound/postgres/tables.py |  1 +
 src/tickets/application/tickets.py               | 33 ++++++++-
 src/tickets/domain/errors.py                     |  2 +-
 src/tickets/domain/ticket.py                     | 59 ++++++++++++++-
 tests/integration/test_tickets_api.py            | 74 ++++++++++++++++++-
 tests/unit/test_ticket.py                        | 78 +++++++++++++++++++-
 tests/unit/test_use_cases.py                     | 36 ++++++++-
 12 files changed, 342 insertions(+), 11 deletions(-)
```
:::

### Contrôler le résultat

```console
$ make test
$ make lint
$ git status --short
```

Relever le coût total (`/usage` sous Claude Code, coût affiché sous Open Code) et le nombre de sous-agents lancés.

::: attendu
Tests verts (37 de départ plus les tests ajoutés), lint propre, migration Alembic créée. Les fichiers modifiés sont ceux de l'implémentation et des tests ; l'orchestrateur n'a fait aucun commit.
:::

::: indice
Remise à zéro : `git checkout -- . && git clean -fdq -e .venv -e node_modules` ; si l'orchestrateur a commité, `git reset --hard origin/main`. Rétablir la base de test avant la démonstration 4 : `docker compose down -v` puis `make db-up`.
:::

## Démonstration 4 : boucle de correction sous garde-fous {.tp}

Une commande du dépôt corrige le code jusqu'à des tests verts, sous garde-fous. Branche `fix/ticket-ferme-commentaires`, deux tests rouges.

### Se placer sur la branche et poser les garde-fous

Le dépôt de session, la copie de travail et les dépendances viennent des démonstrations 1 à 3 (variables `SESSION`, `TARGET` et `WORK` incluses). La remise à zéro retire leurs fichiers non commités. La base est recréée : une base laissée à la révision Alembic `0002` par la démonstration 3 fait échouer les tests. La commande `fix-until-green`, le sous-agent `implementeur` et le hook `.claude/hooks/guard-path.sh` sont dans le dépôt. La commande se joue en session interactive.

```bash
cd $WORK
git checkout -- . && git clean -fdq -e .venv -e node_modules
git checkout fix/ticket-ferme-commentaires
docker compose down -v
make db-up
```

::: claude-code
La règle `deny` protège `tests/` contre l'outil `Edit`. Elle bloque aussi le testeur de l'orchestrateur : ne la garder que pour cette démonstration. Le sous-agent `implementeur` et son hook sont dans le dépôt (texte dans l'indice de l'étape suivante).

```bash
mkdir -p .claude
cat > .claude/settings.json <<'EOF'
{
  "model": "claude-sonnet-5-5",
  "permissions": {
    "allow": [
      "Bash(make test *)",
      "Bash(make lint *)",
      "Bash(uv run pytest *)",
      "Bash(uv run ruff *)",
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ],
    "deny": ["Edit(tests/**)"]
  }
}
EOF
```
:::

::: opencode
Un `opencode.json` fixe le modèle, sans serveur MCP ni jeton. L'agent `implementeur` est écrit en forme v2 : l'édition est autorisée, puis refusée sur `tests/*`, `.github/*` et `.opencode/*` (le joker `*` couvre `/`, la dernière règle correspondante l'emporte).

```bash
cat > opencode.json <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "amazon-bedrock/eu.anthropic.claude-sonnet-5-5",
  "instructions": [".specify/memory/constitution.md"]
}
EOF
mkdir -p .opencode/agents
cat > .opencode/agents/implementeur.md <<'EOF'
---
description: Modifie le code de l'application sous src/ et fait passer make lint et make test ; ne touche jamais aux tests
mode: subagent
steps: 40
permissions:
  - { action: edit, resource: "*", effect: allow }
  - { action: edit, resource: "tests/*", effect: deny }
  - { action: edit, resource: ".github/*", effect: deny }
  - { action: edit, resource: ".opencode/*", effect: deny }
  - { action: shell, resource: "*", effect: deny }
  - { action: shell, resource: "make *", effect: allow }
  - { action: shell, resource: "uv run *", effect: allow }
  - { action: shell, resource: "git status*", effect: allow }
  - { action: shell, resource: "git diff*", effect: allow }
  - { action: shell, resource: "git log*", effect: allow }
  - { action: webfetch, resource: "*", effect: deny }
  - { action: subagent, resource: "*", effect: deny }
---

Tu implémentes ou corriges le code de l'application dans `src/tickets/`, en respectant
l'architecture hexagonale décrite dans `AGENTS.md` : règle métier dans `domain/`, cas
d'usage dans `application/`, routes dans `adapters/inbound/http/`, base dans
`adapters/outbound/postgres/` avec une migration Alembic écrite à la main.

Les tests sont ta cible, jamais ton chantier : tu ne modifies aucun fichier sous
`tests/`. Si un test te paraît faux, tu le dis dans ta réponse et tu t'arrêtes.

Avant de rendre la main : `make lint` et `make test` verts (lance chaque commande
seule, sans `cd` ni `&&`), ou l'explication précise de ce qui bloque.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse, sans préambule :

- Cause : une phrase.
- Fichiers modifiés : liste des chemins.
- Résultat : la dernière ligne de `make test` et de `make lint`.
EOF
opencode debug agents
```
:::

```console
$ make test
```

::: attendu
`2 failed, 37 passed`. Échecs : `test_add_comment_on_closed_ticket_returns_409` et `test_closed_ticket_refuses_comments`. Sous Open Code, `opencode debug agents` décode `implementeur`.
:::

::: indice
Base de test laissée à la révision Alembic `0002` : `make test` donne des erreurs `alembic` et l'agent est tenté de réécrire une migration. Repartir d'une base propre : `docker compose down -v` puis `make db-up`. Port 5432 pris : `docker stop tickets-api-db-1`.
:::

### Lire la commande

::: claude-code
```console
$ cat .claude/commands/fix-until-green.md
```

```markdown
---
description: Corrige le code jusqu'à ce que make test passe, cinq relances au plus
allowed-tools: Bash(make test *)
---

Délègue ce travail au sous-agent `implementeur`.

Objectif : $ARGUMENTS

État actuel des tests :
!`make test 2>&1 | tail -40`

Corrige la cause de l'échec dans le code de l'application, jamais dans les tests.
Relance `make test` après chaque correction. Arrête-toi dès que tout passe, ou après
cinq relances en expliquant ce qui bloque. Compte tes relances dans ta réponse.
```
:::

::: opencode
```console
$ cat .opencode/commands/fix-until-green.md
```

```markdown
---
description: Corrige le code jusqu'à ce que make test passe, cinq relances au plus
agent: implementeur
---

Objectif : $ARGUMENTS

État actuel des tests :
!`make test 2>&1 | tail -40`

Corrige la cause de l'échec dans le code de l'application, jamais dans les tests.
Relance `make test` après chaque correction. Arrête-toi dès que tout passe, ou après
cinq relances en expliquant ce qui bloque. Compte tes relances dans ta réponse.
```
:::

::: attendu
La limite de cinq relances est une instruction du prompt : un garde-fou faible, que seul un script ou le harnais rend contraignant.
:::

::: indice
Sous Claude Code, la commande délègue à `implementeur`, dont voici le fichier du dépôt (le hook limite son périmètre d'écriture ; `deny-tests` refuse `tests/`, `.github/`, `.claude/` et `.opencode/`) :

```markdown
---
name: implementeur
description: Modifie le code de l'application sous src/ et fait passer make lint et make test ; ne touche jamais aux tests
tools: Read, Grep, Glob, Edit, Write, Bash
model: claude-sonnet-5-5
maxTurns: 40
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: ".claude/hooks/guard-path.sh deny-tests"
---

Tu implémentes ou corriges le code de l'application dans `src/tickets/`, en respectant
l'architecture hexagonale décrite dans `AGENTS.md` : règle métier dans `domain/`, cas
d'usage dans `application/`, routes dans `adapters/inbound/http/`, base dans
`adapters/outbound/postgres/` avec une migration Alembic écrite à la main.

Les tests sont ta cible, jamais ton chantier : tu ne modifies aucun fichier sous
`tests/`. Si un test te paraît faux, tu le dis dans ta réponse et tu t'arrêtes.

Avant de rendre la main : `make lint` et `make test` verts, ou l'explication précise de
ce qui bloque.

Tu réponds en français, identifiants et messages du code en anglais.

Réponse, sans préambule :

- Cause : une phrase.
- Fichiers modifiés : liste des chemins.
- Résultat : la dernière ligne de `make test` et de `make lint`.
```

```bash
#!/usr/bin/env bash
# Hook PreToolUse des sous-agents implementeur (deny-tests) et testeur (only-tests).
# Équivalent des règles `edit` par chemin de .opencode/agents/*.md.
set -euo pipefail
mode="${1:?mode}"
path="$(jq -r '.tool_input.file_path // empty')"
rel="${path#"$CLAUDE_PROJECT_DIR"/}"
deny() { echo "Écriture refusée : $rel ($1)" >&2; exit 2; }
case "$mode" in
  deny-tests) case "$rel" in tests/*|.github/*|.claude/*|.opencode/*) deny "hors du périmètre de implementeur";; esac ;;
  only-tests) case "$rel" in tests/*) ;; *) deny "testeur écrit sous tests/ seulement";; esac ;;
esac
```
:::

### Lancer la boucle

::: claude-code
```console
$ claude --model claude-sonnet-5-5
```
:::

::: opencode
```console
$ opencode
```
:::

```prompt
/fix-until-green interdire les commentaires sur un ticket fermé
```

::: attendu
Tous les tests passent en cinq relances au plus (39 verts). Le correctif tient en trois à cinq lignes dans `src/tickets/domain/ticket.py` : import de `TicketClosed` et `if ticket.status == Status.CLOSED: raise TicketClosed(ticket.id)` dans `Comment.write`. Aucune tentative de contourner les tests.
:::

::: indice
Sous Open Code, en non interactif, `/fix-until-green` n'est pas développé : l'agent lit le fichier de la commande avec `read`, lance `make test` puis délègue à `implementeur`. Le sous-agent a écrit `cd <chemin> && make test`, refusé par la règle `shell make *` : l'agent `implementeur` ci-dessus demande de lancer chaque commande seule, sans `cd`. Sans cette instruction, l'agent principal lance les tests à sa place. Si l'agent tente de modifier `tests/`, montrer le refus : `Edit(tests/**)` sous Claude Code, `Permission denied: edit` sous Open Code. Sous Claude Code, `sed -i` par `Bash` échappe à `Edit`.

Repli : la branche corrigée de référence, `git checkout origin/fix/ticket-ferme-commentaires-done` (39 verts), dont voici la différence avec la branche de départ :

```diff
diff --git a/src/tickets/domain/ticket.py b/src/tickets/domain/ticket.py
index 5ff7940..08f964f 100644
--- a/src/tickets/domain/ticket.py
+++ b/src/tickets/domain/ticket.py
@@ -5,7 +5,7 @@ from datetime import UTC, datetime
 from enum import StrEnum
 from uuid import UUID, uuid4
 
-from tickets.domain.errors import InvalidData, InvalidTransition
+from tickets.domain.errors import InvalidData, InvalidTransition, TicketClosed
 
 TITLE_MAX_LENGTH = 200
 AUTHOR_MAX_LENGTH = 100
@@ -59,6 +59,10 @@ class Ticket:
         self.status = target
         self.updated_at = now()
 
+    def ensure_accepts_comments(self) -> None:
+        if self.status is Status.CLOSED:
+            raise TicketClosed(self.id)
+
 
 @dataclass
 class Comment:
@@ -70,6 +74,7 @@ class Comment:
 
     @classmethod
     def write(cls, ticket: Ticket, author: str, body: str) -> Comment:
+        ticket.ensure_accepts_comments()
         author = author.strip()
         body = body.strip()
         if not author or len(author) > AUTHOR_MAX_LENGTH:
```
:::

### Contrôler le diff

```console
$ make test
$ git diff --stat
```

Lire le `git diff` pour vérifier que le correctif ne touche que le code.

::: attendu
`make test` : 39 verts. Seul `src/` change (`src/tickets/domain/ticket.py`) ; `tests/` est intact.
:::

::: indice
Remise à zéro, deux tests de nouveau rouges : `git checkout -- . && git clean -fdq -e .venv -e node_modules`, puis reposer les garde-fous de l'étape 01 (`.claude/settings.json` ou `opencode.json` et `implementeur`, que la remise à zéro restaure ou supprime).
:::

## Démonstration 5 : corriger un bandeau par MCP {.tp}

Un serveur MCP pilote un navigateur : l'agent de code constate un défaut d'interface, le corrige et vérifie le rendu. Branche `feat/front` de `tickets-api`.

### Préparer la copie et le navigateur

Le dépôt de session, la copie de travail et les dépendances viennent des démonstrations 1 à 4 (variables `SESSION`, `TARGET` et `WORK` incluses). La remise à zéro retire leurs fichiers non commités. Nouveaux préalables : `node` avec `npx`, `curl`, `jq`, port 8000 libre, accès réseau pour télécharger le navigateur. Contenu du dépôt employé : le front minimal `src/tickets/ui/` (`index.html`, `app.js`, `style.css`) servi sur `/ui/` par l'API, `Makefile` (`db-up`, `run`, `test`), `AGENTS.md`.

La branche porte un bandeau `.bandeau` en `position: fixed` dans `src/tickets/ui/style.css`, qui recouvre le formulaire de `/ui` à 1280x720 (titre « Tickets » masqué, bouton « Ajouter » rogné) ; l'API répond correctement et les 37 tests passent. Le serveur Playwright se lance par `npx @playwright/mcp@0.0.83` (version testée le 26 octobre 2026, à revérifier par `npm view @playwright/mcp version`).

```bash
cd $WORK
git checkout -- . && git clean -fdq -e .venv -e node_modules
git checkout feat/front
docker compose down -v
make db-up
printf '%s\n' .playwright-mcp/ serve.log serve.pid >> .git/info/exclude
npx --yes @playwright/mcp@0.0.83 install-browser chromium
```

::: attendu
Le navigateur s'installe dans `~/.cache/ms-playwright` (répertoires `chromium-…` et `chromium_headless_shell-…`).
:::

::: indice
Playwright MCP 0.0.83 cible par défaut le canal `chrome` (Google Chrome système) : sans Chrome installé, le serveur échoue (`Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome`, constaté le 26 octobre 2026). L'aide du serveur (`npx @playwright/mcp@0.0.83 --help`) donne pour `--browser` les valeurs `chrome`, `firefox`, `webkit` et `msedge` ; la valeur `chromium` n'y figure pas, mais la version 0.0.83 l'accepte et emploie le navigateur installé ci-dessus (constaté le 26 octobre 2026 par un appel `browser_navigate`). Avec Google Chrome installé (`npx --yes @playwright/mcp@0.0.83 install-browser chrome`, droits d'administrateur), retirer les arguments `--browser chromium`. `npx playwright install chromium` ne suffit pas : la révision diffère de celle attendue par le serveur. Réseau coupé : lancer une fois `npx @playwright/mcp@0.0.83 --help` la veille pour remplir le cache de npm.
:::

### Déclarer le serveur Playwright

::: claude-code
La branche déclare `@latest` : le remplacer par la version épinglée.

```bash
mkdir -p .claude
cat > .mcp.json <<'EOF'
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@0.0.83", "--browser", "chromium", "--headless", "--isolated"]
    }
  }
}
EOF
cat > .claude/settings.json <<'EOF'
{
  "model": "claude-sonnet-5-5",
  "permissions": {
    "allow": [
      "Bash(make test *)",
      "Bash(make lint *)",
      "Bash(uv run pytest *)",
      "Bash(uv run ruff *)",
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "mcp__playwright"
    ]
  }
}
EOF
jq empty .mcp.json .claude/settings.json
```
:::

::: opencode
```bash
cat > opencode.json <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "amazon-bedrock/eu.anthropic.claude-sonnet-5-5",
  "instructions": [".specify/memory/constitution.md"],
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": [
          "npx", "@playwright/mcp@0.0.83",
          "--browser", "chromium", "--headless", "--isolated"
        ]
      }
    }
  },
  "permissions": [
    { "action": "playwright_*", "resource": "*", "effect": "allow" }
  ]
}
EOF
jq empty opencode.json
opencode debug config
```
:::

::: attendu
Les fichiers JSON sont valides (`jq` n'affiche rien). Sous Open Code, `opencode debug config` liste les sources de configuration, dont l'`opencode.json` du projet.
:::

::: indice
`--headless` lance un navigateur sans fenêtre, `--isolated` un profil en mémoire ; la fenêtre visible (sans `--headless`) n'a pas été essayée. Les permissions `allow` sur Playwright conviennent à une démonstration locale seulement.
:::

### Lancer l'API et le front

```bash
cd "$WORK"
setsid nohup make run > serve.log 2>&1 &
echo $! > serve.pid
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/ui/
make test
```

::: attendu
`curl` affiche `200`. `make test` : 37 verts. Dans un navigateur, `http://localhost:8000/ui/` montre le bandeau jaune qui recouvre le formulaire.
:::

::: indice
L'API et les tests partagent la même base : ne pas jouer deux démonstrations en parallèle. Journal du serveur : `serve.log`. Pour arrêter l'API en fin de démonstration : `kill -- -$(cat serve.pid) 2>/dev/null || kill $(cat serve.pid)`, puis `rm serve.pid`. Port 5432 pris : `docker stop tickets-api-db-1`.
:::

### Lancer l'agent de code

::: claude-code
```console
$ claude --model claude-sonnet-5-5
```

Autoriser le serveur du projet à l'invite de permission, puis `/mcp` pour lister les outils.
:::

::: opencode
```console
$ opencode
```

Aucune invite pour le serveur du projet ; `/mcps` pour lister les outils.
:::

::: attendu
Le serveur `playwright` figure dans la liste des outils (`/mcp` sous Claude Code, `/mcps` sous Open Code).
:::

### Constater, corriger, vérifier

```prompt
Avec le serveur MCP playwright, ouvre http://localhost:8000/ui/ à 1280x720, saisis un titre dans le champ puis clique sur « Ajouter », constate le défaut d'interface, corrige-le dans src/tickets/ui/style.css, sans sous-agent, et vérifie le rendu par une capture. Ne modifie ni la configuration MCP ni les tests.
```

::: attendu
Capture initiale : le bandeau jaune recouvre le formulaire. Capture finale : le formulaire et le bouton « Ajouter » sont visibles et cliquables. Le défaut vient de `.bandeau` en `position: fixed`. Le correctif de l'agent varie, ne pas annoncer une ligne précise : le bandeau reste fixe avec `body { margin: 0; padding-top: 64px; }` ou `main { padding: 72px 16px 32px; }` selon l'exécution. Outils à observer : `browser_resize`, `browser_navigate`, `browser_take_screenshot`, `browser_fill_form`, `browser_click`. Noms côté agent : `mcp__playwright__browser_navigate` sous Claude Code, `tools.playwright.browser_navigate` dans l'outil `execute` sous Open Code.
:::

::: indice
Piège du cache : la page reste en cache après la correction, deux captures montrent la feuille de style non corrigée ; l'agent recharge la feuille par `browser_evaluate` (Claude Code) ou `browser_run_code_unsafe` (Open Code). Sous Open Code, `browser_click` avec `target: "ref=e6"` échoue, `"#titre"` fonctionne. Sans l'URL dans le prompt, l'agent la cherche par `curl` ; sous Open Code, il a déjà modifié `opencode.json` pour ajouter `--browser chromium` : d'où l'instruction de ne pas toucher à la configuration MCP.

Repli si le serveur ou le navigateur est indisponible : appliquer le correctif de référence (le bandeau devient `position: static`), recharger `/ui/` et montrer le résultat dans un navigateur.

```console
$ sed -i 's/position: fixed; top: 0; left: 0; right: 0;/position: static;/' src/tickets/ui/style.css
```

Différence obtenue sur la règle `.bandeau` (le reste de la ligne est inchangé) :

```diff
-.bandeau { position: fixed; top: 0; left: 0; right: 0; height: 64px; …
+.bandeau { position: static; height: 64px; …
```
:::

### Contrôler le correctif

```console
$ make test
$ git diff -- src tests
$ git status --short
```

::: attendu
`make test` : 37 verts. Le diff de `src` et `tests` se limite à `src/tickets/ui/style.css`. Le serveur écrit des captures et des fichiers `page-*.yml` dans `.playwright-mcp/` du répertoire de lancement (le bloc de préparation l'a exclu de `git status` par `.git/info/exclude`).
:::

::: indice
Remise à zéro : arrêter l'API (commande de l'étape 03), puis `git checkout -- . && git clean -fdq -e .venv -e node_modules`. Le serveur écrit dans `.playwright-mcp/` par défaut (observé avec la version 0.0.83) ; l'option `--output-dir` le déplace.
:::

## Glossaire : notions de base {kicker="Glossaire"}

- **Mécanisme** : moyen d'étendre l'agent de code
- **Outil d'origine** : outil fourni avec l'agent de code, sans serveur MCP
- **Issue** : fiche de suivi d'un dépôt GitHub, description et commentaires
- **Dérive** : écart de comportement de l'agent de code que le garde-fou corrige
- **Jeton d'accès** : secret qui authentifie l'agent de code auprès d'un serveur MCP

::: sources
- [Claude Code, Tools reference](https://code.claude.com/docs/en/tools-reference)
- [Open Code, Tools](https://opencode.ai/v2/docs/tools/)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : outils MCP {kicker="Glossaire"}

- **MCP** : Model Context Protocol, protocole commun entre un agent de code et un serveur qui lui expose des outils
- **Serveur MCP** : programme qui expose des outils à l'agent de code par le MCP
- **Outil MCP** : outil d'un serveur MCP, avec nom, description et paramètres

::: sources
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Claude Code, MCP](https://code.claude.com/docs/en/mcp)
- [Open Code, MCP servers](https://opencode.ai/v2/docs/mcp-servers/)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique. Les termes « issue », « MCP » et « jeton d'accès » ont été ajoutés au glossaire du plan pour que chaque notion introduite y figure.
:::

## Glossaire : agents {kicker="Glossaire"}

- **Agent principal** : agent de code qui reçoit la tâche et lance les sous-agents
- **Sous-agent** : agent lancé par l'agent principal, avec sa propre fenêtre de contexte
- **Instructions fixes du sous-agent** : corps du fichier d'agent, en tête de sa fenêtre de contexte
- **Rapport** : texte court que le sous-agent renvoie à l'agent principal
- **Orchestrateur** : agent qui délègue à des sous-agents et fait converger leurs rapports

::: sources
- [Claude Code, Subagents](https://code.claude.com/docs/en/sub-agents)
- [Open Code, Agents](https://opencode.ai/v2/docs/agents/)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : boucles {kicker="Glossaire"}

- **Horizon de tâche** : durée d'une tâche, en temps humain, qu'un modèle mène à bien avec 50 % de réussite
- **Critère vérifiable** : commande dont le code de retour dit si le travail est fini
- **Boucle** : relance de l'agent de code tant qu'un critère vérifiable n'est pas satisfait
- **Relance** : nouvel appel de l'agent de code par la boucle quand le critère n'est pas satisfait

|||

- **Commande personnalisée** : prompt enregistré dans un fichier du dépôt, lancé par `/nom`
- **Code de retour** : nombre rendu par une commande à sa fin, 0 si elle réussit
- **Mode non interactif** : exécution sans session ouverte, un prompt en entrée et le résultat en sortie

::: sources
- [METR, Time Horizon 1.1](https://metr.org/blog/2026-01-29-time-horizon-1-1/)
- [METR, Measuring AI Ability to Complete Long Tasks](https://arxiv.org/abs/2503.14499)
- [Claude Code, Skills (commandes)](https://code.claude.com/docs/en/skills)
- [Open Code, Commands (v2, page relevée le 25 octobre 2026)](https://opencode.ai/v2/docs/commands/)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : boucles et garde-fous {kicker="Glossaire"}

- **Garde-fou** : limite posée hors du modèle, qui arrête ou borne l'agent de code
- **Règle de refus** : permission qui interdit une action à l'agent de code
- **Diff** : liste des lignes ajoutées et retirées d'un fichier entre deux états

::: sources
- [Claude Code, Permissions](https://code.claude.com/docs/en/permissions)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique. « Dérive » (glossaire de base) : définition du support, pas une source externe.
:::

## Glossaire : SDK {kicker="Glossaire"}

- **SDK** : Software Development Kit, bibliothèque qui pilote l'agent de code depuis un programme
- **Claude Agent SDK** : SDK d'Anthropic qui pilote Claude Code depuis TypeScript ou Python

::: sources
- [Claude Code, Agent SDK quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart)
- [Claude Code, Headless](https://code.claude.com/docs/en/headless)
- [Open Code, README du SDK (v2.0.32)](https://github.com/anomalyco/opencode/blob/v2.0.32/packages/sdk/README.md)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::
