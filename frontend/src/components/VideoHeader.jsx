import { ExternalLink, MessageSquare } from "lucide-react";

export function VideoHeader({ videoId, title, thumbnail, totalComments }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-5 items-start">
      {thumbnail && (
        <img
          src={thumbnail}
          alt={title}
          className="w-36 h-20.25 object-cover rounded-xl shrink-0 shadow-md"
        />
      )}
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-slate-900 text-lg line-clamp-2 leading-snug">{title}</h2>
        <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
          <MessageSquare size={13} className="text-slate-400" />
          {totalComments.toLocaleString()} comments analyzed
        </p>
        <a
          href={`https://youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 font-medium px-3 py-1.5 rounded-lg transition-colors border border-red-100 mt-3"
        >
          <ExternalLink size={11} /> Watch on YouTube
        </a>
      </div>
    </div>
  );
}
