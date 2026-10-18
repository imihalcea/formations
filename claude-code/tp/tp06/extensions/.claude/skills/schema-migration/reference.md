# Schema migrations: reference

## SQLite limits

`ALTER TABLE` can add a column and rename a column or a table. Removing a column with `DROP COLUMN` fails when the column is indexed, is part of a key or has a constraint. In that case, create the new table, copy the rows, drop the old table and rename the new one, in the same migration.

`ADD COLUMN ... NOT NULL` requires a `DEFAULT` value.

## Test example

```python
import sqlite3

from rooms.db import MIGRATIONS, connect


def test_migration_adds_the_column_to_existing_rooms(db_file):
    previous = sqlite3.connect(db_file)
    for number, script in enumerate(MIGRATIONS[:-1]):
        previous.executescript(script)
        previous.execute(f"PRAGMA user_version = {number + 1}")
    previous.execute("INSERT INTO rooms (name, capacity, hourly_rate) VALUES ('Cape', 8, 2500)")
    previous.commit()
    previous.close()

    connection = connect(db_file)
    row = connection.execute("SELECT * FROM rooms WHERE name = 'Cape'").fetchone()
    assert row["new_column"] == "default value"
```

Replace `new_column` and `"default value"` with the column added by the migration.
