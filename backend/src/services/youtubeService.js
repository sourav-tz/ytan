const { google } = require('googleapis');
const config = require('../config');

class YouTubeService {
  constructor() {
    this._client = null;
  }

  _getClient() {
    if (!this._client) {
      this._client = google.youtube({ version: 'v3', auth: config.youtubeApiKey });
    }
    return this._client;
  }

  async getVideoMetadata(videoId) {
    let response;
    try {
      response = await this._getClient().videos.list({
        part: ['snippet', 'statistics'],
        id: [videoId],
      });
    } catch (err) {
      throw new Error(`YouTube API error: ${err.message}`);
    }

    const items = response.data.items;
    if (!items || items.length === 0) {
      throw new Error(`Video ${videoId} not found or is private`);
    }

    const item = items[0];
    const snippet = item.snippet;
    const thumbnails = snippet.thumbnails || {};
    const thumbnail =
      thumbnails.maxres?.url ||
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      '';

    return {
      title: snippet.title || 'Unknown Title',
      thumbnail,
      channel: snippet.channelTitle || '',
      view_count: parseInt(item.statistics?.viewCount || 0),
      comment_count: parseInt(item.statistics?.commentCount || 0),
    };
  }

  async fetchComments(videoId) {
    const comments = [];
    let nextPageToken = null;
    const client = this._getClient();
    console.log(`[fetchComments] maxComments=${config.maxComments}`);

    try {
      while (comments.length < config.maxComments) {
        const params = {
          part: ['snippet'],
          videoId,
          maxResults: 100,
          textFormat: 'plainText',
          order: 'relevance',
        };
        if (nextPageToken) params.pageToken = nextPageToken;

        const response = await client.commentThreads.list(params);
        const items = response.data.items || [];

        for (const item of items) {
          const top = item.snippet.topLevelComment.snippet;
          comments.push({
            id: item.id,
            text: top.textDisplay || '',
            author: top.authorDisplayName || 'Anonymous',
            likes: top.likeCount || 0,
            published_at: top.publishedAt || '',
          });
        }

        nextPageToken = response.data.nextPageToken;
        if (!nextPageToken) break;
      }
    } catch (err) {
      if (err.message && err.message.includes('commentsDisabled')) {
        throw new Error('Comments are disabled for this video');
      }
      throw new Error(`YouTube API error: ${err.message}`);
    }

    return comments.slice(0, config.maxComments);
  }
}

module.exports = new YouTubeService();
