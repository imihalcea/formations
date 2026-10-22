# 3. Stockage SQLite

Contexte : bookit tourne en une seule instance, sans serveur de base
à administrer ; le stockage doit rester remplaçable.
Décision : les réservations sont écrites dans une base SQLite embarquée,
atteinte par le port BookingRepository, réalisé par SqliteBookingRepository.
Statut : acceptée
Conséquences : le domaine ne connaît pas SQL ; le chemin de la base vient
de la variable d'environnement BOOKIT_DB (défaut bookit.db), ce qui donne
aux tests une base temporaire.
