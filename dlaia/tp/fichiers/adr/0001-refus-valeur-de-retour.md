# 1. Un refus est une valeur de retour

Contexte : l'API répond 422 avec le code de la règle enfreinte ;
une exception ne porte pas de code et interrompt l'appelant.
Décision : validate_booking rend InvalidBooking(code) quand une règle
est enfreinte, None sinon ; aucune exception pour refuser une demande.
Statut : acceptée
Conséquences : l'application lit la valeur rendue et décide d'enregistrer ;
une exception levée par le domaine est un bogue, jamais un refus.
