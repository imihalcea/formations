import sqlite3
from datetime import date, datetime, timedelta

from rooms.models import Booking, BookingError, Room


def _room(row: sqlite3.Row) -> Room:
    return Room(
        id=row["id"],
        name=row["name"],
        capacity=row["capacity"],
        hourly_rate=row["hourly_rate"],
        equipment=row["equipment"],
    )


def _booking(row: sqlite3.Row) -> Booking:
    return Booking(
        id=row["id"],
        room_id=row["room_id"],
        title=row["title"],
        starts_at=datetime.fromisoformat(row["starts_at"]),
        ends_at=datetime.fromisoformat(row["ends_at"]),
        internal=bool(row["internal"]),
        amount=row["amount"],
    )


def add_room(
    connection: sqlite3.Connection,
    name: str,
    capacity: int,
    hourly_rate: int,
    equipment: str = "",
) -> Room:
    try:
        with connection:
            cursor = connection.execute(
                "INSERT INTO rooms (name, capacity, hourly_rate, equipment) VALUES (?, ?, ?, ?)",
                (name, capacity, hourly_rate, equipment),
            )
    except sqlite3.IntegrityError as error:
        raise BookingError(f"A room named {name} already exists") from error
    return Room(cursor.lastrowid, name, capacity, hourly_rate, equipment)


def list_rooms(connection: sqlite3.Connection) -> list[Room]:
    rows = connection.execute("SELECT * FROM rooms ORDER BY name").fetchall()
    return [_room(row) for row in rows]


def find_room(connection: sqlite3.Connection, room_id: int) -> Room | None:
    row = connection.execute("SELECT * FROM rooms WHERE id = ?", (room_id,)).fetchone()
    return _room(row) if row else None


def bookings_for_room(connection: sqlite3.Connection, room_id: int, day: date) -> list[Booking]:
    rows = connection.execute(
        "SELECT * FROM bookings WHERE room_id = ? AND starts_at >= ? AND starts_at < ?"
        " ORDER BY starts_at",
        (room_id, day.isoformat(), (day + timedelta(days=1)).isoformat()),
    ).fetchall()
    return [_booking(row) for row in rows]


def bookings_for_day(connection: sqlite3.Connection, day: date) -> list[Booking]:
    rows = connection.execute(
        "SELECT * FROM bookings WHERE starts_at >= ? AND starts_at < ? ORDER BY starts_at, room_id",
        (day.isoformat(), (day + timedelta(days=1)).isoformat()),
    ).fetchall()
    return [_booking(row) for row in rows]


def add_booking(
    connection: sqlite3.Connection,
    room_id: int,
    title: str,
    starts_at: datetime,
    ends_at: datetime,
    internal: bool,
    amount: int,
) -> Booking:
    with connection:
        cursor = connection.execute(
            "INSERT INTO bookings (room_id, title, starts_at, ends_at, internal, amount)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (room_id, title, starts_at.isoformat(), ends_at.isoformat(), int(internal), amount),
        )
    return Booking(cursor.lastrowid, room_id, title, starts_at, ends_at, internal, amount)


def add_bookings(
    connection: sqlite3.Connection,
    room_id: int,
    title: str,
    slots: list[tuple[datetime, datetime, int]],
    internal: bool,
) -> list[Booking]:
    """Inserts every (starts_at, ends_at, amount) slot in one transaction: all or none."""
    bookings = []
    with connection:
        for starts_at, ends_at, amount in slots:
            cursor = connection.execute(
                "INSERT INTO bookings (room_id, title, starts_at, ends_at, internal, amount)"
                " VALUES (?, ?, ?, ?, ?, ?)",
                (room_id, title, starts_at.isoformat(), ends_at.isoformat(), int(internal), amount),
            )
            bookings.append(
                Booking(cursor.lastrowid, room_id, title, starts_at, ends_at, internal, amount)
            )
    return bookings


def delete_booking(connection: sqlite3.Connection, booking_id: int) -> bool:
    with connection:
        cursor = connection.execute("DELETE FROM bookings WHERE id = ?", (booking_id,))
    return cursor.rowcount == 1
