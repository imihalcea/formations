# Mutation testing de `bookit/domain/validate_booking.py`

## Passe 1

Mutants : 192 ; filtrés : 66 ; tués : 119 ; survivants : 7

Les 66 mutants filtrés remplacent le `|` des annotations de retour (`InvalidBooking | None`) par un autre opérateur. Python 3.14 n'évalue pas les annotations : aucun test ne peut les tuer.

| Survivant (fonction, diff) | Sorte : trou dans les tests ou mutant équivalent | Action |
|---|---|---|
| `_check_hours` : `weekday() >= 5` devient `weekday() == 5` | trou dans les tests : le dimanche change la décision | scénario `REG-02, dimanche` |
| `_check_horizon` : `start > now + MAX_HORIZON` devient `>=` | trou dans les tests : 60 jours pile n'est jamais jugé | scénario `REG-04, 60 jours pile` |
| `_check_horizon` : `days=60` devient `days=61` | trou dans les tests : 60 jours et 1 minute n'est jamais jugé | scénario `REG-04, 60 jours et 1 minute` |
| `_check_overlap` : `booking.start < confirmed.end` devient `!=` | trou dans les tests : une demande entièrement après la réservation confirmée | scénario `REG-05, créneau entièrement après` |
| `_check_overlap` : `confirmed.start < booking.end` devient `!=` | trou dans les tests : une demande entièrement avant | scénario `REG-05, créneau entièrement avant` |
| `_check_overlap` : `confirmed.start < booking.end` devient `is not` | trou dans les tests : le cas du mutant précédent | scénario `REG-05, créneau entièrement avant` |
| `_check_overlap` : `confirmed.start < booking.end` devient `<=` | trou dans les tests : une demande qui finit au début de la réservation confirmée | scénario `REG-05, créneau jointif avant` |

## Passe 2, après les scénarios ajoutés

Mutants : 192 ; filtrés : 66 ; tués : 126 ; survivants : 0

### Survivants gardés et raison

Aucun : chaque survivant de la passe 1 était un trou dans les tests, comblé par un scénario dans `spec.md`, `valider-reservation.feature` et `tests/test_valider_reservation.py`.
