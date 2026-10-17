"""Fills the database with sample data: uv run python -m rooms.seed"""

from datetime import datetime

from rooms import repository
from rooms.db import connect, db_path
from rooms.pricing import compute_price

ROOMS = [
    ("Atlas", 8, 4000),
    ("Boreal", 20, 9000),
    ("Cape", 4, 2500),
]

BOOKINGS = [
    ("Atlas", "Team sync", "2027-01-11T09:00", "2027-01-11T10:00", True),
    ("Atlas", "Interview", "2027-01-11T14:00", "2027-01-11T15:30", False),
    ("Boreal", "Training", "2027-01-11T09:00", "2027-01-11T17:30", False),
    ("Cape", "Code review", "2027-01-11T09:00", "2027-01-11T10:45", True),
    ("Cape", "Budget review", "2027-01-11T14:00", "2027-01-11T16:15", True),
    ("Cape", "Steering committee", "2027-01-11T18:00", "2027-01-11T20:00", False),
    ("Boreal", "Workshop", "2027-01-16T10:00", "2027-01-16T12:00", False),
]


def seed() -> None:
    connection = connect(db_path())
    if repository.list_rooms(connection):
        print("The database already has rooms, nothing added.")
        return
    rooms = {name: repository.add_room(connection, name, cap, rate) for name, cap, rate in ROOMS}
    for name, title, starts_at, ends_at, internal in BOOKINGS:
        room = rooms[name]
        starts_at, ends_at = datetime.fromisoformat(starts_at), datetime.fromisoformat(ends_at)
        amount = compute_price(room, starts_at, ends_at, internal)
        repository.add_booking(connection, room.id, title, starts_at, ends_at, internal, amount)
    print(f"{len(ROOMS)} rooms and {len(BOOKINGS)} bookings added.")


if __name__ == "__main__":
    seed()
