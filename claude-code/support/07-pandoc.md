# Cas d'usage : livrable documentaire avec pandoc

Produire un PDF reproductible à partir d'une source texte

::: notes
Module 7, 3h30 : 1h15 de slides et de démonstrations, 1h45 de TP (7A et 7B en parallèle, une moitié des groupes chacun), 30 min de restitution comparée.
Notions déjà vues, à ne pas redéfinir : `claude -p` (module 2), boucle de vérification (module 4), coût d'une session et `/usage` (module 5), slash commands et partage des extensions (module 6).
Cinq parties : piloter la production, la chaîne Markdown → HTML → PDF, template et CSS paginée, documents générés depuis des données, industrialisation.
Le TP est indépendant du fil rouge.
:::

## pandoc convertit un document d'un format à un autre {.figures kicker="Notions"}

- **47** formats en lecture
- **67** formats en écriture
- **35** formats dans les deux sens

Markdown, HTML, LaTeX et docx se lisent et s'écrivent. Le PDF s'obtient en écriture seulement.

::: sources
- [pandoc, User's Guide : Description](https://pandoc.org/MANUAL.html#description)
- `pandoc --list-input-formats`, `pandoc --list-output-formats` (pandoc 3.7.0.2)
:::

::: notes
Manuel : « Pandoc is a Haskell library for converting from one markup format to another, and a command-line tool that uses this library. »
Comptes relevés le 18 octobre 2026 sur pandoc 3.7.0.2 ; les versions d'Ubuntu (2.9.2.1, 3.1.3) en ont moins.
Fonctionnement interne (lecteurs, arbre, écrivains) : slide « pandoc passe par une représentation commune ».
:::

## Les quatre pièces de la chaîne {.facts kicker="Notions"}

- **pandoc** convertit un document d'un format à un autre
- **Template** squelette de la page, où pandoc insère le contenu
- **CSS paginée** feuille de style qui décrit des pages imprimées
- **WeasyPrint** transforme du HTML et sa CSS en PDF

::: sources
- [pandoc, User's Guide : Description](https://pandoc.org/MANUAL.html#description)
- [pandoc, User's Guide : Templates](https://pandoc.org/MANUAL.html#templates)
- [WeasyPrint](https://doc.courtbouillon.org/weasyprint/stable/#weasyprint)
- [W3C, CSS Paged Media Module Level 3](https://www.w3.org/TR/css-page-3/)
:::

::: notes
pandoc : « a Haskell library for converting from one markup format to another, and a command-line tool that uses this library. »
Templates : « When the -s/--standalone option is used, pandoc uses a template to add header and footer material that is needed for a self-standing document. »
WeasyPrint : « a visual rendering engine for HTML and CSS that can export to PDF. It aims to support web standards for printing. » Aucun JavaScript : « there is no user-interaction, no JavaScript, no live rendering ».
CSS paginée : module CSS Paged Media du W3C ; WeasyPrint en annonce toutes les fonctions (slide « Le format de la page : @page »).
Chaque pièce a sa partie : pandoc et WeasyPrint dans la deuxième, template et CSS dans la troisième.
:::

## L'agent écrit, convertit, relit {kicker="Piloter"}

![Trois étapes en boucle : l'agent écrit la source rapport.md, lance pandoc pour produire rapport.pdf, relit le PDF critère par critère ; si un critère échoue, il corrige la source et relance la conversion](images/07-boucle.svg)

::: sources
- [Claude Code, Best practices : Give Claude a way to verify its work](https://code.claude.com/docs/en/best-practices#give-claude-a-way-to-verify-its-work)
:::

::: notes
Même boucle qu'au module 4 (rassembler, agir, vérifier), appliquée à un document : la vérification porte sur le PDF au lieu d'une suite de tests.
Doc : « Give Claude something that produces a pass or fail, and the loop closes on its own. Claude does the work, runs the check, reads the result, and iterates until the check passes. »
L'agent lance pandoc par son outil shell : la commande doit être autorisée (module 2).
:::

## La source est un fichier texte {kicker="Piloter"}

```markdown
## Synthèse

| Indicateur | Valeur |
|---|---:|
| Incidents | 296 |
| Résolus dans l'objectif | 77,3 % |
```

Le Markdown se relit en diff et se versionne avec git. Le PDF se régénère depuis lui.

::: sources
- [pandoc, User's Guide : Pandoc's Markdown](https://pandoc.org/MANUAL.html#pandocs-markdown)
- Corrigé du TP 7B : Markdown écrit par `tp/tp07-pandoc/corrige-7b/rapport.py`
:::

::: notes
Extrait réduit du Markdown produit au TP 7B (illustration de la forme, chiffres réels du mois de septembre).
Un Word ou un PDF édité à la main ne se compare pas en diff ; une correction du Markdown se relit comme une correction de code.
L'agent écrit ce format sans outil particulier : ses outils d'édition suffisent.
:::

## L'agent lit le PDF qu'il produit {.compare kicker="Piloter"}

::: claude-code
Read lit un PDF court en entier. Au-delà de 10 pages, il lit par plages de 20 pages au plus, rendues en images par `pdftoppm`.
:::

::: opencode
`read` transmet le PDF entier au modèle, sans plage de pages, jusqu'à 20 Mio.
:::

::: sources
- [Claude Code, Tools reference : Read tool behavior](https://code.claude.com/docs/en/tools-reference#read-tool-behavior)
- Open Code v2.0.26 : [`tool/read-filesystem.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/tool/read-filesystem.ts), [`session/model-request.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/core/src/session/model-request.ts)
:::

::: notes
Doc Claude Code : « Claude reads short `.pdf` files whole. For PDFs longer than 10 pages, it reads in ranges with a `pages` parameter, such as `"1-5"`, up to 20 pages at a time. Page-range reads render pages with `pdftoppm` from poppler-utils ». Sans `pdftoppm` : erreur `pdftoppm is not installed`.
Open Code v2.0.26 : fichier transmis comme `application/pdf`, refusé si le modèle ne déclare pas l'entrée `pdf` ; models.dev la déclare pour `claude-sonnet-4-6`. Non documenté en v1.
Le rapport du TP fait deux pages : lecture entière dans les deux outils.
Détail dans `formateur/equivalences.md`, section « Coût et lecture de PDF ».
:::

## Vérifier contre une grille écrite {kicker="Piloter"}

```prompt
Lis rapport.pdf et vérifie-le avec grille.md, critère par critère.
Pour chaque critère, réponds respecté ou non respecté, et cite la page qui le prouve.
```

Une grille écrite donne à l'agent des critères vérifiables. « Vérifie que le PDF est correct » ne lui en donne aucun.

::: sources
- [Claude Code, Best practices : Give Claude a way to verify its work](https://code.claude.com/docs/en/best-practices#give-claude-a-way-to-verify-its-work)
- Grille du TP : `tp/tp07-pandoc/grille.md`
:::

::: notes
Prompt d'illustration, à jouer en démonstration sur le PDF du corrigé.
Doc : « Claude stops when the work looks done. Without a check it can run, "looks done" is the only signal available, and you become the verification loop ».
La grille du TP compte 13 critères : structure, chiffres, faits marquants, mise en page. Elle sert aussi aux groupes pour noter leur propre PDF.
Rappel module 5 : le verbe décide de l'action ; « vérifie » sans « corrige » laisse l'agent rapporter sans corriger.
Les chiffres se contrôlent contre les valeurs de référence (`preparation/references.md`), que l'agent n'a pas.
:::

## Chaque relecture coûte des tokens {.compare kicker="Piloter"}

::: claude-code
`/usage` : coût estimé de la session et tokens par modèle.
:::

::: opencode
Sous la zone de saisie et dans le panneau latéral « Context » : tokens et « $x spent ».
:::

::: sources
- [Claude Code, Manage costs : Using the /usage command](https://code.claude.com/docs/en/costs#using-the-usage-command)
- Open Code v2.0.26 : [`prompt/footer.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/feature-plugins/prompt/footer.tsx), [`sidebar/context.tsx`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/feature-plugins/sidebar/context.tsx)
:::

::: notes
Chaque tour de la boucle relit le PDF : son contenu entre dans le contexte à chaque lecture.
Doc : « Claude Code computes the dollar figure locally from token counts at list price ». Avec un abonnement Pro ou Max, le montant n'a pas de valeur de facturation.
Le TP relève ce coût pour la production initiale et pour le mois suivant : préparer la lecture du chiffre dans chaque outil.
`opencode stats --cost` agrège par période et par projet, pas par session.
:::

## Un PDF se vérifie contre une grille écrite. {.statement kicker="Idée clé"}

::: notes
Découle de « L'agent écrit, convertit, relit », « L'agent lit le PDF qu'il produit » et « Vérifier contre une grille écrite ».
Transition : la conversion elle-même, de la source au PDF.
:::

## De la source au PDF {kicker="Chaîne"}

![pandoc convertit rapport.md en HTML en suivant template.html ; WeasyPrint met en page ce HTML avec rapport.css et produit rapport.pdf, en pages A4 numérotées](images/07-chaine.svg)

::: sources
- [pandoc, User's Guide : Creating a PDF](https://pandoc.org/MANUAL.html#creating-a-pdf)
:::

::: notes
« pandoc can use ConTeXt, roff ms, or HTML as an intermediate format. […] The tool used to generate the PDF from the intermediate format may be specified using --pdf-engine. »
« When HTML is used as an intermediate format, the output can be styled using --css. »
Le HTML intermédiaire reste dans un fichier temporaire : une seule commande pandoc produit le PDF.
:::

## pandoc passe par une représentation commune {kicker="Chaîne"}

Un lecteur analyse le format d'entrée et produit un arbre du document. Un écrivain convertit cet arbre dans le format de sortie.

```console
$ pandoc rapport.md -o rapport.html
$ pandoc rapport.md -o rapport.docx
```

::: sources
- [pandoc, User's Guide : Description](https://pandoc.org/MANUAL.html#description)
:::

::: notes
« it consists of a set of readers, which parse text in a given format and produce a native representation of the document (an abstract syntax tree or AST), and a set of writers, which convert this native representation into a target format. »
« one should not expect perfect conversions between every format and every other. »
Le format de sortie se déduit de l'extension de `-o` ; `-t` le force.
:::

## Le PDF passe par HTML et CSS {kicker="Chaîne"}

Par défaut, pandoc produit un PDF avec LaTeX. Avec `--pdf-engine=weasyprint`, il produit du HTML, que WeasyPrint met en page selon la CSS.

La mise en page s'écrit alors en CSS, sans installer LaTeX.

::: sources
- [pandoc, User's Guide : Creating a PDF](https://pandoc.org/MANUAL.html#creating-a-pdf)
- [pandoc, User's Guide : --pdf-engine](https://pandoc.org/MANUAL.html#option--pdf-engine)
:::

::: notes
« By default, pandoc will use LaTeX to create the PDF, which requires that a LaTeX engine be installed ».
Moteurs HTML cités par le manuel : weasyprint (défaut pour `-t html`), prince, wkhtmltopdf, pagedjs-cli.
`pandoc` et `weasyprint` s'installent par apt (slide « Installer pandoc et WeasyPrint »).
:::

## La commande, option par option {kicker="Chaîne"}

```console
$ pandoc rapport.md -s --template template.html --css rapport.css --wrap=none --pdf-engine=weasyprint -o rapport.pdf
```

| Option | Rôle |
|---|---|
| `-s` | document complet, avec `<head>`, et non un fragment |
| `--template` | squelette de la page ; implique `-s` |
| `--css` | lien vers la feuille de style, dans l'en-tête |
| `--wrap=none` | aucune coupure de ligne dans le HTML produit |

::: sources
- [pandoc, User's Guide : --standalone](https://pandoc.org/MANUAL.html#option--standalone), [--template](https://pandoc.org/MANUAL.html#option--template), [--css](https://pandoc.org/MANUAL.html#option--css), [--wrap](https://pandoc.org/MANUAL.html#option--wrap)
:::

::: notes
`--css` : « It should be used together with -s/--standalone, because the link to the stylesheet goes in the document header. »
`--template` : « Implies --standalone. » Sans `--template`, pandoc prend son template par défaut.
`--wrap=none` : sans lui, pandoc 3.1.3 (Ubuntu 24.04) coupe le `<title>` à 72 colonnes, et WeasyPrint 61.1 ne garde que la première ligne dans le titre du PDF (constaté le 18 octobre 2026, `formateur/equivalences.md`).
`--pdf-engine=weasyprint` : sans lui, pandoc passe par LaTeX.
Commande du Makefile du corrigé 7B.
:::

## Les métadonnées en tête du Markdown {kicker="Chaîne"}

```yaml
---
title: Rapport mensuel d'exploitation
subtitle: Septembre 2026
lang: fr
---
```

Un bloc YAML en tête du fichier. Chaque champ devient une variable du template.

::: sources
- [pandoc, User's Guide : YAML metadata block](https://pandoc.org/MANUAL.html#extension-yaml_metadata_block)
- [pandoc, User's Guide : Metadata variables](https://pandoc.org/MANUAL.html#metadata-variables)
:::

::: notes
« A YAML metadata block is a valid YAML object, delimited by a line of three hyphens (---) at the top and a line of three hyphens (---) or three dots (...) at the bottom. »
« Template variables will be set automatically from the metadata. »
Un titre qui contient deux-points se met entre guillemets (règles d'échappement YAML).
`lang` : le template par défaut l'écrit dans `<html lang="…">` (`pandoc -D html`, ligne 2).
:::

## Les tableaux Markdown {kicker="Chaîne"}

```markdown
| Sévérité | Incidents | Dans l'objectif |
|---|---:|---:|
| P1 | 9 | 77,8 % |
```

Les deux-points de la ligne de séparation alignent la colonne : `---:` à droite, `:---:` au centre.

::: sources
- [pandoc, User's Guide : Pipe tables](https://pandoc.org/MANUAL.html#extension-pipe_tables)
:::

::: notes
« The colons indicate column alignment as shown. The header cannot be omitted. »
« The cells of pipe tables cannot contain block elements like paragraphs and lists, and cannot span multiple lines. »
Chiffres alignés à droite : les unités et les décimales tombent les unes sous les autres.
Piège des largeurs de colonnes : slide « Des colonnes de même largeur ».
:::

## Installer pandoc et WeasyPrint {kicker="Chaîne"}

```console
$ sudo apt install pandoc weasyprint
```

| Distribution | pandoc | WeasyPrint |
|---|---|---|
| Ubuntu 22.04 | 2.9.2.1 | 54.1 |
| Ubuntu 24.04 | 3.1.3 | 61.1 |

Ces versions produisent toutes deux le PDF du TP.

::: sources
- [pandoc, Installing](https://pandoc.org/installing.html)
- [WeasyPrint, First steps](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html)
- Essais du 18 octobre 2026 : `formateur/equivalences.md`
:::

::: notes
Testé dans les images Docker `ubuntu:22.04` et `ubuntu:24.04` : table des matières, tableaux, accents, saut de page, pied de page « Page n / total ». Le corrigé 7B rend à l'identique sous Ubuntu 22.04.
macOS : `brew install pandoc weasyprint`. Windows : `winget install --source winget --exact --id JohnMacFarlane.Pandoc` et l'exécutable WeasyPrint des releases GitHub.
Pour que Claude Code lise un PDF de plus de 10 pages : `poppler-utils`.
:::

## pandoc convertit, la CSS met en page, WeasyPrint imprime. {.statement kicker="Idée clé"}

::: notes
Découle de « De la source au PDF » et de « Le PDF passe par HTML et CSS » : chaque outil a un rôle, et la mise en page vit dans un fichier CSS.
Transition : écrire ce template et cette CSS.
:::

## Le template : du HTML avec des variables {kicker="Template et CSS"}

```html
<h1>$title$</h1>
<p class="mois">$subtitle$</p>
$body$
```

`$title$` reçoit le champ `title` des métadonnées, `$body$` le document converti.

::: sources
- [pandoc, User's Guide : Interpolated variables](https://pandoc.org/MANUAL.html#interpolated-variables)
- [pandoc, User's Guide : Variables set automatically](https://pandoc.org/MANUAL.html#variables-set-automatically)
:::

::: notes
« A slot for an interpolated variable is a variable name surrounded by matched delimiters. » Délimiteurs : `$…$` ou `${…}`.
`body` : « body of document », variable fixée par pandoc.
Une variable absente des métadonnées se donne aussi en ligne de commande : `-V nom=valeur`.
:::

## Conditions et boucles {kicker="Template et CSS"}

```html
$if(subtitle)$<p class="mois">$subtitle$</p>$endif$
$for(css)$<link rel="stylesheet" href="$css$">$endfor$
```

`$if$` n'insère le bloc que si la variable existe. `$for$` le répète pour chaque valeur : une par option `--css`.

::: sources
- [pandoc, User's Guide : Conditionals](https://pandoc.org/MANUAL.html#conditionals)
- [pandoc, User's Guide : For loops](https://pandoc.org/MANUAL.html#for-loops)
:::

::: notes
« The if section is used if variable has a true value, otherwise the else section is used (if present). »
« If variable is an array, the material inside the loop will be evaluated repeatedly, with variable being set to each value of the array in turn ».
`--css` « can be used repeatedly to include multiple files » : d'où la boucle.
:::

## Le template du rapport {kicker="Template et CSS"}

```html file="../tp/tp07-pandoc/corrige-7b/template.html" lines="5-15"
```

::: sources
- Corrigé du TP 7B : `tp/tp07-pandoc/corrige-7b/template.html`
:::

::: notes
Extrait : manquent le `<!DOCTYPE>`, `<html lang="$lang$">` et les balises de fermeture.
Écrit par l'agent au TP 7B. Le `<title>` réunit titre et mois : il devient le titre du PDF (`pdfinfo rapport.pdf`).
Les deux syntaxes vues : variables, boucle `$for(css)$`.
Pas de `$if$` : le script écrit toujours `subtitle`.
:::

## Partir du template par défaut {kicker="Template et CSS"}

```console
$ pandoc -D html > template.html
```

Le template par défaut de pandoc contient déjà les métadonnées, la langue et les styles de base. On le copie, puis on le modifie.

::: sources
- [pandoc, User's Guide : --print-default-template](https://pandoc.org/MANUAL.html#option--print-default-template)
:::

::: notes
« Print the system default template for an output FORMAT. »
« some of the default templates use partials, for example styles.html. To print the partials, use --print-default-data-file ».
Le template par défaut varie d'une version de pandoc à l'autre : en extraire un depuis le pandoc de la VM, pas depuis celui du poste.
Le template du corrigé est plus court que celui par défaut : la CSS du projet remplace les styles intégrés.
:::

## Le format de la page : @page {kicker="Template et CSS"}

```css
@page {
  size: A4;
  margin: 2cm 1.8cm 2.2cm;
}
```

La règle `@page` fixe le format du papier et les marges de chaque page.

::: sources
- [WeasyPrint, Adjust document dimensions](https://doc.courtbouillon.org/weasyprint/stable/common_use_cases.html#adjust-document-dimensions)
- [WeasyPrint, CSS Paged Media Module Level 3](https://doc.courtbouillon.org/weasyprint/stable/api_reference.html#css-paged-media-module-level-3)
:::

::: notes
« WeasyPrint does not provide support for adjusting page size or document margins via command-line flags. This is best accomplished with the CSS @page at-rule ».
Exemple de la doc : `@page { size: A3 landscape; margin: 3cm }`. A4 portrait est le format par défaut.
Paged Media : « All the features of this draft are available, including: the @page rule and the :left, :right, :first and :blank selectors; the page margin boxes; the page-based counters ».
`@page :first` donne une première page différente (sans pied de page, par exemple).
Marges du corrigé : 2 cm en haut, 1,8 cm sur les côtés, 2,2 cm en bas pour le pied de page.
:::

## Numéroter les pages {kicker="Template et CSS"}

```css
@page {
  @bottom-center {
    content: "Page " counter(page) " / " counter(pages);
  }
}
```

`@bottom-center` désigne la marge du bas, au centre. `counter(page)` donne le numéro de la page, `counter(pages)` le nombre total.

::: sources
- [W3C, CSS Paged Media : Page-margin boxes](https://www.w3.org/TR/css-page-3/#margin-boxes)
- [W3C, CSS Paged Media : Page-based counters](https://www.w3.org/TR/css-page-3/#page-based-counters)
- [WeasyPrint, CSS Paged Media Module Level 3](https://doc.courtbouillon.org/weasyprint/stable/api_reference.html#css-paged-media-module-level-3)
:::

::: notes
Spécification : « A counter named page is automatically created and incremented by 1 on every page of the document » ; « a counter named pages is automatically created by the UA. Its value is always the total number of pages in the document. »
Seize boîtes de marge, de `@top-left-corner` à `@left-top` ; `@top-center` pour un en-tête.
La doc WeasyPrint dit seulement « the page-based counters (with known limitations #93) » ; le pied « Page n / total » est vérifié sur WeasyPrint 54.1, 61.1 et 70.0.
Règle complète, avec police, taille et couleur : `rapport.css` du corrigé, lignes 1 à 12.
La boîte de marge n'hérite pas de la police de `body` : la déclarer dans `@bottom-center` (constaté sur le corrigé, police à empattement sinon).
:::

## Contrôler les sauts de page {kicker="Template et CSS"}

```css
h2 { break-after: avoid; }
tr { break-inside: avoid; }
```

Un titre ne reste pas seul en bas de page, une ligne de tableau n'est pas coupée en deux. `break-before: page` force un saut.

::: sources
- [WeasyPrint, CSS Fragmentation Module Level 3/4](https://doc.courtbouillon.org/weasyprint/stable/api_reference.html#css-fragmentation-module-level-3-4)
:::

::: notes
« The break-before, break-after and break-inside properties are supported for pages, but not for columns and regions. page-break-* aliases as defined in CSS2 are supported too. »
Un tableau sur deux pages répète son en-tête (`<thead>`) : changelog de WeasyPrint 0.19.1, « repeat <thead> and <tfoot> elements on every page ». Constaté sur le PDF d'octobre du corrigé.
Usage courant de `break-before: page` : une section qui commence toujours sur une nouvelle page.
:::

## Des colonnes de même largeur {kicker="Template et CSS"}

Quand une ligne d'un tableau Markdown dépasse 72 caractères, pandoc fixe la largeur de chaque colonne d'après le nombre de tirets de la ligne de séparation. Avec `|---|---|`, toutes les colonnes ont la même largeur.

```css
col { width: auto !important; }
```

::: sources
- [pandoc, User's Guide : Pipe tables](https://pandoc.org/MANUAL.html#extension-pipe_tables)
- [pandoc, User's Guide : --wrap](https://pandoc.org/MANUAL.html#option--wrap)
:::

::: notes
« If any line of the Markdown source is longer than the column width (see --columns), then the table will take up the full text width and the cell contents will wrap, with the relative cell widths determined by the number of dashes in the line separating the table header from the table body. »
`--columns` vaut 72 par défaut (entrée `--wrap`).
Constaté sur le corrigé 7B : la colonne Titre des résolutions les plus longues coupée sur trois lignes. pandoc écrit `<col style="width: 20%" />` ; la règle CSS l'annule.
Autres corrections possibles : des tirets proportionnels aux largeurs voulues, ou `--columns` plus grand.
Exemple de défaut que l'agent voit en relisant le PDF, et qu'il corrige dans la CSS.
:::

## Le même Markdown donne toujours le même PDF. {.statement kicker="Idée clé"}

::: notes
Découle des slides sur le template et la CSS : la mise en page est dans deux fichiers versionnés, séparée du contenu.
Transition : quand le contenu vient lui-même de données.
:::

## Le rapport mensuel du TP {.figures kicker="Données"}

- **296** incidents en septembre
- **8** colonnes par incident
- **6** sections dans le rapport
- **13** critères dans la grille

Le mois suivant compte 336 incidents, avec les mêmes colonnes.

::: sources
- Données du TP : `tp/tp07-pandoc/donnees/incidents-2026-09.csv`, `incidents-2026-10.csv`
- Grille : `tp/tp07-pandoc/grille.md`
:::

::: notes
Données générées pour la formation par `preparation/generate_incidents.py`, avec une graine fixe : le script redonne les mêmes fichiers.
Colonnes : `id`, `ouverture`, `service`, `severite`, `categorie`, `titre`, `statut`, `duree_resolution_min`.
Sections : Synthèse, Faits marquants, Par sévérité, Par service, Résolutions les plus longues, Incidents en cours.
Valeurs de référence calculées par script : `preparation/references.md`.
:::

## Les données : un incident par ligne {kicker="Données"}

```csv file="../tp/tp07-pandoc/donnees/incidents-2026-09.csv" lines="1-3"
```

Huit colonnes : identifiant, date d'ouverture, service, sévérité, catégorie, titre, statut, durée de résolution en minutes.

::: sources
- Données du TP : `tp/tp07-pandoc/donnees/incidents-2026-09.csv`
:::

::: notes
Les deux premiers des 296 incidents de septembre.
Sévérité de P1 à P4. Statut `résolu` ou `en cours` ; un incident en cours n'a pas de durée.
Fichier en UTF-8, séparateur virgule, sans guillemets.
:::

## Le livrable : un PDF de deux pages {kicker="Données"}

![Les deux pages A4 du rapport de septembre : titre et mois, synthèse, faits marquants, tableaux par sévérité et par service, résolutions les plus longues, incidents en cours, pied de page numéroté](images/07-rapport.png)

::: sources
- Corrigé du TP 7B : `tp/tp07-pandoc/corrige-7b/rapport.pdf`
:::

::: notes
PDF du corrigé 7B, mois de septembre, WeasyPrint 70.
Six sections, dans l'ordre : Synthèse, Faits marquants, Par sévérité, Par service, Résolutions les plus longues, Incidents en cours.
Seuls les faits marquants sont rédigés ; le reste est fait de chiffres calculés sur le CSV.
Le PDF de l'approche directe a les mêmes sections : la grille est commune.
:::

## L'approche directe {kicker="Données"}

![L'agent lit incidents.csv, calcule les chiffres et rédige rapport.md ; pandoc et WeasyPrint produisent rapport.pdf ; le mois suivant, l'agent relit le nouveau CSV et refait les calculs](images/07-directe.svg)

::: sources
- Énoncé du TP 7A, en fin de module
:::

::: notes
L'agent fait tout en conversation : lecture du CSV, calculs, rédaction, conversion, relecture.
Les calculs se font dans le raisonnement du modèle, ou dans des commandes que l'agent écrit à la volée : l'énoncé ne l'impose pas.
TP 7A.
:::

## L'approche outillée {kicker="Données"}

![Le script rapport.py, écrit une fois par l'agent, calcule les chiffres à partir de incidents.csv et écrit rapport.md ; pandoc et WeasyPrint produisent rapport.pdf ; le mois suivant, make relance le script sur le nouveau CSV](images/07-outillee.svg)

::: sources
- Corrigé du TP 7B : `tp/tp07-pandoc/corrige-7b/`
:::

::: notes
L'agent écrit le script, ses tests, le template, la CSS et le Makefile. Il n'écrit pas le rapport lui-même.
Le script est testé contre les valeurs de référence (`tests/test_rapport.py`).
TP 7B.
:::

## Ce que le TP compare {kicker="Données"}

| Question | Mesurée par |
|---|---|
| Combien de temps pour le premier rapport ? | chronomètre |
| Combien de tokens ? | `/usage`, zone de saisie d'Open Code |
| Combien de prompts ? | décompte du groupe |
| Les chiffres sont-ils justes ? | grille, valeurs de référence |

Chaque question se pose deux fois : pour le premier mois, puis pour le mois suivant.

::: sources
- Grille : `tp/tp07-pandoc/grille.md`
:::

::: notes
Ne pas annoncer de gagnant : la restitution compare les relevés des groupes.
Questions à garder pour la restitution : qui a calculé les chiffres, comment le groupe les a vérifiés, ce qu'a coûté le mois suivant.
:::

## L'agent rédige à partir des chiffres calculés {kicker="Données"}

```json
"synthese": {
  "incidents": 296,
  "duree_moyenne_h": 28.2,
  "taux_objectif_pct": 77.3
}
```

Le script calcule les agrégats. L'agent rédige les faits marquants à partir d'eux, sans relire le CSV.

::: sources
- Corrigé du TP 7B : `tp/tp07-pandoc/corrige-7b/faits.json`, `faits.md`
:::

::: notes
Extrait réduit des agrégats de septembre (`faits.json`, 3,3 Ko, contre 30 Ko pour le CSV).
Faits marquants obtenus le 18 octobre 2026 (Claude Code v2.1.302, `claude-sonnet-4-6`) : « Le service recherche est le plus sollicité avec 70 incidents, dont 2 P1. La sévérité P2 présente le taux de respect des objectifs le plus faible à 75,5 % ». Chiffres exacts.
Le prompt demande de recopier les chiffres sans en calculer de nouveaux : chaque chiffre cité se vérifie dans le JSON.
Approche hybride : le script pour les calculs, le modèle pour la rédaction.
:::

## Deux approches, un livrable, une grille commune. {.statement kicker="Idée clé"}

::: notes
Découle de « L'approche directe », « L'approche outillée » et « Ce que le TP compare ».
Le choix se discute en restitution, sur les relevés des groupes.
:::

## Un Makefile enchaîne les étapes {kicker="Industrialisation"}

![Chaîne du corrigé, un fichier par case avec, au-dessus, la commande qui le produit : rapport.py agregats lit incidents.csv et écrit agregats.json ; make faits envoie agregats.json à l'agent, qui écrit faits.md ; rapport.py markdown réunit agregats.json et faits.md dans rapport.md ; pandoc en fait rapport.pdf](images/07-make.svg)

make reconstruit un fichier quand l'un de ceux dont il dépend est plus récent que lui.

::: sources
- [GNU make, How make Processes a Makefile](https://www.gnu.org/software/make/manual/make.html#How-make-Processes-a-Makefile)
- Corrigé du TP 7B : `tp/tp07-pandoc/corrige-7b/Makefile`
:::

::: notes
Manuel : « The recompilation must be done if the source file, or any of the header files named as prerequisites, is more recent than the object file, or if the object file does not exist. »
Un changement de `rapport.css` ne relance que pandoc ; un nouveau CSV relance le script, puis pandoc.
`make` sans argument construit la première cible du fichier : « This is called the default goal. » Dans le corrigé, `all`, qui dépend de `rapport.pdf`.
Commandes exactes : `uv run rapport.py agregats incidents.csv build/agregats.json`, `uv run rapport.py markdown build/agregats.json faits.md build/rapport.md`.
`agregats.json` : tous les chiffres des tableaux, calculés par le script (slide « L'agent rédige à partir des chiffres calculés »).
:::

## faits.md : le seul texte rédigé par l'agent {kicker="Industrialisation"}

> En septembre 2026, 296 incidents ont été enregistrés, dont 291 résolus et 5 en cours à la clôture du mois, pour une durée moyenne de résolution de 28,2 h et un taux de respect des objectifs de 77,3 %. Le service recherche est le plus sollicité avec 70 incidents, dont 2 P1. La sévérité P2 présente le taux de respect des objectifs le plus faible à 75,5 %, pour une durée moyenne de 6,2 h sur 49 incidents.

Le script l'insère tel quel sous le titre « Faits marquants ».

::: sources
- Corrigé du TP 7B : `tp/tp07-pandoc/corrige-7b/faits.md`, `rapport.py`
:::

::: notes
Contenu intégral de `faits.md` pour septembre, produit par `make faits` le 18 octobre 2026 (Claude Code, `claude-sonnet-4-6`).
Chaque chiffre se retrouve dans `agregats.json` : l'agent recopie, le script calcule.
Versionné : un nouvel appel au modèle donnerait un autre texte.
`faits.json` : copie des agrégats d'où vient ce texte, pour détecter un `faits.md` périmé.
:::

## Une règle : cible, dépendances, commande {kicker="Industrialisation"}

```makefile file="../tp/tp07-pandoc/corrige-7b/Makefile" lines="22-23"
```

`build/agregats.json` est la cible, `$(CSV)` et `rapport.py` ses dépendances. La ligne suivante, indentée par une tabulation, la produit.

::: sources
- [GNU make, What a Rule Looks Like](https://www.gnu.org/software/make/manual/make.html#What-a-Rule-Looks-Like)
- [GNU make, Automatic Variables](https://www.gnu.org/software/make/manual/make.html#Automatic-Variables)
:::

::: notes
« A target is usually the name of a file that is generated by a program » ; « A prerequisite is a file that is used as input to create the target. » ; « A recipe is an action that make carries out. »
« you need to put a tab character at the beginning of every recipe line! » Des espaces donnent l'erreur `missing separator`.
`$@` : « The file name of the target of the rule. » `$<` : « The name of the first prerequisite. »
Chaque ligne de commande tourne dans son propre shell ; un `$` destiné au shell s'écrit `$$`.
`.PHONY` : cibles qui ne sont pas des fichiers (`all`, `faits`, `clean`), exécutées à chaque demande.
:::

## Appeler l'agent sans session {.compare kicker="Industrialisation"}

::: claude-code
```console
$ claude -p "/faits-marquants" < build/agregats.json
```

La slash command est développée, l'entrée standard s'ajoute au prompt.
:::

::: opencode
```console
$ opencode run "<prompt>" < build/agregats.json
```

`/faits-marquants` n'est pas développé : le Makefile envoie le texte de la commande.
:::

::: sources
- [Claude Code, Headless : Pipe data through Claude](https://code.claude.com/docs/en/headless#pipe-data-through-claude), [Create a commit](https://code.claude.com/docs/en/headless#create-a-commit)
- Open Code v2.0.26 : [`run/run.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/cli/src/run/run.ts), [`prompt/parse.ts`](https://github.com/anomalyco/opencode/blob/v2.0.26/packages/tui/src/prompt/parse.ts)
:::

::: notes
Claude Code : « User-invoked skills and custom commands work. Include `/skill-name` in the prompt string and Claude Code expands it before running. » ; « Non-interactive mode reads stdin, so you can pipe data in and redirect the response out like any other command-line tool. »
Open Code v2.0.26 : seule la TUI analyse les `/` (`parse.ts`) ; `opencode run` envoie le texte brut, et l'option `--command` de la doc v1 n'existe plus. L'entrée standard est ajoutée au message (`mergeInput`). Constaté le 18 octobre 2026.
Commande complète du Makefile : `opencode run -m anthropic/claude-sonnet-4-6 "$$(awk 'f >= 2; /^---$$/ { f++ }' .opencode/commands/faits-marquants.md)"` (corps du fichier sans son frontmatter).
Réponse seule sur stdout dans les deux outils ; les traces d'Open Code vont sur stderr.
Rappel module 6 : `claude -p` lance les hooks du dépôt sans demander la confiance du dossier.
:::

## L'appel au modèle a sa propre cible {kicker="Industrialisation"}

```console
$ make faits
$ make
```

`make faits` appelle le modèle une fois par mois de données. `make` reconstruit le PDF sans l'appeler, après un changement de CSS par exemple.

::: sources
- Corrigé du TP 7B : `tp/tp07-pandoc/corrige-7b/Makefile`
:::

::: notes
Coût mesuré le 18 octobre 2026 : 0,09 $ pour un `make faits` (`claude -p --output-format json`, champ `total_cost_usd`), dont l'essentiel en écriture de cache du contexte de départ.
`faits.json` garde les agrégats d'où vient `faits.md` : si le CSV change sans `make faits`, `make` s'arrête avec « faits.md was written for other data: run make faits ».
Un appel au modèle ne redonne pas deux fois le même texte : le séparer garde le PDF reproductible tant que les données ne changent pas.
:::

## Ce qui se versionne {kicker="Industrialisation"}

| Fichier | Versionné |
|---|---|
| script, tests, template, CSS, Makefile | oui |
| commande `faits-marquants`, `faits.md` | oui |
| `build/`, `rapport.pdf` | non, régénérés par `make` |

::: sources
- Corrigé du TP 7B : `tp/tp07-pandoc/corrige-7b/.gitignore`
:::

::: notes
`faits.md` est versionné : c'est un texte rédigé, que `make` ne régénère pas.
Le PDF se régénère depuis le dépôt ; le livrer est une étape de publication, hors de git.
:::

## Une commande partagée avec le projet {kicker="Industrialisation"}

```markdown file="../tp/tp07-pandoc/corrige-7b/.claude/commands/faits-marquants.md" lines="1-6"
```

Commitée avec le projet, elle sert au Makefile comme à une session interactive.

::: sources
- [Claude Code, Skills : Where skills live](https://code.claude.com/docs/en/skills#where-skills-live)
- Corrigé du TP 7B : `.claude/commands/` et `.opencode/commands/`
:::

::: notes
Rappel module 6 : `.claude/commands/<nom>.md` est l'ancien emplacement des slash commands, toujours lu ; même fichier dans `.opencode/commands/`.
Extrait : suivent quatre règles (deux à quatre phrases, service et sévérité à citer, chiffres recopiés sans calcul, paragraphe seul sans outil).
Pas de `$ARGUMENTS` : les agrégats arrivent par l'entrée standard.
« Use no tool » : la commande n'a besoin d'aucune permission, condition d'un appel sans surveillance.
:::

## Ce qui se refait chaque mois passe dans le Makefile. {.statement kicker="Idée clé"}

::: notes
Découle de « Un Makefile enchaîne les étapes » et de « L'appel au modèle a sa propre cible ».
Transition : le TP, en deux approches.
:::

## Glossaire {kicker="Glossaire"}

- **pandoc** : convertisseur de documents
- **Template** : squelette de la page produite
- **Métadonnées** : bloc YAML en tête du Markdown
- **CSS paginée** : CSS pour des pages imprimées
- **@page** : règle du format et des marges

|||

- **WeasyPrint** : moteur HTML et CSS vers PDF
- **Agrégat** : chiffre calculé sur les données
- **Makefile** : fichier des règles de `make`
- **Cible** : fichier que produit une règle

::: sources
- [pandoc, User's Guide](https://pandoc.org/MANUAL.html)
- [WeasyPrint](https://doc.courtbouillon.org/weasyprint/stable/), [W3C, CSS Paged Media](https://www.w3.org/TR/css-page-3/)
- [GNU make, Manual](https://www.gnu.org/software/make/manual/make.html)
:::

::: notes
Slide de référence, à ne pas lire en salle.
:::
