# Modèles locaux


## Données envoyées au modèle {kicker="Données"}

Chaque contrôle du module 3 qui appelle le modèle envoie ce texte à Anthropic (Claude Code) ou à Amazon Bedrock (Open Code).

| Contrôle du module 3 | Ce qui part dans le prompt |
|---|---|
| reviewer en CI | diff et règles de revue |
| hook git avant le commit | changements indexés et règles |
| analyse d'échec | journal de CI |

::: sources
- [Claude Code, Data usage](https://code.claude.com/docs/en/data-usage)
- [Open Code, Enterprise](https://opencode.ai/docs/enterprise/)
:::

::: notes
Reprend la dernière idée clé du module 3 (« Un contrôle bref s'exécute tôt, un contrôle long attend la pull request. ») et sa transition : le module 3 a placé les contrôles, le module 4 décide ce qui sort du poste. Le module 3 ne contient plus de slide sur les données envoyées (section Sécurité retirée le 25 octobre 2026) : cette slide les présente.
Claude Code, page Data usage : « Claude Code sends data over the network. This data includes all user prompts and model outputs, encrypted in transit via TLS 1.2+. » Sur le poste de démonstration, Open Code appelle Amazon Bedrock : la donnée part chez AWS (configuration du poste, non énoncé par la page). Pour un compte commercial (API, Team, Enterprise, plateformes tierces), Anthropic n'entraîne pas ses modèles sur le code ni les prompts, sauf programme explicite (même page). Un compte grand public a un réglage d'amélioration des modèles.
Open Code, page Enterprise : « OpenCode does not store your code or context data. All processing happens locally or through direct API calls to your AI provider. » La page ne détaille pas le contenu envoyé ; le contenu du prompt vient des slides du module 3 (diff et règles ; `git diff --cached` ; 3000 dernières lignes du journal).
Contenu du prompt : tout ce que l'agent de code a lu pendant le tour (fichiers lus par les outils compris), pas seulement le diff.
:::

## Lieux d'exécution d'un modèle {kicker="Données"}

Trois mots situent l'endroit où un modèle s'exécute.

| Terme | Sens |
|---|---|
| poste | ordinateur du développeur |
| machine de l'équipe | ordinateur que l'équipe contrôle : un poste ou un serveur partagé |
| fournisseur | organisation qui héberge un modèle, comme Anthropic ou Amazon Bedrock |

::: notes
Définitions du support, aucune source. Ces trois mots servent dans tout le module ; le serveur partagé est défini à la slide « Définition d'un serveur d'équipe ». Le support écrit « fournisseur » et non « cloud ».
Open Code appelle Amazon Bedrock et Claude Code l'abonnement Anthropic sur le poste de démonstration : ce sont deux fournisseurs.
:::

## Définition d'un modèle local {kicker="Données"}

Un modèle local s'exécute sur une machine de l'équipe : le prompt ne quitte pas le réseau de l'équipe. Un modèle distant est hébergé chez un fournisseur, hors de ce réseau.

![Le prompt reste dans le réseau de l'équipe avec le modèle local, il le quitte pour le modèle distant](images/04-local-distant.svg)

::: notes
Définition du support, aucune source. « Modèle distant » couvre Claude Sonnet 5.5 par l'abonnement Anthropic ou par Amazon Bedrock, et tout modèle d'un fournisseur. Le support écrit « modèle distant » et non « frontier » ni « cloud ».
Question probable : un serveur loué chez un loueur de cartes est-il local ? Il est hébergé hors du réseau de l'équipe : c'est un modèle distant, et la clause de sous-traitance s'applique (slide « Ce qui reste local »). Le serveur loué est défini à la slide « Définition d'un serveur loué ».
:::

## Ce qui reste local {kicker="Données"}

Données gardées en général hors du prompt d'un fournisseur (liste partielle) :

- secrets : clés d'API, jetons, mots de passe ;
- données personnelles, y compris dans les logs ;
- code couvert par une clause de confidentialité.

::: sources
- [Commission nationale de l'informatique et des libertés (CNIL), questions-réponses sur l'IA générative (18 juillet 2024)](https://cnil.fr/fr/les-questions-reponses-de-la-cnil-sur-lutilisation-dun-systeme-dia-generative)
- [Agence nationale de la sécurité des systèmes d'information (ANSSI) et Bundesamt für Sicherheit in der Informationstechnik (BSI), AI Coding Assistants (septembre 2024)](https://allianz-fuer-cybersicherheit.de/SharedDocs/Downloads/EN/BSI/KI/ANSSI_BSI_AI_Coding_Assistants.pdf?__blob=publicationFile&v=7)
:::

::: notes
CNIL (18 juillet 2024) : « les utilisateurs finaux ne devraient soumettre que des informations qu'ils sont autorisés à partager » (section 7) ; recours à une infrastructure externe sécurisé « par le biais d'un contrat de sous-traitance » précisant « les périmètres de responsabilité et les accès autorisés aux données traitées » ; pour les API, « en évitant autant que possible la saisie de données personnelles » (section 5).
ANSSI et BSI, rapport daté « Last updated: September 2024 » dans le fichier lié (la page de publication de l'ANSSI donne le 4 octobre 2024) : « sensitive information (such as API keys) should, if possible, not end up in the prompt » (phrase écrite pour les chatbots courants) ; « local hosting of open-source models can prevent the loss of sensitive information » (niveau management, offres aux développeurs pour éviter le shadow IT).
La liste est une lecture du support. Secrets : ANSSI et BSI (« hors du prompt, si possible »), le support étend l'exemple des clés d'API aux jetons et mots de passe. Données personnelles : CNIL (éviter leur saisie, ne soumettre que le partageable), journaux compris. Code sous clause : contrat de sous-traitance (CNIL), la décision revient au responsable des données de l'organisation. Le code public peut partir chez le fournisseur, aucune règle ne l'interdit. La CNIL formule la règle sur les données personnelles pour l'accès par API ; la liste généralise.
:::

## Une donnée qui ne peut pas sortir impose une machine de l'équipe. {.statement kicker="Données"}

::: notes
Conclut la section : prompt envoyé au fournisseur, définition du modèle local, classes de données. Si la donnée est de celles qui exigent un accord et qu'il manque, le modèle s'exécute sur une machine de l'équipe.
Transition : quelle machine ? La mémoire en décide. Section suivante : mémoire et vitesse.
:::

## Définition d'un poids {kicker="Mémoire"}

Les poids sont les paramètres du modèle, des nombres appris. Leur taille en mémoire vaut le nombre de paramètres fois les octets par paramètre.

```text
8 milliards de paramètres × 2 octets (16 bits) = 16 Go
```

::: sources
- [Hugging Face, Qwen3-8B (modèle de 8,2 milliards de paramètres, bfloat16, config.json)](https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json)
:::

::: notes
Calcul du support (8,2 milliards de paramètres selon la fiche du modèle, arrondis à 8). 16 bits = 2 octets par paramètre (bfloat16, `torch_dtype` du `config.json`). Qwen3-8B est un modèle dense de la famille Qwen3 ; il sert d'exemple de petit modèle dans toute la section.
Lexique : « paramètre » désigne ici un nombre du modèle, distinct du paramètre d'un outil MCP (module 1, `inputSchema`). « Poids » et non « coefficients ».
:::

## Quantification des poids {kicker="Mémoire"}

La quantification stocke chaque poids sur 4 bits au lieu de 16, au prix d'une perte de précision.

| Paramètres | 16 bits | 4 bits |
|---|---|---|
| 8 milliards | 16 Go | 4 Go |
| 30 milliards | 60 Go | 15 Go |
| 70 milliards | 140 Go | 35 Go |

::: sources
- [llama.cpp, README (quantification de 1,5 à 8 bits)](https://github.com/ggml-org/llama.cpp)
:::

::: notes
Calcul : paramètres × octets (16 bits = 2 octets, 4 bits = 0,5 octet). Les formats de quantification réels ajoutent un peu de métadonnées par bloc de poids : les tailles de fichier réelles sont légèrement supérieures.
README de llama.cpp : quantification entière de 1,5 à 8 bits « for faster inference and reduced memory use ». La perte de précision est réelle et dépend du modèle et de la tâche ; la mesure de l'équipe (slide « Mesurer le taux d'accord ») la révèle, pas ce tableau.
Le 4 bits est le point de départ de tous les calculs suivants. Un modèle plus petit réduit aussi la mémoire : slide suivante.
:::

## Définition d'un petit modèle {kicker="Mémoire"}

Un petit modèle compte quelques milliards de paramètres et occupe peu de mémoire. La distillation l'entraîne sur les réponses d'un modèle plus grand.

![Un modèle plus grand produit des réponses, le petit modèle s'entraîne dessus](images/04-distillation.svg)

::: sources
- [Distilling the Knowledge in a Neural Network (arXiv 1503.02531, transfert de connaissance vers un modèle plus facile à déployer)](https://arxiv.org/abs/1503.02531)
- [Google, Gemma 3 Technical Report (modèles entraînés par distillation)](https://arxiv.org/abs/2503.19786)
:::

::: notes
Un petit modèle peut être local ou distant : Claude Haiku est un petit modèle distant (alias `haiku` dans Claude Code). La slide « Scores sur SWE-bench Pro » le montre : claude-4-5-haiku y marque 39,45 %.
Article de distillation : transférer la connaissance d'un modèle (ou d'un ensemble) vers un modèle plus facile à déployer. Gemma 3 : « The Gemma 3 models are trained with distillation. » « Perdre du raisonnement » : constat général de la pratique, non chiffré ici ; la mesure sur les issues de l'équipe tranche.
:::

## Génération token après token {kicker="Mémoire"}

Un modèle relit ses poids pour chaque token produit. La lecture du prompt, elle, se fait en une seule passe.

![Prompt lu en une passe, puis boucle : poids relus, un token produit](images/04-generation.svg)

::: sources
- [NVIDIA, How NVIDIA DGX Spark's performance enables intensive AI tasks (table 4 : lecture du prompt et génération)](https://developer.nvidia.com/blog/how-nvidia-dgx-sparks-performance-enables-intensive-ai-tasks)
:::

::: notes
Acquis de la formation initiale (génération token par token, module 1 de DLAIA). Conséquence pour la suite : chaque token produit demande de relire les poids, donc la vitesse dépend de la bande passante de la mémoire, non de la puissance de calcul seule. La slide suivante précise combien de poids sont relus.
Mesure NVIDIA (blog DGX Spark, table 4, gpt-oss-20b, MXFP4, llama.cpp, entrée 2048 tokens, sortie 128, taille de lot 1) : 3 670 tokens/s de lecture du prompt contre 82,74 tokens/s de génération.
Phase de lecture du prompt : « prefill » en anglais, pas employé sur les slides.
:::

## Définition d'une mixture d'experts {kicker="Mémoire"}

Une mixture d'experts est un modèle découpé en experts, des blocs de poids, dont chaque token n'active que quelques-uns. Un modèle dense relit tous ses poids à chaque token.

| | Modèle dense | Mixture d'experts |
|---|---|---|
| poids en mémoire | tous | tous les experts |
| poids relus par token | tous | quelques experts |

::: sources
- [Outrageously Large Neural Networks (mixture d'experts à porte creuse, arXiv 1701.06538)](https://arxiv.org/abs/1701.06538)
- [Hugging Face, Qwen3-Coder-30B-A3B-Instruct (30,5 milliards au total, 3,3 activés)](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)
:::

::: notes
Un expert est un bloc de poids que la mixture active ou non selon le token (réseau de porte). Exemple chiffré : Qwen3-Coder-30B-A3B-Instruct, « 30.5B in total and 3.3B activated » : il occupe la mémoire d'un modèle de 30 milliards et relit environ 3 milliards de poids par token. Les exemples de calcul de la section utilisent au contraire un modèle dense, Qwen3-8B.
Effet : la mémoire reste celle du modèle entier, la vitesse suit les poids relus. La formule de la slide « Vitesse maximale d'un modèle » vaut pour un modèle dense.
NVIDIA mesure 82,74 tokens/s sur gpt-oss-20b et 55,37 sur gpt-oss-120b (blog DGX Spark, table 4 ; MXFP4, llama.cpp, ISL|OSL 2048|128, BS=1). Ces modèles sont des MoE (Hugging Face, fiche gpt-oss : « MXFP4 quantization of the MoE weights » ; 21 milliards dont 3,6 actifs pour le 20b, 117 dont 5,1 pour le 120b) : leur vitesse dépasse la borne calculée sur tous les poids.
:::

## Vitesse maximale d'un modèle {kicker="Mémoire"}

La bande passante est la quantité de données que la mémoire envoie au processeur par seconde. La vitesse de génération maximale vaut cette bande passante divisée par la taille des poids relus à chaque token.

```text
273 Go/s ÷ 4 Go = 68 tokens/s au mieux
```

Exemple : un modèle dense de 8 milliards en 4 bits (4 Go) sur une machine à 273 Go/s de bande passante (DGX Spark).

::: sources
- [NVIDIA, DGX Spark (128 Go, 273 Go/s)](https://www.nvidia.com/en-us/products/workstations/dgx-spark/)
:::

::: notes
Formule du support (borne haute), sans source ; la page NVIDIA donne seulement 273 Go/s. Définitions du lexique : la bande passante (mémoire) est la quantité de données que la mémoire envoie au processeur par seconde, en Go/s. La vitesse de génération est le nombre de tokens produits par seconde.
273 ÷ 4 = 68,25 tokens/s. Borne haute : la vitesse réelle est plus basse (calcul, cache lu à chaque token, moteur). Valable pour un modèle dense ; une mixture d'experts relit moins de poids (mesures NVIDIA de la slide « Définition d'une mixture d'experts » : 82,74 tokens/s pour gpt-oss-20b, 55,37 pour gpt-oss-120b). Pour comparaison, le même modèle en 16 bits (16 Go) donnerait 273 ÷ 16 = 17 tokens/s au mieux.
Fiche NVIDIA : DGX Spark, « 128 GB of coherent unified system memory with 273 GB/s of memory bandwidth ».
:::

## Mémoire d'un modèle {kicker="Mémoire"}

La mémoire utilisée vaut les poids plus le cache de la fenêtre de contexte, qui grossit à chaque token lu ou produit.

![Barres de mémoire : 4 Go de poids, plus 0,3 Go de cache à 2 000 tokens et 14,7 Go à 100 000 tokens](images/04-memoire.svg)

Exemple : un modèle de 8 milliards en 4 bits, 147 Ko de cache par token.

::: sources
- [Hugging Face, Qwen3-8B, config.json](https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json)
:::

::: notes
Calcul du cache par token d'après la fiche d'architecture (`config.json` de Qwen3-8B) : 2 (clés et valeurs) × 36 couches × 8 têtes de clés-valeurs × 128 dimensions × 2 octets (bfloat16) = 147 456 octets, soit environ 147 Ko. Pour 2 000 tokens : 0,29 Go, arrondi à 0,3 ; pour 100 000 tokens : 14,7 Go. Total à 100 000 tokens : 4 + 14,7 = 18,7 Go.
Le cache dépend de l'architecture du modèle : la valeur est celle du modèle cité, un autre modèle de même taille en demande plus ou moins. La fiche du modèle donne 32 768 tokens de contexte en natif et 131 072 avec YaRN (une barre de 100 000 tokens suppose cette extension). Le rapport Gemma 3 note que ce cache « tend à exploser » avec le contexte long. Le cache peut aussi être quantifié (hors périmètre).
Lexique : « cache de la fenêtre de contexte », non « KV cache ».
:::

## Fenêtre maximale sur 24 Go {kicker="Mémoire"}

Sur une carte de 24 Go (RTX 4090), les poids en 4 bits laissent une place au cache de la fenêtre de contexte. Hypothèse (illustration) : 147 Ko de cache par token pour les trois modèles.

| Modèle en 4 bits | Poids | Reste sur 24 Go | Fenêtre maximale |
|---|---|---|---|
| 8 milliards | 4 Go | 20 Go | environ 136 000 tokens |
| 30 milliards | 15 Go | 9 Go | environ 61 000 tokens |
| 70 milliards | 35 Go | poids supérieurs à 24 Go | ne tient pas |

::: sources
- [NVIDIA, GeForce RTX 4090 (24 Go de GDDR6X)](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/)
- [Hugging Face, Qwen3-8B, config.json](https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json)
:::

::: notes
Calcul : reste = 24 Go − poids ; contexte = reste ÷ 147 456 octets (20 Go ÷ 147 456 = 135 633 ; 9 Go ÷ 147 456 = 61 035). Le moteur d'inférence consomme aussi de la mémoire de travail : la fenêtre réelle est plus petite, de quelques Go. Le cache de Qwen3-8B est supposé identique pour les trois tailles, ce qui est faux en général (illustration). Le plafond du modèle borne aussi la fenêtre (32 768 tokens en natif pour Qwen3-8B, 131 072 avec YaRN).
Carte de 24 Go : GeForce RTX 4090 (24 Go de GDDR6X, interface 384 bits, page produit NVIDIA). Le plan citait la RTX 5090 pour cette ligne : elle offre 32 Go de GDDR7 et 1 792 Go/s (page de comparaison NVIDIA), d'où le choix de la 4090 pour l'exemple à 24 Go.
:::

## Trois grandeurs bornent un modèle local : mémoire, bande passante, taille de la fenêtre. {.statement kicker="Mémoire"}

::: notes
Conclut la section : poids, quantification, petit modèle, génération, mixture d'experts, vitesse, mémoire, fenêtre sur 24 Go. Les poids occupent la mémoire, la bande passante fixe la vitesse, le cache limite la fenêtre.
Transition : ces trois grandeurs sont celles de la machine. Reste le logiciel qui permet d'appeler le modèle. Section suivante : couches.
:::

## Trois couches d'un modèle local {kicker="Couches"}

Un modèle local s'exécute par trois couches : le moteur d'inférence, le format des poids, le serveur d'API (API : interface de programmation).

![Pile de trois couches : serveur d'API, moteur d'inférence, format de poids](images/04-pile.svg)

::: sources
- [llama.cpp, README](https://github.com/ggml-org/llama.cpp)
- [llama.cpp, serveur](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)
- [GGML, format GGUF](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md)
- [vLLM, documentation](https://docs.vllm.ai/en/latest/)
:::

::: notes
Lexique : l'inférence est l'exécution du modèle pour produire des tokens ; le moteur d'inférence est le programme qui l'exécute (llama.cpp : « LLM inference in C/C++ ») ; le format de poids est le fichier qui stocke les poids (GGUF : « a file format for storing models for inference with GGML » ; `safetensors` pour les poids publiés sur Hugging Face) ; le serveur d'API expose le modèle par une adresse compatible avec l'API OpenAI (routes compatibles OpenAI pour le chat).
llama.cpp : `llama-server` est ce serveur, avec des routes compatibles OpenAI. Adresse par défaut selon le README : `127.0.0.1`, port 9931. vLLM : bibliothèque d'inférence et de service avec « OpenAI-compatible API server » et « continuous batching » (slide « Définition d'un serveur d'équipe »). Le choix du moteur dépend de la machine ; hors périmètre.
Question probable : et Ollama ? Même rôle (moteur et serveur empaquetés), non sourcé ici, donc non cité.
:::

## Modeles ouverts face aux benchmarks {.statement kicker="Evaluation"}

::: notes
Conclut la section : moteur d'inférence, format de poids, serveur d'API. Une fois les trois installés, Open Code appelle le modèle par une adresse, comme il appelle un fournisseur (Claude Code ne se raccorde qu'à des modèles Claude, slide « Un modèle par sous-agent »).
Transition : une adresse ne dit rien de la capacité du modèle. Section suivante : l'écart entre les modèles ouverts et le meilleur modèle distant.
:::

## Définition d'un benchmark {kicker="Modèles ouverts"}

Un benchmark est un jeu de tâches avec une méthode de notation. Son score porte une date et un harnais, le logiciel qui lance le modèle sur les tâches.

| Élément | SWE-bench Pro (Software Engineering benchmark) |
|---|---|
| tâches | corriger une issue dans un dépôt |
| score | taux de résolution : le correctif fait passer les tests visés sans casser les autres |

::: sources
- [SWE-Bench Pro (arXiv 2509.16941)](https://arxiv.org/abs/2509.16941)
- [Scale AI, résultats SWE-bench Pro](https://labs.scale.com/leaderboard/swe_bench_pro_public)
:::

::: notes
Article (HTML arXiv, lu le 26 octobre 2026) : le modèle « must generate a patch file to resolve the issue and pass a suite of human-reviewed tests », tests « fail2pass » (la résolution) et « pass2pass » (les fonctions existantes restent intactes) ; 1 865 tâches au total : jeu public 731, jeu privé de réserve 858, jeu commercial 276. Les résultats cités portent sur le jeu public (731 tâches, énoncés publiés). Le harnais est mini-swe-agent pour les entrées marquées d'une étoile ; la page ne nomme pas le harnais des autres.
Un score sans date ni harnais ne se compare pas. Le classement ne porte aucune date ; lu le 26 octobre 2026. Les appels d'outils à plusieurs tours (Berkeley Function Calling Leaderboard) sont écartés faute de source lue.
:::

## Scores sur SWE-bench Pro {.figures kicker="Modèles ouverts"}

- **61,5 %** meilleur modèle distant évalué
- **38,7 %** meilleur modèle ouvert évalué
- **16,2 %** modèle ouvert de 120 milliards

Taux de résolution sur SWE-bench Pro. Un modèle ouvert est un modèle dont les poids sont publiés.

::: sources
- [Scale AI, résultats SWE-bench Pro, lus le 26 octobre 2026 (page sans date de mise à jour)](https://labs.scale.com/leaderboard/swe_bench_pro_public)
:::

::: notes
Jeu public de 731 tâches. Valeurs lues le 26 octobre 2026 (recoupent la lecture du 25) : Muse Spark 1.1 61,5 ± 3,1 ; gpt-5.4 xHigh 59,1 ; Claude Opus 4.6 thinking 51,9 ; qwen3-coder-480b-a35b 38,7 ; minimax-2.1 36,81 ; kimi-k2-instruct 27,67 ; gpt-oss-120b 16,2. Intervalle de confiance : environ ± 3 points ; deux scores proches ne se départagent pas. Le classement marque d'une étoile les entrées jouées avec mini-swe-agent (Muse Spark 1.1, gpt-5.4, Claude Opus 4.6) ; les autres : harnais non nommé, comparaison indirecte. La page ne marque pas les modèles ouverts : la colonne « ouvert » est établie par nous d'après la publication des poids. Relire le jour de la séance.
Point à relever en salle : claude-4-5-haiku, un petit modèle distant, marque 39,45 %, au-dessus du meilleur modèle ouvert évalué. Un petit modèle n'est pas forcément local, et un modèle ouvert est loin derrière.
Les modèles locaux se désignent par leur taille sur les slides ; leurs noms sont ici.
:::

## Approche hybride {.statement kicker="Modèles ouverts"}

::: notes
Conclut la section : définition d'un benchmark, scores sur SWE-bench Pro. 61,5 − 38,7 = 22,8 points, soit environ 23 ; l'intervalle de confiance est d'environ ± 3 points.
Transition : quelles tâches confier au petit modèle local ? Section suivante : tâches.
:::

## Tâches du modèle local {kicker="Tâches"}

Exemples, liste partielle : une tâche convient au modèle local quand elle lit peu de tokens, tient en peu de tours et se vérifie par une commande.

| Tâche | Tours | Critère vérifiable |
|---|---|---|
| message de commit | 1 | le préfixe appartient à la liste de l'équipe |
| corriger une violation de style au `pre-push` | 1 à 2 | `ruff check` rend 0 |
| classement d'une issue | 1 | la catégorie rendue appartient à une liste fixée |

::: sources
- [git, githooks (pre-push)](https://git-scm.com/docs/githooks)
- [ruff, linter (codes de sortie)](https://docs.astral.sh/ruff/linter/)
:::

::: notes
Classement du support, sans source. Chaque tâche lit peu de tokens sur un ou deux tours (classement du support) et son résultat se teste par une commande (critère vérifiable du module 1). `ruff check` rend 1 si des violations existent (module 3) : c'est la commande qui décide, le modèle propose la correction. `pre-push` : hook git invoqué par `git push` avant le transfert (githooks).
Hors de cette zone : une tâche qui demande de raisonner sur plusieurs fichiers reste au modèle distant (slide suivante).
:::

## Tâches du modèle distant {kicker="Tâches"}

Exemples, liste partielle : une tâche reste au modèle distant quand elle enchaîne de nombreux tours sur beaucoup de tokens.

| Tâche | Ce qui est lu | Tours | Coût |
|---|---|---|---|
| reviewer | diff, règles, fichiers du dépôt | 3 à la demande, 5 en CI | 0,24 à 0,51 $ |
| contradicteur | finding, code, tests | 7 en revue adverse | 0,61 $ |
| analyse d'échec | 3 000 dernières lignes du journal de CI | 5 | 0,58 $ |

::: sources
- Mesures des démonstrations des modules 2 et 3, 25 octobre 2026
:::

::: notes
Mesures avec Claude Code : reviewer à la demande 3 tours (0,24 et 0,51 $ sur deux exécutions), revue en CI 5 tours (0,51 $, 146 s), revue adverse 7 tours (0,605 $), analyse d'échec 5 tours (0,58 $, journal de 6 597 lignes, 216 783 octets, dont les 3 000 dernières lignes passées à l'agent). Sources : fichiers de référence des démonstrations et journaux bruts du rejeu, non distribués. Le coût suit les tokens lus par tour multipliés par le nombre de tours : la fenêtre de contexte se relit à chaque tour.
Classement du support : lire de nombreux fichiers et raisonner sur plusieurs d'entre eux exige un modèle qui tient la fenêtre et le raisonnement ; l'écart de la section précédente en donne l'ordre de grandeur. Mesures provisoires jusqu'au rejeu manuel de fin de support.
La frontière n'est pas figée : la mesure sur les issues de l'équipe se refait quand un modèle local progresse.
:::


## Routage vers le grand modèle {kicker="Tâches"}

Classer une tâche lit peu de tokens en un tour : ce classement revient au petit modèle.

![Le petit modèle classe la tâche ; une tâche locale reste au petit modèle, une tâche distante ou hors liste part chez le fournisseur au grand modèle](images/04-routage.svg)

::: notes
Schéma du support. Le classement est lui-même une tâche du modèle local (slide « Tâches du modèle local », ligne « classement d'une issue ») : le petit modèle rend une catégorie prise dans une liste fixée, « locale » ou « distante », d'après les deux slides précédentes. Une commande vérifie que la catégorie appartient à la liste (critère vérifiable, module 1) ; une réponse hors liste ou illisible part au grand modèle, par prudence. Le grand modèle est ici Claude Sonnet 5.5. Les tâches locales restent sur la machine de l'équipe ; seules les distantes partent chez le fournisseur.
Lexique : « routage » et non « cascade » ni « fallback » ; le grand modèle est le modèle auquel le routage renvoie les cas que le petit modèle ne sait pas traiter. Un script route, le code de retour décide (module 1).
:::


## Un tri local réserve le fournisseur aux tâches qui l'exigent. {.statement kicker="Tâches"}

::: notes
Conclut la section : tâches du modèle local, tâches du modèle distant, routage. Le classement d'une tâche est lui-même une tâche locale (peu de tokens, un tour, vérifiable) ; sa catégorie envoie la tâche au petit modèle ou au grand. Seules les tâches distantes, ou mal classées, quittent le réseau de l'équipe.
Transition : où faire tourner ce petit modèle ? Section suivante : choix de machine.
:::

## Machines individuelles {kicker="Machine"}

Mémoire unifiée : mémoire partagée par le processeur et la carte graphique.

| Machine (exemples) | Mémoire | Bande passante | Vitesse maximale |
|---|---|---|---|
| carte graphique de bureau (RTX 4090) | 24 Go | 1 008 Go/s | 252 tokens/s |
| portable à mémoire unifiée (MacBook Pro M5 Max) | 128 Go | 614 Go/s | 153 tokens/s |
| DGX Spark | 128 Go | 273 Go/s | 68 tokens/s |

Vitesse : modèle dense de 8 milliards en 4 bits (4 Go).

::: sources
- [NVIDIA, GeForce RTX 4090](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/)
- [NVIDIA, Ada GPU Architecture (1008 GB/s)](https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf)
- [Apple, MacBook Pro, caractéristiques](https://www.apple.com/macbook-pro/specs/)
- [NVIDIA, DGX Spark](https://www.nvidia.com/en-us/products/workstations/dgx-spark/)
:::

::: notes
Valeurs lues le 26 octobre 2026. RTX 4090 : 24 Go de GDDR6X (page produit) et 1 008 Go/s (tableau comparatif du livre blanc Ada, 21 Gbit/s sur 384 bits). MacBook Pro à puce M5 Max : 128 Go de mémoire unifiée avec 40 cœurs graphiques, 614 Go/s ; la configuration à 32 cœurs graphiques offre 36 Go et 460 Go/s. DGX Spark : jusqu'à 128 Go, 273 Go/s, interface de 256 bits.
Vitesses : bande passante ÷ 4 Go (8 milliards en 4 bits) : 1 008 ÷ 4 = 252, 614 ÷ 4 = 153,5 (arrondi à 153), 273 ÷ 4 = 68,25 ; bornes hautes d'un modèle dense. Pour une mixture d'experts, la vitesse réelle peut dépasser la formule dense (mesures NVIDIA).
La RTX 5090 offre 32 Go de GDDR7 et 1 792 Go/s (page de comparaison NVIDIA). Les prix ne figurent pas : ils varient et ne servent pas à la décision.
:::

## Définition d'un serveur d'équipe {kicker="Machine"}

Un serveur d'équipe est une machine partagée de l'équipe : le prompt reste dans son réseau.

![Trois postes envoient leurs prompts à un serveur d'équipe qui porte le modèle local](images/04-serveur-equipe.svg)

::: sources
- [vLLM, documentation (traitement par lots, serveur compatible OpenAI)](https://docs.vllm.ai/en/latest/)
:::

::: notes
vLLM, page d'accueil : « Continuous batching of incoming requests » et « OpenAI-compatible API server ». Le serveur d'équipe traite les prompts de plusieurs développeurs à la fois (lecture du support : la page ne parle pas de développeurs). Lexique : « serveur d'équipe », jamais « serveur local ».
Le serveur d'équipe réclame de l'exploitation (mises à jour, droits, disponibilité) : coût non chiffré ici.
:::

## Choisir un serveur d'équipe {kicker="Machine"}

Trois critères départagent le poste, le serveur d'équipe et le fournisseur. Sans réponse positive, la tâche reste chez le fournisseur.

| Critère | Question | Exemple | Si oui |
|---|---|---|---|
| donnée | une classe de donnée ne sort-elle pas ? | journaux à identifiants | serveur d'équipe |
| volume | le volume dépasse-t-il le seuil de rentabilité ? | seuil calculé dans les deux slides suivantes | serveur d'équipe |
| réseau | le poste travaille-t-il hors ligne ? | train, site sans accès au fournisseur | modèle sur le poste |

::: notes
Donnée : classe de la slide « Ce qui reste local ». Volume : le seuil se calcule aux slides « Définition d'un serveur loué » et « Coût d'un serveur loué ». Réseau : un poste hors ligne ne joint ni fournisseur ni serveur d'équipe, seul le modèle sur le poste répond.
Critères du support, sans source. Une donnée qui ne sort pas peut aussi rester sur le poste quand le modèle y tient.
:::

## Définition d'un serveur loué {kicker="Machine"}

Un serveur loué est un serveur de calcul loué à un hébergeur, hors du réseau de l'équipe. Il donne ici l'ordre de grandeur du coût d'un serveur d'équipe.

Hypothèses de l'illustration, au 26 octobre 2026 :

- dix développeurs
- 6 000 appels par mois, de 2 000 tokens lus et 100 produits
- modèle distant : Claude Sonnet 5.5

::: notes
Un serveur loué est hors du réseau de l'équipe : le prompt le quitte et passe par la clause de sous-traitance (slide « Ce qui reste local »). Ce n'est pas un serveur d'équipe ; il sert de repère de prix, aucun prix d'achat d'un serveur d'équipe n'ayant été lu.
Hypothèses du support (illustration) : dix développeurs × 20 jours × 30 appels (trieur et message de commit) = 6 000 appels par mois ; chaque appel 2 000 tokens lus et 100 produits, soit 12 millions lus et 0,6 million produits.
:::

## Coût d'un serveur loué {kicker="Machine"}

Même volume, deux façons de le servir : le modèle distant se paie au token, le serveur loué à l'heure.

| | Modèle distant | Serveur loué |
|---|---|---|
| calcul | 12 millions de tokens lus × 2 $ + 0,6 million de tokens produits × 10 $ | 2,49 $/h × 730 h |
| par mois | 30 $ | 1 818 $ |
| par million de tokens | 2,38 $ | 144 $ |

::: sources
- [Anthropic, Pricing (Claude Sonnet 5.5 : 2 $ et 10 $ par million de tokens)](https://platform.claude.com/docs/en/about-claude/pricing)
- [RunPod, Pricing (RTX PRO 6000, 96 Go, Secure Cloud, mis à jour le 8 octobre 2026)](https://www.runpod.io/pricing)
:::

::: notes
Claude Sonnet 5.5 : 2 $ par million de tokens en entrée, 10 $ en sortie (page Pricing, lue le 27 octobre 2026) : 24 $ + 6 $ = 30 $. Le trieur et le message de commit sont servis côté Claude Code par `haiku`, moins cher que Sonnet 5.5 (Haiku 4.5 : 1 $ et 5 $ par million sur la même page) : avec haiku le coût distant baisse et l'écart augmente.
Serveur : le plan prévoyait la mensualité amortie sur 36 mois d'un serveur à carte de 96 Go ; aucun prix d'achat n'a été lu. Remplacé par la location d'une carte RTX PRO 6000 de 96 Go (RunPod, Secure Cloud, 2,49 $ de l'heure, page mise à jour le 8 octobre 2026 ; Community Cloud 1,69 $) : 2,49 × 730 heures = 1 818 $ par mois, durée moyenne d'un mois.
Égalité des coûts : 1 818 $ ÷ 2,38 $ par million = environ 764 millions de tokens par mois, soixante fois le volume de l'illustration. Au volume du trieur, le modèle distant coûte moins cher ; le local se justifie par la donnée (section « Données ») ou par le volume. Le débit réel de la carte n'est pas modélisé : à ce prix, elle pourrait traiter bien plus que 12,6 millions de tokens par mois.
:::

## À dix développeurs, un serveur loué coûte soixante fois plus que le modèle distant. {.statement kicker="Machine"}

::: notes
Conclut la section : machines individuelles, serveur d'équipe, critères de choix, coût d'un serveur loué. 1 818 $ contre 30 $ par mois, soit 60 fois, à 12,6 millions de tokens par mois. La comparaison se fait en prix par million de tokens, au volume réel de l'équipe.
Transition : données, mémoire, couches, modèles ouverts, tâches et machine donnent chacun un critère. Section suivante : leur synthèse par tâche.
:::

## Machine de chaque tâche {kicker="Synthèse"}

Exemples, liste partielle, avec le critère qui décide chaque ligne.

| Tâche | Classe de donnée | Tokens par tour | Machine | Critère décisif |
|---|---|---|---|---|
| message de commit | code sous clause de confidentialité | faible | poste | donnée |
| classement d'une issue | données personnelles | faible | serveur d'équipe | donnée |
| analyse d'échec | journaux à identifiants | élevé | serveur d'équipe | donnée |
| reviewer sur pull request | code public | élevé | fournisseur | tokens |

::: notes
Synthèse du module, sans source (classement du support) : reprend les classes de données (« Ce qui reste local »), les tâches (« Tâches du modèle local » et « Tâches du modèle distant ») et les machines. Lecture : la donnée tranche d'abord (une donnée qui ne sort pas impose une machine de l'équipe, même pour une tâche à beaucoup de tokens comme l'analyse d'échec), les tokens par tour ensuite, le coût en dernier. Le reviewer lit un code public : rien n'interdit le fournisseur, et ses tokens par tour le désignent.
Emplacements du module 3 : le message de commit s'exécute dans un hook git sur le poste ; les trois autres tâches dans un job de CI sur un runner. Un modèle local en CI suppose un serveur d'équipe joignable depuis le runner (module 3).
Aucune démonstration pour ce module (décision du 25 octobre 2026) : les extraits de configuration ne sont pas exécutés.
:::

## La donnée tranche d'abord, les tokens ensuite, le coût en dernier. {.statement kicker="Synthèse"}

::: notes
Conclut le module : données, mémoire, couches, modèles ouverts, tâches, machine, synthèse par tâche. Chaque tâche a une machine : poste, serveur d'équipe ou fournisseur. Retour au programme de la journée : les mécanismes des modules 1 à 3 (serveur MCP, sous-agent, boucle, reviewer, hook, job de CI) se combinent selon la tâche, et le module 4 ajoute où tourne le modèle.
Transition : bilan de la journée.
:::

## Glossaire : modèles {kicker="Glossaire"}

- **Modèle local** : modèle exécuté sur une machine de l'équipe ; le prompt ne quitte pas le réseau de l'équipe
- **Modèle distant** : modèle hébergé chez un fournisseur, hors du réseau de l'équipe
- **Modèle ouvert** : modèle dont les poids sont publiés
- **Petit modèle** : modèle de quelques milliards de paramètres, local ou distant
- **Grand modèle** : modèle auquel le routage renvoie les cas que le petit modèle ne sait pas traiter
- **Distillation** : entraînement d'un petit modèle sur les réponses d'un modèle plus grand

::: sources
- [Distilling the Knowledge in a Neural Network (arXiv 1503.02531)](https://arxiv.org/abs/1503.02531)
- [Google, Gemma 3 Technical Report](https://arxiv.org/abs/2503.19786)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : lieux {kicker="Glossaire"}

- **Poste** : ordinateur du développeur
- **Machine de l'équipe** : ordinateur que l'équipe contrôle, poste ou serveur partagé
- **Fournisseur** : organisation qui héberge un modèle distant (Anthropic, Amazon Bedrock)
- **Serveur d'équipe** : machine partagée de l'équipe qui sert plusieurs développeurs à la fois
- **Serveur loué** : serveur de calcul loué à un hébergeur, hors du réseau de l'équipe

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : mémoire {kicker="Glossaire"}

- **Poids** : nombres appris du modèle, relus à chaque token (modèle dense)
- **Paramètre** : un des nombres du modèle, distinct du paramètre d'un outil MCP
- **Quantification** : stockage des poids sur moins de bits pour réduire la mémoire
- **Cache de la fenêtre de contexte** : données gardées en mémoire pour chaque token déjà lu ou produit
- **Mémoire unifiée** : mémoire partagée par le processeur et la carte graphique

::: sources
- [llama.cpp, README](https://github.com/ggml-org/llama.cpp)
- [Hugging Face, Qwen3-8B, config.json](https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : vitesse et architecture {kicker="Glossaire"}

- **Bande passante (mémoire)** : quantité de données que la mémoire envoie au processeur par seconde, en Go/s
- **Vitesse de génération** : nombre de tokens produits par seconde
- **Modèle dense** : modèle dont chaque token relit tous les poids
- **Mixture d'experts** : modèle dont chaque token n'active qu'une partie des poids
- **Expert** : bloc de poids d'une mixture d'experts, activé ou non selon le token

::: sources
- [Outrageously Large Neural Networks (arXiv 1701.06538)](https://arxiv.org/abs/1701.06538)
- [NVIDIA, How NVIDIA DGX Spark's performance enables intensive AI tasks](https://developer.nvidia.com/blog/how-nvidia-dgx-sparks-performance-enables-intensive-ai-tasks)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : couches {kicker="Glossaire"}

- **Inférence** : exécution du modèle pour produire des tokens
- **Moteur d'inférence** : programme qui exécute le modèle (llama.cpp)
- **Format de poids** : fichier qui stocke les poids (GGUF)
- **Serveur d'API** : programme qui expose le modèle par une adresse compatible avec l'API OpenAI

::: sources
- [llama.cpp, README](https://github.com/ggml-org/llama.cpp)
- [GGML, format GGUF](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : mesure {kicker="Glossaire"}

- **Benchmark** : jeu de tâches avec une méthode de notation ; un score porte une date et un harnais
- **Taux d'accord** : part des issues dont la réponse égale celle de l'équipe

::: sources
- [SWE-Bench Pro (arXiv 2509.16941)](https://arxiv.org/abs/2509.16941)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::

## Glossaire : trieur et routage {kicker="Glossaire"}

- **Trieur** : agent qui range une issue dans une étiquette d'une liste fermée
- **Étiquette** : catégorie de la liste fermée du trieur
- **Liste fermée** : ensemble fixe de valeurs que la réponse ne peut pas dépasser
- **Confiance** : champ de la réponse du trieur, haute ou basse
- **Sortie imposée** : réponse contrainte à un schéma JSON
- **Trieur-distant** : second agent identique au trieur, dont le modèle est le grand modèle ; reçoit les issues routées
- **Routage** : envoi d'une tâche au grand modèle quand le petit modèle ne sait pas la traiter

::: sources
- [Claude Code, Headless](https://code.claude.com/docs/en/headless)
:::

::: notes
Slide de référence, à ne pas lire en salle. Définitions du lexique.
:::
