# 1. Architecture hexagonale

Contexte : les règles métier doivent se tester sans serveur ni base ;
l'API et le stockage sont amenés à changer.
Décision : trois couches, domaine, application, infrastructure ; les dépendances
pointent vers le domaine, qui déclare ses ports et ignore les adaptateurs.
Statut : acceptée
Conséquences : aucun import de bookit.infrastructure dans bookit/domain/ ;
l'horloge est un port, validate_booking reçoit l'instant courant en
paramètre now ; un refus est une valeur rendue, l'adaptateur HTTP la traduit.
