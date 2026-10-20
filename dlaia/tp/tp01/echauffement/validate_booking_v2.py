from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional


@dataclass
class Booking:
    start: datetime
    end: datetime
    resource_id: str


@dataclass
class Resource:
    id: str
    bookings: list[Booking] = field(default_factory=list)


@dataclass
class InvalidBooking:
    code: str


def validate_booking(
    booking: Booking, resource: Resource, now: datetime
) -> Optional[InvalidBooking]:
    duration = booking.end - booking.start

    # REG-01 : durée entre 30 minutes et 4 heures (bornes incluses)
    if not (timedelta(minutes=30) <= duration <= timedelta(hours=4)):
        return InvalidBooking("duration")

    # REG-02 : jour de semaine, de 8h à 20h (bornes incluses pour l'heure de début et de fin)
    if booking.start.weekday() >= 5 or booking.end.weekday() >= 5:
        return InvalidBooking("hours")
    if (
        booking.start.hour < 8
        or (booking.end.hour == 20 and booking.end.minute > 0)
        or booking.end.hour > 20
        or booking.start.hour >= 20
    ):
        return InvalidBooking("hours")

    # REG-03 : début au moins 2 heures après l'instant courant (borne incluse)
    if booking.start < now + timedelta(hours=2):
        return InvalidBooking("lead_time")

    # REG-04 : début au plus 60 jours après l'instant courant (borne incluse)
    if booking.start > now + timedelta(days=60):
        return InvalidBooking("horizon")

    # REG-05 : pas de chevauchement avec les réservations existantes
    # Créneau [start, end) : jointifs non chevauchants
    for existing in resource.bookings:
        if booking.start < existing.end and existing.start < booking.end:
            return InvalidBooking("overlap")

    return None
