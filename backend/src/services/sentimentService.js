const vader = require('vader-sentiment');

const TOXIC_PATTERN = /\b(idiot|stupid|dumb|hate|kill|die|loser|moron|trash|garbage|worthless|shut\s+up|f+u+c+k|s+h+i+t|b+i+t+c+h|a+s+s+h+o+l+e|damn\s+you)\b/i;
const SPAM_PATTERN = /(sub.*sub|subscribe.*channel|check.*my|visit.*link|click.*here|free.*money|earn.*fast|https?:\/\/|www\.|t\.me\/|bit\.ly\/|follow.*back)/i;

const EMOTION_RULES = [
  ['happy',     /\b(great|love|amazing|wonderful|excellent|awesome|fantastic|happy|joy|best|beautiful|perfect|incredible|brilliant|superb|outstanding)\b/gi],
  ['angry',     /\b(hate|worst|terrible|awful|horrible|disgusting|pathetic|useless|annoying|angry|furious|rage|outraged)\b/gi],
  ['sad',       /\b(sad|miss|cry|tears|heartbreak|depressing|unfortunate|disappointing|regret|lonely|grief|sorrow)\b/gi],
  ['surprised', /\b(wow|omg|unexpected|surprising|shocked|unbelievable|incredible|whoa|crazy|mind.?blown)\b/gi],
  ['fearful',   /\b(scary|afraid|fear|worried|terrifying|anxious|nervous|dread|panic|horror)\b/gi],
  ['disgusted', /\b(disgusting|gross|vile|revolting|nauseating|repulsive|yuck|eww)\b/gi],
];

function detectEmotion(text) {
  for (const [emotion, pattern] of EMOTION_RULES) {
    const matches = text.match(pattern);
    if (matches) {
      return { emotion, emotion_score: Math.min(0.5 + 0.1 * matches.length, 0.99) };
    }
  }
  return { emotion: 'neutral', emotion_score: 0.6 };
}

class SentimentService {
  analyzeBatch(comments) {
    return comments.map(comment => {
      const text = comment.text.slice(0, 512);
      const scores = vader.SentimentIntensityAnalyzer.polarity_scores(text);
      const compound = scores.compound;

      let sentiment, score;
      if (compound >= 0.05) {
        sentiment = 'positive';
        score = Math.round(((compound + 1) / 2) * 10000) / 10000;
      } else if (compound <= -0.05) {
        sentiment = 'negative';
        score = Math.round(((1 - compound) / 2) * 10000) / 10000;
      } else {
        sentiment = 'neutral';
        score = Math.round((1 - Math.abs(compound)) * 10000) / 10000;
      }

      const { emotion, emotion_score } = detectEmotion(text);

      return {
        ...comment,
        sentiment,
        sentiment_score: score,
        emotion,
        emotion_score,
        is_toxic: TOXIC_PATTERN.test(text),
        is_spam: SPAM_PATTERN.test(text),
      };
    });
  }
}

module.exports = new SentimentService();
