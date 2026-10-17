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
$ npm test               # tests du compilateur Markdown
$ npm run typecheck
```

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
| `agenda` | aucun ; la liste des modules est générée | |
| `statement` | aucun | `kicker` |
| `facts` | 2 à 4 éléments `- …`, ou `- **Terme** explication` pour mettre le terme en vedette | `kicker` |
| `figure` | aucun ; le titre décrit le chiffre | `value` (obligatoire), `kicker` |
| `figures` | 3 à 5 éléments `- **valeur** légende`, puis un paragraphe facultatif affiché en remarque | `kicker` |
| `quote` | lignes `> …` | `author` |
| `compare` | conteneurs `claude-code` et `opencode` | `kicker` |
| `tp` | voir « Travaux pratiques » | `duration`, `kicker` |
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

Dans une slide `content`, une ligne `|||` coupe le corps en deux colonnes.

Les types `facts`, `figure`, `figures` et `quote` refusent de compiler sans `::: sources`. Les blocs de code ```` ```console ```` prennent le style terminal, les blocs ```` ```prompt ```` le style d'un prompt à copier ; les autres langages sont colorés par Shiki sur fond clair. Les images sont référencées relativement au fichier Markdown et intégrées au fichier généré. Un SVG est inséré en ligne : il utilise les polices de la charte et les classes de `styles.css` (`ink`, `accent`, `paper`, `deck`, `muted`, `tint`, `stroke-accent`, `display`, `mono`…), ce qui garde les schémas dans les couleurs du support.

Un bloc de code vide peut reprendre le contenu d'un fichier, chemin relatif au fichier Markdown, éventuellement limité à une plage de lignes. Le code d'un corrigé se cite ainsi depuis `tp/`, où il est testé, au lieu d'être recopié :

````markdown
```python file="../tp/tp03/solution.py" lines="12-30"
```
````

## Travaux pratiques

Un TP s'écrit dans le fichier de son module. Il produit une slide de lancement, projetée en salle, et une page d'énoncé qui défile, lisible en demi-écran à côté du terminal. Le stagiaire travaille uniquement avec cette page.

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

Chaque étape `###` exige un bloc `::: attendu`. Une étape qui a une variante `claude-code` doit avoir une variante `opencode`, et inversement. Les blocs `indice` et le corrigé sont facultatifs. Sur la page, le stagiaire choisit son outil une fois pour tous les TP, coche les étapes terminées et copie chaque bloc de code ; pour une session `console`, le bouton copie seulement les commandes. Ces choix restent dans son navigateur.

## Navigation

Flèches, Page précédente/suivante, espace, Début et Fin. G affiche la vue d'ensemble, N les notes, P ouvre la vue présentateur dans une seconde fenêtre synchronisée, F bascule en plein écran. Le numéro de slide figure dans l'URL (`index.html#12`), une page de TP a la sienne (`index.html#tp-03`). La pastille « TP » de la barre de navigation ouvre le TP du module courant ; Échap revient aux slides.
