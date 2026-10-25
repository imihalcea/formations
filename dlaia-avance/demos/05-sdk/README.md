# Démonstration 5 : boucle par le SDK

Slide « Démonstration : boucle par SDK ». Un programme pilote l'agent de code par le SDK jusqu'à la réussite des tests et journalise chaque relance. Branche `fix/ticket-ferme-commentaires-sdk` (même état que la branche de la démonstration 4 : deux tests rouges).

## Préalables

Node 24 (relevé : v24.11.1, exécute `.ts` directement), `gh`, `docker`, `uv`.

### Authentification du Claude Agent SDK (décision de l'utilisateur)

Le Claude Agent SDK n'emploie pas la connexion abonnement de Claude Code. La page « Agent SDK overview » dit : « Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK. Use the API key authentication methods described in the Quickstart instead » (consultée le 25 octobre 2026). Le poste de démonstration doit donc disposer de l'un de ces moyens, au choix de l'utilisateur :

| Moyen | Mise en place | À relever |
|---|---|---|
| Clé d'API Anthropic | `export ANTHROPIC_API_KEY=...` | facturation à l'usage, séparée de l'abonnement |
| Amazon Bedrock | `export CLAUDE_CODE_USE_BEDROCK=1` et identifiants AWS (déjà en place pour Open Code) ; `claude-sonnet-4-6` est résolu vers le profil d'inférence du préfixe de la région (equivalences.md) | accès au modèle dans la région du poste |
| Connexion abonnement | non prévue par la documentation du SDK ; la phrase citée vise les produits offerts à des tiers, et ne dit rien de l'usage personnel d'un script de démonstration | à trancher par l'utilisateur ; non testée ici |

Les variantes Open Code ne sont pas concernées : `@opencode/sdk` utilise la configuration du dépôt (`opencode.json`, Bedrock). Sans moyen d'authentification pour le Claude Agent SDK, la veille, préparer le JSON de référence (`reference/sortie-reference.md`) : la salle qui a choisi Claude Code le voit à la place de l'exécution.

## Préparation

```
demos/05-sdk/session.sh <session>
```

L'overlay remplace `scripts/` : `package.json` (`@opencode/sdk` 2.0.32 et `@anthropic-ai/claude-agent-sdk` 0.3.310, versions installables vérifiées le 25 octobre 2026), `tsconfig.json`, `fix-loop.ts` (Open Code) et `fix-loop-claude.ts` (Claude Agent SDK). `scripts/loop.sh` du dépôt reste en place. Le `scripts/fix-loop.ts` du dépôt (ancien paquet `@opencode-ai/sdk` 1.18.29) est remplacé.

`session.sh` lance `npm install` dans `scripts/` ; un échec réseau n'est qu'un avertissement (voir le repli).

Contrôle sans modèle : `make check` dans ce dossier compile les deux scripts (`tsc`, aucune erreur).

## Déroulé

1. Lire le script de l'outil choisi : critère `testsPassent()` (`make test`), nombre maximal de relances `MAX_ITER` (5 par défaut), journal sur la sortie d'erreur, JSON final sur la sortie standard.
2. Exécuter depuis la racine de la copie de travail.
   - Open Code : `node scripts/fix-loop.ts "interdire les commentaires sur un ticket fermé"`
   - Claude Code : `npx --prefix scripts tsx scripts/fix-loop-claude.ts "interdire les commentaires sur un ticket fermé"` (ou `node scripts/fix-loop-claude.ts ...`)
3. Suivre le journal par relance sur la sortie d'erreur (`relance 1 / 5`...). Pour Claude Code, chaque ligne porte le `subtype`, le nombre de tours et le coût.
4. Lire le JSON final.
5. `git diff` : seul `src/` change.

Appels du SDK (vérifiés dans les types des paquets installés) :

| | Claude Agent SDK | `@opencode/sdk` 2.0.32 |
|---|---|---|
| Appel | `query({ prompt, options })`, flux de messages, message `result` | `OpenCode.create()`, `sessions.create({ agent, location })`, `sessions.prompt({ sessionID, text })`, `sessions.wait({ sessionID })`, `sessions.context({ sessionID })` |
| Agent | option `agent: "implementeur"` avec `settingSources: ["project"]` | `agent` de `sessions.create` |
| Nombre maximal de tours et coût | `maxTurns`, `maxBudgetUsd` (estimation côté client, dépassable) | aucun plafond de tours ni de coût lu ; `steps` de l'agent |
| Résultat | `subtype`, `num_turns`, `total_cost_usd` | contenu des messages de la session |

## Résultat attendu

JSON final avec `"corrige": true`, `iterations` de 1 à 5. Le journal du script Open Code est une troncature du dernier message de la session (300 caractères). Résultat observé : `reference/sortie-reference.md`, à relever.

Vérifié sans modèle (25 octobre 2026) : sur la branche `fix/ticket-ferme-commentaires-sdk-done` (tests verts), les deux scripts sortent aussitôt avec `{"corrige":true,"iterations":0,"journal":[]}` et le code 0. Sur la branche de départ, `make test` rend `2 failed, 37 passed`.

## Repli

1. Passer sur `origin/fix/ticket-ferme-commentaires-sdk-done` et montrer le JSON de référence (`reference/sortie-reference.md`).
2. Sans authentification pour le Claude Agent SDK : montrer le JSON de référence, ou jouer `scripts/loop.sh` (boucle shell, slide « Une boucle par script »).
3. `npm install` échoue (réseau) : le préparer la veille ; `reset.sh` conserve `node_modules`. Sinon, repli 1.

## Remise à zéro

`demos/01-commun/reset.sh <session>` (les `node_modules` sont conservés), puis relancer `session.sh <session>` (recopie l'overlay et lance `npm install`, utile si `package.json` a changé).

## À relever

Appel réel avec l'agent `implementeur` sous `@opencode/sdk` 2.0.32 (le README du SDK ne documente pas le choix de l'agent ; `sessions.create` l'accepte dans les types), contenu exploitable de `sessions.context`, plafonds côté Claude Agent SDK, authentification retenue, coût.
