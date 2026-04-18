from pydantic import BaseModel, Field, field_validator
from typing import Optional


class ImageRequest(BaseModel):
    image_base64: str = Field(..., description="Base64-encoded image (JPEG/PNG)")

    @field_validator("image_base64")
    @classmethod
    def validate_base64(cls, v: str) -> str:
        if not v or len(v) < 100:
            raise ValueError("image_base64 appears too short to be a valid image")
        return v


class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class MoodResult(BaseModel):
    mood: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    raw_emotions: Optional[dict] = None  # only included in debug mode


class ErrorDetail(BaseModel):
    detail: str
    code: str
