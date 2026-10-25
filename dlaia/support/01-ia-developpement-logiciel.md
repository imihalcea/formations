# L'IA appliquée au développement logiciel

Modèle, agent et prompt

::: notes
Module 1, 1h15 d'exposé puis TP 1 partie A (45 min). Jour 1 : piloter l'agent, cadrer, spécifier. L'ouverture a présenté le programme ; ce module part d'une scène concrète que toute la formation reprend.
:::

## Une fonction confiée à l'agent {kicker="Point de départ"}

![À gauche cinq règles métier sur une page, à droite un terminal où tourne un agent, entre les deux le texte que le développeur écrit](images/01-depart.svg)

Une règle métier est une contrainte du domaine que toute réservation respecte. Un agent est un programme qui agit dans le dépôt à partir du texte reçu.

::: notes
Scène du fil rouge bookit : la fonction `validate_booking` est la seule que les TP font écrire. Les cinq règles reviennent sur la slide des règles métier avant le TP 1, avec leurs codes.
Le texte du milieu est l'objet des deux jours : d'une phrase (TP 1) à une spécification versionnée (TP 4).
La définition mécanique de l'agent (modèle dans une boucle d'outils) vient dans la section « L'agent » ; ici, son comportement observable suffit.
:::

## La qualité et la pertinence du code sont sensibles à la qualité des informations reçues. {.statement kicker="Point de départ"}

::: notes
Thèse du module. Le TP 1 la fait éprouver : même fonction, deux textes, deux résultats.
:::

## Quatre générations d'assistance au code {kicker="Quatre générations"}

![Frise à quatre jalons : complétion de l'IDE, suggestion dans l'éditeur, assistant conversationnel, agent](images/01-generations.svg)

Une génération est une étape de l'assistance au code, définie par ce que le développeur fait de ses mains.

::: sources
- [GitHub Blog, Introducing GitHub Copilot, 29 juin 2021](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/)
- [Wikipédia, ChatGPT (publié le 30 novembre 2022)](https://en.wikipedia.org/wiki/ChatGPT)
- [Anthropic, Claude 3.7 Sonnet and Claude Code, 24 février 2025](https://www.anthropic.com/news/claude-3-7-sonnet)
:::

::: notes
Copilot : « technical preview » le 29 juin 2021, « suggesting whole lines or entire functions » dans l'éditeur.
ChatGPT : 30 novembre 2022, assistant conversationnel ; la page d'annonce d'OpenAI refuse les lectures automatiques, d'où Wikipédia.
Claude Code : « limited research preview » le 24 février 2025 ; « can search and read code, edit files, write and run tests, commit and push code ».
La complétion de l'IDE n'a pas de date : elle est déterministe et antérieure aux modèles.
Les dates sont celles des annonces publiques, pas des premières recherches.
:::

## Le développeur intervient deux fois {kicker="Quatre générations"}

![Deux chaînes : en génération 3 sept gestes à la main, en génération 4 deux moments autour d'un bloc agent](images/01-deux-moments.svg)

::: sources
- [Claude Code, How Claude Code works : The agentic loop](https://code.claude.com/docs/en/how-claude-code-works#the-agentic-loop)
- [Open Code, Intro](https://opencode.ai/docs/)
:::

::: notes
Doc Claude Code : « gather context, take action, verify results », l'utilisateur peut interrompre à tout moment. Open Code : agent de code libre, terminal, tout fournisseur de modèle.
Ce qui change pour le développeur : il ne colle plus, il ne place plus. Il écrit avant et il relit après. Les deux jours de formation traitent ces deux moments : jour 1 ce qui s'écrit avant, jour 2 ce qui se vérifie après.
:::

## L'agent change le travail du développeur : formuler avant, relire après. {.statement kicker="Quatre générations"}

::: notes
Conclut les deux slides précédentes. « Formuler » et « relire » reviennent à chaque TP.
:::

## Les LLM expliqués en vidéo {.video kicker="Le LLM" src="https://youtu.be/wjZofJX0v4M"}

::: sources
- [3Blue1Brown, Transformers, the tech behind LLMs | Deep Learning Chapter 5](https://youtu.be/wjZofJX0v4M)
:::

::: notes
Vidéo de 3Blue1Brown sur les transformers, lancée au début (le clic sur la slide charge le lecteur ; la vidéo se joue en ligne, hors connexion le lien du bas ne mène nulle part). Elle ouvre la section « Le LLM » : les slides suivantes reprennent la prédiction du texte suivant, les tokens et la température.
:::

## Prédire la suite du texte {kicker="Le LLM"}

![Un début de fonction Python et les candidats pour la suite, avec leur probabilité](images/01-prediction.svg)

Un LLM (Large Language Model) est entraîné à prédire la suite d'un texte, token par token (unité de texte). Chaque token est choisi d'après des probabilités apprises à l'entraînement.

::: sources
- [Claude Platform, Glossary : Pretraining, LLM](https://platform.claude.com/docs/en/about-claude/glossary#pretraining)
:::

::: notes
Glossaire : « pretrained to predict the next word, given the previous context ». Le modèle brut est ensuite affiné (fine-tuning, RLHF) pour suivre des instructions ; détail hors programme.
Chaque token choisi rejoint le texte de départ, puis le modèle recommence : c'est ainsi qu'une réponse de 200 lignes sort d'un prédicteur de token suivant.
Dans la suite, « modèle » désigne le LLM.
:::

## Le texte découpé en tokens {kicker="Le LLM"}

![Une ligne de code Python découpée en huit tokens](images/01-tokens.svg)

Le token est l'unité que le modèle lit et produit. Prix et limites se comptent en tokens.

::: sources
- [Claude Platform, Glossary : Tokens](https://platform.claude.com/docs/en/about-claude/glossary#tokens)
:::

::: notes
Glossaire : pour les modèles antérieurs à Claude 4.7, « a token represents approximately 3.5 English characters » ; Claude Sonnet 4.6 en fait partie. Les modèles 4.7 et suivants ont un tokenizer qui produit environ 30 % de tokens de plus pour le même texte.
Le découpage exact dépend du tokenizer ; l'API de comptage donne le nombre réel.
:::

## Ce que le modèle lit {kicker="Le LLM"}

![La fenêtre de contexte remplie par les instructions fixes, les messages, les fichiers lus et sorties de commandes, la réponse en cours](images/01-contexte.svg)

La fenêtre de contexte est tout ce que le modèle lit, de taille bornée.

::: sources
- [Claude Platform, Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows#how-the-context-window-works)
- [Claude Platform, Claude Sonnet 4.6](https://platform.claude.com/docs/en/models/sonnet-4-6/overview)
- [Claude Code, Amazon Bedrock : 1M token context window](https://code.claude.com/docs/en/amazon-bedrock#1m-token-context-window)
:::

::: notes
Doc : « all the text a language model can reference when generating a response, including the response itself » ; tout compte : instructions fixes, chaque message, résultats d'outils, définitions d'outils, réponse en cours.
Claude Sonnet 4.6 : 1 M de tokens sur l'API Claude. Sur l'API Invoke d'Amazon Bedrock, celle de la VM, Claude Sonnet 4.6 n'atteint 1 M qu'avec la variante `[1m]` ; sans elle, 200 000 tokens, valeur relevée le 19 octobre 2026 par `claude -p --output-format json` (`formateur/fil-rouge.md`).
Le schéma ne montre pas les définitions d'outils ni le fichier de contexte : le premier vient à la section « L'agent », le second au module 4.
Au-delà de la limite : l'appel échoue (« prompt is too long ») ou le harnais compacte ; module 7.
:::

## La température règle le hasard {kicker="Le LLM"}

![Deux distributions de candidats pour un nom de fonction : température basse concentrée, température haute étalée](images/01-temperature.svg)

La température règle la part de hasard dans le choix de chaque token.

::: sources
- [Claude Platform, Glossary : Temperature](https://platform.claude.com/docs/en/about-claude/glossary#temperature)
- [Open Code, Agents : Temperature](https://opencode.ai/docs/agents/#temperature)
:::

::: notes
Glossaire : « Even with temperature set to 0, the results will not be fully deterministic ». Claude Code ne documente aucun réglage de température ; Open Code l'accepte par agent dans `opencode.json` (clé `temperature`, « typically 0 for most models » par défaut).
Démonstration 1, à jouer : trois appels identiques en mode non interactif, depuis `~/bookit`.
`claude -p 'Propose un nom de fonction Python pour vérifier une demande de réservation. Réponds par le nom seul.' --model claude-sonnet-4-6` trois fois, puis `opencode run --model amazon-bedrock/eu.anthropic.claude-sonnet-4-6 '…'` trois fois.
Relevé le 20 octobre 2026 : Claude Code a répondu trois fois `validate_booking` ; Open Code a répondu `valider_demande_reservation`, `validate_booking_request`, `validate_booking_request`. Au moins deux réponses différentes sur trois appels, sous un harnais dont la température par défaut est 0.
Si les six réponses sont identiques en salle, relancer : ce qui compte est la possibilité de l'écart.
:::

## Quatre limites structurelles du modèle {.facts kicker="Le LLM"}

- **Hallucination** une affirmation produite avec assurance et fausse
- **Date de coupure** fin des connaissances fiables du modèle, fixée par l'entraînement : août 2025 pour `claude-sonnet-4-6`
- **Non-déterminisme** deux appels identiques, deux réponses possibles
- **Pas d'exécution** le modèle produit du texte ; il ne lance rien lui-même

::: sources
- [Claude Platform, Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [Claude Platform, Claude Sonnet 4.6 : Reliable knowledge cutoff](https://platform.claude.com/docs/en/models/sonnet-4-6/overview)
- [Claude Platform, Glossary : Temperature](https://platform.claude.com/docs/en/about-claude/glossary#temperature)
- [Claude Platform, Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
:::

::: notes
Hallucination, doc : « text that is factually incorrect or inconsistent with the given context ». Parades citées : autoriser « je ne sais pas », exiger des citations ; elles réduisent sans supprimer.
Date de coupure : « reliable knowledge cutoff » août 2025, données d'entraînement jusqu'en janvier 2026, sortie le 17 février 2026. Une bibliothèque publiée après cette date est inconnue du modèle : sa documentation doit entrer dans la fenêtre de contexte.
Non-déterminisme : glossaire, entrée Temperature.
Pas d'exécution : « returns a structured call that your application executes ». Le modèle demande un outil ; c'est le programme autour qui l'exécute. C'est la transition vers l'agent.
:::

## Le modèle produit le texte le plus probable, sans savoir s'il est juste. {.statement kicker="Le LLM"}

::: notes
Conclut la section : prédiction, tokens, fenêtre, température, limites. Le modèle n'a ni base de faits ni moyen d'exécuter : la vérification revient au développeur et aux outils.
:::

## Un modèle, une boucle d'outils {kicker="L'agent"}

![Boucle en trois phases sur l'exemple d'un test qui échoue : rassembler le contexte, agir, vérifier avec uv run pytest](images/01-boucle.svg)

Un agent est un modèle dans une boucle d'outils. Un outil est une action que l'agent peut déclencher, dont la sortie revient dans la fenêtre de contexte.

::: sources
- [Claude Code, How Claude Code works : The agentic loop](https://code.claude.com/docs/en/how-claude-code-works#the-agentic-loop)
- [Claude Platform, Tool use overview : How tool use works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview#how-tool-use-works)
:::

::: notes
Doc Claude Code : « gather context, take action, verify results », les phases s'entremêlent ; « Each tool use returns information that feeds back into the loop ».
Doc API : le modèle répond `stop_reason: "tool_use"` avec un bloc `tool_use` ; le programme exécute et renvoie un `tool_result`.
Exemple du schéma : un test qui échoue. L'agent cherche le test, lit le code appelé, modifie, relance `uv run pytest`. Tant que le test échoue, nouveau tour ; quand il passe, l'agent rend la main.
Reprend la définition de la première slide (lit le dépôt, écrit, lance) en montrant le mécanisme. Le détail d'une itération est sur la slide « Une itération de la boucle ».
:::

## Les outils de l'agent {kicker="L'agent"}

Outils de base, liste partielle.

| Action | Claude Code | Open Code |
|---|---|---|
| lire un fichier | `Read` | `read` |
| modifier un fichier | `Edit` | `edit` |
| écrire un fichier | `Write` | `write` |
| exécuter une commande | `Bash` | `bash` |
| chercher dans les fichiers | `Grep` | `grep` |

::: sources
- [Claude Code, Tools reference](https://code.claude.com/docs/en/tools-reference)
- [Open Code, Tools](https://opencode.ai/docs/tools/)
:::

::: notes
Noms exacts, utiles pour les règles de permission (module 3 et suivants) et pour lire le fil d'une session.
Claude Code sous Linux, macOS et WSL : `Grep` et `Glob` sont absents par défaut ; l'agent cherche avec `grep` et `find` par `Bash` (doc Tools reference, « Glob tool behavior »). Démonstration 2 relevée : Claude Code a lancé `grep -rn validate_booking` par `Bash`, Open Code son outil `grep`.
Autres outils documentés : `Glob` et `glob` (fichiers par motif), `WebFetch` et `webfetch`, `WebSearch` et `websearch` (indisponible pour Claude Code sur Amazon Bedrock) ; Claude Code a aussi des outils de sous-agents et de questions à l'utilisateur, Open Code un outil `question`.
:::

## Une itération de la boucle {kicker="L'agent"}

![Échange entre le harnais et le modèle : contexte et outils envoyés, demande d'outil, résultat renvoyé, réponse en texte seul](images/01-boucle-mecanisme.svg)

Le modèle ne fait que demander : le harnais exécute chaque outil.

::: sources
- [Claude Platform, Tool use overview : How tool use works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview#how-tool-use-works)
- [Claude Code, How Claude Code works : The agentic loop](https://code.claude.com/docs/en/how-claude-code-works#the-agentic-loop)
:::

::: notes
Doc API : les outils clients « run in your application » ; le modèle répond `stop_reason: "tool_use"` avec un bloc `tool_use`, « Your code runs the operation and sends back a `tool_result` ». Sous Claude Code ou Open Code, « your code » est le harnais.
À chaque tour de boucle, le modèle choisit : demander un outil ou répondre directement (doc API, « When Claude uses tools »). Une réponse sans demande d'outil termine la boucle et rend la main à l'utilisateur.
Doc Claude Code : « Each tool use returns information that feeds back into the loop, informing Claude's next decision ».
Un tour (une demande de l'utilisateur) contient autant d'itérations que nécessaire. Le schéma montre le dernier échange du test qui échoue : 02 à 03 se répètent tant que le test échoue.
:::

## Le harnais entoure le modèle {kicker="L'agent"}

![Le modèle au centre ; autour, le harnais contrôle la boucle, met les outils à disposition et les exécute, demande les permissions, affiche la session](images/01-harnais.svg)

Le harnais est le logiciel autour du modèle : il contrôle la boucle et met les outils à sa disposition. Une permission est l'accord demandé à l'utilisateur avant une action de l'agent.

::: sources
- [Claude Code, Glossary : Agentic harness](https://code.claude.com/docs/en/glossary#agentic-harness)
- [Claude Code, Permissions](https://code.claude.com/docs/en/permissions)
- [Open Code, Permissions](https://opencode.ai/docs/permissions/)
:::

::: notes
Glossaire Claude Code : « Claude Code is the harness; Claude is the model inside it. The harness supplies file access, shell execution, permission gating, memory loading, and the loop that chains actions together. »
Le harnais contrôle la boucle : il appelle le modèle, exécute les outils demandés, renvoie les résultats et décide quels outils sont déclarés au modèle (le modèle ne peut demander que ceux-là).
Les permissions sont appliquées par le harnais, jamais par le modèle. Claude Code en mode Manual demande avant une édition et avant une commande hors d'un jeu de commandes en lecture seule ; Open Code suit les règles `allow`, `ask`, `deny` de `opencode.json`.
Le même modèle tourne dans les deux harnais de la formation : slide suivante.
:::

## Choisir le modèle au lancement {.compare kicker="L'agent"}

::: claude-code
Modèle choisi au lancement, affiché dans la ligne d'état :

```console
$ claude --model claude-sonnet-4-6
```

Sans l'option, le modèle par défaut de Claude Code sur Amazon Bedrock est Claude Opus 5.5.
:::

::: opencode
Modèle lu dans `opencode.json` du projet, affiché en en-tête au lancement (`build · eu.anthropic.claude-sonnet-4-6`) :

```console
$ opencode
```

```json
{ "model": "amazon-bedrock/eu.anthropic.claude-sonnet-4-6" }
```
:::

::: sources
- [Claude Code, CLI reference : `--model`](https://code.claude.com/docs/en/cli-reference#cli-flags)
- [Claude Code, Amazon Bedrock : Pin model versions](https://code.claude.com/docs/en/amazon-bedrock#4-pin-model-versions)
- [Open Code, CLI](https://opencode.ai/docs/cli/) et [`commands.ts` au tag v2.0.32](https://github.com/anomalyco/opencode/blob/v2.0.32/packages/cli/src/commands/commands.ts)
- [Open Code, Models : Set a default](https://opencode.ai/docs/models/#set-a-default)
:::

::: notes
Claude Code : `--model` accepte un alias (`sonnet`) ou un identifiant complet ; le support n'emploie que l'identifiant complet, l'alias `sonnet` pointant vers une autre version sur Bedrock. Sur Bedrock, `claude-sonnet-4-6` est résolu vers le profil d'inférence de la région (`eu.anthropic.claude-sonnet-4-6` en `eu-*`). Le fil rouge épingle aussi le modèle dans `.claude/settings.json`.
Open Code : la TUI de la v2.0.32 n'a pas d'option `--model` (`opencode --help` relevé le 20 octobre 2026, et `commands.ts` du dépôt ne la déclare que sur `run` et `mini` ; la page CLI de la doc en décrit une) ; `opencode run -m` l'a. D'où la copie d'`opencode.json` dans tout dossier hors du fil rouge, au TP 1. En-tête `build · eu.anthropic.claude-sonnet-4-6` relevé sur `opencode run` ; à relever dans la TUI sur la VM.
Démonstration 2, première partie : les deux TUI côte à côte dans `~/bookit`, lancement, lecture de l'en-tête et du modèle.
Mode de permission au lancement : Claude Code démarre en Manual avec `claude-sonnet-4-6` sur Bedrock (le mode `auto` y exige Sonnet 5 ou plus récent, Opus 4.7 ou plus récent, Haiku 5.5 ou un modèle Fable) ; Open Code démarre sur l'agent Build avec les règles du fil rouge, `edit` et `bash` en `ask` sauf `uv run pytest` et les scripts Spec Kit.
:::

## Chaque tour remplit la fenêtre {kicker="L'agent"}

![Trois tours successifs qui s'accumulent dans la fenêtre de contexte, puis une session neuve qui repart d'une fenêtre vide](images/01-tours.svg)

Une session va du lancement à `/clear` ou `/new`. Chaque tour reste entier dans la fenêtre de contexte.

::: sources
- [Claude Platform, Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows#how-the-context-window-works)
- [Claude Code, Glossary : Session, Turn](https://code.claude.com/docs/en/glossary#session)
- [Open Code, TUI : /new](https://opencode.ai/docs/tui/)
:::

::: notes
Doc API : « each user message and assistant response accumulates within the context window, and previous turns are preserved completely ».
Glossaire Claude Code : un tour « begins when you send a message and ends when Claude finishes responding, with any number of tool calls in between » ; une session a « its own independent context window ».
Une session neuve repart d'une fenêtre vide : `/clear` sous Claude Code, `/new` sous Open Code (alias `/clear` d'après la doc TUI ; `/new` est la forme employée dans les énoncés).
Proche de la limite, le harnais efface les vieux résultats d'outils puis résume la session (compaction) : module 7.
:::

## Permission et session neuve {.compare kicker="L'agent"}

::: claude-code
- appel d'outil affiché dans le fil de la session
- avant une écriture ou une commande : `Do you want to proceed?`, puis `Yes`, `Yes, and don't ask again for: …`, `No`
- session neuve : `/clear`
- quitter : `/exit`
:::

::: opencode
- appel d'outil affiché dans le fil de la session
- avant une écriture ou une commande : trois réponses, `once`, `always`, `reject`
- session neuve : `/new`
- quitter : `/exit`
:::

::: sources
- [Claude Code, Permissions : Permission system](https://code.claude.com/docs/en/permissions#permission-system)
- [Claude Code, Glossary : Session](https://code.claude.com/docs/en/glossary#session)
- [Open Code, Permissions](https://opencode.ai/docs/permissions/)
- [Open Code, TUI : Commands](https://opencode.ai/docs/tui/)
:::

::: notes
Claude Code : options relevées sur la capture de la doc Permissions (commande `npm test` : « Yes », « Yes, and don't ask again for: npm test * », « Yes, and switch to auto mode », « No ») ; la troisième n'apparaît pas sur toute demande et n'est pas proposée avec Claude Sonnet 4.6 sur Bedrock, à confirmer sur la VM. Un « don't ask again » sur une commande s'enregistre dans `.claude/settings.local.json` ; sur une édition, jusqu'à la fin de la session.
Open Code : doc Permissions, « the UI offers three outcomes: once, always, reject » ; `always` vaut pour le reste de la session. Libellés exacts de la TUI v2.0.32 à relever sur la VM.
Démonstration 2, seconde partie, dans `~/bookit` : « Où la fonction validate_booking est-elle appelée ? Réponds en deux phrases, sans modifier de fichier. » puis « Ajoute un commentaire TODO en tête de bookit/domain/validate_booking.py ».
Relevé le 20 octobre 2026 en mode non interactif : premier prompt, Claude Code un seul appel `Bash` (`grep -rn validate_booking`), 2 tours, réponse citant `bookit/application/request_booking.py` ligne 10 ; Open Code un seul appel `grep`, même réponse. Aucune permission demandée dans les deux cas. Second prompt : demande de permission à refuser en salle, `~/bookit` reste intact ; texte exact à relever sur la VM (non rejouable hors TUI). Terminer par `/clear` et `/new`.
Piège relevé : après un `opencode run` lancé sans `--auto` sur une action `ask`, le service de fond d'Open Code est resté bloqué et les appels suivants n'ont rien rendu ; `opencode service restart` a suffi (sous-commande `service` absente de la doc, déclarée dans `commands.ts` du dépôt au tag v2.0.32 : https://github.com/anomalyco/opencode/blob/v2.0.32/packages/cli/src/commands/commands.ts). Sans rapport avec la TUI.
:::

## Le dépôt traverse les sessions {kicker="L'agent"}

![Session 1 avec sa consigne, ses fichiers lus et ses essais ; coupure ; session 2 vide ; en bas, le dépôt qui traverse](images/01-session.svg)

::: sources
- [Claude Code, How Claude Code works : Work with sessions](https://code.claude.com/docs/en/how-claude-code-works#work-with-sessions)
- [Open Code, TUI : /new](https://opencode.ai/docs/tui/)
:::

::: notes
Doc : « Sessions are independent. Each new session starts with a fresh context window, without the conversation history from previous sessions. »
Une consigne tapée dans la session (« rends None, jamais d'exception ») vaut jusqu'à sa fin. La session suivante ne connaît que ce qui est sur disque : code, tests, commits, fichiers du dépôt.
Claude Code garde la transcription sur disque (`~/.claude/projects/`) et permet de reprendre une session (`claude -c`, `/resume`) ; reprendre ramène la fenêtre pleine. Même chose sous Open Code (`/sessions`).
Question du module 2 : comment faire traverser l'intention, et pas seulement le code.
:::

## L'agent ne connaît que sa fenêtre de contexte et la perd en fin de session. {.statement kicker="L'agent"}

::: notes
Conclut la section : boucle, outils, harnais, tours, fin de session. Prépare le module 2 : l'intention tapée se perd entre deux sessions ; écrite dans le dépôt, elle reste.
:::

## Le texte envoyé au modèle {kicker="Le prompt"}

![Un prompt vague ouvre cinq suites plausibles, un prompt précis n'en laisse qu'une](images/01-eventail.svg)

Le prompt est le texte envoyé au modèle, après les instructions fixes du harnais.

::: sources
- [Claude Platform, Prompting best practices : Be clear and direct](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#be-clear-and-direct)
:::

::: notes
Doc : « Claude responds well to clear, explicit instructions. Being specific about your desired output can help enhance results. » Règle d'or de la même page : montrer le prompt à un collègue qui n'a pas le contexte ; s'il est perdu, le modèle aussi.
Devant un prompt vague, le modèle complète le texte le plus probable, et plusieurs suites sont probables. Les cinq suites de gauche sont celles produites le 20 octobre 2026 par `claude-sonnet-4-6` sur le prompt d'une phrase (slide suivante).
:::

## Le modèle invente les règles {kicker="Le prompt"}

```prompt
écris dans un fichier validate_booking_v1.py une fonction python validate_booking qui vérifie qu'une réservation est valide
```

```python file="../tp/tp01/echauffement/validate_booking_v1.py" lines="9-14"
```

Extrait de la docstring du fichier produit par `claude-sonnet-4-6` sous Claude Code, le 20 octobre 2026.

::: notes
Fichier produit par `claude-sonnet-4-6` sous Claude Code le 20 octobre 2026, en mode non interactif (`claude -p --permission-mode acceptEdits`), conservé en entier dans `tp/tp01/echauffement/validate_booking_v1.py`. Un `dict` avec un nom de client, un nombre de personnes et une chambre : des règles d'hôtel, inventées. Aucune durée, aucun préavis, aucun chevauchement : rien de ce que bookit exige.
Même prompt sous Open Code le même jour : mêmes champs d'hôtel (`guest_name`, `check_in`, `check_out`, `guests`, `room_id`), tuple `(bool, list[str])`.
Démonstration 3, à jouer avant le TP, dans un dossier jetable `~/demo-prompt` : `claude --model claude-sonnet-4-6`, prompt envoyé, demande de permission d'écriture lue à voix haute puis acceptée, fichier ouvert. Le résultat en salle différera dans le détail (non-déterminisme) ; le point est l'invention des règles.
Prompt sans nom de fichier (« écris une fonction python validate_booking… ») : en mode non interactif, Claude Code a répondu dans le fil sans écrire de fichier ; d'où le nom de fichier dans le prompt du TP.
:::

## Rôle, contexte, instruction, format {kicker="Le prompt"}

| Composant | Question qu'il règle | Sans lui |
|---|---|---|
| rôle | quel niveau d'exigence ? | un style moyen, des cas limites oubliés |
| contexte | que sait le modèle de mon projet ? | des hypothèses plausibles et fausses |
| instruction | quelle action, quel périmètre ? | une réponse à côté, ou trop large |
| format | quelle forme, à quel endroit ? | du texte, un fichier au mauvais nom |

Les quatre composants sont une liste de contrôle : l'absence d'un composant est un choix.

::: sources
- [Claude Platform, Prompting best practices : Give Claude a role](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#give-claude-a-role)
- [Claude Platform, Prompting best practices : Be clear and direct, Add context](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#be-clear-and-direct)
:::

::: notes
Doc : « Setting a role in the system prompt focuses Claude's behavior and tone for your use case. Even a single sentence makes a difference. » ; « Providing context or motivation behind your instructions … can help Claude better understand your goals » ; « Be specific about the desired output format and constraints. »
Sur un prompt court, le rôle peut manquer ; le contexte, rarement.
La slide suivante donne, composant par composant, une version faible et une version utile sur bookit.
:::

## Version faible, version utile {kicker="Le prompt"}

| Composant | Version faible | Version utile |
|---|---|---|
| rôle | « Tu es un expert. » | « développeur Python attentif aux cas limites ; erreurs en valeur de retour » |
| contexte | rien | « règles dans `docs/regles-metier.md`, à lire d'abord ; bornes incluses » |
| instruction | « gère la validation des réservations » | « écrire `validate_booking(booking, resource, now)` : `None` ou `InvalidBooking(code)` » |
| format | rien | « un seul fichier `validate_booking_v2.py`, sans exemple ni test » |

Le prompt complet est dans l'énoncé du TP.

::: sources
- [Claude Platform, Prompting best practices : Give Claude a role](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#give-claude-a-role)
- [Claude Platform, Prompting best practices : Add context to improve performance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#add-context-to-improve-performance)
- [Claude Platform, Prompting best practices : Be clear and direct](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#be-clear-and-direct)
:::

::: notes
« Expert » ne dit rien d'exigible ; « attentif aux cas limites » et « jamais en exception » se vérifient sur le code produit.
Le contexte donne ce que le modèle ignore et rien de plus : un chemin de fichier à lire vaut mieux qu'un résumé des règles recopié dans le prompt, qui diverge du fichier à la première modification.
L'instruction nomme une action (écrire), un objet (la signature) et un périmètre (la première règle enfreinte, rien d'autre). Le format dit la forme et l'emplacement : un fichier, son nom, ce qu'il ne contient pas. Sans format, le modèle ajoute volontiers un exemple d'usage et un test.
Doc : « Be specific about the desired output format and constraints » ; « Provide instructions as sequential steps … when the order or completeness of steps matters ».
Le prompt complet à quatre lignes est dans l'énoncé du TP, étape 3.
:::

## Chaque symptôme désigne un composant {kicker="Le prompt"}

| Symptôme dans la réponse | Composant en cause | Correction |
|---|---|---|
| réponse hors sujet ou trop large | instruction | nommer l'action et le périmètre |
| hypothèses fausses sur le projet | contexte | donner le fichier à lire |
| code juste, style ou rigueur inadaptés | rôle | fixer le niveau d'exigence |
| réponse noyée dans du texte, mauvais fichier | format | dire la forme et l'emplacement |

Régénérer dans une session neuve : la réponse ratée pèserait sur la suivante.

::: sources
- [Claude Platform, Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
:::

::: notes
Doc : la démarche suppose des critères de succès, un moyen de tester, un premier brouillon, puis des itérations.
Méthode : lire la réponse, nommer l'écart, corriger le seul composant en cause, régénérer dans une session neuve. Une session neuve, parce que la réponse ratée est encore dans la fenêtre de contexte et pèse sur la suivante.
Corriger un composant à la fois permet de savoir ce qui a fait la différence ; tout réécrire ne l'apprend pas.
:::

## Un prompt se corrige un composant à la fois, dans une session neuve. {.statement kicker="Le prompt"}

::: notes
Conclut la section. Les quatre composants sont repris dans l'énoncé du TP, étape 3. La slide suivante montre l'inverse de cette discipline.
:::

## Vibe coding, nommé en 2025 {.quote kicker="Vibe coding" author="Andrej Karpathy, publication du 2 février 2025"}

> There's a new kind of coding I call "vibe coding" […] I "Accept All" always, I don't read the diffs anymore. It's not too bad for throwaway weekend projects.

::: sources
- [Andrej Karpathy, publication X du 2 février 2025](https://x.com/karpathy/status/1886192184808149383)
- [Wikipédia, Vibe coding (cite la publication)](https://en.wikipedia.org/wiki/Vibe_coding)
:::

::: notes
Extraits de la publication d'origine, dont la première phrase continue : « where you fully give in to the vibes, embrace exponentials, and forget that the code even exists ». La page X refuse les lectures automatiques ; les extraits sont ceux que l'article Wikipédia reproduit avec la date.
« Accept All » : le bouton d'acceptation des modifications dans l'éditeur Cursor de l'époque ; l'équivalent dans un harnais de terminal est la permission accordée sans lire.
Karpathy décrit une pratique et la limite lui-même aux projets jetables du week-end.
:::

## Des prompts successifs, sans vérification {kicker="Vibe coding"}

![Une chaîne prompt, code, prompt, code dans une seule session, sans aucun fichier écrit à côté](images/01-vibe.svg)

Le vibe coding est un pilotage par prompts successifs, sans rien écrire avant ni vérifier après.

::: sources
- [Wikipédia, Vibe coding](https://en.wikipedia.org/wiki/Vibe_coding)
- [KVIA (CNN), « Vibe coding » named Collins Dictionary's word of the year, 6 novembre 2025](https://kvia.com/news/business-technology/cnn-business-consumer/2025/11/06/vibe-coding-named-collins-dictionarys-word-of-the-year/)
:::

::: notes
Définition tirée de la publication : prompts à la suite, diffs non lus, code oublié. C'est la slide « un composant à la fois, dans une session neuve » à l'envers : tout dans la même session, rien de nommé, rien d'écrit.
Collins Dictionary a retenu « vibe coding » comme mot de l'année 2025 (annonce du 6 novembre 2025), défini comme « the use of artificial intelligence prompted by natural language to assist with the writing of computer code ». La page de Collins refuse les lectures automatiques ; la dépêche CNN reprend la définition et la date.
Le terme est devenu courant ; la pratique est plus ancienne que le mot.
:::

## Prototype jetable ou production {kicker="Vibe coding"}

![Deux zones séparées par le coût d'une erreur : prototype (prompt, code, essai, jeté) et production (prompt, code non lu, mise en production, trois questions sans réponse)](images/01-zones.svg)

Le même agent sert dans les deux zones.

::: sources
- [Wikipédia, Vibe coding (« throwaway weekend projects »)](https://en.wikipedia.org/wiki/Vibe_coding)
:::

::: notes
Karpathy lui-même : « not too bad for throwaway weekend projects ».
Rien n'a été écrit avant : aucune règle à laquelle comparer. Rien n'a été vérifié après : aucun test qui dise s'il est juste.
La frontière est le coût d'une erreur ; le même agent sert dans les deux zones.
:::

## L'intention écrite, versionnée, vérifiée {kicker="L'intention écrite"}

![Chaîne intention écrite, versionnée, code, vérifié, avec une flèche de retour : conforme à ce qui était écrit ?](images/01-intention.svg)

L'intention est ce que le logiciel doit faire.

::: notes
Ce que la session perd (slide « Le dépôt traverse les sessions »), l'intention écrite le garde : elle est sur disque, dans le dépôt, lisible par la session suivante et par l'équipe.
« Vérifié contre elle » : tests verts, diff relu avec la page à côté. Sans page, relire un diff revient à deviner ce qui était voulu.
Le module 2 nomme la méthode (Spec Driven Development) et l'outil (Spec Kit). Ici, seule la chaîne compte.
:::

## Écrire l'intention avant le code permet de vérifier le code contre elle. {.statement kicker="L'intention écrite"}

::: notes
Conclut la section : citation, définition, coût d'une erreur, chaîne de l'intention. Le module 2 part d'ici.
:::

## Situer une nouveauté : quatre questions {kicker="Grille de lecture"}

| Question | Réponse | Exemples, octobre 2026 (liste partielle) | Qui le change |
|---|---|---|---|
| qui produit le texte ? | le modèle | Claude Sonnet 4.6, Claude Opus 5.5, GPT, Gemini | le fournisseur, plusieurs fois par an |
| qui donne les outils ? | le harnais | Claude Code, Open Code, Codex CLI, GitHub Copilot | le fournisseur, plusieurs fois par an |
| comment l'équipe organise le travail ? | la méthode | revue de code, intention écrite avant le code | l'équipe |
| qu'est-ce qui reste dans le dépôt ? | l'artefact | code, tests, règles, intention écrite | l'équipe |

La méthode est la manière dont l'équipe organise le travail avec l'agent. Un artefact est un fichier versionné qui porte le travail au-delà d'une session.

::: sources
- [Claude Platform, Models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Claude Code, Overview](https://code.claude.com/docs/en/overview)
- [Open Code, Intro](https://opencode.ai/docs/)
- [openai/codex](https://github.com/openai/codex)
- [GitHub Docs, Where to use GitHub Copilot](https://docs.github.com/en/copilot/get-started/where-to-use-github-copilot)
:::

::: notes
Synthèse du module : chaque section a traité une ligne. Le LLM (modèle), l'agent et son harnais, le prompt et le vibe coding (méthode), l'intention écrite (artefact).
Modèles d'octobre 2026 : Models overview liste Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5 en modèles courants, Claude Sonnet 4.6 en modèle encore disponible. Harnais : Claude Code (Anthropic), Open Code (libre), Codex CLI (OpenAI, « coding agent … that runs locally »), GitHub Copilot (IDE, CLI, github.com, agent cloud).
« Plusieurs fois par an » : d'après les dates d'annonce citées sur la slide des générations et la page Claude Sonnet 4.6 (sortie le 17 février 2026, déjà en modèle « legacy » en octobre 2026). La doc de Claude Code et d'Open Code change chaque semaine. Une nouveauté se lit en demandant laquelle des quatre lignes elle touche.
:::

## La méthode et les artefacts restent quand le modèle et le harnais changent. {.statement kicker="Grille de lecture"}

::: notes
Conclut la grille et le module. Les deux jours de formation travaillent les deux lignes du bas : la méthode (SDD) et ses artefacts (constitution, spécification, plan, tâches, tests). Modèle et harnais sont ceux de la VM, remplaçables.
:::

## Les règles métier de bookit {kicker="TP 1"}

bookit enregistre des réservations de ressources : salle, équipement ou personne. Une demande vise une ressource, avec un début et une fin. Elle est acceptée, ou refusée avec le code de la règle enfreinte.

| Règle | Contenu | Code de refus |
|---|---|---|
| REG-01 | durée entre 30 minutes et 4 heures | `duration` |
| REG-02 | en semaine, de 8h à 20h | `hours` |
| REG-03 | au moins 2 heures de préavis | `lead_time` |
| REG-04 | au plus 60 jours à l'avance | `horizon` |
| REG-05 | aucun chevauchement sur une même ressource | `overlap` |

::: notes
Tableau repris tel quel au module 3, section « Le fil rouge bookit ». Texte de référence : `tp/fichiers/regles-metier.md`, livré en `~/fichiers/regles-metier.md`, que le TP fait copier dans `~/echauffement/docs/`.
« Ressource » et « réservation » sont pris au sens courant ; le module 3 en fait des notions (ressource, demande de réservation, créneau, réservation confirmée, décision, instant courant).
Ce que les règles ne tranchent pas (20h00 pile, jours fériés, créneaux jointifs, fuseau) : le TP 4 le clarifie ; ne pas répondre ici, noter la question.
Aux sessions précédentes, comprendre ce domaine a pris du temps : laisser une minute de lecture avant de lancer le TP.
:::

## Partie A : deux prompts {.tp duration="45 min" kicker="TP 1"}

Obtenir deux fois la fonction `validate_booking` d'un agent : d'abord sur un prompt d'une phrase, puis sur un prompt à quatre composants avec les règles métier dans le dossier. Comparer les deux fichiers à la lecture. Aucun commit : `~/echauffement/` est un dossier jetable.

::: notes
Point de départ : VM configurée, `dlaia.zip` dans le répertoire personnel. Arrivée : `~/bookit/` et `~/fichiers/` extraits et intacts, `~/echauffement/` avec `validate_booking_v1.py`, `validate_booking_v2.py`, `docs/regles-metier.md`, `docs/comparaison.md`. La partie B (hello spec) est lancée par une slide du module 2.
Durées : 5 min d'extraction, 10 min par prompt, 10 min de comparaison, 5 min de débrief, 5 min de marge pour les permissions. Rejeu non interactif du 20 octobre 2026 (`tmp/rejeu/rapport-tp01-claude-code.md`, `tmp/rejeu/rapport-tp01-opencode.md`), quatre étapes conformes dans les deux outils : l'étape 2 prend de 18 à 22 s sous Claude Code et de 6 à 9 s sous Open Code, l'étape 3 de 21 à 49 s et de 10 à 11 s ; en salle, lecture des permissions et du fichier en plus.
Permissions attendues : Claude Code, une demande d'écriture par étape à prompt (mode Manual) ; Open Code, `edit` en `ask` d'après l'`opencode.json` copié, donc une demande par fichier écrit, plus une par commande si l'agent lance `python`. Non rejouable hors TUI : à relever sur la VM.
Débrief, deux questions : quelle ligne du prompt v2 l'agent n'a-t-il pas respectée, et quel composant la portait (au rejeu : aucune dérive sous les deux outils ; Open Code a écrit `Optional[InvalidBooking]` au lieu de `| None`, écart de style, comme le corrigé ; si aucune dérive en salle, demander ce qui manque encore à la v2) ; que ne dit pas le tableau de comparaison sur la v2 (elle couvre les règles, rien ne dit qu'elle est juste : aucune spécification, aucun test ; au rejeu sous Claude Code, REG-02 ne bornait que `start < 8h` et `end > 20h`, un créneau de 23h00 à 02h00 passait ; point de départ du module 2).
Rejeu fait sur le poste de préparation, modèle `claude-sonnet-4-6` par l'API Claude sous Claude Code et par Amazon Bedrock sous Open Code ; sur la VM les deux passent par Bedrock. Biais du rejeu : lancé sous `tmp/` du dépôt de la formation, Claude Code a lu les fichiers de contexte parents ; rien de tel sur la VM.
Pièges : permissions acceptées sans lecture ; prompt v1 enrichi « pour aider » (il doit rester pauvre) ; conclusion « v2 est juste » parce que le tableau est rempli ; « bornes incluses » ne tranche ni 20h00, ni le samedi, ni les créneaux jointifs, tranchés au TP 4.
À vérifier sur la VM : `unzip` présent ; configuration globale de Claude Code et d'Open Code (modèle par défaut hors du fil rouge, d'où `--model` et la copie d'`opencode.json`).
:::

### Extraire l'archive

L'archive `dlaia.zip` est dans le répertoire personnel. Extraire, puis regarder ce qui est arrivé.

```console
$ cd ~
$ unzip -q -d ~ dlaia.zip
$ ls -d ~/bookit ~/fichiers ~/dlaia.html
$ ls ~/bookit
```

::: attendu
`ls -d ~/bookit ~/fichiers ~/dlaia.html` affiche les trois chemins. `ls ~/bookit` affiche `README.md  bookit  opencode.json  pyproject.toml  tests  uv.lock`. Aucun `.git` : le dépôt se crée au TP 3.
:::

::: indice
Sans `unzip` : `python3 -m zipfile -e dlaia.zip ~` extrait au même endroit.
:::

### Un prompt d'une phrase

Créer le dossier jetable et s'y placer.

```console
$ mkdir -p ~/echauffement/docs
$ cd ~/echauffement
```

::: claude-code
```console
$ claude --model claude-sonnet-4-6
```
:::

::: opencode
Le modèle de la session vient de `opencode.json` : copier celui du fil rouge avant de lancer.

```console
$ cp ~/bookit/opencode.json .
$ opencode
```
:::

Envoyer ce prompt, tel quel, sans rien ajouter :

```prompt
écris dans un fichier validate_booking_v1.py une fonction python validate_booking qui vérifie qu'une réservation est valide
```

Lire chaque demande de permission avant de l'accepter. Quand l'agent a terminé, quitter par `/exit` et lire le fichier produit.

::: attendu
```console
$ grep -c "def validate_booking" ~/echauffement/validate_booking_v1.py
1
```
:::

::: indice
L'agent pose une question au lieu d'écrire : répondre « fais au mieux », sans rien ajouter. Le fichier manque : `ls ~/echauffement` ; s'il n'y a rien, renvoyer dans la même session « écris ce code dans validate_booking_v1.py ».
:::

### Un prompt à quatre composants

Copier les règles métier dans le dossier et les lire.

```console
$ cp ~/fichiers/regles-metier.md ~/echauffement/docs/
$ cat ~/echauffement/docs/regles-metier.md
```

Relancer l'agent en session neuve, depuis `~/echauffement`.

::: claude-code
```console
$ claude --model claude-sonnet-4-6
```

Dans une session encore ouverte, `/clear` ouvre une session neuve.
:::

::: opencode
```console
$ opencode
```

Dans une session encore ouverte, `/new` ouvre une session neuve.
:::

Avant d'envoyer, relire le prompt ci-dessous composant par composant, puis l'envoyer tel quel.

```prompt
Rôle : développeur Python attentif aux cas limites ; les erreurs métier se rendent en valeur de retour, jamais en exception.
Contexte : les règles métier sont dans docs/regles-metier.md, à lire d'abord ; les bornes sont incluses ; l'instant courant est passé en paramètre.
Instruction : écrire validate_booking(booking, resource, now) qui rend None si la réservation est acceptée, sinon InvalidBooking(code) pour la première règle enfreinte, dans l'ordre du fichier.
Format : un seul fichier validate_booking_v2.py, avec les dataclasses Booking, Resource et InvalidBooking, sans exemple d'usage ni test.
```

Lire chaque demande de permission avant de l'accepter, quitter par `/exit`, lire le fichier produit.

::: attendu
```console
$ grep -o 'duration\|hours\|lead_time\|horizon\|overlap' ~/echauffement/validate_booking_v2.py | sort -u | wc -l
5
$ grep -c "class InvalidBooking" ~/echauffement/validate_booking_v2.py
1
```
:::

::: indice
L'agent écrit aussi un test ou lance `python` : c'est un écart par rapport au prompt, à noter pour l'étape suivante, sans le corriger. L'agent relit `validate_booking_v1.py` : à noter aussi, tout fichier du dossier peut entrer dans la fenêtre de contexte.
:::

### Comparer à la lecture

Ouvrir les deux fichiers côte à côte. Créer `~/echauffement/docs/comparaison.md` avec ce tableau et le remplir pour v1 et v2, à partir du code lu, sans l'agent :

```markdown
| Critère | v1 | v2 |
|---|---|---|
| règles couvertes (combien des cinq, lesquelles manquent) | | |
| bornes (30 min pile, 4 h pile, 20h00 pile : accepté ou refusé, lu dans les `<` et `<=`) | | |
| codes de refus (ceux du fichier ou inventés, en valeur de retour ou en exception) | | |
```

::: attendu
```console
$ grep -c '^| ' ~/echauffement/docs/comparaison.md
4
$ ls ~/bookit/.git
ls: cannot access '/home/…/bookit/.git': No such file or directory
```

Quatre lignes : l'en-tête et les trois critères remplis. `~/bookit/` n'a pas été touché.
:::

::: indice
Pour une borne, chercher la comparaison qui la porte : `timedelta(minutes=30) <= duree` accepte 30 minutes pile, `<` la refuse. Pour une règle absente, chercher son mot dans le fichier : `grep -n "60" validate_booking_v1.py`.
:::

### Corrigé {.corrige}

Fichier v2 produit par `claude-sonnet-4-6` sous Claude Code le 20 octobre 2026, à titre d'illustration. Le vôtre diffère dans le détail : le rejeu du même jour a donné une autre variante. Seule retouche : la ponctuation d'un commentaire.

```python file="../tp/tp01/echauffement/validate_booking_v2.py"
```

Tableau de comparaison rempli pour ce couple v1 et v2 :

```markdown file="../tp/tp01/echauffement/docs/comparaison.md"
```

## Glossaire : le modèle {kicker="Glossaire"}

- **LLM** : modèle de langage qui produit du texte token par token à partir d'un contexte
- **Token** : unité de texte que le modèle lit et produit, comptée dans la fenêtre et facturée
- **Fenêtre de contexte** : tout ce que le modèle lit pour produire une réponse, de taille bornée

|||

- **Température** : réglage de la part de hasard dans le choix de chaque token
- **Hallucination** : affirmation produite avec assurance et fausse
- **Date de coupure** : date jusqu'à laquelle les connaissances du modèle sont fiables
- **Non-déterminisme** : deux appels identiques au modèle peuvent produire deux réponses différentes, même à température 0

::: sources
- [Claude Platform, Glossary](https://platform.claude.com/docs/en/about-claude/glossary)
- [Claude Platform, Claude Sonnet 4.6](https://platform.claude.com/docs/en/models/sonnet-4-6/overview)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique de la formation.
:::

## Glossaire : l'agent {kicker="Glossaire"}

- **Agent** : modèle dans une boucle d'outils : il lit, exécute, relit, jusqu'au résultat
- **Outil** : action que l'agent peut déclencher : lire un fichier, écrire, exécuter une commande, chercher
- **Harnais** : logiciel qui entoure le modèle : boucle, outils, permissions, affichage

|||

- **Permission** : accord demandé à l'utilisateur avant une action de l'agent
- **Session** : suite d'échanges avec l'agent, du lancement à `/clear` ou `/new`
- **Tour** : un échange de la session : message, appels d'outils, réponse

::: sources
- [Claude Code, Glossary](https://code.claude.com/docs/en/glossary)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::

## Glossaire : prompt et méthode {kicker="Glossaire"}

- **Prompt** : texte envoyé au modèle ; ses quatre composants : rôle, contexte, instruction, format
- **Vibe coding** : pilotage par prompts successifs, sans intention écrite ni vérification
- **Intention** : ce que le logiciel doit faire, écrit, versionné, vérifié
- **Génération** : une des quatre étapes de l'assistance au code

|||

- **Méthode** : manière dont l'équipe organise le travail avec l'agent : ce qui s'écrit avant le code, ce qui se relit après
- **Artefact** : fichier versionné dans le dépôt qui porte le travail au-delà d'une session
- **Règle métier** : contrainte du domaine que toute réservation respecte, numérotée REG-NN
- **Code de refus** : identifiant de la règle enfreinte, un par règle

::: sources
- [Claude Platform, Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Wikipédia, Vibe coding](https://en.wikipedia.org/wiki/Vibe_coding)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::
