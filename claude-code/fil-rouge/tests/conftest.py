import pytest
from fastapi.testclient import TestClient

from rooms.db import connect
from rooms.main import app


@pytest.fixture
def db_file(tmp_path, monkeypatch):
    path = str(tmp_path / "test.db")
    monkeypatch.setenv("ROOMS_DB", path)
    return path


@pytest.fixture
def connection(db_file):
    connection = connect(db_file)
    yield connection
    connection.close()


@pytest.fixture
def client(db_file):
    return TestClient(app)
