# Automatiser plus loin

L'agent de code seul a trois limitations ; la suite les dépasse.

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
Liste réelle relevée au rejeu. Claude Code : 46 outils `mcp__github__*` (dont `issue_read`, `issue_write`, `add_issue_comment`, `create_pull_request`, `list_issues`, `get_me`, `search_issues`). Open Code : `search` du mode code liste `list_issues`, `issue_read` (méthodes `get`, `get_comments`), `add_issue_comment`, `update_issue_comment`. `get_issue` (support d'origine) n'existe pas. `/mcp` et `/mcps` non rejoués (TUI).
Autres outils du serveur utiles plus loin : `issue_write` (create, update), `add_issue_comment`, `create_pull_request`.
:::

## Un appel d'outil MCP {kicker="MCP"}

![Séquence : le modèle choisit issue_read, le harnais appelle le serveur MCP, le résultat revient dans la fenêtre de contexte](images/01-appel-mcp.svg)

Claude Code avertit au-delà de 10 000 tokens de résultat et coupe à 25 000.

::: sources
- [MCP, Tools (spécification)](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [Claude Code, MCP](https://code.claude.com/docs/en/mcp)
:::

::: notes
Le modèle ne parle jamais au serveur : il demande l'outil, le harnais envoie `tools/call`, le serveur répond, le texte du résultat est ajouté à la fenêtre de contexte.
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
Fichiers : `.mcp.json` (Claude Code), `opencode.json` (Open Code). Claude Code : forme équivalente en ligne de commande `claude mcp add --transport http github https://api.githubcopilot.com/mcp/ --header "Authorization: Bearer ..."` (écrit `.mcp.json` avec `--scope project` ; portée par défaut `local`). `${VAR}` développé dans `url` et `headers` ; variable absente sans défaut : chargement avec avertissement. Un serveur de `.mcp.json` demande une approbation en session interactive ; en `claude -p`, aucune invite (doc headless).
Open Code v2 : `mcp.servers.<nom>` ; `{env:NOM}` substitué, `$NOM` non développé ; la doc interdit la clé `enabled` (ancienne forme v1 `mcp.github` du dépôt tickets-api à porter). Aucune approbation de serveur de projet.
Jeton : lu dans une variable d'environnement, jamais écrit dans le fichier ; ici un PAT GitHub dans `GITHUB_TOKEN`. À ne pas confondre avec le token de la fenêtre de contexte.
Observé : Claude Code accepte l'en-tête statique `Authorization` (`status: connected`, 46 outils) ; en `claude -p`, aucune approbation du serveur de projet, alors que `claude mcp list` affiche `Pending approval`. Open Code v2.0.32 accepte la forme, mais le démon d'arrière-plan (`opencode serve --service`) n'hérite pas de l'environnement du shell : `{env:GITHUB_TOKEN}` y est vide et la connexion échoue (HTTP 400, « Authorization header is badly formatted »). `opencode run --standalone` transmet l'environnement et la connexion réussit.
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
Rejeu Claude Code : avec le seul `issue_read` en `allow`, l'agent appelle d'abord `get_me` et `list_issues`, hors de l'`allow` : refusés en `claude -p`, invite de permission en séance interactive. Open Code : en mode code (outil `execute`), l'appel s'écrit `tools.github.issue_read` ; les règles de permission gardent la forme `github_issue_read` (doc). Avec `--auto`, aucune invite n'est apparue pour les règles `ask` ; leur comportement en TUI n'est pas rejoué.
:::

## Coût en fenêtre de contexte {kicker="MCP"}

| Agent de code | Chargé au démarrage | Fenêtre avant | Fenêtre après |
|---|---|---|---|
| Claude Code | noms d'outils | 26,9k tokens | 41,0k tokens |
| Open Code | outil `execute` | 12,1k tokens | 21,8k tokens |

::: sources
- [Claude Code, MCP (tool search)](https://code.claude.com/docs/en/mcp)
- [Open Code, MCP servers](https://opencode.ai/v2/docs/mcp-servers/)
:::

::: notes
Doc Claude Code : « Tool search keeps MCP context usage low by deferring tool definitions until Claude needs them. Only tool names and server instructions load at session start. » Actif par défaut ; `ENABLE_TOOL_SEARCH` le règle. Donc le coût fixe est faible tant qu'un outil n'est pas appelé, puis la définition de l'outil appelé entre dans la fenêtre.
Doc Open Code : « MCP tools consume model context, so add only the servers you need. » La doc ne dit pas ce qui est chargé au démarrage ; au rejeu, le serveur n'expose pas d'outils plats : un outil `execute` (mode code) et `search` pour découvrir les outils.
Mesures du rejeu, un seul passage chacune. Claude Code : `/context` fonctionne en `claude -p` ; avant l'appel 26,9k sur 200k (outils MCP 478, outils MCP différés 19k, instructions du serveur 982, messages 8), après 41,0k (outils MCP 1,6k, différés 17,8k, messages 13k). Les totaux incluent les MCP et skills personnels du poste (prompt système 6,6k, outils 9,7k, mémoire 6,7k, skills 2,2k) : le delta propre au serveur GitHub est +1,1k de définitions chargées (478 vers 1,6k). Refaire la mesure sur un profil vierge avant la séance.
Open Code : pas de `/context` ; la fenêtre est la somme des tokens d'entrée d'une étape, cache compris, relevée dans `--format json` : 12 146 avant le premier appel d'outil, 21 794 après la dernière étape. Le chargement initial des définitions n'est pas mesuré séparément.
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

## Démonstration 1 : lire une issue {kicker="MCP"}

Un serveur MCP lit l'issue et ses commentaires.

::: notes
Démonstration 1, étapes en fin de module. Branche `fix/ticket-ferme-commentaires` de la copie de travail.
Préalable : issue créée par le script de démonstration (`gh issue create`, deux commentaires), la copie miroir n'en contient aucune. Jeton `GITHUB_TOKEN` posé.
Déroulé : 0. montrer l'impasse sans MCP : même prompt, serveur non déclaré, avec le shim `sans-gh` dans le `PATH` (l'agent de code ne lit pas l'issue ; il tente `curl`, refusé par les permissions). 1. déclaration du serveur (slide « Brancher un serveur MCP »). 2. Liste des outils chargés : `/mcp` (Claude Code) ou `/mcps` (Open Code), non rejoués. 3. Prompt ci-dessus. 4. Appels observés : `list_issues` (le corps de l'issue vient de là) puis `issue_read` avec `method: get_comments` ; `issue_read` avec `method: get` n'est pas appelé. Noms d'outils : `mcp__github__issue_read` et `mcp__github__list_issues` (Claude Code) ; `tools.github.issue_read` et `tools.github.list_issues` par l'outil `execute` (Open Code), `github_issue_read` seulement dans les règles de permission. 5. Comparer avec `gh`. 6. Taille de la fenêtre avant et après (`/context`).
Résultat attendu : résumé exact du bug (un ticket fermé accepte des commentaires), test nommé, aucun fichier modifié (`git status` propre).
Résultat observé. Claude Code : 16 s, 5 tours, 0,079 USD ; résumé exact, test `test_add_comment_on_closed_ticket_returns_409` nommé, seuls les fichiers de l'overlay modifiés ; la réponse tient en quatre paragraphes au lieu de trois lignes. Premier essai bloqué : le prompt ne donne ni dépôt ni numéro, l'agent appelle `get_me` et `list_issues`, hors de l'`allow` de l'overlay, refusés en `-p` (38 s, 0,25 USD). Open Code avec `--standalone` : 19 s, 7 étapes, 0,085 USD, résumé en trois lignes, test nommé, `git status` inchangé. Sans `--standalone`, le MCP échoue (jeton absent du démon) et l'agent lit l'issue par `curl` (12 s).
Étape 5 : `gh issue view --comments` échoue avec gh 2.46.0 (`GraphQL: Projects (classic) is being deprecated`) ; `gh issue view 1 --json title,comments` fonctionne.
Repli : texte de l'issue lu à voix haute, puis `gh issue view 1 --json title,comments` en direct.
Variantes : jeton `${GITHUB_TOKEN}` (`.mcp.json`) ou `{env:GITHUB_TOKEN}` (`opencode.json`, à lancer par `opencode run --standalone`). Invite d'approbation du serveur de projet et invite `ask` : absentes en mode non interactif, non rejouées.
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
Le fichier réel fixe aussi `model: claude-sonnet-4-6` et 25 tours (`maxTurns`, `steps`), omis de l'extrait. Identifiant complet accepté : les six messages du sous-agent portent `claude-sonnet-4-6` (Claude Code) ; Open Code l'exécute sur `amazon-bedrock/eu.anthropic.claude-sonnet-4-6`.
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

## Démonstration 2 : sous-agent explorateur {kicker="Sous-agents"}

Un sous-agent explore le code et rend dix lignes.

::: notes
Démonstration 2, étapes en fin de module. Branche `fix/ticket-ferme-commentaires`.
Déroulé : 1. ouvrir le fichier de l'agent (lecture seule). 2. Prompt ci-dessus. 3. Montrer la session du sous-agent. 4. Rapport reçu. 5. Taille de la fenêtre principale avant et après.
Résultat attendu : rapport d'une dizaine de lignes qui désigne la règle du statut dans le domaine (`Comment.write`, `src/tickets/domain/ticket.py`), appelée par `AddComment.execute` (`src/tickets/application/comments.py`). Repli : rapport enregistré.
Résultat observé : les deux outils désignent `Comment.write` et `AddComment.execute` (`TicketClosed` déclaré, jamais levé). Claude Code : 29 s, 0,22 USD, rapport de 15 lignes dont une phrase contradictoire, reformulé par l'agent principal. Open Code : 13 s, 0,022 USD côté agent principal, rapport de 18 lignes, un fichier cité comme lu mais non ouvert, ré-emballé par l'agent principal. « Affiche son rapport tel quel » n'est obéi par aucun des deux ; dix lignes dépassées par les deux. Tokens : slide précédente. Forme d'appel : le langage naturel fonctionne dans les deux outils.
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

## Démonstration 3 : livrer une spécification {kicker="Orchestrateur"}

Un orchestrateur livre la spécification 002.

::: notes
Démonstration 3, étapes en fin de module. Branche `main` (spécification 002 écrite, code absent). Lancement de l'agent principal `orchestrateur`. Claude Code : `claude --agent orchestrateur` ; Open Code : `default_agent` des fichiers fournis par la démonstration, ou `opencode run --agent orchestrateur` en non interactif.
Déroulé : 1. instructions fixes de l'orchestrateur. 2. Trois explorations dans le même tour. 3. Tests rouges. 4. Implémentation. 5. Trois vérifications, éventuelle remarque renvoyée à l'implémentation. 6. `make test` et coût total.
Résultat attendu : tests verts et lint propre, migration créée, tests ajoutés aux 37 de départ. Le chiffre de la branche livrée (61 tests, 12 fichiers) n'est pas reproduit : le nombre dépend de l'exécution. Repli : branche `feat/responsable-priorite-haute-done`.
Résultat observé, Claude Code (`claude -p`) : 18 appels `Agent` (5 explorateurs, 3 testeurs, 4 implementeurs, 6 verificateurs), tous depuis le fil principal ; explorateurs 1 + 3 + 1 (un isolé avant les trois), vérificateurs en deux séries de trois dans le même message. Le testeur (30 tours) et l'implementeur (40 tours) atteignent leur limite au premier passage. Deux findings (lint, deux tests de la spécification 001 cassés) puis un sur le scénario 8. Fin : 71 tests verts, lint propre, 13 fichiers (10 de code et migration, 3 de tests), 18 min, 4,49 USD. Le compte rendu annonce trois passes de vérification, deux observées. Le processus `claude -p` ne se termine pas après le résultat final : jouer en interactif (non vérifié).
Résultat observé, Open Code : `opencode run --agent orchestrateur` rend la main après 16 s, une fois les trois explorations lancées en arrière-plan ; l'orchestration continue côté démon (357 s) : jouer en TUI. 11 sous-agents (3 explorateurs, testeur, implementeur, testeur de correction, 2 relances, 3 verificateurs) ; trois explorations et trois vérifications dans le même tour, aucun finding des vérificateurs. Fin : 70 tests verts, 11 fichiers (10 modifiés et la migration), 2,40 USD. Le compte rendu annonce 26 tests ajoutés, 33 réellement : ne pas s'y fier pour relever les chiffres. Imbrication : voir la slide des dérives.
Hook `guard-path.sh` des sous-agents : non observé.
:::

## Un orchestrateur répartit le travail et ne garde que les rapports. {.statement kicker="Orchestrateur"}

::: notes
Conclut la section : définition, permissions, étapes, parallélisme, coût, dérives, démonstration.
Transition : une exécution unique, avec des sous-agents. Reste l'arrêt prématuré : la section Boucles.
:::

## L'horizon double en 131 jours {.facts kicker="Boucles"}

- **Horizon de tâche** durée d'une tâche, en temps humain, qu'un modèle mène à bien avec 50 % de réussite
- **131 jours** pour doubler cet horizon
- **Tâche plus longue** dépasse une seule exécution de l'agent de code

::: sources
- [METR, Time Horizon 1.1 (29 janvier 2026)](https://metr.org/blog/2026-01-29-time-horizon-1-1/)
- [METR, Measuring AI Ability to Complete Long Tasks](https://arxiv.org/abs/2503.14499)
:::

::: notes
Le type `figures` exige trois chiffres : la slide emploie `facts`, deux chiffres (131 jours, 50 %) et la phrase de liaison. Source : METR, Time Horizon 1.1, 29 janvier 2026. Doublement post-2023 : 130,8 jours, intervalle [107, 161] (tableau d'annexe), « 131 jours » dans le texte, contre 165 jours pour la version 1. La définition du 50 % ne vient que de l'article d'origine (arXiv 2503.14499), non du billet 1.1 : « the time humans typically take to complete tasks that AI models can complete with 50% success rate ».
Réserves à dire : la mesure dépend de la composition des tâches ; la page `metr.org/time-horizons` précise ne plus être mise à jour (8 septembre 2026).
Lien avec la suite : les tâches confiées à un agent de code s'allongent, donc une seule exécution ne suffit plus.
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
Open Code : aucune commande équivalente à `/goal` documentée ; `opencode run` envoie le message tel quel sans développer `/commande` (équivalences). Au rejeu, l'agent lit lui-même `.opencode/commands/fix-until-green.md` avec `read` et suit le texte, sans l'`agent: implementeur` du frontmatter. Le développement natif se joue en TUI. Claude Code développe la commande en `claude -p`.
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

## Le code de retour d'une commande remplace l'avis du modèle sur la fin. {.statement kicker="Boucles"}

::: notes
Conclut la section : horizon de tâche, critère, définition, commande, script, cas Airbnb.
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

## Démonstration 4 : boucle de correction {kicker="Garde-fous"}

Une commande boucle jusqu'à des tests verts.

::: notes
Démonstration 4, étapes en fin de module. Branche `fix/ticket-ferme-commentaires` (deux tests rouges). Commande `fix-until-green` (Claude Code : `.claude/commands/` ; Open Code : `.opencode/commands/`, en TUI).
Déroulé : 1. `make test` rouge. 2. Lire la commande (cinq relances). 3. Relances comptées. 4. Un échec persistant puis la réussite. 5. Règle `deny` sur `tests/` visible si l'agent tente de modifier les tests. 6. `git diff` lu à voix haute.
Résultat attendu : tous les tests passent en cinq relances au plus. Repli : branche `fix/ticket-ferme-commentaires-done`.
Résultat observé, Claude Code (`claude -p`, commande développée) : `2 failed, 37 passed` avant, `39 passed` après, 42 s, 0,29 USD, une relance (« Relance 1 : succès »), pas d'échec persistant à montrer. Diff dans `src/tickets/domain/ticket.py` seulement : import de `TicketClosed` et `if ticket.status == Status.CLOSED: raise TicketClosed(ticket.id)` dans `Comment.write`, trois lignes, sans la méthode `ensure_accepts_comments` annoncée par la branche corrigée.
Open Code (`opencode run`, `--standalone`) : 43 s, 0,22 USD (parent 0,049, sous-agent 0,172), 39 verts, même diff limité à `ticket.py`. Le shell du sous-agent est refusé (`cd <chemin> && make test` ne correspond pas à la règle `make *`) : c'est l'agent principal qui lance `make test`, donc zéro test lancé par l'implementeur. Premier essai écarté : base de test contaminée par la démonstration 3, l'agent avait réécrit une migration.
Tentative de contournement des tests : aucune dans les deux outils.
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
Illustration schématique de l'interface web de la branche `feat/front` de tickets-api, à 1280x720 : un bandeau en `position: fixed` recouvre le bouton « Ajouter ». Le rejeu a produit des captures réelles avant et après correction (bandeau jaune « Maintenance prévue samedi 20 h : l'API sera indisponible dix minutes. », titre masqué, formulaire rogné) ; la slide garde le schéma.
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
Fichiers : `.mcp.json` (Claude Code), `opencode.json` (Open Code). Configuration fournie par la démonstration. Serveur local : processus lancé par l'agent de code. Claude Code : `command` et `args` (sans `type`, une entrée vaut stdio). Open Code v2 : `type: "local"`, `command` en tableau. `--isolated` (profil en mémoire) est confirmé dans le README de Playwright MCP.
`--browser chromium` est nécessaire (rejeu) : sans lui, la version 0.0.83 cible Google Chrome (`/opt/google/chrome/chrome`) et échoue avec « Chromium distribution 'chrome' is not found » aux deux outils. Le navigateur s'installe par `npx @playwright/mcp@0.0.83 install-browser chrome-for-testing` (12 s, 118,6 Mo) ; `npx playwright install chromium` ne suffit pas (révision différente de celle que le serveur attend).
Le serveur de projet de `.mcp.json` demande une approbation en session interactive de Claude Code. Claude Code : `.mcp.json` du dépôt ; Open Code : `opencode.json` fourni par la démonstration, rien à ajouter.
:::

## Constater, corriger, vérifier {kicker="Interface"}

![Trois étapes en boucle : constater par une capture, corriger la feuille de style, vérifier par une nouvelle capture](images/01-cycle-interface.svg)

La vérification est une capture lue par l'agent de code.

::: notes
Le critère n'est plus un code de retour mais une capture que l'agent de code lit. Un défaut restant déclenche une nouvelle correction.
Ouverture sur la boucle : la vérification visuelle est une relance avec une capture comme critère. À conserver sous contrôle humain : jugement du rendu final.
:::

## Démonstration 5 : corriger un bandeau {kicker="Interface"}

Un serveur MCP de navigateur vérifie le correctif.

::: notes
Démonstration 5, étapes en fin de module. Branche `feat/front`. Serveur Playwright. Claude Code : `.mcp.json` du dépôt ; Open Code : `opencode.json` fourni par la démonstration, rien à ajouter.
Déroulé : 1. serveur lancé. 2. Capture initiale. 3. Bandeau repéré. 4. Correction CSS. 5. Capture finale. 6. `make test` toujours passant.
Résultat attendu : bouton « Ajouter » cliquable, capture avant et après. Repli : captures enregistrées et branche corrigée.
Résultat observé, Claude Code (configuration avec `--browser chromium`) : 155 s, 33 tours, 0,72 USD. L'agent clique sur `#ajouter` (le clic réussit malgré le bandeau) et ajoute « Bug de connexion ». Correctif : `body { margin: 0; padding-top: 64px; }` dans `src/tickets/ui/style.css`, une ligne ; le bandeau reste fixe, contrairement au correctif de référence (`position: static`). Cinq captures de vérification : les deux premières montrent l'ancienne feuille de style (cache HTTP du navigateur), l'agent recharge la feuille par `browser_evaluate`. `make test` : 37 verts, diff limité à `style.css`.
Open Code : 77 s, 37 étapes, 0,415 USD. Défaut constaté par coordonnées (bandeau `0,0,1280,65`, `h1` à `280,8`). Correctif : `main { padding: 72px 16px 32px; }`, même rechargement de la feuille (`browser_run_code_unsafe`). L'agent n'a pas ajouté de ticket (aucun clic sur « Ajouter »). Il a modifié `opencode.json` lui-même pour ajouter `--browser chromium` : diff plus large que la feuille de style. `make test` : 37 verts.
Le prompt ne donne pas l'URL : les agents la trouvent par `curl` sur `localhost:8000/ui/`.
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

## Démonstration 1 : lire une issue par MCP {.tp}

Un serveur MCP GitHub donne à l'agent de code une issue et ses commentaires. Branche `fix/ticket-ferme-commentaires` de `tickets-api`.

Prérequis : Claude Code 2.1.310 ou Open Code v2.0.32, `gh` connecté, `docker`, `uv`, accès à `imihalcea/tickets-api`, port 5432 libre.

### Préparer la copie de session

La copie est un dépôt privé distinct de la référence : la référence ne reçoit jamais d'issue.

```bash
export SESSION=demo
export REFERENCE=imihalcea/tickets-api
export TARGET="$REFERENCE-$SESSION"
export WORK="$HOME/travail/tickets-api-$SESSION"

gh repo create "$TARGET" --private --description "Dépôt de session $SESSION"
tmp=$(mktemp -d)
git clone --mirror "$(gh repo view "$REFERENCE" --json sshUrl -q .sshUrl)" "$tmp/reference.git"
git -C "$tmp/reference.git" push --mirror "$(gh repo view "$TARGET" --json sshUrl -q .sshUrl)"
rm -rf "$tmp"

mkdir -p "$HOME/travail"
git clone "$(gh repo view "$TARGET" --json sshUrl -q .sshUrl)" "$WORK"
cd "$WORK"
git checkout fix/ticket-ferme-commentaires
make db-up
uv sync
```

::: attendu
`make test` affiche `2 failed, 37 passed`. Les échecs sont `test_add_comment_on_closed_ticket_returns_409` et `test_closed_ticket_refuses_comments`.
:::

::: indice
Copie déjà créée lors d'une séance précédente : ignorer les lignes `gh repo create` à `rm -rf`, et cloner seulement si `$WORK` n'existe pas. Port 5432 pris par un autre projet (conteneur `tickets-api-db-1`) : `docker stop tickets-api-db-1` avant `make db-up`.
:::

### Créer l'issue de démonstration

L'issue porte un constat et deux commentaires. Elle est créée dans la copie de session, jamais dans la référence.

```bash
cd "$WORK"
gh issue create --repo "$TARGET" --title "Un ticket fermé accepte encore des commentaires" --body-file - <<'EOF'
## Constat

`POST /tickets/{id}/comments` répond 201 sur un ticket au statut `closed`. Le commentaire est enregistré.

## Attendu

Un ticket fermé refuse les commentaires. La réponse est un 409 avec un message qui nomme le statut.

## Piste

La vérification du statut manque au moment de l'ajout du commentaire.
EOF
gh issue comment 1 --repo "$TARGET" --body-file - <<'EOF'
Reproduit sur `main` : création d'un ticket, passage à `closed`, ajout d'un commentaire. Le commentaire apparaît dans `GET /tickets/{id}/comments`.
EOF
gh issue comment 1 --repo "$TARGET" --body-file - <<'EOF'
Le test d'intégration `test_add_comment_on_closed_ticket_returns_409` décrit déjà le comportement attendu. Il échoue aujourd'hui.
EOF
```

::: attendu
`gh issue view 1 --repo "$TARGET" --json title,comments` affiche le titre et deux commentaires.
:::

::: indice
`gh issue view 1 --comments` échoue avec gh 2.46.0 (`GraphQL: Projects (classic) is being deprecated`) : employer toujours `--json title,comments`.
:::

### Montrer l'impasse sans MCP

Un faux `gh` cache la ligne de commande GitHub à l'agent de code. Le serveur MCP n'est pas encore déclaré.

```bash
mkdir -p "$HOME/sans-gh"
cat > "$HOME/sans-gh/gh" <<'EOF'
#!/usr/bin/env bash
echo "gh: command not found" >&2
exit 127
EOF
chmod +x "$HOME/sans-gh/gh"
```

::: claude-code
```console
$ cd "$WORK"
$ PATH="$HOME/sans-gh:$PATH" claude --model claude-sonnet-4-6
```
:::

::: opencode
Le modèle est fixé dans `opencode.json` : aucune option de modèle.

```console
$ cd "$WORK"
$ PATH="$HOME/sans-gh:$PATH" opencode
```
:::

Prompt, sans mention du serveur MCP :

```prompt
Lis l'issue n° 1 du dépôt imihalcea/tickets-api-demo et ses commentaires. Résume le bug en trois lignes exactement et nomme le test qui devrait le couvrir. Ne modifie rien.
```

::: attendu
L'agent de code ne lit pas l'issue. Sous Claude Code, il tente `gh`, puis `curl`, puis `python3` (refusés ou sans résultat). Sous Open Code, l'impasse n'a pas été jouée : à relever à l'essai.
:::

::: indice
Quitter la session de l'agent avant l'étape suivante. Si l'agent trouve l'issue par un autre moyen, le dire à la salle : le but est de montrer que l'information reste hors de portée sans outil dédié.
:::

### Déclarer le serveur MCP

Le jeton est lu dans l'environnement du shell, jamais écrit dans un fichier.

```console
$ export GITHUB_TOKEN=$(gh auth token)
```

::: claude-code
Fichiers `.mcp.json` et `.claude/settings.json` à la racine de la copie. Les trois outils de lecture sont autorisés, les trois outils d'écriture demandent une confirmation.

```bash
cd "$WORK"
mkdir -p .claude
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
  "model": "claude-sonnet-4-6",
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

Lancer `claude --model claude-sonnet-4-6`, approuver le serveur du projet à la demande d'approbation, puis taper `/mcp`.
:::

::: opencode
Fichier `opencode.json` à la racine de la copie, en forme v2 (`mcp.servers`, `permissions` en tableau, la dernière règle correspondante l'emporte).

```bash
cd "$WORK"
cat > opencode.json <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "amazon-bedrock/eu.anthropic.claude-sonnet-4-6",
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
Le serveur `github` figure dans la liste (`/mcp` sous Claude Code, `✓ github` à `opencode mcp list` et `/mcps` sous Open Code). L'en-tête `Authorization` statique est accepté. L'invite d'approbation du serveur de projet et la liste en interactif n'ont pas été relevées : à relever à l'essai.
:::

::: indice
Open Code v2 lance un démon d'arrière-plan qui n'hérite pas de l'environnement du shell : sans `GITHUB_TOKEN` côté démon, le serveur échoue (`Authorization header is badly formatted`) et l'agent contourne par `curl`. En non interactif, ajouter `--standalone` à `opencode run`. En TUI, vérifier `opencode mcp list` avant la séance. Sous Claude Code, sans `list_issues` ni `get_me` dans `allow`, l'agent est bloqué par les permissions.
:::

### Lire l'issue par le serveur MCP

Relever d'abord la taille de la fenêtre de contexte : `/context` sous Claude Code ; sous Open Code, aucune commande équivalente documentée, noter le coût du premier tour.

```prompt
Avec le serveur MCP github, sans gh ni curl, lis l'issue n° 1 du dépôt imihalcea/tickets-api-demo et ses commentaires. Résume le bug en trois lignes exactement et nomme le test qui devrait le couvrir. Ne modifie rien.
```

::: attendu
Résumé exact du bug (un ticket fermé accepte des commentaires, la réponse est 201 au lieu de 409) et test nommé, `test_add_comment_on_closed_ticket_returns_409`. Appels observés : `list_issues` (le corps de l'issue vient de là) puis `issue_read` avec `method: get_comments` ; `issue_read` avec `method: get` n'est pas appelé. Noms d'outils : `mcp__github__issue_read` et `mcp__github__list_issues` sous Claude Code, `tools.github.issue_read` et `tools.github.list_issues` par l'outil `execute` sous Open Code.

Relevé du 25 octobre 2026 en non interactif. Claude Code : 16 s, 5 tours, 0,079 USD ; la réponse tient en quatre paragraphes au lieu de trois lignes. Open Code (`--standalone`) : 19 s, 7 étapes, 0,085 USD, trois lignes. Le déroulé en TUI est à relever à l'essai.
:::

::: indice
Sans le dépôt ni le numéro dans le prompt, l'agent appelle `get_me` et `list_issues` pour chercher l'issue, hors de l'`allow` : refus en non interactif. Le dépôt de la copie s'obtient par `gh repo view --json nameWithOwner -q .nameWithOwner`. Pour forcer l'appel de `issue_read` avec `method: get`, écrire « lis l'issue avec `issue_read` » dans le prompt (non vérifié). Repli si le réseau ou le jeton échoue : lire à voix haute le titre et les commentaires de l'étape 02, puis `gh issue view 1 --repo "$TARGET" --json title,comments` en direct.
:::

### Comparer avec gh et contrôler

Dans un autre terminal, sans le faux `gh`, puis dans la copie :

```console
$ gh issue view 1 --repo "$TARGET" --json title,comments
$ git status --short
```

Relever la fenêtre de contexte après le prompt (`/context` sous Claude Code).

::: attendu
`gh` rend le même contenu que le serveur MCP. `git status` ne liste que les fichiers de configuration posés à l'étape 04 (`.mcp.json` et `.claude/settings.json`, ou `opencode.json`) : l'agent n'a rien modifié. Fenêtre sous Claude Code au relevé du 25 octobre 2026 : 26,9k tokens avant, 41,0k après (chiffres du poste, serveurs MCP et skills personnels compris). Sous Open Code, l'entrée par étape passe de 12 146 à 21 794 tokens.
:::

::: indice
Remise à zéro avant la démonstration suivante : `cd "$WORK" && git checkout -- . && git clean -fdq -e .venv -e node_modules` (supprime la configuration posée à l'étape 04). L'issue reste dans la copie de session et n'est pas recréée.
:::

## Démonstration 2 : déléguer à un sous-agent explorateur {.tp}

Un sous-agent explore le code des commentaires et rend dix lignes à l'agent principal. Branche `fix/ticket-ferme-commentaires`.

Prérequis : Claude Code 2.1.310 ou Open Code v2.0.32, `gh`, `docker`, `uv`, copie de session de la démonstration 1. Aucun jeton GitHub.

### Se placer sur la branche

Variables `SESSION`, `TARGET` et `WORK` de la démonstration 1 posées.

```bash
cd "$WORK"
git checkout -- . && git clean -fdq -e .venv -e node_modules
git checkout fix/ticket-ferme-commentaires
make db-up
uv sync
```

::: claude-code
Le sous-agent `explorateur` est dans le dépôt (`.claude/agents/explorateur.md`), sans changement.
:::

::: opencode
Le dépôt porte l'explorateur en forme v1. Le remplacer par la forme v2 (`permissions` en tableau, quatre refus) :

```bash
mkdir -p .opencode/agents
cat > .opencode/agents/explorateur.md <<'EOF'
---
description: Explore un périmètre du dépôt en lecture seule et rend un résumé de dix lignes au plus
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

1. Fichiers lus, chemins relatifs à la racine du dépôt (jamais de chemin absolu). Cite comme lu un fichier seulement si tu l'as ouvert avec `read`.
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
Port 5432 pris par un autre projet `tickets-api` : `docker stop tickets-api-db-1`, puis relancer `make db-up`.
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
model: claude-sonnet-4-6
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

### Lancer l'agent principal

::: claude-code
```console
$ claude --model claude-sonnet-4-6
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
Une session interactive s'ouvre sur le modèle `claude-sonnet-4-6`. La fenêtre de départ est relevée.
:::

### Déléguer l'exploration

```prompt
Délègue à l'explorateur l'exploration de tout ce qui touche aux commentaires d'un ticket. Question : où vérifier le statut du ticket avant d'ajouter un commentaire ? Réponds en recopiant son rapport mot pour mot, sans le reformuler, le mettre en forme ni le commenter, et sans rien ajouter avant ou après.
```

::: attendu
Rapport d'une quinzaine de lignes (15 sous Claude Code, 18 sous Open Code au relevé du 25 octobre 2026 pour une limite de dix). Il désigne `Comment.write` (`src/tickets/domain/ticket.py`, ligne 72), qui ne vérifie pas `ticket.status`, appelée par `AddComment.execute` (`src/tickets/application/comments.py`, lignes 23 à 26), et signale `TicketClosed` (`errors.py`, ligne 21) déclarée mais jamais levée. Le point de vérification du statut est donc dans le domaine, appelé depuis le cas d'usage.

Écarts observés : avec l'ancienne formulation (« tel quel »), l'agent principal a reformulé le rapport dans les deux outils ; sous Open Code, `routers/comments.py` est listé comme lu sans avoir été ouvert. L'effet de la formulation ci-dessus n'a pas été rejoué : à relever à l'essai. Sous Claude Code, durée 29 s, 0,22 USD ; sous Open Code, 13 s, 0,022 USD pour l'agent principal et 0,083 USD pour la session enfant.
:::

::: indice
Le langage naturel déclenche la délégation dans les deux outils. Sous Claude Code, `@"explorateur (agent)"` fonctionne aussi en non interactif ; la mention interactive est à vérifier à la main. Si le rapport dépasse dix lignes, l'annoncer comme « une quinzaine de lignes » ou durcir les instructions de l'explorateur. Repli : ouvrir `src/tickets/application/comments.py` et `src/tickets/domain/ticket.py` et lire à voix haute la réponse ci-dessus.
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
:::

::: attendu
Le sous-agent lit beaucoup, l'agent principal reçoit peu. Relevé du 25 octobre 2026. Claude Code : 15 017 tokens lus par le sous-agent (6 outils : `Grep` 2, `Glob` 1, `Read` 3, 18,9 s), environ 1,2k reçus par l'agent principal (contexte de 32 397 à 33 575). Open Code : environ 38 000 tokens dont 23 365 lus en cache pour la session enfant (3 étapes), environ 640 reçus par l'agent principal (fenêtre de 12 146 à 12 790). Le panneau d'agents et la session enfant en TUI sont à relever à l'essai. `git status` est propre hors configuration : l'explorateur ne modifie rien.
:::

::: indice
Remise à zéro : `git checkout -- . && git clean -fdq -e .venv -e node_modules`.
:::

## Démonstration 3 : livrer une spécification avec un orchestrateur {.tp}

L'orchestrateur répartit la spécification 002 entre cinq agents. Branche `main` de `tickets-api` : spécification écrite, code absent.

Prérequis : Claude Code 2.1.310 ou Open Code v2.0.32, `gh`, `docker`, `uv`, copie de session de la démonstration 1. La plus longue et la plus coûteuse : la lancer une fois.

### Se placer sur main

La spécification 002 est écrite dans `specs/002-responsable-priorite-haute/`, le code est absent, 37 tests passent. Variables `SESSION`, `TARGET` et `WORK` de la démonstration 1 posées.

```bash
cd "$WORK"
git checkout -- . && git clean -fdq -e .venv -e node_modules
git checkout main
make db-up
uv sync
```

Les cinq agents (`orchestrateur`, `explorateur`, `testeur`, `implementeur`, `verificateur`) sont dans le dépôt : `.claude/agents/` et `.opencode/agents/`.

::: claude-code
Aucune configuration à poser : l'orchestrateur se lance par `--agent` à l'étape 03.
:::

::: opencode
Un `opencode.json` désigne l'orchestrateur comme agent par défaut, pour que la TUI démarre dessus. Il ne déclare aucun serveur MCP, donc aucun jeton.

```bash
cat > opencode.json <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "amazon-bedrock/eu.anthropic.claude-sonnet-4-6",
  "instructions": [".specify/memory/constitution.md"],
  "default_agent": "orchestrateur"
}
EOF
opencode debug agents
```
:::

::: attendu
`make test` affiche 37 tests verts. Sous Open Code, `opencode debug agents` liste `orchestrateur` en mode `primary`.
:::

::: indice
Base de test : l'orchestrateur ajoute une migration Alembic (`assignee`). La base partagée reste à la révision `0002` après la démonstration et fait échouer les suivantes (14 erreurs alembic au relevé). Avant la démonstration 4, la ramener à l'état de `main` (`uv run alembic downgrade -1`) ou employer une base dédiée. Port 5432 pris : `docker stop tickets-api-db-1`.
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
model: claude-sonnet-4-6
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
```console
$ cat .opencode/agents/orchestrateur.md
```

Même corps que sous Claude Code, avec l'outil `task` à la place de `Agent`. L'en-tête diffère :

```markdown
---
description: Livre une spec en répartissant exploration, tests, implémentation et vérification entre sous-agents ; ne modifie rien lui-même
mode: primary
steps: 60
permission:
  edit: deny
  bash:
    "*": deny
    "make test*": allow
    "make lint*": allow
    "git status*": allow
    "git diff*": allow
    "cat *": allow
  webfetch: deny
---
```
:::

::: attendu
Cinq étapes fixes : trois explorations dans le même tour, tests rouges, implémentation, trois vérifications dans le même tour, compte rendu. L'orchestrateur ne modifie aucun fichier.
:::

### Lancer l'orchestrateur

::: claude-code
```console
$ claude --agent orchestrateur --model claude-sonnet-4-6
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
Jouer en interactif. Claude Code en `claude -p` : le processus est resté bloqué 20 min après le résultat final (observé une fois). Open Code en `opencode run --agent orchestrateur` : la main est rendue après 16 s, quand les trois explorations partent en arrière-plan, alors que l'orchestration continue dans le démon (357 s en tout). Si les invites de permission ralentissent la salle, prévoir `--permission-mode acceptEdits` sous Claude Code.
:::

### Déléguer la livraison

```prompt
Livre la spécification 002 en suivant tes étapes.
```

Observer : explorations lancées dans le même tour, tests rouges du testeur, implémentation, vérifications par série de trois, remarque éventuellement renvoyée à l'implémentation.

::: attendu
Relevé du 25 octobre 2026, non interactif ; le TUI est à relever à l'essai. Claude Code : 18 appels `Agent` (5 explorateurs, 3 testeurs, 4 implementeurs, 6 verificateurs), tous depuis le fil principal ; une exploration isolée, puis trois ; deux séries de trois vérificateurs. Le testeur (30 tours) et l'implementeur (40 tours) atteignent leur limite au premier passage. Deux findings (lint, deux tests de la spécification 001 cassés), puis un sur le scénario 8. Fin : 71 tests verts, lint propre, 13 fichiers (10 de code et migration, 3 de tests), 18 min, 4,49 USD. Le compte rendu annonce trois passes de vérification, deux observées.

Open Code : 11 sous-agents (3 explorateurs, testeur, implementeur, testeur de correction, 2 relances, 3 verificateurs) ; trois explorations et trois vérifications dans le même tour, aucun finding. Fin : 70 tests verts, 11 fichiers, 2,40 USD. Le compte rendu annonce 26 tests ajoutés, 33 réellement. Annoncer à la salle « 70 ou 71 tests » et « 11 ou 13 fichiers » : le nombre dépend de l'exécution.
:::

::: indice
Le hook `guard-path.sh` des sous-agents (périmètre d'écriture sous Claude Code) n'a pas été observé. L'imbrication d'un sous-agent dans un sous-agent est refusée par défaut sous Open Code (`Subagent depth limit reached (1)`). Repli si la livraison échoue ou dure trop : `git checkout origin/feat/responsable-priorite-haute-done` (61 tests, `make test`), puis `git diff main..HEAD --stat` (12 fichiers : neuf de code et de documentation, dont la migration `20260907_0002_ticket_assignee.py`, et trois de tests).
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
Remise à zéro : `git checkout -- . && git clean -fdq -e .venv -e node_modules` ; si l'orchestrateur a commité, `git reset --hard origin/main`. Rétablir la base de test avant la démonstration 4.
:::

## Démonstration 4 : boucle de correction sous garde-fous {.tp}

Une commande du dépôt corrige le code jusqu'à des tests verts, sous garde-fous. Branche `fix/ticket-ferme-commentaires`, deux tests rouges.

Prérequis : Claude Code 2.1.310 ou Open Code v2.0.32, `gh`, `docker`, `uv`, copie de session de la démonstration 1.

### Se placer sur la branche et poser les garde-fous

Variables `SESSION`, `TARGET` et `WORK` de la démonstration 1 posées. La commande se joue en session interactive.

```bash
cd "$WORK"
git checkout -- . && git clean -fdq -e .venv -e node_modules
git checkout fix/ticket-ferme-commentaires
make db-up
uv sync
```

::: claude-code
La règle `deny` protège `tests/` contre l'outil `Edit`. Elle bloque aussi le testeur de l'orchestrateur : ne la garder que pour cette démonstration.

```bash
mkdir -p .claude
cat > .claude/settings.json <<'EOF'
{
  "model": "claude-sonnet-4-6",
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
L'agent `implementeur` en forme v2 : l'édition est autorisée, puis refusée sur `tests/*`, `.github/*` et `.opencode/*` (le joker `*` couvre `/`, la dernière règle correspondante l'emporte).

```bash
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

Avant de rendre la main : `make lint` et `make test` verts (lance chaque commande seule, sans `cd` ni `&&`), ou l'explication précise de
ce qui bloque.

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
Base de test laissée à la révision Alembic `0002` par la démonstration 3 : `make test` donne 14 erreurs et l'agent est tenté de réécrire une migration. Repartir d'une base propre (`uv run alembic downgrade -1`, ou `make db-down` puis `make db-up`). Port 5432 pris : `docker stop tickets-api-db-1`.
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

### Lancer la boucle

::: claude-code
```console
$ claude --model claude-sonnet-4-6
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
Tous les tests passent en cinq relances au plus (39 verts). Le correctif tient en trois à cinq lignes dans `src/tickets/domain/ticket.py` : import de `TicketClosed` et `if ticket.status == Status.CLOSED: raise TicketClosed(ticket.id)` dans `Comment.write`. Relevé du 25 octobre 2026, non interactif. Claude Code : 42 s, 0,29 USD, `2 failed, 37 passed` avant, `39 passed` après, une relance, pas d'échec persistant à montrer. Open Code : 43 s, 0,22 USD (agent principal 0,049, sous-agent 0,172), 39 verts, même diff limité à `ticket.py`. Aucune tentative de contourner les tests dans les deux outils. Le déroulé de `/fix-until-green` en TUI est à relever à l'essai.
:::

::: indice
Sous Open Code, en non interactif, `/fix-until-green` n'est pas développé : l'agent lit le fichier de la commande avec `read`, lance `make test` puis délègue à `implementeur`. Le sous-agent a écrit `cd <chemin> && make test`, refusé par la règle `shell make *` : l'agent `implementeur` ci-dessus demande de lancer chaque commande seule, sans `cd`. Sans cette consigne, l'agent principal lance les tests à sa place. Si l'agent tente de modifier `tests/`, montrer le refus : `Edit(tests/**)` sous Claude Code, `Permission denied: edit` sous Open Code. Sous Claude Code, `sed -i` par `Bash` échappe à `Edit`. Repli : `git checkout origin/fix/ticket-ferme-commentaires-done` (39 verts) et lecture du `git diff` contre la branche de départ.
:::

### Contrôler le diff

```console
$ make test
$ git diff --stat
```

Lire le `git diff` à voix haute.

::: attendu
`make test` : 39 verts. Seul `src/` change (`src/tickets/domain/ticket.py`) ; `tests/` est intact.
:::

::: indice
Remise à zéro, deux tests de nouveau rouges : `git checkout -- . && git clean -fdq -e .venv -e node_modules`, puis reposer les garde-fous de l'étape 01.
:::

## Démonstration 5 : corriger un bandeau par MCP {.tp}

Un serveur MCP pilote un navigateur : l'agent de code constate un défaut d'interface, le corrige et vérifie le rendu. Branche `feat/front` de `tickets-api`.

Prérequis : Claude Code 2.1.310 ou Open Code v2.0.32, `gh`, `docker`, `uv`, `node`, copie de session de la démonstration 1.

### Préparer la copie et le navigateur

La branche porte un bandeau `position: fixed` qui recouvre le formulaire de `/ui` à 1280x720 (titre « Tickets » masqué, bouton « Ajouter » rogné) ; l'API répond correctement et les 37 tests passent. Le serveur Playwright se lance par `npx @playwright/mcp@0.0.83` (version testée le 25 octobre 2026, à revérifier par `npm view @playwright/mcp version`).

```bash
cd "$WORK"
git checkout -- . && git clean -fdq -e .venv -e node_modules
git checkout feat/front
make db-up
uv sync
npx --yes @playwright/mcp@0.0.83 install-browser chrome-for-testing
```

::: attendu
Le navigateur s'installe (12 s, 118,6 Mo, `chromium_headless_shell-1247` dans `~/.cache/ms-playwright`).
:::

::: indice
Playwright MCP 0.0.83 cible par défaut le canal `chrome` (Google Chrome système) : sans Chrome installé, le serveur échoue (`Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome`). La configuration ci-dessous passe `--browser chromium`, qui s'appuie sur ce navigateur. `npx playwright install chromium` ne suffit pas : la révision diffère de celle attendue par le serveur. Réseau coupé : la veille, lancer une fois `npx @playwright/mcp@0.0.83 --help` pour remplir le cache de npm (à vérifier hors ligne).
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
  "model": "claude-sonnet-4-6",
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
  "model": "amazon-bedrock/eu.anthropic.claude-sonnet-4-6",
  "instructions": [".specify/memory/constitution.md"],
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": ["npx", "@playwright/mcp@0.0.83", "--browser", "chromium", "--headless", "--isolated"]
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
Les fichiers JSON sont valides (`jq` ne affiche rien). Sous Open Code, `opencode debug config` décode l'entrée `playwright`.
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
$ claude --model claude-sonnet-4-6
```

Approuver le serveur du projet à la demande d'approbation, puis `/mcp` pour lister les outils.
:::

::: opencode
```console
$ opencode
```

Aucune approbation ; `/mcps` pour lister les outils.
:::

::: attendu
Le serveur `playwright` figure dans la liste. L'invite d'approbation, `/mcp` et `/mcps` n'ont pas été relevés : à relever à l'essai.
:::

### Constater, corriger, vérifier

```prompt
Avec le serveur MCP playwright, ouvre http://localhost:8000/ui/ à 1280x720, saisis un titre dans le champ puis clique sur « Ajouter », constate le défaut d'interface, corrige-le dans src/tickets/ui/style.css, sans sous-agent, et vérifie le rendu par une capture. Ne modifie ni la configuration MCP ni les tests.
```

::: attendu
Capture initiale : le bandeau jaune recouvre le formulaire. Capture finale : le formulaire et le bouton « Ajouter » sont visibles et cliquables. Le défaut vient de `.bandeau` en `position: fixed`. Le correctif de l'agent varie, ne pas annoncer une ligne précise : le bandeau restait fixe, avec `body { margin: 0; padding-top: 64px; }` sous Claude Code et `main { padding: 72px 16px 32px; }` sous Open Code. Outils observés : `browser_resize`, `browser_navigate`, `browser_take_screenshot`, `browser_fill_form`, `browser_click`, `browser_evaluate` sous Claude Code ; `browser_resize`, `browser_navigate`, `browser_snapshot`, `browser_take_screenshot`, `browser_click`, `browser_run_code_unsafe` sous Open Code. Noms côté agent : `mcp__playwright__browser_navigate` sous Claude Code, `tools.playwright.browser_navigate` dans l'outil `execute` sous Open Code.

Relevé du 25 octobre 2026, non interactif, avec l'ancien prompt (sans URL ni clic). Claude Code : 155 s, 33 tours, 0,72 USD, cinq captures de vérification. Open Code : 77 s, 37 étapes, 0,415 USD, aucun clic sur « Ajouter ». L'effet du prompt ci-dessus n'a pas été rejoué : à relever à l'essai.
:::

::: indice
Piège du cache : la page reste en cache après la correction, deux captures montrent la feuille de style non corrigée ; l'agent recharge la feuille par `browser_evaluate` (Claude Code) ou `browser_run_code_unsafe` (Open Code). Sous Open Code, `browser_click` avec `target: "ref=e6"` échoue, `"#titre"` fonctionne. Avec l'ancien prompt, l'agent cherchait l'URL par `curl`, et sous Open Code il a modifié `opencode.json` pour ajouter `--browser chromium` : d'où la consigne de ne pas toucher à la configuration MCP.

Repli si le serveur ou le navigateur est indisponible : appliquer le correctif de référence (le bandeau devient `position: static`), recharger `/ui/` et montrer le résultat dans un navigateur.

```console
$ sed -i 's/^\.bandeau { position: fixed; top: 0; left: 0; right: 0;/.bandeau { position: static;/' src/tickets/ui/style.css
```
:::

### Contrôler le correctif

```console
$ make test
$ git diff -- src tests
$ git status --short
```

::: attendu
`make test` : 37 verts. Le diff de `src` et `tests` se limite à `src/tickets/ui/style.css`. Le serveur écrit des captures et des fichiers `page-*.yml` dans `.playwright-mcp/` : l'ignorer dans `git status`, ou l'ajouter au `.gitignore` de la copie.
:::

::: indice
Remise à zéro : arrêter l'API (commande de l'étape 03), puis `git checkout -- . && git clean -fdq -e .venv -e node_modules`.
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
