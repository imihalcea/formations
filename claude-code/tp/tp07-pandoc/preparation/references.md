# Valeurs de référence des TP 7A et 7B

Fichier produit par `uv run preparation/compute_references.py`. Ne pas éditer à la main.

Durées en heures, arrondies au dixième le plus proche (demi vers le haut). Durées et taux portent sur les incidents résolus. Objectifs de résolution : P1 4 h, P2 8 h, P3 24 h, P4 72 h, bornes incluses.

## Septembre 2026 (`incidents-2026-09.csv`)

| Indicateur | Valeur |
|---|---|
| Incidents | 296 |
| Résolus | 291 |
| En cours | 5 |
| P1 | 9 |
| Durée moyenne de résolution (h) | 28,2 |
| Résolus dans l'objectif | 77,3 % |

### Faits marquants

Service le plus touché : recherche (70 incidents). Sévérité au taux dans l'objectif le plus bas : P2 (75,5 %).

### Par sévérité

| Sévérité | Incidents | Résolus | Durée moyenne (h) | Dans l'objectif |
|---|---|---|---|---|
| P1 | 9 | 9 | 3,2 | 77,8 % |
| P2 | 49 | 49 | 6,2 | 75,5 % |
| P3 | 134 | 132 | 18,5 | 77,3 % |
| P4 | 104 | 101 | 53,7 | 78,2 % |

### Par service, par nombre d'incidents décroissant

| Service | Incidents | Dont P1 | Durée moyenne (h) |
|---|---|---|---|
| recherche | 70 | 2 | 24,3 |
| catalogue | 60 | 3 | 31,3 |
| commandes | 48 | 3 | 35,6 |
| paiement | 46 | 0 | 26,2 |
| authentification | 44 | 1 | 21,9 |
| notifications | 28 | 0 | 30,8 |

### Cinq résolutions les plus longues

| Identifiant | Service | Sévérité | Titre | Durée (h) |
|---|---|---|---|---|
| INC-2609-0037 | commandes | P4 | Requêtes lentes sur la base principale | 444,8 |
| INC-2609-0154 | paiement | P4 | Quota d'API tiers dépassé | 203,4 |
| INC-2609-0183 | catalogue | P4 | Timeouts vers le répartiteur de charge | 187,1 |
| INC-2609-0059 | paiement | P4 | Latence élevée d'un service tiers | 136,5 |
| INC-2609-0040 | catalogue | P4 | Résolution DNS en échec | 135,6 |

### Incidents en cours

| Identifiant | Ouverture | Service | Sévérité | Titre |
|---|---|---|---|---|
| INC-2609-0291 | 2026-09-30T04:17 | recherche | P3 | Perte de paquets entre zones |
| INC-2609-0292 | 2026-09-30T06:18 | paiement | P3 | Pic de charge non absorbé |
| INC-2609-0293 | 2026-09-30T08:54 | authentification | P4 | Réponses invalides d'un partenaire |
| INC-2609-0295 | 2026-09-30T13:40 | authentification | P4 | Régression après mise en production |
| INC-2609-0296 | 2026-09-30T20:34 | authentification | P4 | File de messages en débordement |

## Octobre 2026 (`incidents-2026-10.csv`)

| Indicateur | Valeur |
|---|---|
| Incidents | 336 |
| Résolus | 328 |
| En cours | 8 |
| P1 | 15 |
| Durée moyenne de résolution (h) | 26,3 |
| Résolus dans l'objectif | 76,2 % |

### Faits marquants

Service le plus touché : paiement (88 incidents). Sévérité au taux dans l'objectif le plus bas : P4 (74,0 %).

### Par sévérité

| Sévérité | Incidents | Résolus | Durée moyenne (h) | Dans l'objectif |
|---|---|---|---|---|
| P1 | 15 | 15 | 3,2 | 80,0 % |
| P2 | 65 | 65 | 6,9 | 75,4 % |
| P3 | 152 | 148 | 18,0 | 77,7 % |
| P4 | 104 | 100 | 54,7 | 74,0 % |

### Par service, par nombre d'incidents décroissant

| Service | Incidents | Dont P1 | Durée moyenne (h) |
|---|---|---|---|
| paiement | 88 | 12 | 22,2 |
| commandes | 64 | 0 | 27,9 |
| catalogue | 56 | 1 | 22,9 |
| recherche | 50 | 1 | 25,1 |
| authentification | 48 | 1 | 29,6 |
| notifications | 30 | 0 | 37,1 |

### Cinq résolutions les plus longues

| Identifiant | Service | Sévérité | Titre | Durée (h) |
|---|---|---|---|---|
| INC-2610-0162 | notifications | P4 | Régression après mise en production | 204,2 |
| INC-2610-0069 | commandes | P4 | Certificat TLS expiré | 175,0 |
| INC-2610-0040 | catalogue | P4 | Pic de charge non absorbé | 163,3 |
| INC-2610-0132 | paiement | P4 | Régression après mise en production | 158,4 |
| INC-2610-0205 | authentification | P4 | Régression après mise en production | 148,0 |

### Incidents en cours

| Identifiant | Ouverture | Service | Sévérité | Titre |
|---|---|---|---|---|
| INC-2610-0328 | 2026-10-31T08:30 | commandes | P3 | Régression après mise en production |
| INC-2610-0329 | 2026-10-31T08:33 | paiement | P4 | Réplication en retard |
| INC-2610-0330 | 2026-10-31T14:39 | paiement | P3 | Saturation du pool de connexions |
| INC-2610-0331 | 2026-10-31T15:39 | catalogue | P4 | Perte de paquets entre zones |
| INC-2610-0332 | 2026-10-31T15:45 | paiement | P4 | Régression après mise en production |
| INC-2610-0333 | 2026-10-31T20:19 | catalogue | P4 | Migration interrompue |
| INC-2610-0334 | 2026-10-31T22:04 | paiement | P3 | Perte de paquets entre zones |
| INC-2610-0335 | 2026-10-31T22:26 | recherche | P3 | Verrou bloquant sur une table |
