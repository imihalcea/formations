from pydantic import BaseModel, Field, NaiveDatetime


class RoomCreate(BaseModel):
    name: str = Field(min_length=1)
    capacity: int = Field(gt=0)
    hourly_rate: int = Field(ge=0, description="In cents")
    equipment: str = Field(default="", description="Free text, e.g. projector, whiteboard")


class RoomOut(BaseModel):
    id: int
    name: str
    capacity: int
    hourly_rate: int
    equipment: str


class BookingCreate(BaseModel):
    room_id: int
    title: str = Field(min_length=1)
    starts_at: NaiveDatetime
    ends_at: NaiveDatetime
    internal: bool = False


class WeeklyBookingCreate(BookingCreate):
    weeks: int = Field(ge=2, le=12, description="Consecutive weeks, the first one included")


class BookingOut(BaseModel):
    id: int
    room_id: int
    title: str
    starts_at: NaiveDatetime
    ends_at: NaiveDatetime
    internal: bool
    amount: int = Field(description="In cents")


class RoomStats(BaseModel):
    room_id: int
    name: str
    booked_minutes: int
    occupancy_percent: int = Field(description="Booked share of 8:00 to 20:00, rounded down")
