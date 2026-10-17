from datetime import UTC, datetime

import pytest

from rooms.conflicts import check_availability, overlaps, validate_slot
from rooms.models import Booking, BookingError


def at(time: str) -> datetime:
    return datetime.fromisoformat(f"2027-01-11T{time}")


def booking(starts_at: str, ends_at: str) -> Booking:
    return Booking(1, 1, "Meeting", at(starts_at), at(ends_at), False, 0)


@pytest.mark.parametrize(
    ("a", "b", "expected"),
    [
        (("09:00", "10:00"), ("09:30", "10:30"), True),
        (("09:00", "10:00"), ("08:00", "09:30"), True),
        (("09:00", "12:00"), ("10:00", "11:00"), True),
        (("10:00", "11:00"), ("09:00", "12:00"), True),
        (("09:00", "10:00"), ("09:00", "10:00"), True),
        (("09:00", "10:00"), ("10:00", "11:00"), False),
        (("10:00", "11:00"), ("09:00", "10:00"), False),
        (("09:00", "10:00"), ("14:00", "15:00"), False),
    ],
)
def test_overlaps(a, b, expected):
    assert overlaps(at(a[0]), at(a[1]), at(b[0]), at(b[1])) is expected


def test_a_valid_slot_is_accepted():
    validate_slot(at("09:00"), at("10:00"))


def test_the_end_must_come_after_the_start():
    with pytest.raises(BookingError, match="end"):
        validate_slot(at("10:00"), at("10:00"))


def test_a_slot_fits_within_a_day():
    with pytest.raises(BookingError, match="single day"):
        validate_slot(at("18:00"), datetime(2027, 1, 12, 9, 0))


def test_a_slot_with_a_time_zone_is_rejected():
    with pytest.raises(BookingError, match="time zone"):
        validate_slot(at("09:00").replace(tzinfo=UTC), at("10:00"))


def test_check_availability_accepts_a_free_slot():
    check_availability([booking("09:00", "10:00")], at("10:00"), at("11:00"))


def test_check_availability_rejects_a_taken_slot():
    with pytest.raises(BookingError, match="from 09:00 to 10:00"):
        check_availability([booking("09:00", "10:00")], at("09:30"), at("11:00"))
