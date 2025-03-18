# NOTE: This file was partially generated using AI assistance.
import asyncio
from io import BytesIO

import cv2
import numpy as np
from PIL import Image


class ImageProcessor:
    def __init__(self):
        # Load the pre-trained face detection model
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

    async def process_image(self, image_data: BytesIO) -> Image.Image:
        """
        Process the image asynchronously to detect and crop faces.

        Args:
            image_data (BytesIO): Input image data

        Returns:
            Image.Image: Processed image with faces cropped
        """
        # Convert to PIL Image
        image = Image.open(image_data)

        # Convert to OpenCV format
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = await self._detect_faces(gray)

        if not faces:
            return image  # Return original if no faces found

        # Get the largest face
        x, y, w, h = max(faces, key=lambda face: face[2] * face[3])

        # Add padding around the face (20%)
        padding_x = int(w * 0.2)
        padding_y = int(h * 0.2)

        # Calculate crop coordinates with padding
        start_x = max(0, x - padding_x)
        start_y = max(0, y - padding_y)
        end_x = min(cv_image.shape[1], x + w + padding_x)
        end_y = min(cv_image.shape[0], y + h + padding_y)

        # Crop the image
        cropped_cv = cv_image[start_y:end_y, start_x:end_x]

        # Convert back to PIL
        cropped_image = Image.fromarray(cv2.cvtColor(cropped_cv, cv2.COLOR_BGR2RGB))

        return cropped_image

    async def _detect_faces(self, gray_image: np.ndarray) -> list:
        """
        Detect faces in the grayscale image asynchronously.
        """
        # Run face detection in an executor to avoid blocking
        loop = asyncio.get_event_loop()
        faces = await loop.run_in_executor(
            None, self.face_cascade.detectMultiScale, gray_image, 1.3, 5
        )
        return faces
