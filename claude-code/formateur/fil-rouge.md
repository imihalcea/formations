# Projet fil rouge

## Domaine

`salles` est une application en ligne de commande qui gère les salles de réunion d'une entreprise : salles, réservations, détection des conflits, calcul du tarif et export du planning. Le domaine se comprend sans explication métier.

## Contraintes techniques

| Contrainte | Choix |
|---|---|
| Langage | Python 3.10, aucune syntaxe ni bibliothèque standard postérieure |
| Dépendances | bibliothèque standard, `pytest`, `ruff` |
| Persistance | `sqlite3` |
| Interface | CLI `argparse` |
| Taille | environ 500 lignes, explorables en une vingtaine de minutes |

`datetime.fromisoformat` n'accepte pas le suffixe `Z` avant Python 3.11. Les dates sont donc stockées naïves, sans fuseau.

## Modules

| Module | Rôle | État au départ |
|---|---|---|
| `cli.py` | sous-commandes `salle ajouter`, `salle lister`, `reserver`, `annuler`, `planning`, `disponibles` | testé partiellement |
| `db.py` | connexion `sqlite3`, création du schéma | testé |
| `depot.py` | requêtes SQL paramétrées sur les salles et les réservations | testé |
| `conflits.py` | chevauchement de créneaux | bien testé |
| `tarifs.py` | fonction legacy unique : tarif horaire, majorations soirée et week-end, remise longue durée, forfait journée, tarif interne ; `if` imbriqués et constantes en dur | aucun test |
| `export.py` | export CSV du planning | aucun test |
| `modeles.py` | dataclasses `Salle` et `Reservation`, exception `ErreurReservation` | |

## Conventions implicites

Le code respecte des conventions qu'aucun document n'écrit. Le TP 5 les fait formaliser dans un `CLAUDE.md` :

- montants en centimes entiers ;
- dates en ISO 8601, heure locale naïve ;
- noms et messages en français ;
- SQL toujours paramétré ;
- erreurs métier levées par `ErreurReservation`.

## Exploitation par les TP

La trajectoire détaillée, état de départ et d'arrivée de chaque TP, fait l'objet d'une étape suivante.

| TP | Ce que le TP exploite |
|---|---|
| 2 | premier lancement sur le dépôt, lecture de la structure, premières demandes soumises aux permissions |
| 3 | explication du flux `reserver` de la CLI jusqu'à `sqlite3`, petite édition guidée dans `export.py` |
| 4 | tests de caractérisation de `tarifs.py`, refactoring à comportement constant, implémentation d'une spécification fournie (réservations récurrentes hebdomadaires, refusées si une occurrence est en conflit), message de commit |
| 5 | rédaction du `CLAUDE.md` à partir des conventions implicites |
| 6 | slash command qui crée une sous-commande et son test ; hook qui lance `ruff format` et `pytest` après chaque modification |
