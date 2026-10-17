import csv
import io

from rooms.models import Booking, Room


def duration_minutes(booking: Booking) -> int:
    return int((booking.ends_at - booking.starts_at).total_seconds()) // 60


def schedule_csv(bookings: list[Booking], rooms: list[Room]) -> str:
    names = {room.id: room.name for room in rooms}
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["room", "title", "starts_at", "ends_at", "duration_minutes", "amount"])
    for booking in bookings:
        writer.writerow(
            [
                names[booking.room_id],
                booking.title,
                booking.starts_at.isoformat(),
                booking.ends_at.isoformat(),
                duration_minutes(booking),
                booking.amount,
            ]
        )
    return output.getvalue()
