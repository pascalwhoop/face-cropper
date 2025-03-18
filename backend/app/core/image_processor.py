# NOTE: This file was partially generated using AI assistance.
import asyncio
from enum import Enum
from io import BytesIO
from typing import Tuple

import cv2
import numpy as np
from PIL import Image
from pydantic import BaseModel, Field


class AspectRatio(str, Enum):
    """Valid aspect ratios for image cropping."""

    PORTRAIT = "9:16"
    SQUARE = "square"
    PHOTO = "2:3"
    ORIGINAL = "original"

    def get_ratio(self) -> float | None:
        """Convert aspect ratio string to float value."""
        if self == AspectRatio.PORTRAIT:
            return 9 / 16
        elif self == AspectRatio.SQUARE:
            return 1.0
        elif self == AspectRatio.PHOTO:
            return 2 / 3
        else:  # ORIGINAL
            return None


class ImageProcessingParams(BaseModel):
    """Parameters for image processing."""

    aspect_ratio: AspectRatio = Field(
        default=AspectRatio.ORIGINAL,
        description="Desired aspect ratio for the output image",
    )
    zoom: float = Field(
        default=0.2,
        ge=0.0,
        le=1.0,
        description="Zoom level (0.0 means maximum padding, 1.0 means tight crop)",
    )


class ImageProcessingError(Exception):
    """Custom exception for image processing errors."""

    pass


class ImageProcessor:
    def __init__(self):
        # Load the pre-trained face detection model
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        if self.face_cascade.empty():
            raise ImageProcessingError("Failed to load face detection model")

    async def process_image(
        self,
        image_data: BytesIO,
        params: ImageProcessingParams = ImageProcessingParams(),
    ) -> Image.Image:
        """
        Process the image asynchronously to detect and crop faces.

        Args:
            image_data (BytesIO): Input image data
            params (ImageProcessingParams): Processing parameters for aspect ratio and zoom

        Returns:
            Image.Image: Processed image with faces cropped

        Raises:
            ImageProcessingError: If image processing fails
            ValueError: If input is invalid
        """
        if not image_data or image_data.getbuffer().nbytes == 0:
            raise ValueError("Empty image data provided")

        try:
            # Load and validate image
            pil_image = self._load_and_validate_image(image_data)
            cv_image = self._convert_to_opencv(pil_image)

            # Detect faces
            faces = await self._detect_faces(cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY))
            if len(faces) == 0:
                return pil_image

            # Get crop coordinates
            crop_coords = self._calculate_crop_coordinates(
                cv_image.shape, faces, params.zoom
            )

            # Adjust for aspect ratio if needed
            if params.aspect_ratio != AspectRatio.ORIGINAL:
                crop_coords = self._adjust_crop_for_aspect_ratio(
                    cv_image.shape, crop_coords, params.aspect_ratio
                )

            # Perform the crop
            cropped_image = self._crop_and_convert_image(cv_image, crop_coords)

            # Verify and fix aspect ratio if needed
            if params.aspect_ratio != AspectRatio.ORIGINAL:
                cropped_image = self._verify_and_fix_aspect_ratio(
                    cropped_image, params.aspect_ratio
                )

            return cropped_image

        except (IOError, SyntaxError) as e:
            raise ImageProcessingError(f"Invalid image format: {str(e)}")
        except Exception as e:
            raise ImageProcessingError(f"Failed to process image: {str(e)}")

    def _load_and_validate_image(self, image_data: BytesIO) -> Image.Image:
        """Load and validate the input image."""
        image = Image.open(image_data)
        image.verify()  # Verify it's a valid image
        image_data.seek(0)  # Reset buffer position after verify
        return Image.open(image_data)  # Reopen after verify

    def _convert_to_opencv(self, pil_image: Image.Image) -> np.ndarray:
        """Convert PIL Image to OpenCV format."""
        return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

    def _calculate_crop_coordinates(
        self, image_shape: Tuple[int, int, int], faces: np.ndarray, zoom: float
    ) -> Tuple[int, int, int, int]:
        """Calculate initial crop coordinates based on face detection and zoom."""
        # Get the largest face
        x, y, w, h = max(faces, key=lambda face: face[2] * face[3])

        # Calculate padding based on zoom level (inverse relationship)
        padding_factor = 1.0 - zoom
        padding_x = int(w * padding_factor)
        padding_y = int(h * padding_factor)

        # Initial crop coordinates with padding
        return (
            max(0, x - padding_x),
            max(0, y - padding_y),
            min(image_shape[1], x + w + padding_x),
            min(image_shape[0], y + h + padding_y),
        )

    def _adjust_crop_for_aspect_ratio(
        self,
        image_shape: Tuple[int, int, int],
        crop_coords: Tuple[int, int, int, int],
        aspect_ratio: AspectRatio,
    ) -> Tuple[int, int, int, int]:
        """Adjust crop coordinates to match the desired aspect ratio."""
        start_x, start_y, end_x, end_y = crop_coords
        current_width = end_x - start_x
        current_height = end_y - start_y
        target_ratio = aspect_ratio.get_ratio()

        if target_ratio < 1:  # Portrait mode
            return self._adjust_for_portrait_ratio(
                image_shape,
                start_x,
                start_y,
                end_x,
                end_y,
                current_width,
                current_height,
                target_ratio,
            )
        else:  # Landscape or square mode
            return self._adjust_for_landscape_ratio(
                image_shape,
                start_x,
                start_y,
                end_x,
                end_y,
                current_width,
                current_height,
                target_ratio,
            )

    def _adjust_for_portrait_ratio(
        self,
        image_shape: Tuple[int, int, int],
        start_x: int,
        start_y: int,
        end_x: int,
        end_y: int,
        current_width: int,
        current_height: int,
        target_ratio: float,
    ) -> Tuple[int, int, int, int]:
        """Adjust crop coordinates for portrait aspect ratio."""
        new_width = int(current_height * target_ratio)
        if new_width > current_width:
            # Scale height up instead
            new_height = int(current_width / target_ratio)
            diff = new_height - current_height
            if diff > 0:
                start_y = max(0, start_y - diff // 2)
                end_y = min(image_shape[0], end_y + (diff - diff // 2))
        else:
            # Adjust width equally on both sides
            diff = current_width - new_width
            start_x += diff // 2
            end_x -= diff - (diff // 2)

        return (start_x, start_y, end_x, end_y)

    def _adjust_for_landscape_ratio(
        self,
        image_shape: Tuple[int, int, int],
        start_x: int,
        start_y: int,
        end_x: int,
        end_y: int,
        current_width: int,
        current_height: int,
        target_ratio: float,
    ) -> Tuple[int, int, int, int]:
        """Adjust crop coordinates for landscape or square aspect ratio."""
        new_height = int(current_width / target_ratio)
        if new_height > current_height:
            # Scale width up instead
            new_width = int(current_height * target_ratio)
            diff = current_width - new_width
            start_x += diff // 2
            end_x -= diff - (diff // 2)
        else:
            # Adjust height equally on both sides
            diff = current_height - new_height
            start_y += diff // 2
            end_y -= diff - (diff // 2)

        return (start_x, start_y, end_x, end_y)

    def _crop_and_convert_image(
        self, cv_image: np.ndarray, crop_coords: Tuple[int, int, int, int]
    ) -> Image.Image:
        """Crop the image and convert back to PIL format."""
        start_x, start_y, end_x, end_y = crop_coords
        cropped_cv = cv_image[start_y:end_y, start_x:end_x]
        return Image.fromarray(cv2.cvtColor(cropped_cv, cv2.COLOR_BGR2RGB))

    def _verify_and_fix_aspect_ratio(
        self, image: Image.Image, aspect_ratio: AspectRatio
    ) -> Image.Image:
        """Verify and fix the aspect ratio of the image if needed."""
        width, height = image.size
        current_ratio = width / height
        target_ratio = aspect_ratio.get_ratio()

        if abs(current_ratio - target_ratio) > 0.01:
            if target_ratio < 1:  # Portrait
                new_width = int(height * target_ratio)
                new_height = height
            else:  # Landscape or square
                new_width = width
                new_height = int(width / target_ratio)
            return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        return image

    async def _detect_faces(self, gray_image: np.ndarray) -> np.ndarray:
        """
        Detect faces in the grayscale image asynchronously.

        Args:
            gray_image (np.ndarray): Grayscale image for face detection

        Returns:
            np.ndarray: Array of face coordinates (x, y, w, h)

        Raises:
            ImageProcessingError: If face detection fails
        """
        if gray_image is None or gray_image.size == 0:
            raise ValueError("Invalid grayscale image provided")

        try:
            # Run face detection in an executor to avoid blocking
            loop = asyncio.get_event_loop()
            faces = await loop.run_in_executor(
                None, self.face_cascade.detectMultiScale, gray_image, 1.3, 5
            )
            # Convert to numpy array if it isn't already
            return np.array(faces) if not isinstance(faces, np.ndarray) else faces
        except Exception as e:
            raise ImageProcessingError(f"Face detection failed: {str(e)}")
