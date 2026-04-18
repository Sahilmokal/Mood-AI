import logging
from fastapi import APIRouter, Request, HTTPException, status
from app.models.schemas import TextRequest, MoodResult

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/analyze-text",
    response_model=MoodResult,
    summary="Analyze sentiment/emotion from text input",
    responses={
        503: {"description": "ML model unavailable"},
    },
)
async def analyze_text(request: Request, body: TextRequest):
    text_service = request.app.state.text_service
    try:
        result = text_service.analyze_sentiment(body.text)
        return MoodResult(
            mood=result["mood"],
            confidence=result["confidence"],
            raw_emotions=result.get("raw_emotions"),
        )
    except Exception as e:
        logger.exception("Unexpected error in analyze_text")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Text analysis failed",
        )
