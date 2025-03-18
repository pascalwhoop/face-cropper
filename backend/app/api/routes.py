# NOTE: This file was partially generated using AI assistance.
from io import BytesIO

from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from ..core.image_processor import ImageProcessor

router = APIRouter()
image_processor = ImageProcessor()


@router.post("/process-image")
async def process_image(file: UploadFile):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Read the file
        contents = await file.read()
        input_image = BytesIO(contents)

        # Process the image
        processed_image = await image_processor.process_image(input_image)

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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
