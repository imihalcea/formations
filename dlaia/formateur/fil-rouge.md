# Fil rouge bookit

Trajectoire du projet fil rouge de TP en TP (issue #52) et environnement technique sur lequel il tourne. Les relevés datés ci-dessous ont été faits le 19 octobre 2026 sur le poste de préparation ; la section « À vérifier sur la VM » liste ce qui reste à confirmer sur la machine des stagiaires.

## Environnement (issue #48)

### Versions relevées

| Composant | Poste de préparation (19 octobre 2026) | Exigence du support |
|---|---|---|
| Python | 3.14.4 (`uv python list`) | 3.14, géré par uv |
| uv | 0.11.19 | |
| Claude Code | 2.1.303 | 2.1.277 au moins : lecture d'`AGENTS.md` à défaut de `CLAUDE.md` |
| Open Code | v2.0.26 | v2 |
| Spec Kit | 1.2.2, épinglé par `uv tool install specify-cli==1.2.2` | 1.2.2 |
| cosmic-ray | 8.7.0 | |
| pytest | 9.1.1 | |

### Mutation testing : cosmic-ray conservé

cosmic-ray 8.7.0 ne déclare pas Python 3.14 dans ses métadonnées, mais il s'installe et fonctionne sous 3.14.4. Test fait sur un projet jetable (`uv init --python 3.14`, `uv add --dev pytest cosmic-ray==8.7.0`) avec deux fonctions et deux tests :

- `cosmic-ray --version` : 8.7.0 ; `import cosmic_ray.cli` sous `python -W error` sans avertissement de dépréciation ;
- `cosmic-ray baseline` passe ; `init` puis `exec` : 18 mutants, 4 survivants, `cr-report` lisible.

Décision : cosmic-ray reste l'outil du module 6 et du TP 6 ; le repli mutmut est abandonné. Configuration de référence (reprise dans `tp/fichiers/cosmic-ray.toml`) :

```toml
[cosmic-ray]
module-path = "bookit/domain"
timeout = 30.0
excluded-modules = []
test-command = "uv run pytest -q tests"

[cosmic-ray.distributor]
name = "local"
```

Piège relevé : `test-command` est exécuté depuis la racine du projet, et pytest n'ajoute pas cette racine au `sys.path` par défaut. Sans `pythonpath = ["."]` dans `[tool.pytest.ini_options]` (ou un paquet installé), chaque exécution échoue à la collecte et cosmic-ray compte tous les mutants comme tués : le baseline doit être lancé avant `exec`.

### Modèle : Sonnet 4.6 par Amazon Bedrock

Sonnet 4.6 est servi par Bedrock sous forme de profil d'inférence (`inferenceTypesSupported: INFERENCE_PROFILE`), jamais par l'identifiant nu `anthropic.claude-sonnet-4-6` en appel à la demande. Identifiants relevés par `aws bedrock list-inference-profiles` :

| Région | Profils actifs pour Sonnet 4.6 |
|---|---|
| eu-west-1, eu-west-3 | `eu.anthropic.claude-sonnet-4-6`, `global.anthropic.claude-sonnet-4-6` |
| us-east-1 | `us.anthropic.claude-sonnet-4-6`, `global.anthropic.claude-sonnet-4-6` |

**Claude Code.** Avec `CLAUDE_CODE_USE_BEDROCK=1`, `claude --model claude-sonnet-4-6` résout l'identifiant Anthropic vers le profil du préfixe de la région (`eu.` pour une région `eu-*`, `us.` pour `us-*`, `global.` ailleurs ; `ANTHROPIC_BEDROCK_REGION_PREFIX` force le préfixe). Vérifié en eu-west-3 par `claude -p --output-format json` : `modelUsage` rapporte `canonicalModel: claude-sonnet-4-6`, `provider: bedrock`, fenêtre de 200 000 tokens, cache de prompt actif (22 210 tokens lus en cache sur un appel d'un mot). La région est lue dans l'ordre `AWS_REGION`, `AWS_DEFAULT_REGION`, région du profil AWS actif, puis `us-east-1`. Sans `--model`, le modèle par défaut de Claude Code sur Bedrock est Opus 5.5 : le fil rouge épingle `"model": "claude-sonnet-4-6"` dans `.claude/settings.json`. Source : https://code.claude.com/docs/en/amazon-bedrock (sections « Configure Claude Code », « Pin model versions », « Cross-region inference profile prefixes »).

**Open Code.** Le fournisseur `amazon-bedrock` connaît `eu.anthropic.claude-sonnet-4-6`, `us.anthropic.claude-sonnet-4-6` et `global.anthropic.claude-sonnet-4-6` (catalogue models.dev, `opencode models`). Le modèle se désigne `amazon-bedrock/eu.anthropic.claude-sonnet-4-6`, dans la clé `model` d'`opencode.json` ou par `opencode run --model`. La région vient de `AWS_REGION` ou de `provider.amazon-bedrock.options.region` ; sans l'une ni l'autre, l'appel échoue avec « The provided model identifier is invalid » (le profil `eu.` n'existe pas dans la région par défaut). Les identifiants AWS viennent de la chaîne habituelle (variables, profil, rôle de la machine) ; `AWS_BEARER_TOKEN_BEDROCK` prime sur tout le reste. Vérifié en eu-west-3 et en eu-west-1 : `opencode run` affiche `build · eu.anthropic.claude-sonnet-4-6` et répond. Source : https://opencode.ai/docs/providers/#amazon-bedrock.

### Fichiers du fil rouge

`fil-rouge/opencode.json` : modèle `amazon-bedrock/eu.anthropic.claude-sonnet-4-6`, région `eu-west-1`, `edit` en `ask`, `bash` en `ask` sauf `uv run pytest*` et `.specify/scripts/bash/*` (dernière règle correspondante gagnante, https://opencode.ai/docs/permissions/).

En mode non interactif (`opencode run`), une commande `ask` est refusée d'office (« This non-interactive run cannot ask the user for permission ») et l'agent continue sans elle ; `--auto` approuve tout ce qui n'est pas `deny`. Vérifié le 19 octobre 2026 avec `echo *` en `allow` et `printf` en `ask`. Le rejeu utilise donc `--auto`. Avec `--standalone`, trois appels dont la sortie partait dans un tube sans `--print-logs` n'ont jamais rendu la main ; le mode service par défaut, sortie JSON comprise, n'a pas ce défaut.

`fil-rouge/.claude/settings.json` : `model` épinglé à `claude-sonnet-4-6`, règles `allow` pour `Bash(uv run pytest *)` et `Bash(.specify/scripts/bash/*)` (https://code.claude.com/docs/en/permissions, « Wildcard patterns »). L'activation de Bedrock (`CLAUDE_CODE_USE_BEDROCK`, région) reste dans la configuration globale de la VM : le fil rouge ne porte aucune variable d'environnement.

### À vérifier sur la VM

- Versions installées : `claude --version` (2.1.277 au moins), `opencode --version` (v2), `uv --version`, `uv python list` (3.14), `specify --version` (1.2.2).
- Région et profils : `aws bedrock list-inference-profiles --region <région> --query 'inferenceProfileSummaries[?contains(inferenceProfileId, \`sonnet-4-6\`)].inferenceProfileId'`. Si la VM tourne hors `eu-*`, remplacer `eu.` par le préfixe de la région (ou `global.`) dans `opencode.json`, et ajuster `options.region`.
- Claude Code : `CLAUDE_CODE_USE_BEDROCK=1` et la région sont fournis par la configuration globale (`~/.claude/settings.json`, bloc `env`) ; `claude --model claude-sonnet-4-6 -p 'OK' --output-format json` doit rapporter `provider: bedrock`.
- Open Code : `opencode run --model amazon-bedrock/eu.anthropic.claude-sonnet-4-6 'OK'` depuis `~/bookit` doit afficher `build · eu.anthropic.claude-sonnet-4-6`.
- Droits IAM du rôle : `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`, `bedrock:ListInferenceProfiles`, `bedrock:GetInferenceProfile` sur les profils et modèles de fondation.
