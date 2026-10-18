---
name: schema-migration
description: Change the SQLite schema of the rooms API. Use when a task adds, renames or removes a column, a table or an index.
---

The schema version is stored in `PRAGMA user_version`. Each entry of `MIGRATIONS` in `rooms/db.py` moves the schema to the next version.

1. Never edit an existing entry of `MIGRATIONS`: a database already at that version would never receive the change.
2. Append one new SQL string to `MIGRATIONS`. `migrate()` runs it and increments `user_version`.
3. Give every new column a default value, so that existing rows stay valid.
4. Update `rooms/models.py`, `rooms/repository.py` and `rooms/schemas.py`.
5. Add a test in `tests/test_db.py` that migrates a database created at the previous version.

SQLite limits and a test example: [reference.md](reference.md).
