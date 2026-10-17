from datetime import timedelta

from rooms.models import BookingError


def compute_price(room, start, end, internal=False):
    # price in cents
    minutes = int((end - start).total_seconds() // 60)
    if minutes <= 0:
        raise BookingError("Invalid booking duration")
    if minutes >= 480:
        # full day package = 6 hours
        if internal:
            price = room.hourly_rate * 6 * 0.5
        else:
            if start.weekday() >= 5:
                price = room.hourly_rate * 6 * 1.5
            else:
                price = room.hourly_rate * 6
    else:
        price = 0
        t = start
        while t < end:
            if t.hour >= 19:
                price = price + room.hourly_rate / 60 * 1.25
            else:
                price = price + room.hourly_rate / 60
            t = t + timedelta(minutes=1)
        if minutes >= 240:
            price = price * 0.9
        if internal:
            price = price * 0.5
        else:
            if start.weekday() == 5 or start.weekday() == 6:
                price = price * 1.5
    return int(round(price))
