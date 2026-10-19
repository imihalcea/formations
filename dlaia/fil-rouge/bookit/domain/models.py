from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class InvalidBooking:
    code: str  # duration, hours, lead_time, horizon, overlap
    message: str = ""


@dataclass(frozen=True)
class Booking:
    start: datetime  # créneau demi-ouvert [start, end[
    end: datetime


@dataclass
class Resource:
    name: str = "salle A"
    bookings: list[Booking] = field(default_factory=list)
