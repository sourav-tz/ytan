import re
from collections import Counter
from typing import List, Dict, Any
from app.models.schemas import (
    SentimentDistribution,
    EmotionDistribution,
    KeywordFrequency,
    EngagementStats,
    CommentData,
)

STOP_WORDS = {
    "the", "a", "an", "is", "it", "in", "on", "at", "to", "for", "of", "and",
    "or", "but", "not", "with", "this", "that", "was", "are", "be", "as", "by",
    "from", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "i", "you", "he", "she", "we", "they", "my", "your",
    "his", "her", "our", "their", "me", "him", "us", "them", "so", "if", "up",
    "out", "about", "what", "which", "who", "when", "where", "how", "all", "more",
    "just", "can", "also", "very", "too", "been", "than", "its", "into", "no",
    "like", "im", "its", "dont", "cant", "wont", "ill", "ive",
}


class AnalyticsService:
    def compute_sentiment_distribution(
        self, comments: List[Dict[str, Any]]
    ) -> SentimentDistribution:
        total = len(comments)
        pos = sum(1 for c in comments if c.get("sentiment") == "positive")
        neg = sum(1 for c in comments if c.get("sentiment") == "negative")
        neu = total - pos - neg

        def pct(n): return round(n / total * 100, 1) if total else 0.0

        return SentimentDistribution(
            positive=pos, negative=neg, neutral=neu,
            positive_pct=pct(pos), negative_pct=pct(neg), neutral_pct=pct(neu),
        )

    def compute_emotion_distribution(
        self, comments: List[Dict[str, Any]]
    ) -> EmotionDistribution:
        counts: Dict[str, int] = Counter(c.get("emotion", "neutral") for c in comments)
        return EmotionDistribution(
            happy=counts.get("happy", 0),
            angry=counts.get("angry", 0),
            sad=counts.get("sad", 0),
            surprised=counts.get("surprised", 0),
            fearful=counts.get("fearful", 0),
            disgusted=counts.get("disgusted", 0),
            neutral=counts.get("neutral", 0),
        )

    def compute_keywords(
        self, comments: List[Dict[str, Any]], top_n: int = 20
    ) -> List[KeywordFrequency]:
        all_words: List[str] = []
        for c in comments:
            words = re.findall(r"\b[a-z]{3,}\b", c["text"].lower())
            all_words.extend(w for w in words if w not in STOP_WORDS)
        counter = Counter(all_words)
        return [
            KeywordFrequency(word=w, count=cnt)
            for w, cnt in counter.most_common(top_n)
        ]

    def compute_engagement(self, comments: List[Dict[str, Any]]) -> EngagementStats:
        total = len(comments)
        total_likes = sum(c.get("likes", 0) for c in comments)
        toxic = sum(1 for c in comments if c.get("is_toxic"))
        spam = sum(1 for c in comments if c.get("is_spam"))

        def pct(n): return round(n / total * 100, 1) if total else 0.0

        return EngagementStats(
            total_comments=total,
            total_likes_on_comments=total_likes,
            avg_likes_per_comment=round(total_likes / total, 2) if total else 0.0,
            toxic_count=toxic,
            spam_count=spam,
            toxic_pct=pct(toxic),
            spam_pct=pct(spam),
        )

    def get_top_comments(
        self, comments: List[Dict[str, Any]], sentiment: str, n: int = 5
    ) -> List[CommentData]:
        filtered = [c for c in comments if c.get("sentiment") == sentiment]
        sorted_comments = sorted(
            filtered,
            key=lambda c: (c.get("sentiment_score", 0), c.get("likes", 0)),
            reverse=True,
        )
        return [CommentData(**c) for c in sorted_comments[:n]]

    def get_sample_comments(
        self, comments: List[Dict[str, Any]], n: int = 50
    ) -> List[CommentData]:
        return [CommentData(**c) for c in comments[:n]]


analytics_service = AnalyticsService()
