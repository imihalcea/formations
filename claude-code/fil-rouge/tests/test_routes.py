import pytest


@pytest.fixture
def atlas(client):
    reponse = client.post("/salles", json={"nom": "Atlas", "capacite": 8, "tarif_horaire": 4000})
    return reponse.json()


def reserver(client, salle_id, debut, fin, titre="Réunion"):
    return client.post(
        "/reservations",
        json={"salle_id": salle_id, "titre": titre, "debut": debut, "fin": fin},
    )


def test_creer_une_salle(client):
    reponse = client.post("/salles", json={"nom": "Atlas", "capacite": 8, "tarif_horaire": 4000})
    assert reponse.status_code == 201
    assert reponse.json() == {"id": 1, "nom": "Atlas", "capacite": 8, "tarif_horaire": 4000}


def test_une_salle_en_double_est_refusee(client, atlas):
    reponse = client.post("/salles", json={"nom": "Atlas", "capacite": 4, "tarif_horaire": 1000})
    assert reponse.status_code == 409
    assert "Atlas" in reponse.json()["erreur"]


def test_lister_les_salles(client, atlas):
    assert client.get("/salles").json() == [atlas]


def test_salles_disponibles(client, atlas):
    reserver(client, atlas["id"], "2027-01-11T09:00", "2027-01-11T10:00")
    params = {"debut": "2027-01-11T10:00", "fin": "2027-01-11T11:00"}
    assert client.get("/salles/disponibles", params=params).json() == [atlas]


def test_reserver_une_salle(client, atlas):
    reponse = reserver(client, atlas["id"], "2027-01-11T09:00", "2027-01-11T11:00")
    assert reponse.status_code == 201
    assert reponse.json()["montant"] == 8000


def test_reserver_une_salle_inconnue(client):
    reponse = reserver(client, 42, "2027-01-11T09:00", "2027-01-11T10:00")
    assert reponse.status_code == 404


def test_reserver_un_creneau_occupe(client, atlas):
    reserver(client, atlas["id"], "2027-01-11T09:00", "2027-01-11T10:00", titre="Point")
    reponse = reserver(client, atlas["id"], "2027-01-11T09:30", "2027-01-11T10:30")
    assert reponse.status_code == 409
    assert "Point" in reponse.json()["erreur"]


def test_une_date_avec_fuseau_est_refusee(client, atlas):
    reponse = reserver(client, atlas["id"], "2027-01-11T09:00Z", "2027-01-11T10:00Z")
    assert reponse.status_code == 422


def test_annuler_une_reservation(client, atlas):
    reservation = reserver(client, atlas["id"], "2027-01-11T09:00", "2027-01-11T10:00").json()
    assert client.delete(f"/reservations/{reservation['id']}").status_code == 204
    assert client.delete(f"/reservations/{reservation['id']}").status_code == 404


def test_planning_du_jour(client, atlas):
    reserver(client, atlas["id"], "2027-01-11T14:00", "2027-01-11T15:00", titre="Après-midi")
    reserver(client, atlas["id"], "2027-01-11T09:00", "2027-01-11T10:00", titre="Matin")
    planning = client.get("/planning", params={"jour": "2027-01-11"}).json()
    assert [r["titre"] for r in planning] == ["Matin", "Après-midi"]


def test_planning_en_csv(client, atlas):
    reponse = client.get("/planning.csv", params={"jour": "2027-01-11"})
    assert reponse.status_code == 200
    assert reponse.headers["content-type"].startswith("text/csv")
