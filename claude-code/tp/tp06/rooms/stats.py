from rooms.export import duration_minutes
from rooms.models import Booking, Room

# Opening hours used as the reference for the occupancy: 8:00 to 20:00.
OPENING_MINUTES = 12 * 60


def occupancy(rooms: list[Room], bookings: list[Booking]) -> list[dict]:
    """Booked minutes and occupancy percent, rounded down, of each room."""
    booked = {room.id: 0 for room in rooms}
    for booking in bookings:
        booked[booking.room_id] += duration_minutes(booking)
    return [
        {
            "room_id": room.id,
            "name": room.name,
            "booked_minutes": booked[room.id],
            "occupancy_percent": booked[room.id] * 100 // OPENING_MINUTES,
        }
        for room in rooms
    ]
