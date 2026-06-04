import { useState, useEffect } from "react";
import { Download, Music, Video, Youtube, Loader2, Search, Clock, User } from "lucide-react";

const PHRASES = [
  "https://www.youtube.com/watch?v=...",
  "Paste any YouTube video link...",
  "Try a song, movie clip, or tutorial...",
  "Drop a Shorts or playlist link...",
];

function useTypewriter(phrases) {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => { setDisplayed(current.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, 55);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), 1600);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => { setDisplayed(current.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, 28);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx === 0) { setDeleting(false); setPhraseIdx(p => (p + 1) % phrases.length); }
  }, [charIdx, deleting, phraseIdx, phrases]);

  return displayed;
}

const ICON_MAP = { audio: Music, m4a: Music, mp3: Music };

export function VideoDownloader() {
  const [url, setUrl]         = useState("");
  const [fetching, setFetching] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [quality, setQuality] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const placeholder           = useTypewriter(PHRASES);

  const base = import.meta.env.VITE_API_URL ?? "/api/v1";

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setFetching(true);
    setError("");
    setVideoInfo(null);
    setQuality("");
    try {
      const res = await fetch(`${base}/download/info?url=${encodeURIComponent(url.trim())}`);
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || "Failed to fetch video info"); }
      const data = await res.json();
      setVideoInfo(data);
      if (data.available_qualities?.length) setQuality(data.available_qualities[0].value);
    } catch (e) {
      setError(e.message);
    } finally {
      setFetching(false);
    }
  };

  const handleDownload = async () => {
    if (!quality) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${base}/download?url=${encodeURIComponent(url.trim())}&quality=${quality}`);
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || "Download failed"); }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+?)"/);
      const filename = match ? match[1] : `video.${quality === "audio" ? "m4a" : "mp4"}`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center space-y-8 pt-6 pb-2 w-full">
      <div className="space-y-3">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
          Download YouTube
          <br />
          <span className="bg-linear-to-r from-red-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
            videos & audio
          </span>
        </h2>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
          Paste a YouTube URL — we'll check available qualities for you.
        </p>
      </div>

      {/* URL Input */}
      <form onSubmit={handleFetch} className="w-full max-w-3xl mx-auto">
        <div className="flex gap-1.5 sm:gap-2 items-center bg-white border-2 border-slate-200 focus-within:border-red-400 focus-within:shadow-lg focus-within:shadow-red-100 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-xl shadow-slate-200/50 transition-all duration-300">
          <div className="pl-1 sm:pl-2 text-red-500 shrink-0">
            <Youtube size={18} className="sm:hidden" />
            <Youtube size={22} className="hidden sm:block" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setVideoInfo(null); setQuality(""); }}
            placeholder={placeholder}
            className="flex-1 outline-none text-slate-700 placeholder-slate-400 text-sm sm:text-base py-2 sm:py-2.5 bg-transparent min-w-0"
            disabled={fetching || loading}
            required
          />
          <button
            type="submit"
            disabled={fetching || !url.trim()}
            className="flex items-center gap-1.5 bg-linear-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm transition-all duration-200 shadow-md shadow-red-200 disabled:shadow-none whitespace-nowrap shrink-0"
          >
            {fetching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            <span className="hidden sm:inline">{fetching ? "Checking..." : "Check"}</span>
            <span className="sm:hidden">{fetching ? "..." : "Go"}</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Video Info + Quality selector */}
      {videoInfo && (
        <div className="w-full max-w-2xl mx-auto space-y-5">
          {/* Video preview */}
          <div className="flex gap-4 items-start bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-left">
            {videoInfo.thumbnail && (
              <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-28 sm:w-36 rounded-xl object-cover shrink-0 shadow-md" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2">{videoInfo.title}</p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><User size={11} />{videoInfo.channel}</p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={11} />{videoInfo.duration}</p>
            </div>
          </div>

          {/* Quality options */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {videoInfo.available_qualities.map(({ value, label, size }) => {
              const Icon = ICON_MAP[value] ?? Video;
              return (
                <button
                  key={value}
                  onClick={() => setQuality(value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200 ${
                    quality === value
                      ? "border-red-400 bg-red-50 text-red-700 shadow-md shadow-red-100"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-semibold">{label}</span>
                  {size && <span className="text-xs opacity-60">{size}</span>}
                </button>
              );
            })}
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={loading || !quality}
            className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-linear-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-lg shadow-red-200 disabled:shadow-none"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {loading ? "Downloading..." : `Download ${quality.toUpperCase()}`}
          </button>
        </div>
      )}
    </div>
  );
}
