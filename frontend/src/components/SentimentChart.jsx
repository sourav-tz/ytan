import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#10b981", "#f43f5e", "#94a3b8"];

export function SentimentChart({ data }) {
  const chartData = [
    { name: "Positive", value: data.positive, pct: data.positive_pct },
    { name: "Negative", value: data.negative, pct: data.negative_pct },
    { name: "Neutral", value: data.neutral, pct: data.neutral_pct },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-slate-50 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-linear-to-b from-red-500 to-rose-600 inline-block" />
        <h3 className="text-sm font-semibold text-slate-700">Sentiment Distribution</h3>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip formatter={(v, name, props) => [`${v} (${props.payload.pct}%)`, name]} />
            <Legend iconType="circle" iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
