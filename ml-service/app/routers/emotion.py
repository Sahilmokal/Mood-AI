import logging
from fastapi import APIRouter, Request, HTTPException, status
from app.models.schemas import ImageRequest, MoodResult

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/detect-emotion",
    response_model=MoodResult,
    summary="Detect emotion from a face image",
    responses={
        422: {"description": "No face detected or image invalid"},
        503: {"description": "ML model unavailable"},
    },
)
async def detect_emotion(request: Request, body: ImageRequest):
    face_service = request.app.state.face_service
    try:
        result = face_service.detect_emotion(body.image_base64)
        return MoodResult(
            mood=result["mood"],
            confidence=result["confidence"],
            raw_emotions=result.get("raw_emotions"),
        )
    except ValueError as e:
        # No face detected
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        logger.exception("Unexpected error in detect_emotion")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal ML service error",
        )
