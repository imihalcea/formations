# 2. API HTTP avec FastAPI

Contexte : un client doit savoir quelle règle a refusé sa demande ;
la documentation de l'API ne doit pas s'écrire à la main.
Décision : bookit s'expose par une API HTTP écrite avec FastAPI, qui sert
la documentation interactive sur /docs ; un refus répond 422 avec le code
de la règle enfreinte dans le corps.
Statut : acceptée
Conséquences : le domaine rend InvalidBooking(code), api.py le traduit
en 422 ; une exception levée par le domaine est un bogue, jamais un refus.
