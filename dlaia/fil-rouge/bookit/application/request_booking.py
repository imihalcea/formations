from bookit.domain.models import Booking, InvalidBooking
from bookit.domain.ports import BookingRepository, Clock
from bookit.domain.validate_booking import validate_booking


def request_booking(
    name: str, booking: Booking, repo: BookingRepository, clock: Clock
) -> InvalidBooking | None:
    resource = repo.get_resource(name)
    error = validate_booking(booking, resource, clock.now())
    if error is None:
        repo.add(name, booking)
    return error
