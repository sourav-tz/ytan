from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import List, Dict, Any, Tuple
from app.config import settings


class YouTubeService:
    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            self._client = build("youtube", "v3", developerKey=settings.youtube_api_key)
        return self._client

    def get_video_metadata(self, video_id: str) -> Dict[str, Any]:
        try:
            response = (
                self._get_client()
                .videos()
                .list(part="snippet,statistics", id=video_id)
                .execute()
            )
            if not response.get("items"):
                raise ValueError(f"Video {video_id} not found or is private")
            item = response["items"][0]
            snippet = item["snippet"]
            thumbnails = snippet.get("thumbnails", {})
            thumbnail = (
                thumbnails.get("maxres", {}).get("url")
                or thumbnails.get("high", {}).get("url")
                or thumbnails.get("medium", {}).get("url")
                or ""
            )
            return {
                "title": snippet.get("title", "Unknown Title"),
                "thumbnail": thumbnail,
                "channel": snippet.get("channelTitle", ""),
                "view_count": int(item.get("statistics", {}).get("viewCount", 0)),
                "comment_count": int(item.get("statistics", {}).get("commentCount", 0)),
            }
        except HttpError as e:
            raise RuntimeError(f"YouTube API error: {e.reason}")

    def fetch_comments(self, video_id: str) -> List[Dict[str, Any]]:
        comments = []
        next_page_token = None
        client = self._get_client()

        try:
            while len(comments) < settings.max_comments:
                kwargs: Dict[str, Any] = {
                    "part": "snippet",
                    "videoId": video_id,
                    "maxResults": 100,
                    "textFormat": "plainText",
                    "order": "relevance",
                }
                if next_page_token:
                    kwargs["pageToken"] = next_page_token

                response = client.commentThreads().list(**kwargs).execute()

                for item in response.get("items", []):
                    top = item["snippet"]["topLevelComment"]["snippet"]
                    comments.append(
                        {
                            "id": item["id"],
                            "text": top.get("textDisplay", ""),
                            "author": top.get("authorDisplayName", "Anonymous"),
                            "likes": top.get("likeCount", 0),
                            "published_at": top.get("publishedAt", ""),
                        }
                    )

                next_page_token = response.get("nextPageToken")
                if not next_page_token:
                    break

        except HttpError as e:
            if "commentsDisabled" in str(e):
                raise RuntimeError("Comments are disabled for this video")
            raise RuntimeError(f"YouTube API error: {e.reason}")

        return comments[: settings.max_comments]


youtube_service = YouTubeService()
