const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'it', 'in', 'on', 'at', 'to', 'for', 'of', 'and',
  'or', 'but', 'not', 'with', 'this', 'that', 'was', 'are', 'be', 'as', 'by',
  'from', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your',
  'his', 'her', 'our', 'their', 'me', 'him', 'us', 'them', 'so', 'if', 'up',
  'out', 'about', 'what', 'which', 'who', 'when', 'where', 'how', 'all', 'more',
  'just', 'can', 'also', 'very', 'too', 'been', 'than', 'its', 'into', 'no',
  'like', 'im', 'dont', 'cant', 'wont', 'ill', 'ive',
]);

class AnalyticsService {
  computeSentimentDistribution(comments) {
    const total = comments.length;
    const pos = comments.filter(c => c.sentiment === 'positive').length;
    const neg = comments.filter(c => c.sentiment === 'negative').length;
    const neu = total - pos - neg;
    const pct = n => (total ? Math.round((n / total) * 1000) / 10 : 0.0);

    return {
      positive: pos, negative: neg, neutral: neu,
      positive_pct: pct(pos), negative_pct: pct(neg), neutral_pct: pct(neu),
    };
  }

  computeEmotionDistribution(comments) {
    const counts = {};
    for (const c of comments) {
      const e = c.emotion || 'neutral';
      counts[e] = (counts[e] || 0) + 1;
    }
    return {
      happy: counts.happy || 0,
      angry: counts.angry || 0,
      sad: counts.sad || 0,
      surprised: counts.surprised || 0,
      fearful: counts.fearful || 0,
      disgusted: counts.disgusted || 0,
      neutral: counts.neutral || 0,
    };
  }

  computeKeywords(comments, topN = 20) {
    const wordCounts = {};
    for (const c of comments) {
      const words = c.text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      for (const w of words) {
        if (!STOP_WORDS.has(w)) {
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
      }
    }
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, count]) => ({ word, count }));
  }

  computeEngagement(comments) {
    const total = comments.length;
    const totalLikes = comments.reduce((sum, c) => sum + (c.likes || 0), 0);
    const toxic = comments.filter(c => c.is_toxic).length;
    const spam = comments.filter(c => c.is_spam).length;
    const pct = n => (total ? Math.round((n / total) * 1000) / 10 : 0.0);

    return {
      total_comments: total,
      total_likes_on_comments: totalLikes,
      avg_likes_per_comment: total ? Math.round((totalLikes / total) * 100) / 100 : 0.0,
      toxic_count: toxic,
      spam_count: spam,
      toxic_pct: pct(toxic),
      spam_pct: pct(spam),
    };
  }

  getTopComments(comments, sentiment, n = 5) {
    return comments
      .filter(c => c.sentiment === sentiment)
      .sort((a, b) => {
        const diff = (b.sentiment_score || 0) - (a.sentiment_score || 0);
        return diff !== 0 ? diff : (b.likes || 0) - (a.likes || 0);
      })
      .slice(0, n);
  }

  getSampleComments(comments, n = 50) {
    return comments.slice(0, n);
  }
}

module.exports = new AnalyticsService();
