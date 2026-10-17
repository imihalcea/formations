from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from salles.modeles import ErreurReservation
from salles.routes import routeur

app = FastAPI(title="Salles", description="Réservation des salles de réunion")
app.include_router(routeur)


@app.exception_handler(ErreurReservation)
def erreur_reservation(request: Request, erreur: ErreurReservation) -> JSONResponse:
    return JSONResponse(status_code=409, content={"erreur": str(erreur)})
