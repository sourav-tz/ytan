from typing import List, Dict, Any
from collections import Counter
import re
from app.models.schemas import AIInsights

REQUEST_PATTERNS = re.compile(
    r"\b(please|can you|could you|more|next|part\s*\d+|tutorial|"
    r"explain|show|make|need|want|wish|hope)\b",
    re.IGNORECASE,
)


class InsightsService:
    def _top_keywords_for_sentiment(
        self,
        comments: List[Dict[str, Any]],
        sentiment: str,
        n: int = 10,
    ) -> List[str]:
        stop = {"the", "a", "an", "is", "it", "in", "on", "to", "for", "and", "of",
                "this", "that", "was", "are", "you", "i", "my", "your", "so", "just",
                "very", "too", "its", "like", "im", "but", "not"}
        words: List[str] = []
        for c in comments:
            if c.get("sentiment") == sentiment:
                words.extend(
                    w for w in re.findall(r"\b[a-z]{3,}\b", c["text"].lower())
                    if w not in stop
                )
        counter = Counter(words)
        return [w for w, _ in counter.most_common(n)]

    def _extract_requests(self, comments: List[Dict[str, Any]]) -> List[str]:
        requests = []
        for c in comments:
            if REQUEST_PATTERNS.search(c["text"]):
                requests.append(c["text"][:120].strip())
        return requests[:5]

    def generate_insights(
        self,
        comments: List[Dict[str, Any]],
        sentiment_dist: Dict[str, Any],
    ) -> AIInsights:
        pos_keywords = self._top_keywords_for_sentiment(comments, "positive")
        neg_keywords = self._top_keywords_for_sentiment(comments, "negative")
        requests = self._extract_requests(comments)

        total = len(comments)
        pos_pct = sentiment_dist.get("positive_pct", 0)
        neg_pct = sentiment_dist.get("negative_pct", 0)

        liked_most = (
            f"Viewers reacted positively to: {', '.join(pos_keywords[:6])}. "
            f"{pos_pct}% of comments expressed positive sentiment."
            if pos_keywords
            else "No strong positive themes detected."
        )

        disliked_most = (
            f"Common negative themes: {', '.join(neg_keywords[:6])}. "
            f"{neg_pct}% of comments were negative."
            if neg_keywords
            else "Very few negative comments detected."
        )

        common_requests = (
            "Top viewer requests: " + " | ".join(f'"{r}"' for r in requests[:3])
            if requests
            else "No clear viewer requests detected in comments."
        )

        if pos_pct >= 60:
            tone = "overwhelmingly positive"
            suggestion = "Continue creating similar content. Consider a follow-up or series."
        elif pos_pct >= 40:
            tone = "generally positive with room for improvement"
            suggestion = "Address the negative feedback themes and engage with viewer questions."
        else:
            tone = "mixed to negative"
            suggestion = "Review content quality, pacing, or topic alignment with your audience."

        improvement_suggestions = (
            f"Audience sentiment is {tone}. {suggestion} "
            f"{'Top requests: ' + ', '.join(requests[:2]) if requests else ''}"
        ).strip()

        overall_summary = (
            f"Analyzed {total} comments. {pos_pct}% positive, "
            f"{neg_pct}% negative. Audience tone is {tone}."
        )

        return AIInsights(
            liked_most=liked_most,
            disliked_most=disliked_most,
            common_requests=common_requests,
            improvement_suggestions=improvement_suggestions,
            overall_sentiment_summary=overall_summary,
        )


insights_service = InsightsService()
