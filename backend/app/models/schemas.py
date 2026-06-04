from pydantic import BaseModel, HttpUrl, field_validator
from typing import List, Optional
import re


class AnalyzeRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_youtube_url(cls, v: str) -> str:
        patterns = [
            r"(?:v=|youtu\.be/|embed/|shorts/)([a-zA-Z0-9_-]{11})",
        ]
        for p in patterns:
            if re.search(p, v):
                return v
        raise ValueError("Not a valid YouTube URL")

    def extract_video_id(self) -> str:
        match = re.search(
            r"(?:v=|youtu\.be/|embed/|shorts/)([a-zA-Z0-9_-]{11})", self.url
        )
        return match.group(1) if match else ""


class CommentData(BaseModel):
    id: str
    text: str
    author: str
    likes: int
    published_at: str
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    emotion: Optional[str] = None
    emotion_score: Optional[float] = None
    is_toxic: Optional[bool] = None
    is_spam: Optional[bool] = None


class SentimentDistribution(BaseModel):
    positive: int
    negative: int
    neutral: int
    positive_pct: float
    negative_pct: float
    neutral_pct: float


class EmotionDistribution(BaseModel):
    happy: int
    angry: int
    sad: int
    surprised: int
    fearful: int
    disgusted: int
    neutral: int


class KeywordFrequency(BaseModel):
    word: str
    count: int


class EngagementStats(BaseModel):
    total_comments: int
    total_likes_on_comments: int
    avg_likes_per_comment: float
    toxic_count: int
    spam_count: int
    toxic_pct: float
    spam_pct: float


class AIInsights(BaseModel):
    liked_most: str
    disliked_most: str
    common_requests: str
    improvement_suggestions: str
    overall_sentiment_summary: str


class AnalysisResult(BaseModel):
    video_id: str
    video_title: str
    video_thumbnail: str
    total_comments_fetched: int
    sentiment: SentimentDistribution
    emotions: EmotionDistribution
    engagement: EngagementStats
    top_positive_comments: List[CommentData]
    top_negative_comments: List[CommentData]
    keywords: List[KeywordFrequency]
    insights: AIInsights
    sample_comments: List[CommentData]
