from datetime import datetime
from typing import Protocol

from bookit.domain.models import Booking, Resource


class BookingRepository(Protocol):
    def get_resource(self, name: str) -> Resource: ...
    def add(self, name: str, booking: Booking) -> None: ...


class Clock(Protocol):
    def now(self) -> datetime: ...
