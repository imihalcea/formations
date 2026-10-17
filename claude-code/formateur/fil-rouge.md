# Projet fil rouge

## Domaine

`salles` est une API REST qui gère les salles de réunion d'une entreprise : salles, réservations, détection des conflits, calcul du tarif et export du planning. Le domaine se comprend sans explication métier.

## Contraintes techniques

| Contrainte | Choix |
|---|---|
| Langage | Python 3.14, fixé par `.python-version` et `requires-python` |
| Gestion des dépendances | `uv` : `pyproject.toml` et `uv.lock` versionnés |
| Framework | FastAPI, servi par `uvicorn` |
| Dépendances | `fastapi`, `uvicorn` ; en développement `pytest`, `httpx2` (requis par le `TestClient` de Starlette 1.8, qui déclare `httpx` obsolète), `ruff` |
| Persistance | `sqlite3` de la bibliothèque standard, une connexion par requête fournie par une dépendance FastAPI |
| Taille | environ 500 lignes, explorables en une vingtaine de minutes |

Python 3.14 est sorti en octobre 2025 et reste maintenu jusqu'en octobre 2030 ([endoflife.date](https://endoflife.date/python)). La 3.15, sortie le 9 octobre 2026, est trop récente pour garantir les wheels de toutes les dépendances. `pydantic-core` publie déjà des wheels `cp314` ([PyPI](https://pypi.org/project/pydantic-core/#files)).

`uv` installe lui-même la version de Python demandée par le projet : la VM n'a pas besoin de Python 3.14. Par défaut, `uv` télécharge une version de Python manquante quand une commande en a besoin ([uv, Installing Python](https://docs.astral.sh/uv/guides/install-python/)).

## Installation de uv

Sur la VM, et sur le poste du stagiaire sous Linux ou macOS, l'installeur officiel place `uv` et `uvx` dans `~/.local/bin` ([uv, Installation](https://docs.astral.sh/uv/getting-started/installation/)). La version est épinglée dans l'URL :

```console
$ curl -LsSf https://astral.sh/uv/0.13.1/install.sh | sh
```

Sans `curl`, la même commande s'écrit avec `wget -qO- https://astral.sh/uv/0.13.1/install.sh | sh`. L'installeur modifie les fichiers de profil du shell : il faut ouvrir un nouveau terminal pour que `uv` soit dans le `PATH`. La version 0.13.1 est la dernière publiée sur PyPI au 17 octobre 2026.

L'énoncé du TP 2 reprend cette commande.

Les schémas déclarent leurs dates en `NaiveDatetime` : l'API refuse une date avec fuseau, conformément à la convention des dates naïves.

## Modules

| Module | Rôle | État au départ |
|---|---|---|
| `main.py` | application FastAPI, gestionnaire qui traduit `ErreurReservation` en réponse 409 | |
| `routes.py` | `POST /salles`, `GET /salles`, `GET /salles/disponibles`, `POST /reservations`, `DELETE /reservations/{id}`, `GET /planning`, `GET /planning.csv` | testé partiellement |
| `schemas.py` | schémas Pydantic des requêtes et des réponses | |
| `db.py` | connexion `sqlite3`, création et version du schéma | testé |
| `depot.py` | requêtes SQL paramétrées sur les salles et les réservations | testé |
| `conflits.py` | chevauchement de créneaux | bien testé |
| `tarifs.py` | fonction legacy unique : tarif horaire, majorations soirée et week-end, remise longue durée, forfait journée, tarif interne ; `if` imbriqués et constantes en dur | aucun test |
| `export.py` | génération du CSV du planning | aucun test |
| `modeles.py` | dataclasses `Salle` et `Reservation`, exception `ErreurReservation` | |
| `exemple.py` | remplit la base avec trois salles et sept réservations, les 11 et 16 janvier 2027 : `uv run python -m salles.exemple` | |

## Conventions implicites

Le code respecte des conventions qu'aucun document n'écrit. Le TP 5 les fait formaliser dans un `CLAUDE.md` :

- montants en centimes entiers ;
- dates en ISO 8601, heure locale naïve ;
- noms, champs JSON et messages d'erreur en français ;
- SQL toujours paramétré ;
- erreurs métier levées par `ErreurReservation` dans le code métier, jamais de `HTTPException` hors de `routes.py` ;
- chaque route a un test qui passe par le `TestClient`.

## Trajectoire des TP

Le stagiaire copie `fil-rouge/` au début du TP 2, installe `uv`, lance `uv sync`, fait de sa copie un dépôt git et commite l'état initial. Les commandes du projet passent par `uv run` : `uv run pytest`, `uv run uvicorn salles.main:app --reload`. Chaque TP qui modifie le code se termine par un commit : le stagiaire compare son état à celui du corrigé avec `git diff` et peut revenir au commit précédent si un TP échoue.

Les durées sont des estimations, fixées dans le plan de chaque module.

### TP 2 : premier lancement (15 min)

Départ : installation de `uv`, copie de `fil-rouge/`, `uv sync`, `git init`, commit « État initial ».

Travail : lancer l'outil à la racine du projet avec `claude-sonnet-4-6`, faire décrire la structure, faire lancer `pytest`. Le stagiaire démarre `uvicorn` dans un second terminal, puis demande à l'agent d'interroger l'API avec `curl`. Chaque commande déclenche une demande de permission, que le stagiaire accepte, refuse ou autorise pour la session.

Arrivée : code inchangé, aucun commit. `/init` est montré en démonstration sans être lancé : le `CLAUDE.md` est le sujet du TP 5.

### TP 3 : explorer et modifier (20 min)

Départ : état initial.

Travail : faire expliquer le traitement de `POST /reservations`, de la route jusqu'à `sqlite3`, puis l'injection de la connexion par `Depends`. Demander une petite modification de `export.py` : une colonne `duree_minutes` dans le CSV de `GET /planning.csv`. Relire le diff avant de l'accepter, refuser une première proposition et la reformuler.

Arrivée : le CSV contient la durée. Commit « Export : durée des réservations ».

### TP 4 : tester, refactorer, générer (35 min)

Départ : état d'arrivée du TP 3.

Travail : faire écrire les tests de caractérisation de `tarifs.py`. L'énoncé impose d'y inclure les réservations de `exemple.py`, présentées comme des montants déjà facturés, en plus des cas limites que l'agent propose. Demander ensuite de refactorer la fonction et de remplacer la boucle minute par minute par un calcul direct, puis relancer les tests. Implémenter enfin une spécification courte fournie par l'énoncé : un paramètre `capacite_min` sur `GET /salles/disponibles`, avec ses tests. Faire rédiger les messages de commit.

Arrivée : `tests/test_tarifs.py` en place, `tarifs.py` découpé à comportement constant, anomalie d'arrondi signalée dans le code, filtre de capacité testé. Deux commits.

#### Le piège des arrondis

`calculer_tarif` additionne le prix minute par minute en flottants, puis arrondit avec `round`. Quand le montant exact tombe sur un demi-centime, la somme dérive juste au-dessus ou juste au-dessous, et l'arrondi en dépend. Deux réservations internes de `exemple.py` sont choisies pour cela. Un script a vérifié que chaque calcul direct échoue sur au moins l'une d'elles :

| Réservation | Montant exact | Legacy | `round` exact | Arrondi au demi supérieur | Troncature |
|---|---|---|---|---|---|
| Revue de code, Cap, 1h45 | 2187,5 | 2187 | 2188 | 2188 | 2187 |
| Point budget, Cap, 2h15 | 2812,5 | 2813 | 2812 | 2813 | 2812 |

Après le passage au calcul direct, un test de caractérisation échoue d'un centime. Ce moment fait passer trois enseignements du module 4 :

- la boucle de vérification attrape un écart que la relecture du diff laisse passer ;
- les cas inventés par l'agent ne suffisent pas, les données réelles en révèlent d'autres ;
- un refactoring à comportement constant conserve aussi les défauts : l'agent qui « corrige » l'arrondi au passage change des montants facturés.

Pour garder un comportement constant, la sortie attendue isole l'accumulation en flottants dans une fonction dédiée et signale l'anomalie dans un commentaire. La correction de l'arrondi relève d'une décision métier et sort du TP.

Le TP 4 dure 35 minutes, et cette étape en prend une part importante. Le plan du module 4 (#18) vérifie que la durée tient.

### TP 5 : contexte projet (environ 1h30)

Départ : état d'arrivée du TP 4.

Travail : lancer `/init` et lire le `CLAUDE.md` généré. Le compléter avec les conventions implicites, absentes du fichier généré. Rédiger une demande structurée pour la spécification des réservations récurrentes hebdomadaires : toutes les occurrences sont créées dans une transaction, ou aucune si l'une est en conflit. Vérifier que l'implémentation respecte les conventions du `CLAUDE.md`. Passer à une seconde tâche dans une session neuve, puis compacter une session longue et comparer.

Arrivée : `CLAUDE.md` commité, route `POST /reservations/hebdomadaires` testée. Deux commits.

### TP 6 : étendre l'outil (environ 1h30)

Départ : état d'arrivée du TP 5.

Travail : écrire une slash command qui crée une route et son test, puis l'utiliser pour ajouter `GET /statistiques` (taux d'occupation par salle). Écrire un hook qui lance `uv run ruff format` et `uv run pytest` après chaque modification de fichier. Écrire un skill de migration de schéma, appliqué à l'ajout d'une colonne `equipements` sur les salles. Commiter ces extensions dans `.claude/` pour les partager.

Arrivée : extensions versionnées, route `GET /statistiques`, migration appliquée. Trois commits.

Les équivalents Open Code de la slash command, du hook et du skill dépendent de l'issue #3. Si l'un d'eux n'existe pas, l'énoncé propose une variante ou signale l'absence.

## Contenu exigé du code de départ

La trajectoire impose ces éléments au code de départ :

- `Salle` a un champ `capacite`, et `GET /salles/disponibles` n'a pas encore de filtre sur la capacité ;
- `export.py` produit un CSV sans durée ;
- `tarifs.py` applique des règles déterministes, dont le résultat ne dépend que de la réservation et de la salle ;
- `db.py` versionne le schéma par `PRAGMA user_version`, ce qui donne un point d'appui au skill de migration ;
- `pyproject.toml`, `uv.lock` et `.python-version` sont versionnés ;
- les tests existants passent et `uv run ruff check` ne signale rien ;
- aucun `CLAUDE.md` ni `AGENTS.md`.

## Questions ouvertes

- Comment les stagiaires récupèrent-ils `fil-rouge/` : copie depuis la VM, archive, ou clonage du dépôt ?
