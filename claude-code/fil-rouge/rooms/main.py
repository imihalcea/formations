from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from rooms.models import BookingError
from rooms.routes import router

app = FastAPI(title="Rooms", description="Meeting room booking")
app.include_router(router)


@app.exception_handler(BookingError)
def booking_error(request: Request, error: BookingError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"error": str(error)})
