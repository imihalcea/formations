import pytest
from fastapi.testclient import TestClient

from salles.db import connecter
from salles.main import app


@pytest.fixture
def chemin_db(tmp_path, monkeypatch):
    chemin = str(tmp_path / "test.db")
    monkeypatch.setenv("SALLES_DB", chemin)
    return chemin


@pytest.fixture
def connexion(chemin_db):
    connexion = connecter(chemin_db)
    yield connexion
    connexion.close()


@pytest.fixture
def client(chemin_db):
    return TestClient(app)
