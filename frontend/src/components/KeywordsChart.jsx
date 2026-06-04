import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export function KeywordsChart({ data }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-slate-50 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-linear-to-b from-indigo-500 to-purple-600 inline-block" />
        <h3 className="text-sm font-semibold text-slate-700">Top Keywords</h3>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            layout="vertical"
            data={data.slice(0, 15)}
            margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="word" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
            <Tooltip
              contentStyle={{ borderRadius: "10px", border: "1px solid #f1f5f9", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
              cursor={{ fill: "#f8fafc" }}
            />
            <Bar dataKey="count" fill="url(#keywordGrad)" radius={[0, 6, 6, 0]}>
              <defs>
                <linearGradient id="keywordGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
