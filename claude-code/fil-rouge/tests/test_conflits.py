from datetime import UTC, datetime

import pytest

from salles.conflits import se_chevauchent, valider_creneau, verifier_disponibilite
from salles.modeles import ErreurReservation, Reservation


def h(heure: str) -> datetime:
    return datetime.fromisoformat(f"2027-01-11T{heure}")


def reservation(debut: str, fin: str) -> Reservation:
    return Reservation(1, 1, "Réunion", h(debut), h(fin), False, 0)


@pytest.mark.parametrize(
    ("a", "b", "attendu"),
    [
        (("09:00", "10:00"), ("09:30", "10:30"), True),
        (("09:00", "10:00"), ("08:00", "09:30"), True),
        (("09:00", "12:00"), ("10:00", "11:00"), True),
        (("10:00", "11:00"), ("09:00", "12:00"), True),
        (("09:00", "10:00"), ("09:00", "10:00"), True),
        (("09:00", "10:00"), ("10:00", "11:00"), False),
        (("10:00", "11:00"), ("09:00", "10:00"), False),
        (("09:00", "10:00"), ("14:00", "15:00"), False),
    ],
)
def test_se_chevauchent(a, b, attendu):
    assert se_chevauchent(h(a[0]), h(a[1]), h(b[0]), h(b[1])) is attendu


def test_un_creneau_valide_est_accepte():
    valider_creneau(h("09:00"), h("10:00"))


def test_la_fin_doit_suivre_le_debut():
    with pytest.raises(ErreurReservation, match="fin"):
        valider_creneau(h("10:00"), h("10:00"))


def test_un_creneau_tient_dans_une_journee():
    with pytest.raises(ErreurReservation, match="journée"):
        valider_creneau(h("18:00"), datetime(2027, 1, 12, 9, 0))


def test_un_creneau_avec_fuseau_est_refuse():
    with pytest.raises(ErreurReservation, match="fuseau"):
        valider_creneau(h("09:00").replace(tzinfo=UTC), h("10:00"))


def test_verifier_disponibilite_accepte_un_creneau_libre():
    verifier_disponibilite([reservation("09:00", "10:00")], h("10:00"), h("11:00"))


def test_verifier_disponibilite_refuse_un_creneau_occupe():
    with pytest.raises(ErreurReservation, match="09:00 à 10:00"):
        verifier_disponibilite([reservation("09:00", "10:00")], h("09:30"), h("11:00"))
