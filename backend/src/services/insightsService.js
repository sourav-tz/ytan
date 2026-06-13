const REQUEST_PATTERN = /\b(please|can you|could you|more|next|part\s*\d+|tutorial|explain|show|make|need|want|wish|hope)\b/i;

const INSIGHT_STOP = new Set([
  'the', 'a', 'an', 'is', 'it', 'in', 'on', 'to', 'for', 'and', 'of',
  'this', 'that', 'was', 'are', 'you', 'i', 'my', 'your', 'so', 'just',
  'very', 'too', 'its', 'like', 'im', 'but', 'not',
]);

class InsightsService {
  _topKeywordsForSentiment(comments, sentiment, n = 10) {
    const wordCounts = {};
    for (const c of comments) {
      if (c.sentiment !== sentiment) continue;
      const words = c.text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      for (const w of words) {
        if (!INSIGHT_STOP.has(w)) {
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
      }
    }
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([w]) => w);
  }

  _extractRequests(comments) {
    return comments
      .filter(c => REQUEST_PATTERN.test(c.text))
      .slice(0, 5)
      .map(c => c.text.slice(0, 120).trim());
  }

  generateInsights(comments, sentimentDist) {
    const posKeywords = this._topKeywordsForSentiment(comments, 'positive');
    const negKeywords = this._topKeywordsForSentiment(comments, 'negative');
    const requests = this._extractRequests(comments);

    const total = comments.length;
    const pos_pct = sentimentDist.positive_pct || 0;
    const neg_pct = sentimentDist.negative_pct || 0;

    const liked_most = posKeywords.length
      ? `Viewers reacted positively to: ${posKeywords.slice(0, 6).join(', ')}. ${pos_pct}% of comments expressed positive sentiment.`
      : 'No strong positive themes detected.';

    const disliked_most = negKeywords.length
      ? `Common negative themes: ${negKeywords.slice(0, 6).join(', ')}. ${neg_pct}% of comments were negative.`
      : 'Very few negative comments detected.';

    const common_requests = requests.length
      ? 'Top viewer requests: ' + requests.slice(0, 3).map(r => `"${r}"`).join(' | ')
      : 'No clear viewer requests detected in comments.';

    let tone, suggestion;
    if (pos_pct >= 60) {
      tone = 'overwhelmingly positive';
      suggestion = 'Continue creating similar content. Consider a follow-up or series.';
    } else if (pos_pct >= 40) {
      tone = 'generally positive with room for improvement';
      suggestion = 'Address the negative feedback themes and engage with viewer questions.';
    } else {
      tone = 'mixed to negative';
      suggestion = 'Review content quality, pacing, or topic alignment with your audience.';
    }

    const topRequests = requests.slice(0, 2);
    const improvement_suggestions = (
      `Audience sentiment is ${tone}. ${suggestion}` +
      (topRequests.length ? ` Top requests: ${topRequests.join(', ')}` : '')
    ).trim();

    const overall_sentiment_summary =
      `Analyzed ${total} comments. ${pos_pct}% positive, ${neg_pct}% negative. Audience tone is ${tone}.`;

    return {
      liked_most,
      disliked_most,
      common_requests,
      improvement_suggestions,
      overall_sentiment_summary,
    };
  }
}

module.exports = new InsightsService();
