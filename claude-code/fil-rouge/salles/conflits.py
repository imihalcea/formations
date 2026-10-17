from collections.abc import Iterable
from datetime import datetime

from salles.modeles import ErreurReservation, Reservation


def se_chevauchent(debut_a: datetime, fin_a: datetime, debut_b: datetime, fin_b: datetime) -> bool:
    """Deux créneaux qui se touchent sans se recouvrir ne se chevauchent pas."""
    return debut_a < fin_b and debut_b < fin_a


def valider_creneau(debut: datetime, fin: datetime) -> None:
    if debut.tzinfo is not None or fin.tzinfo is not None:
        raise ErreurReservation("Les dates doivent être sans fuseau horaire")
    if fin <= debut:
        raise ErreurReservation("La fin doit suivre le début")
    if fin.date() != debut.date():
        raise ErreurReservation("Une réservation tient dans une seule journée")


def verifier_disponibilite(
    existantes: Iterable[Reservation], debut: datetime, fin: datetime
) -> None:
    for reservation in existantes:
        if se_chevauchent(reservation.debut, reservation.fin, debut, fin):
            raise ErreurReservation(
                f"Créneau déjà réservé par « {reservation.titre} »"
                f" de {reservation.debut:%H:%M} à {reservation.fin:%H:%M}"
            )
