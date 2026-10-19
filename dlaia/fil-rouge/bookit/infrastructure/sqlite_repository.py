import sqlite3
from contextlib import closing
from datetime import datetime

from bookit.domain.models import Booking, Resource


class SqliteBookingRepository:
    def __init__(self, path: str) -> None:
        self._path = path
        with closing(sqlite3.connect(self._path)) as db, db:
            db.execute(
                "CREATE TABLE IF NOT EXISTS bookings "
                "(resource TEXT NOT NULL, start_at TEXT NOT NULL, end_at TEXT NOT NULL)"
            )

    def get_resource(self, name: str) -> Resource:
        with closing(sqlite3.connect(self._path)) as db:
            rows = db.execute(
                "SELECT start_at, end_at FROM bookings WHERE resource = ? ORDER BY start_at",
                (name,),
            ).fetchall()
        bookings = [Booking(datetime.fromisoformat(s), datetime.fromisoformat(e)) for s, e in rows]
        return Resource(name=name, bookings=bookings)

    def add(self, name: str, booking: Booking) -> None:
        with closing(sqlite3.connect(self._path)) as db, db:
            db.execute(
                "INSERT INTO bookings (resource, start_at, end_at) VALUES (?, ?, ?)",
                (name, booking.start.isoformat(), booking.end.isoformat()),
            )
