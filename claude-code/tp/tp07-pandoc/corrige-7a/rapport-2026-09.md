---
lang: fr
---

# Rapport mensuel d'exploitation

## Septembre 2026

## Synthèse

| Indicateur | Valeur |
|---|---|
| Nombre total d'incidents | 296 |
| Incidents résolus | 291 |
| Incidents en cours | 5 |
| Incidents P1 | 9 |
| Durée moyenne de résolution | 28,2 h |
| Taux de résolution dans l'objectif | 77,3 % |

## Faits marquants

Le service **recherche** est le plus touché ce mois avec 70 incidents, devant catalogue (60) et commandes (48). La sévérité **P2** enregistre le taux de résolution dans l'objectif le plus bas à 75,5 %, soit près de deux points sous la moyenne globale. Un incident P4 sur le service commandes (INC-2609-0037) a nécessité 444,8 h de résolution, représentant à lui seul une anomalie majeure. L'accumulation d'incidents de capacité et de dépendances externes sur l'ensemble des services suggère une tension structurelle sur l'infrastructure.

## Par sévérité

| Sévérité | Incidents | Résolus | Durée moyenne | Taux dans l'objectif |
|---|---|---|---|---|
| P1 | 9 | 9 | 3,2 h | 77,8 % |
| P2 | 49 | 49 | 6,2 h | 75,5 % |
| P3 | 134 | 132 | 18,5 h | 77,3 % |
| P4 | 104 | 101 | 53,7 h | 78,2 % |

## Par service

| Service | Incidents | Dont P1 | Durée moyenne |
|---|---|---|---|
| recherche | 70 | 2 | 24,3 h |
| catalogue | 60 | 3 | 31,3 h |
| commandes | 48 | 3 | 35,6 h |
| paiement | 46 | 0 | 26,2 h |
| authentification | 44 | 1 | 21,9 h |
| notifications | 28 | 0 | 30,8 h |

## Résolutions les plus longues

| Identifiant | Service | Sévérité | Titre | Durée |
|---|---|---|---|---|
| INC-2609-0037 | commandes | P4 | Requêtes lentes sur la base principale | 444,8 h |
| INC-2609-0154 | paiement | P4 | Quota d'API tiers dépassé | 203,4 h |
| INC-2609-0183 | catalogue | P4 | Timeouts vers le répartiteur de charge | 187,1 h |
| INC-2609-0059 | paiement | P4 | Latence élevée d'un service tiers | 136,5 h |
| INC-2609-0040 | catalogue | P4 | Résolution DNS en échec | 135,6 h |

## Incidents en cours

| Identifiant | Ouverture | Service | Sévérité | Titre |
|---|---|---|---|---|
| INC-2609-0291 | 2026-09-30 04:17 | recherche | P3 | Perte de paquets entre zones |
| INC-2609-0292 | 2026-09-30 06:18 | paiement | P3 | Pic de charge non absorbé |
| INC-2609-0293 | 2026-09-30 08:54 | authentification | P4 | Réponses invalides d'un partenaire |
| INC-2609-0295 | 2026-09-30 13:40 | authentification | P4 | Régression après mise en production |
| INC-2609-0296 | 2026-09-30 20:34 | authentification | P4 | File de messages en débordement |
