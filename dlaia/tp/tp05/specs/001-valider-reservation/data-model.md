# Data Model: Valider une demande de réservation

Les entités existent déjà dans `bookit/domain/models.py` ; la fonctionnalité n'en ajoute aucune.

## Entités

| Entité | Champs | Rôle |
|--------|--------|------|
| `Booking` | `start`, `end` | demande ou réservation confirmée, créneau demi-ouvert `[start, end[` |
| `Resource` | `name`, `bookings` | ressource visée et ses réservations confirmées |
| `InvalidBooking` | `code`, `message` | décision de refus, `code` parmi `duration`, `hours`, `lead_time`, `horizon`, `overlap` |

## Décision

`validate_booking(booking, resource, now)` rend `None` quand la demande est acceptée, `InvalidBooking(code)` quand une règle est enfreinte. Une seule valeur est rendue (REG-06).

## Règles, dans l'ordre d'évaluation

| Exigence | Condition de refus | Code |
|----------|--------------------|------|
| REG-01 | durée inférieure à 30 minutes ou supérieure à 4 heures | `duration` |
| REG-02 | hors du lundi au vendredi, de 8h00 à 20h00 | `hours` |
| REG-03 | début avant `now` plus 2 heures | `lead_time` |
| REG-04 | début plus de 60 jours après `now` | `horizon` |
| REG-05 | chevauchement d'une réservation confirmée de la ressource | `overlap` |

REG-07 n'ajoute aucune règle : la décision dépend de `booking`, `resource` et `now`.
