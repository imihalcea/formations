from datetime import datetime, timedelta

from fastapi.testclient import TestClient

from bookit.infrastructure.api import app


def test_api_enregistre_une_reservation():
    today = datetime.now()
    start = (today + timedelta(days=7 - today.weekday())).replace(
        hour=10, minute=0, second=0, microsecond=0
    )
    body = {"start": start.isoformat(), "end": (start + timedelta(hours=1)).isoformat()}

    response = TestClient(app).post("/resources/salle-a/bookings", json=body)

    assert response.status_code == 201
    assert response.json() == body
