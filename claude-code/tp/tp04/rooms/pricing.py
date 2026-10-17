import math
from datetime import datetime, time, timedelta

from rooms.models import BookingError

MINUTE = timedelta(minutes=1)
FULL_DAY_MINUTES = 480
FULL_DAY_BILLED_HOURS = 6
LONG_BOOKING_MINUTES = 240
LONG_BOOKING_DISCOUNT = 0.9
EVENING_HOUR = 19
EVENING_MARKUP = 1.25
WEEKEND_MARKUP = 1.5
INTERNAL_DISCOUNT = 0.5


def compute_price(room, start, end, internal=False):
    """Price in cents."""
    minutes = int((end - start).total_seconds() // 60)
    if minutes <= 0:
        raise BookingError("Invalid booking duration")
    if minutes >= FULL_DAY_MINUTES:
        price = _full_day_price(room, start, internal)
    else:
        price = _hourly_price(room, start, end)
        if minutes >= LONG_BOOKING_MINUTES:
            price = price * LONG_BOOKING_DISCOUNT
        if internal:
            price = price * INTERNAL_DISCOUNT
        elif _is_weekend(start):
            price = price * WEEKEND_MARKUP
    return int(round(price))


def _full_day_price(room, start, internal):
    if internal:
        return room.hourly_rate * FULL_DAY_BILLED_HOURS * INTERNAL_DISCOUNT
    if _is_weekend(start):
        return room.hourly_rate * FULL_DAY_BILLED_HOURS * WEEKEND_MARKUP
    return room.hourly_rate * FULL_DAY_BILLED_HOURS


def _hourly_price(room, start, end):
    # One run per rate: before 7 pm, evening, after midnight.
    price = 0
    t = start
    while t < end:
        per_minute = room.hourly_rate / 60
        if t.hour >= EVENING_HOUR:
            per_minute = per_minute * EVENING_MARKUP
        stop = min(end, _next_rate_change(t))
        # A started minute is billed in full.
        count = math.ceil((stop - t) / MINUTE)
        price = _add_minutes(price, per_minute, count)
        t = t + count * MINUTE
    return price


def _next_rate_change(t):
    if t.hour >= EVENING_HOUR:
        return datetime.combine(t.date() + timedelta(days=1), time())
    return datetime.combine(t.date(), time(EVENING_HOUR))


def _add_minutes(price, per_minute, count):
    # Rounding anomaly, kept to leave invoiced amounts unchanged: the legacy code
    # adds the per-minute price as a float, one minute at a time. When the exact
    # amount ends in half a cent, the float sum drifts just above or below it and
    # round() goes either way: Retrospective is billed 2187 instead of round(2187.5)
    # = 2188, Supplier meeting 2813 instead of 2812. A direct per_minute * count
    # changes these amounts. Fixing it is a business decision.
    for _ in range(count):
        price = price + per_minute
    return price


def _is_weekend(start):
    return start.weekday() >= 5
