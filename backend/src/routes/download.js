const express = require('express');
const router = express.Router();
const ytDlp = require('yt-dlp-exec');
const path = require('path');
const os = require('os');
const fs = require('fs');

const QUALITY_LEVELS = [
  { value: '1080p', label: '1080p Full HD', min: 900,  max: 1200 },
  { value: '720p',  label: '720p HD',       min: 600,  max: 899  },
  { value: '480p',  label: '480p SD',        min: 420,  max: 599  },
  { value: '360p',  label: '360p',           min: 300,  max: 419  },
  { value: '240p',  label: '240p',           min: 180,  max: 299  },
  { value: '144p',  label: '144p',           min: 0,    max: 179  },
];

const FORMAT_MAP = {
  '1080p': 'best[height<=1080][ext=mp4]/best[height<=1080]/best[ext=mp4]/best',
  '720p':  'best[height<=720][ext=mp4]/best[height<=720]/best[ext=mp4]/best',
  '480p':  'best[height<=480][ext=mp4]/best[height<=480]/best[ext=mp4]/best',
  '360p':  'best[height<=360][ext=mp4]/best[height<=360]/best[ext=mp4]/best',
  '240p':  'best[height<=240][ext=mp4]/best[height<=240]/best[ext=mp4]/best',
  '144p':  'best[height<=144][ext=mp4]/best[height<=144]/best[ext=mp4]/best',
  'm4a':   'bestaudio[ext=m4a]/bestaudio',
  'mp3':   'bestaudio',
};

const MIME_MAP = {
  mp4: 'video/mp4', webm: 'video/webm',
  m4a: 'audio/x-m4a', mp3: 'audio/mpeg',
  opus: 'audio/ogg', ogg: 'audio/ogg',
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}

router.get('/download/info', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ detail: 'url is required' });

  try {
    const infoOpts = {
      dumpSingleJson: true,
      noWarnings: true,
      noPlaylist: true,
      noCheckCertificates: true,
      extractorArgs: 'youtube:player_client=ios,android,web',
    };
    if (fs.existsSync('/tmp/yt-cookies.txt')) infoOpts.cookies = '/tmp/yt-cookies.txt';

    const info = await ytDlp(url, infoOpts);

    const formats = info.formats || [];
    const heightSize = {};
    let audioSize = 0;
    let hasAudio = false;

    for (const f of formats) {
      const height = f.height;
      const vcodec = f.vcodec || 'none';
      const acodec = f.acodec || 'none';
      const size = f.filesize || f.filesize_approx || 0;

      if (height && vcodec !== 'none') {
        if (size > (heightSize[height] || 0)) heightSize[height] = size;
      }

      if (vcodec === 'none' && acodec !== 'none') {
        hasAudio = true;
        if (size > audioSize) audioSize = size;
      }
    }

    if (!hasAudio && Object.keys(heightSize).length > 0) hasAudio = true;

    const available_qualities = [];
    for (const q of QUALITY_LEVELS) {
      const matching = Object.keys(heightSize).map(Number).filter(h => h >= q.min && h <= q.max);
      if (!matching.length) continue;
      const sizeBytes = Math.max(...matching.map(h => heightSize[h]));
      const entry = { value: q.value, label: q.label };
      if (sizeBytes) entry.size = formatSize(sizeBytes);
      available_qualities.push(entry);
    }

    if (hasAudio) {
      const sizeStr = formatSize(audioSize);
      available_qualities.push({ value: 'm4a', label: 'Audio — M4A', ...(sizeStr ? { size: sizeStr } : {}) });
      available_qualities.push({ value: 'mp3', label: 'Audio — MP3', ...(sizeStr ? { size: sizeStr } : {}) });
    }

    const durationS = info.duration || 0;
    const minutes = Math.floor(durationS / 60);
    const seconds = Math.floor(durationS % 60);

    res.json({
      title: info.title || '',
      thumbnail: info.thumbnail || '',
      channel: info.uploader || '',
      duration: `${minutes}:${String(seconds).padStart(2, '0')}`,
      available_qualities,
    });
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
});

router.get('/download', async (req, res) => {
  const { url, quality = '720p' } = req.query;
  if (!url) return res.status(400).json({ detail: 'url is required' });

  const fmt = FORMAT_MAP[quality] || FORMAT_MAP['720p'];
  const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ytana-'));

  try {
    const opts = {
      format: fmt,
      output: path.join(tmpdir, '%(title)s.%(ext)s'),
      quiet: true,
      noWarnings: true,
      noPlaylist: true,
      noCheckCertificates: true,
      extractorArgs: 'youtube:player_client=ios,android,web',
    };
    if (fs.existsSync('/tmp/yt-cookies.txt')) opts.cookies = '/tmp/yt-cookies.txt';

    if (quality === 'mp3') {
      opts.extractAudio = true;
      opts.audioFormat = 'mp3';
      opts.audioQuality = '192K';
    }

    await ytDlp(url, opts);

    const files = fs.readdirSync(tmpdir);
    if (!files.length) {
      cleanup(tmpdir);
      return res.status(500).json({ detail: 'Download failed — no file produced' });
    }

    const preferred = { mp3: 'mp3', m4a: 'm4a' }[quality];
    const target = preferred
      ? (files.find(f => f.toLowerCase().endsWith(`.${preferred}`)) || files[0])
      : files[0];

    const filePath = path.join(tmpdir, target);
    const actualExt = target.split('.').pop().toLowerCase();
    const rawTitle = target.replace(/\.[^.]+$/, '');

    let ext, mime;
    if (quality === 'mp3') { ext = 'mp3'; mime = 'audio/mpeg'; }
    else if (quality === 'm4a') { ext = 'm4a'; mime = 'audio/x-m4a'; }
    else { ext = actualExt; mime = MIME_MAP[actualExt] || 'application/octet-stream'; }

    const safeTitle = rawTitle.replace(/[/\\]/g, '-').slice(0, 100);
    const encodedName = encodeURIComponent(`${safeTitle}.${ext}`);

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    res.setHeader('Content-Type', mime);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('close', () => cleanup(tmpdir));
    stream.on('error', () => cleanup(tmpdir));

  } catch (err) {
    cleanup(tmpdir);
    if (!res.headersSent) {
      res.status(500).json({ detail: err.message });
    }
  }
});

module.exports = router;
