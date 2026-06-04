import { useState, useEffect } from "react";
import { Search, Youtube } from "lucide-react";

const PHRASES = [
  "Paste YouTube video URL here...",
  "https://youtube.com/watch?v=...",
  "Drop any YouTube link to analyze...",
  "Try a music video, tutorial, or vlog...",
];

function useTypewriter(phrases) {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => { setDisplayed(current.slice(0, charIdx + 1)); setCharIdx((c) => c + 1); }, 55);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), 1600);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => { setDisplayed(current.slice(0, charIdx - 1)); setCharIdx((c) => c - 1); }, 28);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx === 0) { setDeleting(false); setPhraseIdx((p) => (p + 1) % phrases.length); }
  }, [charIdx, deleting, phraseIdx, phrases]);

  return displayed;
}

export function UrlInput({ onAnalyze, loading }) {
  const [url, setUrl] = useState("");
  const placeholder = useTypewriter(PHRASES);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) onAnalyze(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex gap-1.5 sm:gap-2 items-center bg-white border-2 border-slate-200 focus-within:border-red-400 focus-within:shadow-lg focus-within:shadow-red-100 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-xl shadow-slate-200/50 transition-all duration-300">
        <div className="pl-1 sm:pl-2 text-red-500 shrink-0">
          <Youtube size={18} className="sm:hidden" />
          <Youtube size={22} className="hidden sm:block" />
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholder}
          className="flex-1 outline-none text-slate-700 placeholder-slate-400 text-sm sm:text-base py-2 sm:py-2.5 bg-transparent min-w-0"
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="flex items-center gap-1.5 bg-linear-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm transition-all duration-200 shadow-md shadow-red-200 disabled:shadow-none whitespace-nowrap shrink-0"
        >
          <Search size={14} />
          <span className="hidden sm:inline">{loading ? "Analyzing..." : "Analyze"}</span>
          <span className="sm:hidden">{loading ? "..." : "Go"}</span>
        </button>
      </div>
    </form>
  );
}
