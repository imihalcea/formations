import csv
import io
from datetime import datetime

from rooms.export import duration_minutes
from rooms.models import Booking


def booking(starts_at, ends_at):
    return Booking(
        id=1,
        room_id=1,
        title="Meeting",
        starts_at=datetime.fromisoformat(starts_at),
        ends_at=datetime.fromisoformat(ends_at),
        internal=False,
        amount=0,
    )


def test_duration_in_minutes():
    assert duration_minutes(booking("2027-01-11T09:00", "2027-01-11T10:45")) == 105


def test_duration_of_a_full_day():
    assert duration_minutes(booking("2027-01-11T09:00", "2027-01-11T17:30")) == 510


def test_schedule_csv_has_the_duration(client):
    client.post("/rooms", json={"name": "Atlas", "capacity": 8, "hourly_rate": 4000})
    client.post(
        "/bookings",
        json={
            "room_id": 1,
            "title": "Team sync",
            "starts_at": "2027-01-11T09:00",
            "ends_at": "2027-01-11T10:00",
        },
    )
    response = client.get("/schedule.csv", params={"day": "2027-01-11"})
    rows = list(csv.reader(io.StringIO(response.text)))
    assert rows[0] == ["room", "title", "starts_at", "ends_at", "duration_minutes", "amount"]
    assert rows[1][4] == "60"
