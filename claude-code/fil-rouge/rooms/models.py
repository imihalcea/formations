from dataclasses import dataclass
from datetime import datetime


class BookingError(Exception):
    """A business rule was broken."""


@dataclass(frozen=True)
class Room:
    id: int
    name: str
    capacity: int
    hourly_rate: int


@dataclass(frozen=True)
class Booking:
    id: int
    room_id: int
    title: str
    starts_at: datetime
    ends_at: datetime
    internal: bool
    amount: int
