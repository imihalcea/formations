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
