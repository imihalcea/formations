# Research: Valider une demande de réservation

## Où s'écrit la règle

- **Decision**: `bookit/domain/validate_booking.py`, la fonction existante.
- **Rationale**: principe IV de la constitution, une règle métier vit dans la couche domaine ; la signature `validate_booking(booking, resource, now)` est déjà celle de l'application.
- **Alternatives considered**: un module par règle, écarté, cinq règles courtes tiennent dans un fichier ; une règle dans `request_booking.py`, écartée, elle sortirait du domaine.

## Comment les règles s'enchaînent

- **Decision**: une fonction interne par règle, appelées dans l'ordre REG-01 à REG-05 ; la première qui rend un `InvalidBooking` met fin à l'enchaînement.
- **Rationale**: REG-06 demande un seul code, celui de la première règle enfreinte dans l'ordre des règles.
- **Alternatives considered**: collecter tous les refus puis en choisir un, écarté, il évalue des règles inutiles.

## Comment les règles se testent

- **Decision**: pytest-bdd, un test par scénario de `valider-reservation.feature`, instant courant fixé dans l'étape `Soit`.
- **Rationale**: la spécification et le fichier `.feature` portent les mêmes dix-neuf scénarios ; pytest-bdd est déjà dans le groupe `dev`.
- **Alternatives considered**: des tests pytest écrits à la main, écartés, ils dupliqueraient les scénarios ; des tests par l'API, écartés, ils sortiraient du domaine.

## Bornes et instant courant

- **Decision**: le créneau est demi-ouvert, la valeur pile d'une borne est acceptée (réponses de `clarify`) ; `now` est le seul instant courant.
- **Rationale**: REG-05 accepte deux créneaux jointifs ; REG-07 demande une décision reproductible.
- **Alternatives considered**: lire l'heure du système dans le domaine, écarté par le principe II.

## Contrat d'API

- **Decision**: aucun contrat, aucun fichier dans `contracts/`.
- **Rationale**: l'API et le stockage ne changent pas (SC-004) ; le code de refus traverse déjà l'API en 422.
- **Alternatives considered**: décrire l'API existante dans `contracts/`, écarté, elle n'est pas modifiée.
