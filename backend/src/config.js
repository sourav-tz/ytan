module.exports = {
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  maxComments: parseInt(process.env.MAX_COMMENTS || '500', 10),
  port: parseInt(process.env.PORT || '8050', 10),
};
