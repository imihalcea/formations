from datetime import datetime

from bookit.domain.models import Booking, InvalidBooking, Resource


def validate_booking(booking: Booking, resource: Resource, now: datetime) -> InvalidBooking | None:
    return None
