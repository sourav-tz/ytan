const express = require('express');
const router = express.Router();
const youtubeService = require('../services/youtubeService');
const sentimentService = require('../services/sentimentService');
const analyticsService = require('../services/analyticsService');
const insightsService = require('../services/insightsService');

function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

router.post('/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ detail: 'URL is required' });

  const videoId = extractVideoId(url);
  if (!videoId) return res.status(400).json({ detail: 'Could not extract video ID from URL' });

  let metadata;
  try {
    metadata = await youtubeService.getVideoMetadata(videoId);
  } catch (err) {
    return res.status(404).json({ detail: err.message });
  }

  let rawComments;
  try {
    rawComments = await youtubeService.fetchComments(videoId);
  } catch (err) {
    return res.status(422).json({ detail: err.message });
  }

  if (!rawComments.length) {
    return res.status(404).json({ detail: 'No comments found for this video' });
  }

  const enriched = sentimentService.analyzeBatch(rawComments);
  const sentiment = analyticsService.computeSentimentDistribution(enriched);
  const emotions = analyticsService.computeEmotionDistribution(enriched);
  const engagement = analyticsService.computeEngagement(enriched);
  const keywords = analyticsService.computeKeywords(enriched);
  const top_positive_comments = analyticsService.getTopComments(enriched, 'positive');
  const top_negative_comments = analyticsService.getTopComments(enriched, 'negative');
  const sample_comments = analyticsService.getSampleComments(enriched);
  const insights = insightsService.generateInsights(enriched, sentiment);

  res.json({
    video_id: videoId,
    video_title: metadata.title,
    video_thumbnail: metadata.thumbnail,
    total_comments_fetched: enriched.length,
    sentiment,
    emotions,
    engagement,
    top_positive_comments,
    top_negative_comments,
    keywords,
    insights,
    sample_comments,
  });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'YtAna API' });
});

module.exports = router;
