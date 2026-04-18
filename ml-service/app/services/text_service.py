import logging
from typing import Optional

logger = logging.getLogger(__name__)

# HuggingFace label → app mood
HF_LABEL_MAP = {
    # j-hartmann/emotion-english-distilroberta-base labels:
    "joy":      "happy",
    "sadness":  "sad",
    "anger":    "angry",
    "fear":     "fearful",
    "surprise": "surprised",
    "disgust":  "disgusted",
    "neutral":  "neutral",
    # distilbert-base-uncased-finetuned-sst-2 labels:
    "POSITIVE": "happy",
    "NEGATIVE": "sad",
    # cardiffnlp/twitter-roberta-base-emotion:
    "optimism": "happy",
    "love":     "calm",
    "worry":    "stressed",
    "hate":     "angry",
}

MODEL_NAME = "j-hartmann/emotion-english-distilroberta-base"


class TextService:
    def __init__(self):
        try:
            from transformers import pipeline
            self._pipeline = pipeline(
                "text-classification",
                model=MODEL_NAME,
                top_k=None,          # return all scores
                truncation=True,
                max_length=512,
            )
            logger.info(f"Text model loaded: {MODEL_NAME}")
        except Exception as e:
            logger.warning(f"Could not load HuggingFace model: {e}. Using fallback.")
            self._pipeline = None

    def analyze_sentiment(self, text: str) -> dict:
        """
        Run the emotion classifier and return mood + confidence.
        Falls back to keyword heuristic if model unavailable.
        """
        if self._pipeline is None:
            return self._keyword_fallback(text)

        try:
            results = self._pipeline(text[:512])
            # results is list of list of dicts: [[{label, score}, ...]]
            scores = results[0] if isinstance(results[0], list) else results
            best = max(scores, key=lambda x: x["score"])

            mood = HF_LABEL_MAP.get(best["label"], "neutral")
            confidence = round(best["score"], 3)

            all_moods = {
                HF_LABEL_MAP.get(r["label"], r["label"]): round(r["score"], 3)
                for r in scores
            }

            return {
                "mood": mood,
                "confidence": confidence,
                "raw_emotions": all_moods,
            }
        except Exception as e:
            logger.error(f"Text analysis error: {e}")
            return self._keyword_fallback(text)

    def _keyword_fallback(self, text: str) -> dict:
        """Simple keyword-based fallback when model is unavailable."""
        text_lower = text.lower()
        keyword_map = {
            "happy":    ["happy", "joy", "great", "amazing", "wonderful", "excited", "love"],
            "sad":      ["sad", "depressed", "unhappy", "cry", "grief", "lost", "miss"],
            "angry":    ["angry", "furious", "hate", "rage", "mad", "annoyed"],
            "stressed": ["stressed", "overwhelmed", "anxious", "worried", "pressure", "too much"],
            "calm":     ["calm", "peaceful", "relaxed", "serene", "content", "fine"],
            "fearful":  ["scared", "afraid", "fear", "terrified", "nervous", "dread"],
        }
        for mood, keywords in keyword_map.items():
            if any(k in text_lower for k in keywords):
                return {"mood": mood, "confidence": 0.65, "raw_emotions": None}
        return {"mood": "neutral", "confidence": 0.55, "raw_emotions": None}
