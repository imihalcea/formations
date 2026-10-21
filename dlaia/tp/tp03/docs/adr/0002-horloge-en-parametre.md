# 2. L'horloge est un paramètre

Contexte : deux règles dépendent de l'instant courant (préavis, horizon) ;
un test qui lit l'horloge système change de résultat d'un jour à l'autre.
Décision : validate_booking reçoit l'instant courant en paramètre now ;
l'infrastructure fournit SystemClock, qui réalise le port Clock.
Statut : acceptée
Conséquences : un test fixe l'instant courant et reste reproductible ;
un appel à datetime.now() dans bookit/domain/ est un bogue.
