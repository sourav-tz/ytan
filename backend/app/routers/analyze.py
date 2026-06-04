from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeRequest, AnalysisResult
from app.services.youtube_service import youtube_service
from app.services.sentiment_service import sentiment_service
from app.services.analytics_service import analytics_service
from app.services.insights_service import insights_service
import asyncio

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_video(request: AnalyzeRequest):
    video_id = request.extract_video_id()
    if not video_id:
        raise HTTPException(status_code=400, detail="Could not extract video ID from URL")

    try:
        metadata = await asyncio.to_thread(youtube_service.get_video_metadata, video_id)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=404, detail=str(e))

    try:
        raw_comments = await asyncio.to_thread(youtube_service.fetch_comments, video_id)
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not raw_comments:
        raise HTTPException(status_code=404, detail="No comments found for this video")

    enriched = await asyncio.to_thread(sentiment_service.analyze_batch, raw_comments)

    sentiment_dist = analytics_service.compute_sentiment_distribution(enriched)
    emotion_dist = analytics_service.compute_emotion_distribution(enriched)
    engagement = analytics_service.compute_engagement(enriched)
    keywords = analytics_service.compute_keywords(enriched)
    top_positive = analytics_service.get_top_comments(enriched, "positive")
    top_negative = analytics_service.get_top_comments(enriched, "negative")
    sample = analytics_service.get_sample_comments(enriched)

    insights = insights_service.generate_insights(
        enriched, sentiment_dist.model_dump()
    )

    return AnalysisResult(
        video_id=video_id,
        video_title=metadata["title"],
        video_thumbnail=metadata["thumbnail"],
        total_comments_fetched=len(enriched),
        sentiment=sentiment_dist,
        emotions=emotion_dist,
        engagement=engagement,
        top_positive_comments=top_positive,
        top_negative_comments=top_negative,
        keywords=keywords,
        insights=insights,
        sample_comments=sample,
    )


@router.get("/health")
async def health():
    return {"status": "ok", "service": "YtAna API"}
