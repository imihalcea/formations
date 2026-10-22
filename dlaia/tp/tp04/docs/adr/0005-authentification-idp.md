# 5. Authentification par fournisseur d'identité

Contexte : l'organisation a déjà un fournisseur d'identité ;
bookit ne doit gérer ni mots de passe ni comptes.
Décision : l'authentification est déléguée au fournisseur d'identité
par OpenID Connect ; l'infrastructure vérifie l'ID token reçu.
Statut : acceptée
Conséquences : aucun mot de passe ni table d'utilisateurs dans bookit ;
le demandeur arrive au domaine comme un identifiant, valeur d'entrée ;
à construire : l'adaptateur s'écrit après validate_booking.
