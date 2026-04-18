from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.routers import emotion, sentiment
from app.services.face_service import FaceService
from app.services.text_service import TextService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load models on startup
    logger.info("Loading ML models...")
    app.state.face_service = FaceService()
    app.state.text_service = TextService()
    logger.info("Models loaded successfully")
    yield
    logger.info("Shutting down ML service")


app = FastAPI(
    title="MoodRec ML Service",
    version="1.0.0",
    description="Facial emotion detection and text sentiment analysis",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(emotion.router, prefix="", tags=["Emotion Detection"])
app.include_router(sentiment.router, prefix="", tags=["Sentiment Analysis"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "mood-ml"}
