from collections.abc import Iterable
from datetime import datetime

from rooms.models import Booking, BookingError


def overlaps(start_a: datetime, end_a: datetime, start_b: datetime, end_b: datetime) -> bool:
    """Two slots that touch without covering each other do not overlap."""
    return start_a < end_b and start_b < end_a


def validate_slot(starts_at: datetime, ends_at: datetime) -> None:
    if starts_at.tzinfo is not None or ends_at.tzinfo is not None:
        raise BookingError("Dates must not carry a time zone")
    if ends_at <= starts_at:
        raise BookingError("The end must come after the start")
    if ends_at.date() != starts_at.date():
        raise BookingError("A booking must fit within a single day")


def check_availability(existing: Iterable[Booking], starts_at: datetime, ends_at: datetime) -> None:
    for booking in existing:
        if overlaps(booking.starts_at, booking.ends_at, starts_at, ends_at):
            raise BookingError(
                f'Slot already booked by "{booking.title}"'
                f" from {booking.starts_at:%H:%M} to {booking.ends_at:%H:%M}"
            )
