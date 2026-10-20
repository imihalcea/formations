---
name: module
description: Prépare un module de la formation dlaia. « /module NN plan » rédige le plan des slides et le fait relire avant validation ; « /module NN » livre slides, TP, corrigé et démonstrations d'un bloc une fois le plan validé, avec relecture, vérification des sources, captures et commits.
---

Arguments reçus : `$ARGUMENTS`. Le premier est le numéro du module sur deux chiffres (`01` à `08`, `00` pour l'ouverture, `99` pour la clôture) ; le second, facultatif, vaut `plan`.

Racine de la formation : `/home/ionut/formations/dlaia/`, notée `dlaia/` ci-dessous. Les commandes npm se lancent depuis `dlaia/template-support/app/`. Les issues du module sont celles du label `dlaia` dont le titre commence par `NN ` : « plan des slides », « rédaction des slides », « TP NN et corrigé », « démonstrations ». `gh issue list --label dlaia --state open --search "NN in:title"` les retrouve.

Règles qui priment pendant tout le skill : `dlaia/CLAUDE.md` (rédaction, qualité pédagogique, interdits), `dlaia/formateur/lexique.md` (vocabulaire), `dlaia/formateur/relecture.md` (critères), `dlaia/template-support/app/README.md` (syntaxe des slides).

## `/module NN plan`

1. Lire : l'issue « plan des slides » (son Objet donne les sections et les points à revérifier), le programme du module dans `CLAUDE.md`, le lexique, la check-list, les titres `##` et les idées clés des modules antérieurs de `dlaia/support/`, et s'ils existent `formateur/fil-rouge.md`, `formateur/spec-kit.md`, `formateur/equivalences.md`.
2. Rédiger le plan dans `dlaia/tmp/plans/module-NN.md` selon le gabarit ci-dessous. Chaque notion nouvelle a sa slide de définition avant la première slide qui l'emploie. Chaque titre se comprend seul.
3. Lancer l'agent `relecteur` (outil Agent, `subagent_type: relecteur`) en mode `plan` sur ce fichier. Corriger chaque constat, ou le refuser avec une raison d'une phrase.
4. Présenter le plan complet à l'utilisateur, suivi des constats refusés et de la liste des termes à ajouter au lexique. S'arrêter là : l'utilisateur valide ou demande des changements.
5. Une fois le plan validé, le poster en commentaire de l'issue « plan des slides » (`gh issue comment N --body-file …`) et fermer l'issue avec un commit vide ou le commit du lexique mis à jour (`closes #N`).

Gabarit du plan :

```markdown
# Module NN : titre

Sous-titre (une phrase). Durée prévue. Ce que le module précédent laisse en suspens et que la première section reprend.

## Section (kicker)

| # | Type | Titre | Idée (une phrase) | Support visuel | Source |
|---|---|---|---|---|---|

(une section par kicker ; au moins une idée clé `statement` par section ; une `compare` par module au moins ; la slide de lancement du TP en dernier)

## TP NN

Objectif, durée, nombre de commits. Une ligne par étape : titre, ce que fait le stagiaire, `attendu` (commande et sortie), variantes d'outil si elles diffèrent, repli `indice`. Fichiers fournis (`tp/fichiers/`), contenu du corrigé (`tp/tpNN/`).

## Démonstrations

Pour chaque démonstration : slide qui la porte, prompt, déroulé, résultat attendu, à relever à l'essai avec `claude-sonnet-4-6`.

## Notions introduites

| Terme | Définition | Slide qui le définit |

## Notions reprises

| Terme | Module d'origine |

## Sources à consulter

| URL | Ce que le plan lui attribue |
```

## `/module NN`

Préalable : le plan validé est le dernier commentaire de l'issue « plan des slides ». Le récupérer sans l'afficher : `gh issue view N --json comments --jq '.comments[-1].body' > tmp/plans/module-NN.md`, puis vérifier par `wc -l` qu'il n'est pas vide. S'il manque, s'arrêter et le dire.

Orchestration : cette session lance les sous-agents, les commandes npm et git, et compile le rapport. Elle n'ouvre aucune URL, aucune capture, aucun fichier de `support/`, `formateur/`, `tp/` ni du template : ces lectures appartiennent aux sous-agents, qui travaillent chacun dans un contexte propre et rendent un rapport court. Toute écriture dans `support/`, `tp/` et `formateur/` passe par le sous-agent `redacteur`. Le prompt d'un sous-agent se limite au mode, au module, aux chemins des entrées et aux constats à appliquer ; il ne recopie ni le plan ni les règles, que l'agent lit lui-même.

1. Rédaction : `redacteur` en mode `slides` (lexique, slides, SVG, sources consultées, notes avec les démonstrations à relever), puis `redacteur` en mode `tp` (bloc `{.tp}`, corrigé, fichiers fournis, pytest). L'un après l'autre : les deux écrivent le fichier du module.
2. Rejeu et démonstrations : quatre `rejoueur-tp` en parallèle, le TP NN sous chaque outil (enchaîné sur l'état laissé par le TP précédent, ou « depuis le corrigé » si cet état manque) et les démonstrations du module sous chaque outil. Lire les quatre synthèses, sans les sorties brutes. Un écart isolé se confirme par un second rejeu de l'étape seule (« à partir de l'étape K ») avant d'être traité ; deux échecs font un défaut de l'énoncé.
3. Corrections du rejeu : `redacteur` en mode `corrections` avec les chemins des quatre rapports. Rejouer les étapes modifiées (`rejoueur-tp`, « à partir de l'étape K »), puis corriger de nouveau, jusqu'à deux rejeux conformes de suite par outil. Les points « non rejouable » restent dans les notes, à vérifier sur la VM.
4. Build et captures : `npm run build`, puis `npm run captures -- --module NN`. Ne pas ouvrir les PNG : le `relecteur` les lit. S'il y a des débordements, passer la liste à `redacteur` en mode `corrections`, puis relancer.
5. Relecture : en parallèle `relecteur` (mode `slides` sur le fichier avec le dossier `tmp/captures/`, puis mode `tp` sur le même fichier) et `verificateur-sources` sur le fichier. Transmettre les trois sorties en entier à `redacteur` en mode `corrections`. Rebuild, recaptures, puis seconde passe de `relecteur` et de `redacteur`. Deux passes au plus : les constats restants vont dans le rapport.
6. Commits, un par issue, dans cet ordre : slides (`Module NN : … (closes #N)`), TP et corrigé (`TP NN : … (closes #N)`), démonstrations (`Module NN : démonstrations … (closes #N)`), lexique et fil rouge si modifiés (`Formateur : …`). `npm run build` passe avant le premier commit ; `git status --short` est vide après le dernier.
7. Rapport à l'utilisateur, compilé à partir des rapports des sous-agents, dans ce format :

```
## Module NN livré

Slides : N (dont N idées clés, N compare, N SVG). TP : N étapes, N commits attendus, corrigé testé. Démonstrations : N.
Rejeu : Claude Code N/N étapes conformes, Open Code N/N ; N attendus relevés ; N prompts durcis ; non rejouable : liste.
Relecture : N constats en première passe, N en seconde ; N corrigés, N refusés :
- « Titre » C1 : raison du refus
Sources : N vérifiées ; N corrigées ; N remplacées ou retirées :
- « Titre » : ce qui a changé
Captures : tmp/captures/NN-*.png, aucun débordement.
Doutes : ce qui reste à relever sur la VM, ce qui attend une décision.
Commits : liste des hash et messages.
```

Ne pas demander de validation intermédiaire : la seule interruption admise est un préalable manquant (plan absent, fil rouge absent, `uv` ou Python 3.14 indisponible, source impossible à remplacer).

En mode `plan`, les lectures de l'étape 1 restent dans cette session : le plan se discute avec l'utilisateur et le contexte se termine à la validation.
