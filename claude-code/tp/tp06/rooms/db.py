import os
import sqlite3
from collections.abc import Iterator

# Each migration moves the schema to the next version.
# The current version is stored in PRAGMA user_version.
MIGRATIONS = [
    """
    CREATE TABLE rooms (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        capacity INTEGER NOT NULL,
        hourly_rate INTEGER NOT NULL
    );
    CREATE TABLE bookings (
        id INTEGER PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES rooms (id),
        title TEXT NOT NULL,
        starts_at TEXT NOT NULL,
        ends_at TEXT NOT NULL,
        internal INTEGER NOT NULL DEFAULT 0,
        amount INTEGER NOT NULL
    );
    CREATE INDEX bookings_room_starts_at ON bookings (room_id, starts_at);
    """,
    """
    ALTER TABLE rooms ADD COLUMN equipment TEXT NOT NULL DEFAULT '';
    """,
]


def schema_version(connection: sqlite3.Connection) -> int:
    return connection.execute("PRAGMA user_version").fetchone()[0]


def migrate(connection: sqlite3.Connection) -> None:
    for number in range(schema_version(connection), len(MIGRATIONS)):
        with connection:
            connection.executescript(MIGRATIONS[number])
            connection.execute(f"PRAGMA user_version = {number + 1}")


def connect(path: str) -> sqlite3.Connection:
    # check_same_thread=False: FastAPI may run the route and the dependency
    # that provides the connection in two different threads.
    connection = sqlite3.connect(path, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    migrate(connection)
    return connection


def db_path() -> str:
    return os.environ.get("ROOMS_DB", "rooms.db")


def get_connection() -> Iterator[sqlite3.Connection]:
    """FastAPI dependency: one connection per request."""
    connection = connect(db_path())
    try:
        yield connection
    finally:
        connection.close()
