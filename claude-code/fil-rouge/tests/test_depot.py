from datetime import date, datetime

import pytest

from salles import depot
from salles.modeles import ErreurReservation


def test_ajouter_puis_lister_les_salles_par_nom(connexion):
    depot.ajouter_salle(connexion, "Cap", 4, 2500)
    depot.ajouter_salle(connexion, "Atlas", 8, 4000)
    assert [salle.nom for salle in depot.lister_salles(connexion)] == ["Atlas", "Cap"]


def test_deux_salles_ne_portent_pas_le_meme_nom(connexion):
    depot.ajouter_salle(connexion, "Atlas", 8, 4000)
    with pytest.raises(ErreurReservation, match="Atlas"):
        depot.ajouter_salle(connexion, "Atlas", 10, 5000)


def test_trouver_une_salle_absente(connexion):
    assert depot.trouver_salle(connexion, 42) is None


def test_les_reservations_sont_relues_avec_leurs_dates(connexion):
    salle = depot.ajouter_salle(connexion, "Atlas", 8, 4000)
    debut, fin = datetime(2027, 1, 11, 9, 0), datetime(2027, 1, 11, 10, 0)
    depot.ajouter_reservation(connexion, salle.id, "Point", debut, fin, True, 2000)

    (relue,) = depot.reservations_de_salle(connexion, salle.id, date(2027, 1, 11))
    assert (relue.debut, relue.fin, relue.interne, relue.montant) == (debut, fin, True, 2000)


def test_reservations_du_jour_ignore_les_autres_jours(connexion):
    salle = depot.ajouter_salle(connexion, "Atlas", 8, 4000)
    for jour in (10, 11, 12):
        debut = datetime(2027, 1, jour, 9, 0)
        depot.ajouter_reservation(
            connexion, salle.id, f"Le {jour}", debut, debut.replace(hour=10), False, 4000
        )
    assert [r.titre for r in depot.reservations_du_jour(connexion, date(2027, 1, 11))] == ["Le 11"]


def test_supprimer_une_reservation(connexion):
    salle = depot.ajouter_salle(connexion, "Atlas", 8, 4000)
    debut = datetime(2027, 1, 11, 9, 0)
    reservation = depot.ajouter_reservation(
        connexion, salle.id, "Point", debut, debut.replace(hour=10), False, 4000
    )
    assert depot.supprimer_reservation(connexion, reservation.id) is True
    assert depot.supprimer_reservation(connexion, reservation.id) is False
