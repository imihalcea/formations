from datetime import timedelta

from salles.modeles import ErreurReservation


def calculer_tarif(salle, debut, fin, interne=False):
    # calcul du prix en centimes
    minutes = int((fin - debut).total_seconds() // 60)
    if minutes <= 0:
        raise ErreurReservation("Durée de réservation invalide")
    if minutes >= 480:
        # forfait journée = 6 heures
        if interne:
            prix = salle.tarif_horaire * 6 * 0.5
        else:
            if debut.weekday() >= 5:
                prix = salle.tarif_horaire * 6 * 1.5
            else:
                prix = salle.tarif_horaire * 6
    else:
        prix = 0
        t = debut
        while t < fin:
            if t.hour >= 19:
                prix = prix + salle.tarif_horaire / 60 * 1.25
            else:
                prix = prix + salle.tarif_horaire / 60
            t = t + timedelta(minutes=1)
        if minutes >= 240:
            prix = prix * 0.9
        if interne:
            prix = prix * 0.5
        else:
            if debut.weekday() == 5 or debut.weekday() == 6:
                prix = prix * 1.5
    return int(round(prix))
