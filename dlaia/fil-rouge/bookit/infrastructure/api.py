import os
from datetime import datetime

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from bookit.application.request_booking import request_booking
from bookit.domain.models import Booking
from bookit.infrastructure.sqlite_repository import SqliteBookingRepository
from bookit.infrastructure.system_clock import SystemClock

app = FastAPI(title="bookit")
repository = SqliteBookingRepository(os.environ.get("BOOKIT_DB", "bookit.db"))
clock = SystemClock()


class BookingIn(BaseModel):
    start: datetime
    end: datetime


class BookingOut(BaseModel):
    start: datetime
    end: datetime


@app.post("/resources/{name}/bookings", status_code=201)
def create_booking(name: str, body: BookingIn) -> BookingOut:
    booking = Booking(start=body.start, end=body.end)
    error = request_booking(name, booking, repository, clock)
    if error is not None:
        raise HTTPException(status_code=422, detail={"code": error.code})
    return BookingOut(start=booking.start, end=booking.end)
