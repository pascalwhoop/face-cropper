from pathlib import Path

import pytest
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def test_client():
    client = TestClient(app)
    return client


@pytest.fixture
def test_image_path():
    return Path(__file__).parent / "test_data" / "test_image.jpg"


@pytest.fixture
def test_image_bytes(test_image_path):
    return test_image_path.read_bytes()
