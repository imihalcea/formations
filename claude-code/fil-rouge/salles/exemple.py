"""Remplit la base avec des données d'exemple : uv run python -m salles.exemple"""

from datetime import datetime

from salles import depot
from salles.db import chemin_base, connecter
from salles.tarifs import calculer_tarif

SALLES = [
    ("Atlas", 8, 4000),
    ("Boréal", 20, 9000),
    ("Cap", 4, 2500),
]

RESERVATIONS = [
    ("Atlas", "Point d'équipe", "2027-01-11T09:00", "2027-01-11T10:00", True),
    ("Atlas", "Entretien", "2027-01-11T14:00", "2027-01-11T15:30", False),
    ("Boréal", "Formation", "2027-01-11T09:00", "2027-01-11T17:30", False),
    ("Cap", "Revue de code", "2027-01-11T09:00", "2027-01-11T10:45", True),
    ("Cap", "Point budget", "2027-01-11T14:00", "2027-01-11T16:15", True),
    ("Cap", "Comité", "2027-01-11T18:00", "2027-01-11T20:00", False),
    ("Boréal", "Atelier", "2027-01-16T10:00", "2027-01-16T12:00", False),
]


def remplir() -> None:
    connexion = connecter(chemin_base())
    if depot.lister_salles(connexion):
        print("La base contient déjà des salles, rien n'est ajouté.")
        return
    salles = {nom: depot.ajouter_salle(connexion, nom, cap, tarif) for nom, cap, tarif in SALLES}
    for nom, titre, debut, fin, interne in RESERVATIONS:
        salle = salles[nom]
        debut, fin = datetime.fromisoformat(debut), datetime.fromisoformat(fin)
        montant = calculer_tarif(salle, debut, fin, interne)
        depot.ajouter_reservation(connexion, salle.id, titre, debut, fin, interne, montant)
    print(f"{len(SALLES)} salles et {len(RESERVATIONS)} réservations ajoutées.")


if __name__ == "__main__":
    remplir()
