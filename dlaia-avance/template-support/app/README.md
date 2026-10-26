# Template du support

Compile les fichiers Markdown de `support/` en un fichier unique, `dist/index.html`. Ce fichier s'ouvre directement dans un navigateur, sans serveur ni installation. Seules les polices sont chargées depuis Google Fonts.

La charte graphique (couleurs, polices, échelle typographique, canevas de 1920×1080) reprend celle du premier jet réalisé avec Lovable ; elle est définie dans `src/styles.css`.

## Commandes

Node est nécessaire pour construire le support, pas pour le consulter.

```console
$ npm install
$ npm run dev            # support/ avec rechargement à chaud
$ npm run dev:exemple    # contenu de démonstration de exemple/
$ npm run build          # écrit ../../dist/index.html
$ npm run archive        # assemble ../../dist/dlaia-avance.zip à partir de dist/index.html
$ npm run dist           # build puis archive : la commande de livraison
$ npm test               # tests du compilateur Markdown
$ npm run typecheck
```

`npm run build` vide `dist/` avant d'écrire : tout fichier déposé à la main dans `dist/` est perdu. L'archive distribuée aux stagiaires, `dist/dlaia-avance.zip`, est toujours produite par `npm run archive` après le build. Elle contient `dlaia-avance.html` (le support) ; les démonstrations ne sont pas distribuées.

En développement, une slide dont le contenu déborde du canevas est encadrée en rouge et signalée dans la console.

## Fichiers source

Chaque fichier de `support/` porte un préfixe à deux chiffres et contient un seul titre `#`. Les fichiers `01` à `98` sont des modules numérotés : leur titre `#` produit la slide de titre du module, et le paragraphe qui le suit en devient le sous-titre. Les fichiers `00` (ouverture) et `99` (clôture) n'ont pas de slide de titre.

Chaque titre `##` ouvre une slide. Une classe entre accolades fixe son type, et des attributs `cle="valeur"` complètent la slide :

```markdown
## Fichier de contexte {.compare kicker="Configuration"}
```

| Type | Corps | Attributs |
|---|---|---|
| `content` (défaut) | Markdown libre : listes, code, tableaux, images | `kicker` |
| `title` | sous-titre | `kicker` |
| `agenda` | aucun ; la liste des modules est générée | `days` (facultatif, nombre de modules par jour : une colonne « Jour N » par jour) |
| `statement` | aucun | `kicker` |
| `facts` | 2 à 4 éléments `- …`, ou `- **Terme** explication` pour mettre le terme en vedette | `kicker` |
| `figure` | aucun ; le titre décrit le chiffre | `value` (obligatoire), `kicker` |
| `figures` | 3 à 5 éléments `- **valeur** légende`, puis un paragraphe facultatif affiché en remarque | `kicker` |
| `quote` | lignes `> …` | `author`, `kicker` |
| `video` | aucun ; le lecteur se charge au clic | `src` (obligatoire : adresse https YouTube, Vimeo ou fichier `.mp4` / `.webm`), `start` (secondes, à défaut le paramètre `t` de l'adresse), `kicker` |
| `compare` | conteneurs `claude-code` et `opencode`, texte commun facultatif au-dessus ; seule la variante de l'outil choisi s'affiche (sélecteur en haut à droite, `?outil=opencode` dans l'adresse) | `kicker` |
| `tp` | voir « Démonstrations (type tp) » | `duration`, `kicker` |
| `end` | sous-titre | `kicker` |

Les conteneurs `::: nom` … `:::` complètent une slide :

```markdown
::: sources
- [Claude Code, Memory](https://…)
:::

::: notes
Notes d'animation, visibles dans la vue présentateur (touche P) et le panneau de notes (touche N).
:::
```

Dans une slide `content`, une ligne `|||` coupe le corps en deux colonnes ; une seconde ligne `|||` ferme les colonnes, et ce qui la suit s'affiche en pleine largeur dessous. Les titres `##` et `###` acceptent le Markdown en ligne : le code entre accents graves y est rendu comme dans le corps, sans coupure de ligne, et une espace insécable est placée avant « ; », « : », « ? » et « ! » au rendu.

Les types `facts`, `figure`, `figures`, `quote` et `video` refusent de compiler sans `::: sources`. Les blocs de code ```` ```console ```` prennent le style terminal, les blocs ```` ```prompt ```` le style d'un prompt à copier ; sur les slides comme sur la page de TP, chaque bloc a un bouton « Tout copier », et chaque commande `$` d'une session `console` un bouton qui copie cette seule commande, visible au survol de sa ligne ; les autres langages sont colorés par Shiki sur fond clair. Les images sont référencées relativement au fichier Markdown et intégrées au fichier généré. Un SVG est inséré en ligne : il utilise les polices de la charte et les classes de `styles.css` (`ink`, `accent`, `paper`, `deck`, `muted`, `tint`, `stroke-accent`, `display`, `mono`…), ce qui garde les schémas dans les couleurs du support.

Un bloc de code vide peut reprendre le contenu d'un fichier, chemin relatif au fichier Markdown, éventuellement limité à une plage de lignes. Le code d'un corrigé se cite ainsi depuis `tp/`, où il est testé, au lieu d'être recopié :

````markdown
```python file="../tp/tp03/solution.py" lines="12-30"
```
````

## Démonstrations (type tp)

Le type `tp` sert aux démonstrations de fin de module (`## Démonstration N : titre {.tp}`), jouées par le formateur ; « stagiaire » désigne alors le lecteur de la page. Un TP s'écrit dans le fichier de son module. Il produit une slide de lancement, projetée en salle, et une page d'étapes qui défile, lisible en demi-écran à côté du terminal. Le stagiaire travaille uniquement avec cette page.

```markdown
## TP 3 : explorer le code {.tp duration="45 min"}

Objectif et prérequis.

::: notes
Notes d'animation de la slide de lancement.
:::

### Titre de l'étape

Texte commun aux deux outils.

::: claude-code
Instructions propres à Claude Code.
:::

::: opencode
Instructions propres à Open Code.
:::

::: attendu
Ce que le stagiaire doit observer.
:::

::: indice
Aide, repliée par défaut.
:::

### Corrigé {.corrige}

Solution, repliée par défaut.
```

Chaque étape `###` exige un bloc `::: attendu`. Une étape qui a une variante `claude-code` doit avoir une variante `opencode`, et inversement. Les blocs `indice` et le corrigé sont facultatifs. La première étape peut porter `{.optionnel}` : elle est numérotée `00` et marquée « Optionnel », les suivantes gardent `01`, `02`… Sur la page, le stagiaire choisit son outil une fois pour tous les TP, coche les étapes terminées et copie chaque bloc de code ; pour une session `console`, le bouton copie seulement les commandes. Ces choix restent dans son navigateur.

## Carte mentale

Le fichier facultatif `carte-mentale.yaml`, à côté des fichiers Markdown, produit une dernière section après la clôture. Sa slide montre la formation et ses modules ; elle ouvre la carte en plein écran, sur sa propre page (`index.html#carte`).

```yaml
titre: Titre de la formation
modules:
  - module: "01"
    titre: Titre du module
    sections:
      - section: Kicker des slides
        concepts:
          - concept: Fichier de contexte
            definition: Instructions lues au lancement de chaque session.
            slide: 01-module.md#Titre exact de la slide
            outils:
              claude-code: "`CLAUDE.md`"
              opencode: "`AGENTS.md`"
            voir: [Autre concept]
```

L'arbre a quatre niveaux fixes : formation, module, section, concept. Les modules suivent l'ordre des fichiers numérotés, sans en omettre. Un concept exige `concept` et `definition`. `slide` désigne un fichier et le titre `##` exact d'une de ses slides. `outils` donne l'équivalent dans chaque outil, avec ses deux clés. `voir` relie d'autres concepts par leur nom, en pointillés sur la carte. `definition` et `outils` acceptent le Markdown en ligne. Le build échoue, avec la ligne fautive, sur un champ inconnu ou manquant, un titre de slide introuvable, un `voir` sans cible ou un concept en double.

Sur la page, un clic déplie ou replie une branche, la molette zoome, un glisser déplace la carte. Les flèches parcourent l'arbre : haut et bas d'un nœud visible à l'autre, droite pour déplier, gauche pour replier ou remonter. Entrée ouvre la slide du concept, `/` place le curseur dans la recherche, `+`, `-` et `0` règlent le zoom. Le panneau de droite affiche la définition, les équivalents et les liens du nœud sélectionné. Les branches dépliées et le nœud sélectionné sont conservés dans l'onglet. Dans la section de la carte, la pastille « Carte » de la barre de navigation ouvre la page ; Échap revient aux slides.

## Navigation

Flèches, Page précédente/suivante, espace, Début et Fin. G affiche la vue d'ensemble, N les notes, P ouvre la vue présentateur dans une seconde fenêtre synchronisée, F bascule en plein écran. Le numéro de slide figure dans l'URL (`index.html#12`), une page de TP a la sienne (`index.html#tp-03`). La pastille « TP » de la barre de navigation ouvre le TP du module courant ; Échap revient aux slides. Si le module contient des slides de kicker « Débrief », une pastille « Débrief » suit celles des TP et mène à la première d'entre elles.
