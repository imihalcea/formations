# Grille de conformité du rapport mensuel d'exploitation

Grille commune aux TP 7A et 7B, appliquée au PDF du mois 1 (`incidents-2026-09.csv`) puis à celui du mois 2 (`incidents-2026-10.csv`). Chaque critère vaut 1 point s'il est entièrement satisfait, 0 sinon : 13 points. Les valeurs attendues servent à la notation et ne sont pas données à l'agent. La vérification prend cinq minutes environ.

## Données

Une ligne par incident ouvert dans le mois, séparateur virgule, UTF-8.

| Colonne | Contenu |
|---|---|
| `id` | identifiant, `INC-AAMM-NNNN` |
| `ouverture` | date et heure d'ouverture, `AAAA-MM-JJTHH:MM` |
| `service` | service touché |
| `severite` | `P1` (la plus grave) à `P4` |
| `categorie` | cause de l'incident |
| `titre` | description courte |
| `statut` | `résolu` ou `en cours` |
| `duree_resolution_min` | durée de résolution en minutes, vide si l'incident est en cours |

Objectifs de résolution : P1 4 h, P2 8 h, P3 24 h, P4 72 h. Un incident résolu en une durée égale à l'objectif le respecte.

## Règles de calcul

Durées et taux portent sur les incidents résolus ; les effectifs portent sur tous les incidents. Les durées s'affichent en heures avec une décimale, les taux en pourcentage avec une décimale, arrondis au dixième le plus proche, avec la virgule décimale (`28,2`, `77,3 %`).

## Critères

### Structure

1. Le document s'ouvre sur le titre « Rapport mensuel d'exploitation » suivi du mois (« Septembre 2026 »).
2. Les sections se suivent dans cet ordre : Synthèse, Faits marquants, Par sévérité, Par service, Résolutions les plus longues, Incidents en cours.

### Chiffres

3. Synthèse : nombre d'incidents, de résolus, d'incidents en cours et de P1 exacts.
4. Synthèse : durée moyenne de résolution et taux de résolution dans l'objectif exacts.
5. Par sévérité : une ligne par sévérité, de P1 à P4, avec incidents, résolus, durée moyenne et taux dans l'objectif exacts.
6. Par service : un tableau des six services avec incidents, dont P1 et durée moyenne exacts.
7. Par service : lignes triées par nombre d'incidents décroissant.
8. Résolutions les plus longues : les cinq bons identifiants, dans l'ordre, avec service, sévérité, titre et durée.
9. Incidents en cours : tous les incidents en cours, et eux seuls, avec identifiant, ouverture, service, sévérité et titre.
10. Format des nombres conforme aux règles de calcul dans tout le document.

### Faits marquants

11. Deux à quatre phrases qui nomment le service le plus touché et la sévérité dont le taux dans l'objectif est le plus bas.
12. Chaque chiffre cité dans les faits marquants est exact.

### Mise en page

13. PDF au format A4, numéro « Page n / total » en pied de chaque page.
