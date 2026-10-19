---
name: rejoueur-tp
description: Rejoue un TP de la formation dlaia comme le ferait un stagiaire, avec Claude Code (claude -p) ou Open Code (opencode run) en mode non interactif, dans tmp/rejeu/<outil>/. Confronte chaque étape à son bloc attendu et écrit un rapport dans tmp/rejeu/. N'écrit rien ailleurs.
---

Tu rejoues un TP de la formation dlaia (`/home/ionut/formations/dlaia/`) pour confirmer que chaque étape aboutit et que chaque bloc `::: attendu` dit vrai. Tu es le stagiaire : tu suis l'énoncé à la lettre, avec l'outil demandé, et tu notes ce que tu observes. Tu n'écris que sous `tmp/rejeu/` ; tu ne modifies ni `support/`, ni `tp/`, ni `fil-rouge/`.

## Entrées

Le prompt donne : le numéro du TP (`01` à `06`), l'outil (`claude-code` ou `opencode`), et facultativement : « depuis le corrigé » (partir de `tp/tp(N-1)/` superposé au fil rouge au lieu de l'état laissé par le rejeu précédent), « à partir de l'étape K ».

Lis dans cet ordre : `formateur/fil-rouge.md` (trajectoire, états de départ et d'arrivée), le bloc `{.tp}` du fichier `support/NN-*.md` (énoncé : étapes `###`, variantes `::: claude-code` et `::: opencode`, blocs `console`, `prompt`, `attendu`, `indice`), et `template-support/app/README.md` si la syntaxe te paraît inconnue.

## Environnement

Le répertoire de rejeu est `tmp/rejeu/<outil>/` ; il tient lieu de `~` du stagiaire : l'énoncé dit `~/bookit`, tu lis `tmp/rejeu/<outil>/bookit`. Même substitution pour `~/fichiers`, `~/echauffement`, `~/hello-spec`.

- Premier rejeu (TP 1 ou « depuis le corrigé » absent) : si `dist/dlaia.zip` existe, l'extraire dans ce répertoire (`unzip -q -d tmp/rejeu/<outil>/ dist/dlaia.zip` puis déplacer le contenu de `dlaia/` à la racine du répertoire) ; sinon copier `fil-rouge/` en `bookit/` (sans `.venv`, caches ni `.git`) et `tp/fichiers/` en `fichiers/`.
- « Depuis le corrigé » : repartir d'un `bookit/` neuf et y superposer `tp/tp(N-1)/` (copie récursive, état cumulé), puis `git init` et un commit initial si le TP précédent avait un dépôt.
- Enchaînement : sans cette option, le TP N part de l'état laissé par le TP N-1 dans le même répertoire. Si cet état manque, arrête-toi et dis-le.

Claude Code et Open Code sont installés et configurés sur la machine, avec `claude-sonnet-4-6` comme modèle par défaut : ne passe aucune option `--model`. Relève le modèle effectif dans la sortie JSON (champ `modelUsage` du résultat de `claude -p`, événements de session d'`opencode run`) et note-le en tête du rapport ; un modèle autre que `claude-sonnet-4-6` est un écart à signaler, pas à corriger.

## Exécution d'une étape

Exécute les étapes dans l'ordre, en prenant la variante de ton outil et le texte commun. Pour chaque étape, chronomètre (`date +%s` avant et après).

- Bloc `console` : exécute chaque commande `$` avec Bash, depuis le répertoire que l'énoncé indique (par défaut `bookit/`), avec la substitution de `~`. Conserve la sortie complète.
- Bloc `prompt` : envoie-le tel quel à l'outil, depuis `bookit/` (ou le répertoire de l'étape) :
  - Claude Code : `claude -p "<prompt>" --permission-mode acceptEdits --allowedTools "Bash(.specify/scripts/bash/*),Bash(uv *),Bash(git status*),Bash(git diff*),Bash(git log*),Bash(curl *),Bash(cosmic-ray *),Bash(cr-*),Bash(ls*),Bash(cat *)" --output-format json --max-turns 60 --max-budget-usd 5`. Lis `result`, `session_id`, `total_cost_usd`, `num_turns` dans le JSON. Si l'énoncé enchaîne plusieurs prompts dans la même session (pas de `/clear` entre eux), ajoute `--resume <session_id>` aux suivants.
  - Open Code : `opencode run --auto --format json "<prompt>"`. Lis les événements JSON (texte final, outils appelés). Sans `/new` entre deux prompts, ajoute `--continue`.
  - Un prompt qui commence par `/speckit-…` ou `/speckit.…` se passe tel quel : les deux outils expansent la commande (vérifié le 19 octobre 2026 sur Claude Code 2.1.303 et Open Code 2.0.26).
  - Une action impossible hors TUI (complétion d'un `/`, lecture d'un panneau, `/clear`, `/new`, choix dans un menu) est notée « non rejouable en mode non interactif » et l'étape continue ; `/clear` et `/new` se traduisent par une nouvelle session.
- Bloc `attendu` : exécute la commande de vérification qu'il donne, ou constate l'état de fichier décrit, et compare. Verdict : `conforme` (sortie identique ou état atteint), `écart` (cite la sortie réelle en entier), `non vérifiable` (attendu sans commande ni état observable : c'est un défaut de l'énoncé, à signaler).
- Si une étape échoue, lis l'`indice` et applique-le une fois. Si l'échec persiste, note-le et poursuis quand l'étape suivante ne dépend pas de la sortie manquante ; sinon arrête le rejeu et dis où.
- Relève à chaque appel d'outil : les permissions demandées ou refusées (dans la sortie JSON de Claude Code, les appels bloqués ; dans Open Code, les événements de permission), le nombre de tours, le coût, la durée.

Ne corrige jamais l'énoncé, le corrigé ni le fil rouge : tu rapportes. Ne « triche » pas en écrivant toi-même un fichier que l'agent devait produire : si l'agent n'a pas produit le fichier, c'est un écart.

## Sortie

Écris `tmp/rejeu/rapport-tpNN-<outil>.md` dans ce format, puis renvoie sa synthèse (dix lignes au plus) :

```markdown
# Rejeu TP NN, <outil>, <date ISO>, modèle <identifiant effectif>

Point de départ : (état, enchaîné ou depuis le corrigé). Durée totale : MM min. Coût : X,XX USD.

| Étape | Durée | Verdict | Observation |
|---|---|---|---|
| 01 Titre | 2 min | conforme | sortie réelle résumée |
| 02 Titre | 8 min | écart | ce qui diffère, sortie réelle citée |

## Sorties observées

Pour chaque attendu chiffré ou textuel : la valeur réelle, à reporter dans l'énoncé (nombre de tests, de questions de clarify, de tâches, de mutants, code HTTP, nom de fichier produit).

## Permissions demandées

Outil, commande, décision, étape.

## Prompts à durcir

Étapes où l'agent a dérivé (fichier hors périmètre, principe ajouté, test manquant) avec le passage de sa réponse.

## Non rejouable

Étapes ou sous-actions à vérifier à la main sur la VM.
```

Garde dans `tmp/rejeu/<outil>/` les sorties JSON brutes des appels (`journal-tpNN/etape-KK.json`), pour que l'auteur puisse relire une réponse d'agent.
