---
lang: fr
---

# Rapport mensuel d'exploitation

## Octobre 2026

## Synthèse

| Indicateur | Valeur |
|---|---|
| Nombre total d'incidents | 336 |
| Incidents résolus | 328 |
| Incidents en cours | 8 |
| Incidents P1 | 15 |
| Durée moyenne de résolution | 26,3 h |
| Taux de résolution dans l'objectif | 76,2 % |

## Faits marquants

Le service **paiement** est le plus touché ce mois avec 88 incidents, soit 26,2 % du total. La sévérité **P4** enregistre le taux de résolution dans l'objectif le plus bas à 74,0 %, ce qui représente un écart de plus de deux points par rapport à la moyenne globale de 76,2 %. Quatre incidents P4 dépassent les 150 heures de résolution, dont INC-2610-0162 sur notifications avec 204,2 h. Ces anomalies révèlent des tensions sur la capacité et les dépendances externes, particulièrement concentrées sur paiement et commandes.

## Par sévérité

| Sévérité | Incidents | Résolus | Durée moyenne | Taux dans l'objectif |
|---|---|---|---|---|
| P1 | 15 | 15 | 3,2 h | 80,0 % |
| P2 | 65 | 65 | 6,9 h | 75,4 % |
| P3 | 152 | 148 | 18,0 h | 77,7 % |
| P4 | 104 | 100 | 54,7 h | 74,0 % |

## Par service

| Service | Incidents | Dont P1 | Durée moyenne |
|---|---|---|---|
| paiement | 88 | 12 | 22,2 h |
| commandes | 64 | 0 | 27,9 h |
| catalogue | 56 | 1 | 22,9 h |
| recherche | 50 | 1 | 25,1 h |
| authentification | 48 | 1 | 29,6 h |
| notifications | 30 | 0 | 37,1 h |

## Résolutions les plus longues

| Identifiant | Service | Sévérité | Titre | Durée |
|---|---|---|---|---|
| INC-2610-0162 | notifications | P4 | Régression après mise en production | 204,2 h |
| INC-2610-0069 | commandes | P4 | Certificat TLS expiré | 175,0 h |
| INC-2610-0040 | catalogue | P4 | Pic de charge non absorbé | 163,2 h |
| INC-2610-0132 | paiement | P4 | Régression après mise en production | 158,4 h |
| INC-2610-0205 | authentification | P4 | Régression après mise en production | 147,9 h |

## Incidents en cours

| Identifiant | Ouverture | Service | Sévérité | Titre |
|---|---|---|---|---|
| INC-2610-0328 | 2026-10-31 08:30 | commandes | P3 | Régression après mise en production |
| INC-2610-0329 | 2026-10-31 08:33 | paiement | P4 | Réplication en retard |
| INC-2610-0330 | 2026-10-31 14:39 | paiement | P3 | Saturation du pool de connexions |
| INC-2610-0331 | 2026-10-31 15:39 | catalogue | P4 | Perte de paquets entre zones |
| INC-2610-0332 | 2026-10-31 15:45 | paiement | P4 | Régression après mise en production |
| INC-2610-0333 | 2026-10-31 20:19 | catalogue | P4 | Migration interrompue |
| INC-2610-0334 | 2026-10-31 22:04 | paiement | P3 | Perte de paquets entre zones |
| INC-2610-0335 | 2026-10-31 22:26 | recherche | P3 | Verrou bloquant sur une table |
