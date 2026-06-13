import { UrlInput } from "./components/UrlInput";
import { LoadingState } from "./components/LoadingState";
import { VideoHeader } from "./components/VideoHeader";
import { StatCard } from "./components/StatCard";
import { SentimentChart } from "./components/SentimentChart";
import { EmotionChart } from "./components/EmotionChart";
import { KeywordsChart } from "./components/KeywordsChart";
import { InsightsPanel } from "./components/InsightsPanel";
import { CommentsTable } from "./components/CommentsTable";
import { useAnalysis } from "./hooks/useAnalysis";
import {
  Youtube, RefreshCw, AlertCircle, MessageCircle,
  TrendingUp, TrendingDown, ShieldX,
} from "lucide-react";

export default function App() {
  const { status, result, error, analyze, reset } = useAnalysis();

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 via-white to-rose-50/40">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/70 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="w-full px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <div className="bg-linear-to-br from-red-500 to-rose-600 text-white p-2 rounded-xl shadow-lg shadow-red-200">
            <Youtube size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">YtAn</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Comment Analyzer</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {status === "success" && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3.5 py-1.5 rounded-xl transition-all duration-200"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">New Analysis</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10 space-y-8">

        {/* Hero */}
        {status !== "success" && (
          <>
            <div className="text-center space-y-5 pt-4 pb-2 w-full max-w-3xl mx-auto">
              <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                Understand what your audience
                <br />
                <span className="bg-linear-to-r from-red-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                  really thinks
                </span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Paste any YouTube URL to get AI-powered sentiment analysis, emotion detection,
                toxic comment filtering, and actionable insights.
              </p>
              <UrlInput onAnalyze={analyze} loading={status === "loading"} />
            </div>

            {/* Feature badges — outside constrained container */}
            <div className="marquee-wrap">
              <div className="marquee-track">
                {[...["Sentiment Analysis", "Emotion Detection", "Toxic Filtering", "AI Insights", "Keyword Extraction"],
                  ...["Sentiment Analysis", "Emotion Detection", "Toxic Filtering", "AI Insights", "Keyword Extraction"]].map((f, i) => (
                  <span key={i} className="marquee-item text-sm font-semibold px-5 py-2 rounded-full shadow-sm border bg-slate-100 text-slate-600 border-slate-300 inline-block">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {status === "loading" && <LoadingState />}

        {/* Error */}
        {status === "error" && (
          <div className="max-w-md mx-auto bg-white border border-red-100 rounded-2xl p-8 text-center space-y-4 shadow-xl shadow-red-50">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="text-red-500" size={28} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">Analysis Failed</p>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
            </div>
            <button
              onClick={reset}
              className="px-5 py-2.5 bg-linear-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-700 transition-all shadow-md shadow-red-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {status === "success" && result && (
          <div className="space-y-6">
            <VideoHeader
              videoId={result.video_id}
              title={result.video_title}
              thumbnail={result.video_thumbnail}
              totalComments={result.total_comments_fetched}
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label="Total Comments"
                value={result.total_comments_fetched.toLocaleString()}
                icon={MessageCircle}
                gradient="from-violet-500 to-indigo-600"
                shadow="shadow-violet-200"
              />
              <StatCard
                label="Positive"
                value={`${result.sentiment.positive_pct}%`}
                sub={`${result.sentiment.positive} comments`}
                icon={TrendingUp}
                gradient="from-emerald-500 to-green-600"
                shadow="shadow-emerald-200"
              />
              <StatCard
                label="Negative"
                value={`${result.sentiment.negative_pct}%`}
                sub={`${result.sentiment.negative} comments`}
                icon={TrendingDown}
                gradient="from-rose-500 to-red-600"
                shadow="shadow-rose-200"
              />
              <StatCard
                label="Toxic / Spam"
                value={`${result.engagement.toxic_count} / ${result.engagement.spam_count}`}
                sub={`${result.engagement.toxic_pct}% · ${result.engagement.spam_pct}%`}
                icon={ShieldX}
                gradient="from-amber-500 to-orange-600"
                shadow="shadow-amber-200"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SentimentChart data={result.sentiment} />
              <EmotionChart data={result.emotions} />
            </div>

            <KeywordsChart data={result.keywords} />

            <InsightsPanel insights={result.insights} />

            {/* Top Comments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Top Positive Comments</h3>
                </div>
                <div className="p-4 space-y-3">
                  {result.top_positive_comments.map((c) => (
                    <div key={c.id} className="bg-linear-to-br from-emerald-50 to-green-50 border border-emerald-100/60 rounded-xl p-3.5">
                      <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">{c.text}</p>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span className="font-medium text-emerald-600">{c.author}</span>
                        <span>·</span>
                        <span>{c.likes} likes</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <h3 className="text-sm font-semibold text-slate-700">Top Negative Comments</h3>
                </div>
                <div className="p-4 space-y-3">
                  {result.top_negative_comments.map((c) => (
                    <div key={c.id} className="bg-linear-to-br from-rose-50 to-red-50 border border-rose-100/60 rounded-xl p-3.5">
                      <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">{c.text}</p>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span className="font-medium text-rose-600">{c.author}</span>
                        <span>·</span>
                        <span>{c.likes} likes</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <CommentsTable comments={result.sample_comments} />
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 mt-4 border-t border-slate-100">
        <p className="text-center text-xs text-slate-400">
          YtAn · Oz · © 2026 All rights reserved
        </p>
      </footer>
    </div>
  );
}
