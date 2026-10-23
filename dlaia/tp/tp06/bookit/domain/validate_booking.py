from datetime import datetime, time, timedelta

from bookit.domain.models import Booking, InvalidBooking, Resource

MIN_DURATION = timedelta(minutes=30)
MAX_DURATION = timedelta(hours=4)


def _check_duration(booking: Booking) -> InvalidBooking | None:
    duration = booking.end - booking.start
    if duration < MIN_DURATION or duration > MAX_DURATION:
        return InvalidBooking("duration")
    return None


OPENING = time(8, 0)
CLOSING = time(20, 0)


def _check_hours(booking: Booking) -> InvalidBooking | None:
    if booking.start.weekday() >= 5:
        return InvalidBooking("hours")
    closing = datetime.combine(booking.start.date(), CLOSING)
    if booking.start.time() < OPENING or booking.end > closing:
        return InvalidBooking("hours")
    return None


MIN_LEAD_TIME = timedelta(hours=2)


def _check_lead_time(booking: Booking, now: datetime) -> InvalidBooking | None:
    if booking.start < now + MIN_LEAD_TIME:
        return InvalidBooking("lead_time")
    return None


MAX_HORIZON = timedelta(days=60)


def _check_horizon(booking: Booking, now: datetime) -> InvalidBooking | None:
    if booking.start > now + MAX_HORIZON:
        return InvalidBooking("horizon")
    return None


def _check_overlap(booking: Booking, resource: Resource) -> InvalidBooking | None:
    for confirmed in resource.bookings:
        if booking.start < confirmed.end and confirmed.start < booking.end:
            return InvalidBooking("overlap")
    return None


def validate_booking(booking: Booking, resource: Resource, now: datetime) -> InvalidBooking | None:
    return (
        _check_duration(booking)
        or _check_hours(booking)
        or _check_lead_time(booking, now)
        or _check_horizon(booking, now)
        or _check_overlap(booking, resource)
    )
