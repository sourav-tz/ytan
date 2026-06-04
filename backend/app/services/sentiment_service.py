import re
import os
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from typing import List, Dict, Any

_NLTK_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "nltk_data")
os.makedirs(_NLTK_DIR, exist_ok=True)
nltk.data.path.insert(0, os.path.abspath(_NLTK_DIR))
nltk.download("vader_lexicon", download_dir=os.path.abspath(_NLTK_DIR), quiet=True)

_sia = SentimentIntensityAnalyzer()

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

_EMOTION_RULES: List[tuple] = [
    ("happy",     re.compile(r"\b(great|love|amazing|wonderful|excellent|awesome|fantastic|happy|joy|best|beautiful|perfect|incredible|brilliant|superb|outstanding)\b", re.I)),
    ("angry",     re.compile(r"\b(hate|worst|terrible|awful|horrible|disgusting|pathetic|useless|annoying|angry|furious|rage|outraged)\b", re.I)),
    ("sad",       re.compile(r"\b(sad|miss|cry|tears|heartbreak|depressing|unfortunate|disappointing|regret|lonely|grief|sorrow)\b", re.I)),
    ("surprised", re.compile(r"\b(wow|omg|unexpected|surprising|shocked|unbelievable|incredible|whoa|crazy|mind.?blown)\b", re.I)),
    ("fearful",   re.compile(r"\b(scary|afraid|fear|worried|terrifying|anxious|nervous|dread|panic|horror)\b", re.I)),
    ("disgusted", re.compile(r"\b(disgusting|gross|vile|revolting|nauseating|repulsive|yuck|eww)\b", re.I)),
]


def _detect_emotion(text: str) -> tuple[str, float]:
    for emotion, pattern in _EMOTION_RULES:
        matches = pattern.findall(text)
        if matches:
            return emotion, min(0.5 + 0.1 * len(matches), 0.99)
    return "neutral", 0.6


class SentimentService:
    def analyze_batch(self, comments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        enriched = []
        for comment in comments:
            text = comment["text"][:512]
            scores = _sia.polarity_scores(text)
            compound = scores["compound"]

            if compound >= 0.05:
                sentiment, score = "positive", round((compound + 1) / 2, 4)
            elif compound <= -0.05:
                sentiment, score = "negative", round((1 - compound) / 2, 4)
            else:
                sentiment, score = "neutral", round(1 - abs(compound), 4)

            emotion, emotion_score = _detect_emotion(text)

            enriched.append({
                **comment,
                "sentiment": sentiment,
                "sentiment_score": score,
                "emotion": emotion,
                "emotion_score": emotion_score,
                "is_toxic": bool(TOXIC_PATTERNS.search(text)),
                "is_spam": bool(SPAM_PATTERNS.search(text)),
            })
        return enriched


sentiment_service = SentimentService()
