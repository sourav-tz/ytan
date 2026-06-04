import { useState } from "react";
import { Search, Youtube } from "lucide-react";

export function UrlInput({ onAnalyze, loading }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) onAnalyze(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex gap-2 items-center bg-white border-2 border-slate-200 focus-within:border-red-400 focus-within:shadow-lg focus-within:shadow-red-100 rounded-2xl p-2 shadow-xl shadow-slate-200/50 transition-all duration-300">
        <div className="pl-2 text-red-500 shrink-0">
          <Youtube size={22} />
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube video URL here..."
          className="flex-1 outline-none text-slate-700 placeholder-slate-400 text-base py-2.5 bg-transparent min-w-0"
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 bg-linear-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-red-200 disabled:shadow-none whitespace-nowrap shrink-0"
        >
          <Search size={16} />
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
    </form>
  );
}
