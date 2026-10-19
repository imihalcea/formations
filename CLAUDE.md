# CLAUDE.md

Monorepo des formations. Chaque formation occupe un répertoire à la racine et porte son propre `CLAUDE.md`, qui fait foi pour son contenu. Travailler depuis le répertoire de la formation concernée et ne pas modifier une formation depuis une autre.

| Répertoire | Formation | Label GitHub |
|---|---|---|
| `claude-code/` | Claude Code et Open Code en ligne de commande | `claude-code` |
| `dlaia/` | Développement logiciel assisté par l'IA | `dlaia` |

## Suivi GitHub

- Une issue par module et par étape (plan des slides, rédaction des slides, TP et corrigé, démonstrations), plus des issues transverses (fil rouge, équivalences, template, build, relecture). Corps en trois sections : Objet, Validation, Dépend de. Chaque issue porte le label de sa formation.
- Commits petits et unitaires, au format « Préfixe : description (refs #N) », `closes #N` sur le dernier commit d'une issue. Préfixes usuels : `Module N`, `TP N`, `Template`, `Fil rouge`, `Formateur`, `Équivalences`, `CLAUDE.md`, `Monorepo`.
- `tmp/` est hors dépôt : copies de travail et anciens supports.

## Règles communes

Langue française, orthographe et accentuation complètes ; identifiants, commandes et termes techniques dans leur forme d'origine. Les règles de rédaction, les interdits de style et les contraintes techniques sont dans le `CLAUDE.md` de chaque formation.
