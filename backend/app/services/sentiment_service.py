import re
from typing import List, Dict, Any, Tuple
from transformers import pipeline
import torch


class SentimentService:
    _sentiment_pipeline = None
    _emotion_pipeline = None

    TOXIC_PATTERNS = re.compile(
        r"\b(idiot|stupid|dumb|hate|kill|die|loser|moron|trash|garbage|worthless|"
        r"shut up|f+u+c+k|s+h+i+t|b+i+t+c+h|a+s+s+h+o+l+e|damn you)\b",
        re.IGNORECASE,
    )
    SPAM_PATTERNS = re.compile(
        r"(sub.*sub|subscribe.*channel|check.*my|visit.*link|click.*here|"
        r"free.*money|earn.*fast|http[s]?://|www\.|t\.me/|bit\.ly/|follow.*back)",
        re.IGNORECASE,
    )

    @classmethod
    def _get_sentiment_pipeline(cls):
        if cls._sentiment_pipeline is None:
            device = 0 if torch.cuda.is_available() else -1
            cls._sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=device,
                truncation=True,
                max_length=512,
            )
        return cls._sentiment_pipeline

    @classmethod
    def _get_emotion_pipeline(cls):
        if cls._emotion_pipeline is None:
            device = 0 if torch.cuda.is_available() else -1
            cls._emotion_pipeline = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                device=device,
                truncation=True,
                max_length=512,
                top_k=1,
            )
        return cls._emotion_pipeline

    def _normalize_label(self, label: str) -> str:
        mapping = {
            "LABEL_0": "negative",
            "LABEL_1": "neutral",
            "LABEL_2": "positive",
            "NEGATIVE": "negative",
            "NEUTRAL": "neutral",
            "POSITIVE": "positive",
        }
        return mapping.get(label.upper(), label.lower())

    def _normalize_emotion(self, label: str) -> str:
        mapping = {
            "joy": "happy",
            "anger": "angry",
            "sadness": "sad",
            "surprise": "surprised",
            "fear": "fearful",
            "disgust": "disgusted",
            "neutral": "neutral",
        }
        return mapping.get(label.lower(), "neutral")

    def analyze_batch(
        self, comments: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        texts = [c["text"][:512] for c in comments]

        sentiment_pipe = self._get_sentiment_pipeline()
        emotion_pipe = self._get_emotion_pipeline()

        sentiment_results = sentiment_pipe(texts, batch_size=32)
        emotion_results = emotion_pipe(texts, batch_size=32)

        enriched = []
        for comment, sent, emo in zip(comments, sentiment_results, emotion_results):
            emo_item = emo[0] if isinstance(emo, list) else emo
            enriched.append(
                {
                    **comment,
                    "sentiment": self._normalize_label(sent["label"]),
                    "sentiment_score": round(float(sent["score"]), 4),
                    "emotion": self._normalize_emotion(emo_item["label"]),
                    "emotion_score": round(float(emo_item["score"]), 4),
                    "is_toxic": bool(self.TOXIC_PATTERNS.search(comment["text"])),
                    "is_spam": bool(self.SPAM_PATTERNS.search(comment["text"])),
                }
            )
        return enriched


sentiment_service = SentimentService()
