# 4. Déploiement en conteneur

Contexte : la même image doit tourner sur le poste du développeur
et en production ; la base doit survivre au redémarrage du conteneur.
Décision : une image de conteneur unique, construite avec uv ; la base
SQLite est sur un volume ; toute configuration se lit dans l'environnement.
Statut : acceptée
Conséquences : BOOKIT_DB est le premier cas de configuration par
l'environnement ; aucun chemin absolu ni secret dans bookit/ ;
à construire : le Dockerfile s'écrit après validate_booking.
