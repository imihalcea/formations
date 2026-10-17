import csv
import io

from rooms.models import Booking, Room


def schedule_csv(bookings: list[Booking], rooms: list[Room]) -> str:
    names = {room.id: room.name for room in rooms}
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["room", "title", "starts_at", "ends_at", "amount"])
    for booking in bookings:
        writer.writerow(
            [
                names[booking.room_id],
                booking.title,
                booking.starts_at.isoformat(),
                booking.ends_at.isoformat(),
                booking.amount,
            ]
        )
    return output.getvalue()
