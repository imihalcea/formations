from datetime import datetime

import pytest

from rooms.models import BookingError, Room
from rooms.pricing import compute_price

ATLAS = Room(id=1, name="Atlas", capacity=8, hourly_rate=4000)
BOREAL = Room(id=2, name="Boreal", capacity=20, hourly_rate=9000)
CAPE = Room(id=3, name="Cape", capacity=4, hourly_rate=2500)


def price(room, starts_at, ends_at, internal=False):
    start, end = datetime.fromisoformat(starts_at), datetime.fromisoformat(ends_at)
    return compute_price(room, start, end, internal)


# Bookings of rooms/seed.py: amounts already invoiced.
@pytest.mark.parametrize(
    ("room", "starts_at", "ends_at", "internal", "expected"),
    [
        (ATLAS, "2027-01-11T09:00", "2027-01-11T10:00", True, 2000),
        (ATLAS, "2027-01-11T14:00", "2027-01-11T15:30", False, 6000),
        (BOREAL, "2027-01-11T09:00", "2027-01-11T17:30", False, 54000),
        (CAPE, "2027-01-11T09:00", "2027-01-11T10:45", True, 2187),
        (CAPE, "2027-01-11T14:00", "2027-01-11T16:15", True, 2813),
        (CAPE, "2027-01-11T18:00", "2027-01-11T20:00", False, 5625),
        (BOREAL, "2027-01-16T10:00", "2027-01-16T12:00", False, 27000),
    ],
    ids=[
        "team-sync",
        "interview",
        "training",
        "retrospective",
        "supplier-meeting",
        "steering-committee",
        "workshop",
    ],
)
def test_seed_bookings(room, starts_at, ends_at, internal, expected):
    assert price(room, starts_at, ends_at, internal) == expected


def test_zero_duration_is_rejected():
    with pytest.raises(BookingError):
        price(ATLAS, "2027-01-11T09:00", "2027-01-11T09:00")


def test_negative_duration_is_rejected():
    with pytest.raises(BookingError):
        price(ATLAS, "2027-01-11T10:00", "2027-01-11T09:00")


def test_evening_markup():
    assert price(ATLAS, "2027-01-11T19:00", "2027-01-11T21:00") == 10000


def test_booking_across_7_pm():
    assert price(ATLAS, "2027-01-11T18:30", "2027-01-11T19:30") == 4500


def test_booking_across_midnight():
    assert price(ATLAS, "2027-01-11T22:00", "2027-01-12T02:00") == 16200


def test_3_hours_59_costs_more_than_4_hours():
    assert price(ATLAS, "2027-01-11T09:00", "2027-01-11T12:59") == 15933


def test_4_hours_long_booking_discount():
    assert price(ATLAS, "2027-01-11T09:00", "2027-01-11T13:00") == 14400


def test_8_hours_full_day_package():
    assert price(ATLAS, "2027-01-11T09:00", "2027-01-11T17:00") == 24000


def test_internal_full_day_package():
    assert price(ATLAS, "2027-01-11T09:00", "2027-01-11T17:00", internal=True) == 12000


def test_weekend_full_day_package():
    assert price(ATLAS, "2027-01-16T09:00", "2027-01-16T17:00") == 36000


def test_weekend_markup():
    assert price(ATLAS, "2027-01-16T10:00", "2027-01-16T11:00") == 6000


def test_internal_booking_has_no_weekend_markup():
    assert price(ATLAS, "2027-01-17T10:00", "2027-01-17T11:00", internal=True) == 2000
