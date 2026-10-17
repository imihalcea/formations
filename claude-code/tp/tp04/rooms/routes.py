import sqlite3
from dataclasses import asdict
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import NaiveDatetime

from rooms import repository
from rooms.conflicts import check_availability, overlaps, validate_slot
from rooms.db import get_connection
from rooms.export import schedule_csv
from rooms.pricing import compute_price
from rooms.schemas import BookingCreate, BookingOut, RoomCreate, RoomOut

router = APIRouter()

Connection = Annotated[sqlite3.Connection, Depends(get_connection)]


@router.post("/rooms", status_code=201, response_model=RoomOut)
def create_room(data: RoomCreate, connection: Connection):
    room = repository.add_room(connection, data.name, data.capacity, data.hourly_rate)
    return asdict(room)


@router.get("/rooms", response_model=list[RoomOut])
def list_rooms(connection: Connection):
    return [asdict(room) for room in repository.list_rooms(connection)]


@router.get("/rooms/available", response_model=list[RoomOut])
def available_rooms(
    starts_at: NaiveDatetime,
    ends_at: NaiveDatetime,
    connection: Connection,
    min_capacity: int | None = None,
):
    validate_slot(starts_at, ends_at)
    available = []
    for room in repository.list_rooms(connection):
        if min_capacity is not None and room.capacity < min_capacity:
            continue
        bookings = repository.bookings_for_room(connection, room.id, starts_at.date())
        if not any(overlaps(b.starts_at, b.ends_at, starts_at, ends_at) for b in bookings):
            available.append(asdict(room))
    return available


@router.post("/bookings", status_code=201, response_model=BookingOut)
def book(data: BookingCreate, connection: Connection):
    room = repository.find_room(connection, data.room_id)
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    validate_slot(data.starts_at, data.ends_at)
    existing = repository.bookings_for_room(connection, room.id, data.starts_at.date())
    check_availability(existing, data.starts_at, data.ends_at)
    amount = compute_price(room, data.starts_at, data.ends_at, data.internal)
    booking = repository.add_booking(
        connection,
        room.id,
        data.title,
        data.starts_at,
        data.ends_at,
        data.internal,
        amount,
    )
    return asdict(booking)


@router.delete("/bookings/{booking_id}", status_code=204)
def cancel(booking_id: int, connection: Connection):
    if not repository.delete_booking(connection, booking_id):
        raise HTTPException(status_code=404, detail="Booking not found")


@router.get("/schedule", response_model=list[BookingOut])
def schedule(day: date, connection: Connection):
    return [asdict(booking) for booking in repository.bookings_for_day(connection, day)]


@router.get("/schedule.csv")
def schedule_as_csv(day: date, connection: Connection):
    bookings = repository.bookings_for_day(connection, day)
    content = schedule_csv(bookings, repository.list_rooms(connection))
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="schedule-{day}.csv"'},
    )
