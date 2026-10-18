import sqlite3
from datetime import date, datetime

import pytest

from rooms import repository
from rooms.models import BookingError


def test_add_then_list_rooms_by_name(connection):
    repository.add_room(connection, "Cape", 4, 2500)
    repository.add_room(connection, "Atlas", 8, 4000)
    assert [room.name for room in repository.list_rooms(connection)] == ["Atlas", "Cape"]


def test_two_rooms_cannot_share_a_name(connection):
    repository.add_room(connection, "Atlas", 8, 4000)
    with pytest.raises(BookingError, match="Atlas"):
        repository.add_room(connection, "Atlas", 10, 5000)


def test_find_a_missing_room(connection):
    assert repository.find_room(connection, 42) is None


def test_bookings_are_read_back_with_their_dates(connection):
    room = repository.add_room(connection, "Atlas", 8, 4000)
    starts_at, ends_at = datetime(2027, 1, 11, 9, 0), datetime(2027, 1, 11, 10, 0)
    repository.add_booking(connection, room.id, "Sync", starts_at, ends_at, True, 2000)

    (read,) = repository.bookings_for_room(connection, room.id, date(2027, 1, 11))
    assert (read.starts_at, read.ends_at, read.internal, read.amount) == (
        starts_at,
        ends_at,
        True,
        2000,
    )


def test_bookings_for_day_ignores_other_days(connection):
    room = repository.add_room(connection, "Atlas", 8, 4000)
    for day in (10, 11, 12):
        starts_at = datetime(2027, 1, day, 9, 0)
        repository.add_booking(
            connection,
            room.id,
            f"On the {day}th",
            starts_at,
            starts_at.replace(hour=10),
            False,
            4000,
        )
    bookings = repository.bookings_for_day(connection, date(2027, 1, 11))
    assert [b.title for b in bookings] == ["On the 11th"]


def test_delete_a_booking(connection):
    room = repository.add_room(connection, "Atlas", 8, 4000)
    starts_at = datetime(2027, 1, 11, 9, 0)
    booking = repository.add_booking(
        connection, room.id, "Sync", starts_at, starts_at.replace(hour=10), False, 4000
    )
    assert repository.delete_booking(connection, booking.id) is True
    assert repository.delete_booking(connection, booking.id) is False


def test_add_bookings_inserts_nothing_when_one_insert_fails(connection):
    room = repository.add_room(connection, "Atlas", 8, 4000)
    first = (datetime(2027, 1, 11, 9, 0), datetime(2027, 1, 11, 10, 0), 4000)
    broken = (datetime(2027, 1, 18, 9, 0), datetime(2027, 1, 18, 10, 0), None)
    with pytest.raises(sqlite3.IntegrityError):
        repository.add_bookings(connection, room.id, "Weekly", [first, broken], False)
    assert repository.bookings_for_day(connection, date(2027, 1, 11)) == []
