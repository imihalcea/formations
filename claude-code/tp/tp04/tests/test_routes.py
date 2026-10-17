import pytest


@pytest.fixture
def atlas(client):
    response = client.post("/rooms", json={"name": "Atlas", "capacity": 8, "hourly_rate": 4000})
    return response.json()


def book(client, room_id, starts_at, ends_at, title="Meeting"):
    return client.post(
        "/bookings",
        json={"room_id": room_id, "title": title, "starts_at": starts_at, "ends_at": ends_at},
    )


def test_create_a_room(client):
    response = client.post("/rooms", json={"name": "Atlas", "capacity": 8, "hourly_rate": 4000})
    assert response.status_code == 201
    assert response.json() == {"id": 1, "name": "Atlas", "capacity": 8, "hourly_rate": 4000}


def test_a_duplicate_room_is_rejected(client, atlas):
    response = client.post("/rooms", json={"name": "Atlas", "capacity": 4, "hourly_rate": 1000})
    assert response.status_code == 409
    assert "Atlas" in response.json()["error"]


def test_list_rooms(client, atlas):
    assert client.get("/rooms").json() == [atlas]


def test_available_rooms(client, atlas):
    book(client, atlas["id"], "2027-01-11T09:00", "2027-01-11T10:00")
    params = {"starts_at": "2027-01-11T10:00", "ends_at": "2027-01-11T11:00"}
    assert client.get("/rooms/available", params=params).json() == [atlas]


def test_available_rooms_with_a_minimum_capacity(client, atlas):
    client.post("/rooms", json={"name": "Cape", "capacity": 4, "hourly_rate": 2500})
    params = {"starts_at": "2027-01-11T10:00", "ends_at": "2027-01-11T11:00", "min_capacity": 5}
    assert client.get("/rooms/available", params=params).json() == [atlas]


def test_available_rooms_at_the_exact_capacity(client, atlas):
    params = {"starts_at": "2027-01-11T10:00", "ends_at": "2027-01-11T11:00", "min_capacity": 8}
    assert client.get("/rooms/available", params=params).json() == [atlas]


def test_book_a_room(client, atlas):
    response = book(client, atlas["id"], "2027-01-11T09:00", "2027-01-11T11:00")
    assert response.status_code == 201
    assert response.json()["amount"] == 8000


def test_book_an_unknown_room(client):
    response = book(client, 42, "2027-01-11T09:00", "2027-01-11T10:00")
    assert response.status_code == 404


def test_book_a_taken_slot(client, atlas):
    book(client, atlas["id"], "2027-01-11T09:00", "2027-01-11T10:00", title="Sync")
    response = book(client, atlas["id"], "2027-01-11T09:30", "2027-01-11T10:30")
    assert response.status_code == 409
    assert "Sync" in response.json()["error"]


def test_a_date_with_a_time_zone_is_rejected(client, atlas):
    response = book(client, atlas["id"], "2027-01-11T09:00Z", "2027-01-11T10:00Z")
    assert response.status_code == 422


def test_cancel_a_booking(client, atlas):
    booking = book(client, atlas["id"], "2027-01-11T09:00", "2027-01-11T10:00").json()
    assert client.delete(f"/bookings/{booking['id']}").status_code == 204
    assert client.delete(f"/bookings/{booking['id']}").status_code == 404


def test_schedule_of_the_day(client, atlas):
    book(client, atlas["id"], "2027-01-11T14:00", "2027-01-11T15:00", title="Afternoon")
    book(client, atlas["id"], "2027-01-11T09:00", "2027-01-11T10:00", title="Morning")
    schedule = client.get("/schedule", params={"day": "2027-01-11"}).json()
    assert [b["title"] for b in schedule] == ["Morning", "Afternoon"]


def test_schedule_as_csv(client, atlas):
    response = client.get("/schedule.csv", params={"day": "2027-01-11"})
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
