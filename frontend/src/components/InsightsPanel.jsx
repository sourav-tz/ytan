import { ThumbsUp, ThumbsDown, MessageSquare, Lightbulb, BarChart2 } from "lucide-react";

const ITEMS = [
  {
    key: "liked_most",
    label: "What Viewers Liked",
    icon: ThumbsUp,
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
    accent: "bg-emerald-100",
    bar: "from-emerald-500 to-green-500",
  },
  {
    key: "disliked_most",
    label: "What Viewers Disliked",
    icon: ThumbsDown,
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-700",
    accent: "bg-rose-100",
    bar: "from-rose-500 to-red-500",
  },
  {
    key: "common_requests",
    label: "Common Requests",
    icon: MessageSquare,
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-700",
    accent: "bg-blue-100",
    bar: "from-blue-500 to-indigo-500",
  },
  {
    key: "improvement_suggestions",
    label: "Improvement Suggestions",
    icon: Lightbulb,
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
    accent: "bg-amber-100",
    bar: "from-amber-500 to-orange-500",
  },
  {
    key: "overall_sentiment_summary",
    label: "Overall Summary",
    icon: BarChart2,
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    text: "text-indigo-700",
    accent: "bg-indigo-100",
    bar: "from-indigo-500 to-violet-500",
  },
];

export function InsightsPanel({ insights }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-linear-to-b from-amber-400 to-orange-500 inline-block" />
        <h3 className="text-sm font-semibold text-slate-700">AI-Generated Insights</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ITEMS.map(({ key, label, icon: Icon, bg, border, text, accent, bar }) => (
          <div key={key} className={`rounded-2xl border ${border} ${bg} p-5 hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`p-1.5 rounded-lg ${accent}`}>
                <Icon size={15} className={text} />
              </div>
              <span className={`font-semibold text-sm ${text}`}>{label}</span>
            </div>
            <div className={`w-8 h-0.5 rounded-full bg-linear-to-r ${bar} mb-3`} />
            <p className="text-sm text-slate-600 leading-relaxed">{insights[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
