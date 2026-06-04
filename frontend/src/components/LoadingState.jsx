import { Youtube } from "lucide-react";

const steps = [
  "Fetching comments from YouTube...",
  "Running transformer sentiment analysis...",
  "Detecting emotions...",
  "Scanning for toxic & spam comments...",
  "Generating AI insights...",
];

export function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-8 py-16">
      {/* Animated icon */}
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-linear-to-br from-red-100 to-rose-100 flex items-center justify-center">
          <Youtube size={30} className="text-red-500 animate-float" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-red-200 animate-spin" style={{ animationDuration: "4s" }} />
        <div className="absolute -inset-3 rounded-full border-2 border-dashed border-rose-100 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
      </div>

      <div className="text-center space-y-2">
        <p className="text-2xl font-bold text-slate-800">Analyzing comments...</p>
        <p className="text-slate-500 text-sm">This may take 1–3 minutes for large videos</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 max-w-sm w-full space-y-3.5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
            <div
              className="w-2 h-2 rounded-full bg-linear-to-br from-red-400 to-rose-500 animate-pulse shrink-0"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
