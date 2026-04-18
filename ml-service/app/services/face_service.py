import base64
import io
import logging
from typing import Optional

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# DeepFace emotion labels → our app mood labels
DEEPFACE_TO_APP_MOOD = {
    "angry":    "angry",
    "disgust":  "disgusted",
    "fear":     "fearful",
    "happy":    "happy",
    "sad":      "sad",
    "surprise": "surprised",
    "neutral":  "neutral",
}


class FaceService:
    def __init__(self):
        # Import here so model loads once at startup
        try:
            from deepface import DeepFace
            self._deepface = DeepFace
            # Warm up: run a tiny dummy image to load model weights
            dummy = np.zeros((48, 48, 3), dtype=np.uint8)
            try:
                self._deepface.analyze(dummy, actions=["emotion"],
                                       enforce_detection=False, silent=True)
            except Exception:
                pass
            logger.info("DeepFace loaded successfully")
        except ImportError:
            logger.warning("DeepFace not installed – face detection unavailable")
            self._deepface = None

    def detect_emotion(self, image_base64: str) -> dict:
        """
        Decode base64 image, run DeepFace, return mood + confidence.
        Raises ValueError if no face detected.
        """
        if self._deepface is None:
            raise RuntimeError("DeepFace is not available")

        image = self._decode_image(image_base64)
        img_array = np.array(image.convert("RGB"))

        results = self._deepface.analyze(
            img_array,
            actions=["emotion"],
            enforce_detection=True,
            detector_backend="opencv",
            silent=True,
        )

        if not results:
            raise ValueError("No face detected")

        # DeepFace returns list when multiple faces found – use first (dominant) face
        face_data = results[0] if isinstance(results, list) else results
        dominant = face_data.get("dominant_emotion", "neutral")
        emotions = face_data.get("emotion", {})

        mood = DEEPFACE_TO_APP_MOOD.get(dominant, "neutral")
        raw_confidence = emotions.get(dominant, 0.0) / 100.0  # DeepFace returns 0-100

        # Apply temperature scaling to avoid overconfident outputs
        confidence = self._calibrate_confidence(raw_confidence)

        return {
            "mood": mood,
            "confidence": round(confidence, 3),
            "raw_emotions": {
                DEEPFACE_TO_APP_MOOD.get(k, k): round(v / 100, 3)
                for k, v in emotions.items()
            },
        }

    def _decode_image(self, image_base64: str) -> Image.Image:
        # Strip data URI prefix if present (e.g. "data:image/jpeg;base64,...")
        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]
        try:
            raw = base64.b64decode(image_base64)
            return Image.open(io.BytesIO(raw))
        except Exception as e:
            raise ValueError(f"Invalid image data: {e}")

    def _calibrate_confidence(self, raw: float) -> float:
        """Mild dampening to prevent 0.99 outputs."""
        return 0.5 + (raw - 0.5) * 0.85
