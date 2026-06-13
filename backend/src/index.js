require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const analyzeRouter = require('./routes/analyze');
const downloadRouter = require('./routes/download');

if (process.env.YOUTUBE_COOKIES_B64) {
  fs.writeFileSync(
    '/tmp/yt-cookies.txt',
    Buffer.from(process.env.YOUTUBE_COOKIES_B64, 'base64').toString('utf8')
  );
  console.log('YouTube cookies loaded');
}

const app = express();
const PORT = process.env.PORT || 8050;

app.use(cors());
app.use(express.json());

app.use('/api/v1', analyzeRouter);
app.use('/api/v1', downloadRouter);

app.listen(PORT, () => {
  console.log(`YtAna backend running on port ${PORT}`);
});
