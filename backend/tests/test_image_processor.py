# NOTE: This file was partially generated using AI assistance.
from io import BytesIO

import cv2
import numpy as np
import pytest
from app.core.image_processor import (
    AspectRatio,
    ImageProcessingError,
    ImageProcessingParams,
    ImageProcessor,
)
from PIL import Image


@pytest.fixture
def image_processor():
    return ImageProcessor()


@pytest.fixture
def test_image_bytes(test_image_path):
    return test_image_path.read_bytes()


@pytest.fixture
def test_image_bytesio(test_image_bytes):
    return BytesIO(test_image_bytes)


@pytest.mark.asyncio
async def test_process_image_with_face(image_processor, test_image_bytesio):
    """Test processing an image that contains a face."""
    # Process the image with default parameters
    result = await image_processor.process_image(test_image_bytesio)

    # Verify the result is a PIL Image
    assert isinstance(result, Image.Image)

    # Verify the image has valid dimensions
    width, height = result.size
    assert width > 0 and height > 0

    # Verify the image mode is RGB
    assert result.mode == "RGB"


@pytest.mark.asyncio
async def test_process_image_with_square_ratio(image_processor, test_image_bytesio):
    """Test processing an image with square aspect ratio."""
    params = ImageProcessingParams(aspect_ratio=AspectRatio.SQUARE)
    result = await image_processor.process_image(test_image_bytesio, params)

    # Verify square aspect ratio
    width, height = result.size
    assert abs(width - height) <= 1  # Allow for rounding


@pytest.mark.asyncio
async def test_process_image_with_portrait_ratio(image_processor, test_image_bytesio):
    """Test processing an image with portrait (9:16) aspect ratio."""
    params = ImageProcessingParams(aspect_ratio=AspectRatio.PORTRAIT)
    result = await image_processor.process_image(test_image_bytesio, params)

    # Verify portrait aspect ratio (9:16)
    width, height = result.size
    assert abs((width / height) - (9 / 16)) < 0.01  # Allow for rounding


@pytest.mark.asyncio
async def test_process_image_with_zoom(image_processor, test_image_bytesio):
    """Test processing an image with different zoom levels."""
    # Test tight crop
    tight_params = ImageProcessingParams(zoom=1.0)
    tight_result = await image_processor.process_image(test_image_bytesio, tight_params)

    # Test loose crop
    loose_params = ImageProcessingParams(zoom=0.0)
    loose_result = await image_processor.process_image(test_image_bytesio, loose_params)

    # Tight crop should be smaller than loose crop
    tight_width, tight_height = tight_result.size
    loose_width, loose_height = loose_result.size
    assert tight_width <= loose_width
    assert tight_height <= loose_height


@pytest.mark.asyncio
async def test_process_image_no_face(image_processor):
    """Test processing an image without faces returns original image."""
    # Create a simple test image without faces
    img = Image.new("RGB", (100, 100), color="white")
    img_bytes = BytesIO()
    img.save(img_bytes, format="JPEG")
    img_bytes.seek(0)

    # Process the image
    result = await image_processor.process_image(img_bytes)

    # Should return the original image
    assert isinstance(result, Image.Image)
    assert result.size == (100, 100)


@pytest.mark.asyncio
async def test_process_invalid_image(image_processor):
    """Test processing invalid image data raises appropriate error."""
    invalid_data = BytesIO(b"not an image")

    with pytest.raises(ImageProcessingError) as exc_info:
        await image_processor.process_image(invalid_data)

    assert "Invalid image format" in str(exc_info.value)


@pytest.mark.asyncio
async def test_face_detection(image_processor, test_image_bytesio):
    """Test the face detection specifically."""
    # Load and convert image for face detection
    image = Image.open(test_image_bytesio)
    cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = await image_processor._detect_faces(gray)

    # Verify faces were found
    assert len(faces) > 0

    # Verify face coordinates are valid
    for x, y, w, h in faces:
        assert x >= 0
        assert y >= 0
        assert w > 0
        assert h > 0
        assert x + w <= cv_image.shape[1]
        assert y + h <= cv_image.shape[0]


@pytest.mark.asyncio
async def test_invalid_zoom_value():
    """Test that invalid zoom values are rejected."""
    with pytest.raises(ValueError):
        ImageProcessingParams(zoom=1.5)
    with pytest.raises(ValueError):
        ImageProcessingParams(zoom=-0.5)
