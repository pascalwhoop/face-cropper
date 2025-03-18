# NOTE: This file was partially generated using AI assistance.
from io import BytesIO

from app.core.image_processor import AspectRatio
from app.main import app
from fastapi.testclient import TestClient
from PIL import Image

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_process_image_success(test_image_path):
    """Test successful image processing with default parameters."""
    with open(test_image_path, "rb") as f:
        files = {"file": ("test.jpg", f, "image/jpeg")}
        response = client.post("/api/v1/process-image", files=files)

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/")

    # Verify the response can be loaded as an image
    img = Image.open(BytesIO(response.content))
    assert isinstance(img, Image.Image)


def test_process_image_with_aspect_ratio(test_image_path):
    """Test image processing with different aspect ratios."""
    with open(test_image_path, "rb") as f:
        files = {"file": ("test.jpg", f, "image/jpeg")}

        # Test square aspect ratio
        response = client.post(
            "/api/v1/process-image",
            files=files,
            data={"aspect_ratio": AspectRatio.SQUARE.value},
        )
        assert response.status_code == 200
        img = Image.open(BytesIO(response.content))
        width, height = img.size
        assert abs(width - height) <= 1  # Allow for rounding

        # Test portrait aspect ratio
        f.seek(0)
        response = client.post(
            "/api/v1/process-image",
            files=files,
            data={"aspect_ratio": AspectRatio.PORTRAIT.value},
        )
        assert response.status_code == 200
        img = Image.open(BytesIO(response.content))
        width, height = img.size
        assert abs((width / height) - (9 / 16)) < 0.01


def test_process_image_with_zoom(test_image_path):
    """Test image processing with different zoom levels."""
    with open(test_image_path, "rb") as f:
        files = {"file": ("test.jpg", f, "image/jpeg")}

        # Test tight zoom
        response = client.post("/api/v1/process-image", files=files, data={"zoom": 1.0})
        assert response.status_code == 200
        tight_img = Image.open(BytesIO(response.content))

        # Test loose zoom
        f.seek(0)
        response = client.post("/api/v1/process-image", files=files, data={"zoom": 0.0})
        assert response.status_code == 200
        loose_img = Image.open(BytesIO(response.content))

        # Verify tight crop is smaller than loose crop
        assert tight_img.size[0] <= loose_img.size[0]
        assert tight_img.size[1] <= loose_img.size[1]


def test_process_image_invalid_zoom(test_image_path):
    """Test image processing with invalid zoom values."""
    with open(test_image_path, "rb") as f:
        files = {"file": ("test.jpg", f, "image/jpeg")}

        # Test zoom > 1.0
        response = client.post("/api/v1/process-image", files=files, data={"zoom": 1.5})
        print(f"Response content: {response.content}")  # Debug line
        assert response.status_code == 422

        # Test zoom < 0.0
        f.seek(0)
        response = client.post(
            "/api/v1/process-image", files=files, data={"zoom": -0.5}
        )
        print(f"Response content: {response.content}")  # Debug line
        assert response.status_code == 422


def test_process_image_invalid_aspect_ratio(test_image_path):
    """Test image processing with invalid aspect ratio."""
    with open(test_image_path, "rb") as f:
        files = {"file": ("test.jpg", f, "image/jpeg")}
        response = client.post(
            "/api/v1/process-image", files=files, data={"aspect_ratio": "invalid_ratio"}
        )
        print(f"Response content: {response.content}")  # Debug line
        assert response.status_code == 422


def test_process_invalid_file():
    """Test processing an invalid file."""
    files = {"file": ("test.txt", b"not an image", "text/plain")}
    response = client.post("/api/v1/process-image", files=files)
    assert response.status_code == 400
    assert "Invalid image format" in response.json()["detail"]


def test_process_no_file():
    """Test request without a file."""
    response = client.post("/api/v1/process-image")
    assert response.status_code == 400
    assert "No file provided" in response.json()["detail"]
