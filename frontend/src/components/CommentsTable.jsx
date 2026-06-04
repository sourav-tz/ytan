import { useState } from "react";
import { ThumbsUp, ShieldAlert, Trash2 } from "lucide-react";

const SENTIMENT_BADGE = {
  positive: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  negative: "bg-rose-100 text-rose-700 border border-rose-200",
  neutral: "bg-slate-100 text-slate-600 border border-slate-200",
};

const FILTERS = ["all", "positive", "negative", "neutral"];

const FILTER_STYLES = {
  all: "bg-slate-800 text-white",
  positive: "bg-emerald-500 text-white",
  negative: "bg-rose-500 text-white",
  neutral: "bg-slate-500 text-white",
};

export function CommentsTable({ comments }) {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  const filtered = filter === "all" ? comments : comments.filter((c) => c.sentiment === filter);
  const pages = Math.ceil(filtered.length / PER_PAGE);
  const slice = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-linear-to-b from-slate-400 to-slate-600 inline-block" />
          <h3 className="text-sm font-semibold text-slate-700">
            Comments <span className="text-slate-400 font-normal">({filtered.length})</span>
          </h3>
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                filter === f ? FILTER_STYLES[f] : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Author</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Comment</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sentiment</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Emotion</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <ThumbsUp size={13} className="inline" />
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Flags</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((c, i) => (
              <tr
                key={c.id}
                className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}
              >
                <td className="px-5 py-3.5 font-medium text-slate-700 whitespace-nowrap max-w-30 truncate">
                  {c.author}
                </td>
                <td className="px-5 py-3.5 text-slate-600 max-w-xs">
                  <p className="line-clamp-2 leading-relaxed">{c.text}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${SENTIMENT_BADGE[c.sentiment]}`}>
                    {c.sentiment}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500 capitalize text-xs">{c.emotion}</td>
                <td className="px-3 py-3.5 text-center text-slate-500 text-xs font-medium">{c.likes}</td>
                <td className="px-3 py-3.5 text-center">
                  <div className="flex justify-center gap-1">
                    {c.is_toxic && <ShieldAlert size={14} className="text-rose-500" aria-label="Toxic" />}
                    {c.is_spam && <Trash2 size={14} className="text-amber-500" aria-label="Spam" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">{page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40 text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
              {page + 1} / {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page >= pages - 1}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40 text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
