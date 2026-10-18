import sqlite3

from rooms.db import MIGRATIONS, connect, schema_version


def test_a_new_database_is_migrated_to_the_latest_version(db_file):
    connection = connect(db_file)
    assert schema_version(connection) == len(MIGRATIONS)
    tables = {
        row["name"]
        for row in connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'")
    }
    assert {"rooms", "bookings"} <= tables


def test_reconnecting_does_not_replay_migrations(db_file):
    connect(db_file).close()
    connection = connect(db_file)
    assert schema_version(connection) == len(MIGRATIONS)


def test_migration_adds_an_empty_equipment_to_existing_rooms(db_file):
    previous = sqlite3.connect(db_file)
    for number, script in enumerate(MIGRATIONS[:-1]):
        previous.executescript(script)
        previous.execute(f"PRAGMA user_version = {number + 1}")
    previous.execute("INSERT INTO rooms (name, capacity, hourly_rate) VALUES ('Cape', 4, 2500)")
    previous.commit()
    previous.close()

    connection = connect(db_file)
    row = connection.execute("SELECT * FROM rooms WHERE name = 'Cape'").fetchone()
    assert row["equipment"] == ""
