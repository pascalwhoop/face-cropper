# NOTE: This file was partially generated using AI assistance.
from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import ValidationError

from ..core.image_processor import (
    AspectRatio,
    ImageProcessingError,
    ImageProcessingParams,
    ImageProcessor,
)

router = APIRouter()
image_processor = ImageProcessor()


@router.post("/process-image")
async def process_image(
    file: UploadFile = File(None),
    aspect_ratio: str = Form(AspectRatio.ORIGINAL.value),
    zoom: str = Form("0.2"),
):
    """
    Process an uploaded image to detect and crop faces.

    Args:
        file (UploadFile): The image file to process
        aspect_ratio (str): Desired aspect ratio for the output image
        zoom (str): Zoom level (0.0 means maximum padding, 1.0 means tight crop)

    Returns:
        StreamingResponse: The processed image

    Raises:
        HTTPException: If the file is invalid or processing fails
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image format")

    # Validate aspect ratio
    try:
        aspect_ratio_enum = AspectRatio(aspect_ratio)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid aspect ratio. Must be one of: {[e.value for e in AspectRatio]}",
        )

    # Validate zoom
    try:
        zoom_float = float(zoom)
        if not 0.0 <= zoom_float <= 1.0:
            raise HTTPException(
                status_code=422,
                detail="Zoom must be between 0.0 and 1.0",
            )
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Invalid zoom value. Must be a number between 0.0 and 1.0",
        )

    try:
        # Read the file
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file provided")

        input_image = BytesIO(contents)

        # Create processing parameters
        params = ImageProcessingParams(aspect_ratio=aspect_ratio_enum, zoom=zoom_float)

        # Process the image
        processed_image = await image_processor.process_image(input_image, params)

        # Prepare the response
        output = BytesIO()
        processed_image.save(output, format="JPEG")
        output.seek(0)

        return StreamingResponse(
            output,
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f'attachment; filename="processed_{file.filename}"'
            },
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except ImageProcessingError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )
