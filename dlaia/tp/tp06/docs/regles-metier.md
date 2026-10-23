# Règles métier de bookit

bookit enregistre des réservations de ressources : salle, équipement ou personne. Une demande de réservation vise une ressource, avec un début et une fin. Elle est acceptée quand elle respecte les cinq règles ci-dessous. Sinon elle est refusée avec le code de la règle enfreinte.

- REG-01 : la durée d'une réservation est comprise entre 30 minutes et 4 heures.
- REG-02 : une réservation a lieu un jour de semaine, du lundi au vendredi, entre 8h et 20h.
- REG-03 : une réservation commence au moins 2 heures après l'instant courant.
- REG-04 : une réservation commence au plus 60 jours après l'instant courant.
- REG-05 : deux réservations d'une même ressource ne se chevauchent pas ; un créneau va de son début inclus à sa fin exclue, deux créneaux jointifs ne se chevauchent pas.

Codes de refus, un par règle : `duration`, `hours`, `lead_time`, `horizon`, `overlap`.
