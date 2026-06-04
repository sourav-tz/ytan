import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const EMOTION_COLORS = {
  Happy: "#fbbf24",
  Angry: "#f43f5e",
  Sad: "#60a5fa",
  Surprised: "#a78bfa",
  Fearful: "#fb923c",
  Disgusted: "#4ade80",
  Neutral: "#94a3b8",
};

export function EmotionChart({ data }) {
  const chartData = [
    { name: "Happy", value: data.happy },
    { name: "Angry", value: data.angry },
    { name: "Sad", value: data.sad },
    { name: "Surprised", value: data.surprised },
    { name: "Fearful", value: data.fearful },
    { name: "Disgusted", value: data.disgusted },
    { name: "Neutral", value: data.neutral },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-slate-50 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-linear-to-b from-violet-500 to-indigo-600 inline-block" />
        <h3 className="text-sm font-semibold text-slate-700">Emotion Breakdown</h3>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "10px", border: "1px solid #f1f5f9", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
              cursor={{ fill: "#f8fafc" }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={EMOTION_COLORS[entry.name] ?? "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
