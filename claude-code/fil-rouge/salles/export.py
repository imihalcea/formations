import csv
import io

from salles.modeles import Reservation, Salle


def planning_csv(reservations: list[Reservation], salles: list[Salle]) -> str:
    noms = {salle.id: salle.nom for salle in salles}
    sortie = io.StringIO()
    ecrivain = csv.writer(sortie)
    ecrivain.writerow(["salle", "titre", "debut", "fin", "montant"])
    for reservation in reservations:
        ecrivain.writerow(
            [
                noms[reservation.salle_id],
                reservation.titre,
                reservation.debut.isoformat(),
                reservation.fin.isoformat(),
                reservation.montant,
            ]
        )
    return sortie.getvalue()
