import re
from datetime import datetime

import pytest
from pytest_bdd import given, parsers, scenario, then, when

from bookit.domain.models import Booking, Resource
from bookit.domain.validate_booking import validate_booking

FEATURE = "../specs/001-valider-reservation/valider-reservation.feature"
MOIS = (
    "janvier février mars avril mai juin juillet août septembre octobre novembre décembre".split()
)


def lire_instant(texte):
    j, m, a, h, mn = re.search(r"(\d+)(?:er)? (\w+) (\d{4}) à (\d+)h(\d+)", texte).groups()
    return datetime(int(a), MOIS.index(m) + 1, int(j), int(h), int(mn))


def lire_creneau(texte):
    j, m, a, h1, m1, h2, m2 = re.search(
        r"(\d+)(?:er)? (\w+) (\d{4}) de (\d+)h(\d+) à (\d+)h(\d+)", texte
    ).groups()
    mois = MOIS.index(m) + 1
    return Booking(
        datetime(int(a), mois, int(j), int(h1), int(m1)),
        datetime(int(a), mois, int(j), int(h2), int(m2)),
    )


@pytest.fixture
def salles():
    return {"A": Resource("salle A"), "B": Resource("salle B")}


@given(parsers.parse("l'instant courant fixé au {instant}"), target_fixture="now")
def instant_courant(instant):
    return lire_instant(instant)


@when(parsers.parse("une demande vise la salle {nom} le {creneau}"), target_fixture="resultat")
def demande(nom, creneau, salles, now):
    return validate_booking(lire_creneau(creneau), salles[nom], now)


@then("la demande est acceptée")
def acceptee(resultat):
    assert resultat is None


@given(parsers.parse("la salle A réservée le {creneau}"))
def salle_reservee(salles, creneau):
    salles["A"].bookings.append(lire_creneau(creneau))


@when(
    parsers.parse("une demande vise la salle {nom} le {creneau}, jugée deux fois"),
    target_fixture="resultat",
)
def demande_deux_fois(nom, creneau, salles, now):
    booking = lire_creneau(creneau)
    return [validate_booking(booking, salles[nom], now) for _ in range(2)]


@then(parsers.parse("la demande est refusée avec le code {code}"))
def refusee(resultat, code):
    assert resultat is not None
    assert resultat.code == code


@then("la demande est acceptée les deux fois")
def acceptee_deux_fois(resultat):
    assert resultat == [None, None]


@scenario(FEATURE, "REG-01, durée de 30 minutes pile")
def test_reg01_30_minutes(): ...


@scenario(FEATURE, "REG-01, durée de 29 minutes")
def test_reg01_29_minutes(): ...


@scenario(FEATURE, "REG-01, durée de 4 heures pile")
def test_reg01_4_h(): ...


@scenario(FEATURE, "REG-01, durée de 4 heures et 1 minute")
def test_reg01_4_h_01(): ...


@scenario(FEATURE, "REG-02, début à 8h00 pile")
def test_reg02_8h00(): ...


@scenario(FEATURE, "REG-02, début à 7h59")
def test_reg02_7h59(): ...


@scenario(FEATURE, "REG-02, fin à 20h00 pile")
def test_reg02_20h00(): ...


@scenario(FEATURE, "REG-02, fin à 20h01")
def test_reg02_20h01(): ...


@scenario(FEATURE, "REG-02, samedi")
def test_reg02_samedi(): ...


@scenario(FEATURE, "REG-02, dimanche")
def test_reg02_dimanche(): ...


@scenario(FEATURE, "REG-03, préavis de 2 heures pile")
def test_reg03_2_h(): ...


@scenario(FEATURE, "REG-03, préavis de 1 heure 59")
def test_reg03_1_h_59(): ...


@scenario(FEATURE, "REG-04, 59 jours à l'avance")
def test_reg04_59_jours(): ...


@scenario(FEATURE, "REG-04, 62 jours à l'avance")
def test_reg04_62_jours(): ...


@scenario(FEATURE, "REG-04, 60 jours pile")
def test_reg04_60_jours(): ...


@scenario(FEATURE, "REG-04, 60 jours et 1 minute")
def test_reg04_60_jours_1_min(): ...


@scenario(FEATURE, "REG-05, créneau jointif")
def test_reg05_jointif(): ...


@scenario(FEATURE, "REG-05, créneau chevauchant")
def test_reg05_chevauchant(): ...


@scenario(FEATURE, "REG-05, même créneau sur une autre ressource")
def test_reg05_autre_ressource(): ...


@scenario(FEATURE, "REG-05, créneau jointif avant")
def test_reg05_jointif_avant(): ...


@scenario(FEATURE, "REG-05, créneau entièrement avant")
def test_reg05_avant(): ...


@scenario(FEATURE, "REG-05, créneau entièrement après")
def test_reg05_apres(): ...


@scenario(FEATURE, "REG-06, durée et jour enfreints")
def test_reg06_duree_et_jour(): ...


@scenario(FEATURE, "REG-06, jour et horizon enfreints")
def test_reg06_jour_et_horizon(): ...


@scenario(FEATURE, "REG-07, même demande, même instant, même décision")
def test_reg07_meme_decision(): ...
