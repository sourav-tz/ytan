from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from urllib.parse import quote
import yt_dlp
import tempfile
import os
import shutil

router = APIRouter()

QUALITY_LEVELS = [
    {"value": "1080p", "label": "1080p Full HD", "min": 900,  "max": 1200},
    {"value": "720p",  "label": "720p HD",       "min": 600,  "max": 899},
    {"value": "480p",  "label": "480p SD",        "min": 420,  "max": 599},
    {"value": "360p",  "label": "360p",           "min": 300,  "max": 419},
    {"value": "240p",  "label": "240p",           "min": 180,  "max": 299},
    {"value": "144p",  "label": "144p",           "min": 0,    "max": 179},
]

FORMAT_MAP = {
    "1080p": "best[height<=1080]/worst",
    "720p":  "best[height<=720]/worst",
    "480p":  "best[height<=480]/worst",
    "360p":  "best[height<=360]/worst",
    "240p":  "best[height<=240]/worst",
    "144p":  "best[height<=144]/worst",
    "m4a":   "bestaudio[ext=m4a][vcodec=none]/bestaudio[vcodec=none]/bestaudio",
    "mp3":   "bestaudio[vcodec=none]/bestaudio",
}

AUDIO_POSTPROCESSORS = {
    "mp3": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}],
}

MIME_MAP = {
    "mp4":  "video/mp4",
    "webm": "video/webm",
    "m4a":  "audio/x-m4a",
    "mp3":  "audio/mpeg",
    "opus": "audio/ogg",
    "ogg":  "audio/ogg",
}


@router.get("/download/info")
async def get_video_info(url: str = Query(...)):
    try:
        ydl_opts = {"quiet": True, "no_warnings": True, "noplaylist": True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

        formats = info.get("formats", [])

        # height → best filesize for that height
        height_size: dict[int, int] = {}
        audio_size = 0
        has_audio = False

        for f in formats:
            height = f.get("height")
            vcodec = f.get("vcodec", "none")
            acodec = f.get("acodec", "none")
            size   = f.get("filesize") or f.get("filesize_approx") or 0

            if height and vcodec and vcodec != "none":
                if size > height_size.get(height, 0):
                    height_size[height] = size

            if (not vcodec or vcodec == "none") and acodec and acodec != "none":
                has_audio = True
                if size > audio_size:
                    audio_size = size

        if not has_audio and height_size:
            has_audio = True

        def fmt_size(b: int) -> str:
            if not b:
                return ""
            if b >= 1_073_741_824:
                return f"{b/1_073_741_824:.1f} GB"
            if b >= 1_048_576:
                return f"{b/1_048_576:.1f} MB"
            return f"{b/1024:.0f} KB"

        available_qualities = []
        for q in QUALITY_LEVELS:
            matching = [h for h in height_size if q["min"] <= h <= q["max"]]
            if not matching:
                continue
            size_bytes = max(height_size[h] for h in matching)
            entry = {"value": q["value"], "label": q["label"]}
            if size_bytes:
                entry["size"] = fmt_size(size_bytes)
            available_qualities.append(entry)

        if has_audio:
            size_str = fmt_size(audio_size) if audio_size else ""
            available_qualities.append({"value": "m4a", "label": "Audio — M4A", **({"size": size_str} if size_str else {})})
            available_qualities.append({"value": "mp3", "label": "Audio — MP3", **({"size": size_str} if size_str else {})})

        duration_s = info.get("duration", 0) or 0
        minutes, seconds = divmod(int(duration_s), 60)

        return {
            "title":     info.get("title", ""),
            "thumbnail": info.get("thumbnail", ""),
            "channel":   info.get("uploader", ""),
            "duration":  f"{minutes}:{seconds:02d}",
            "available_qualities": available_qualities,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/download")
async def download_video(
    url: str = Query(...),
    quality: str = Query("720p"),
):
    fmt = FORMAT_MAP.get(quality, FORMAT_MAP["720p"])
    tmpdir = tempfile.mkdtemp()

    try:
        ydl_opts = {
            "format": fmt,
            "outtmpl": os.path.join(tmpdir, "%(title)s.%(ext)s"),
            "quiet": True,
            "no_warnings": True,
            "noplaylist": True,
            "nocheckcertificate": True,
        }
        if quality in AUDIO_POSTPROCESSORS:
            ydl_opts["postprocessors"] = AUDIO_POSTPROCESSORS[quality]

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get("title", "video")

        files = os.listdir(tmpdir)
        if not files:
            raise HTTPException(status_code=500, detail="Download failed — no file produced")

        # for audio quality, prefer the expected extension
        preferred = {"mp3": "mp3", "m4a": "m4a"}.get(quality)
        if preferred:
            match = next((f for f in files if f.lower().endswith(f".{preferred}")), None)
            target = match or files[0]
        else:
            target = files[0]

        file_path = os.path.join(tmpdir, target)
        actual_ext = target.rsplit(".", 1)[-1].lower()

        # audio quality: force correct extension regardless of container
        if quality == "mp3":
            ext, mime = "mp3", "audio/mpeg"
        elif quality == "m4a":
            ext, mime = "m4a", "audio/x-m4a"
        else:
            ext  = actual_ext
            mime = MIME_MAP.get(actual_ext, "application/octet-stream")
        safe_title = title.replace("/", "-").replace("\\", "-")[:100]
        encoded_name = quote(f"{safe_title}.{ext}", safe="")

        def iterfile():
            try:
                with open(file_path, "rb") as f:
                    while chunk := f.read(65536):
                        yield chunk
            finally:
                shutil.rmtree(tmpdir, ignore_errors=True)

        return StreamingResponse(
            iterfile(),
            media_type=mime,
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_name}"},
        )

    except HTTPException:
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))
