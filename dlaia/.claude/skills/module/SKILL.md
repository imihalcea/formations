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

Préalable : le plan validé est le dernier commentaire de l'issue « plan des slides » (`gh issue view N --comments`). S'il manque, s'arrêter et le dire.

1. Lexique : ajouter les « Notions introduites » du plan à `formateur/lexique.md`, dans la section du module, en confirmant ou corrigeant les définitions provisoires.
2. Slides : rédiger `dlaia/support/NN-titre.md` selon le plan : une slide par ligne du gabarit, notes d'animation sur chaque slide, schémas SVG dans `support/images/NN-nom.svg` avec les classes de la charte, glossaire du module en fin de fichier tiré du lexique, sources dans `::: sources`. Consulter chaque source avant de la citer.
3. TP : rédiger le bloc `{.tp}` en fin de fichier et le corrigé dans `tp/tpNN/` (état cumulé) ; déposer les fichiers fournis dans `tp/fichiers/` ; superposer le corrigé au fil rouge dans un répertoire temporaire et exécuter `uv run pytest -q` sous Python 3.14 ; citer le corrigé par `file=`. Les `attendu` sont écrits comme des commandes à sortie connue, la sortie restant « à relever » jusqu'au rejeu.
4. Rejeu : appliquer le skill `rejeu` au TP du module, dans les deux outils (sous-agent `rejoueur-tp`, un par outil, en parallèle, enchaîné sur l'état laissé par le TP précédent ou « depuis le corrigé » si cet état manque). Reporter les sorties observées dans les `attendu` et les notes de la slide de lancement (durées, permissions, nombre de tours), durcir les prompts qui ont dérivé, puis rejouer les étapes modifiées jusqu'à deux rejeux conformes de suite par outil. Les points « non rejouable » vont dans les notes, à vérifier sur la VM.
5. Démonstrations : les écrire dans les notes des slides qui les portent (prompt, déroulé, résultat attendu). Les jouer en mode non interactif avec la même méthode que le rejeu (`claude -p`, `opencode run`) et consigner le résultat observé ; ce qui n'a pas pu être joué est marqué « à relever à l'essai ».
6. Build et captures : `npm run build`, puis `npm run captures -- --module NN`. Corriger toute slide signalée en débordement, puis relancer.
7. Relecture : lancer en parallèle `relecteur` (mode `slides` sur le fichier, dossier `tmp/captures/`, puis mode `tp` sur le même fichier) et `verificateur-sources` sur le fichier. Corriger chaque constat ou le refuser avec une raison d'une phrase. Pour une source `partiel` ou `contredit`, corriger la slide ou remplacer la source ; pour `inaccessible`, chercher une autre source ou retirer le fait. Rebuild, recaptures, puis relancer `relecteur` sur le fichier une seconde fois. Deux passes au plus : les constats restants vont dans le rapport.
8. Commits, un par issue, dans cet ordre : slides (`Module NN : … (closes #N)`), TP et corrigé (`TP NN : … (closes #N)`), démonstrations (`Module NN : démonstrations … (closes #N)`), lexique et fil rouge si modifiés (`Formateur : …`). `npm run build` passe avant le premier commit ; `git status --short` est vide après le dernier.
9. Rapport à l'utilisateur, dans ce format :

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
