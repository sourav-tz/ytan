export function StatCard({ label, value, sub, icon: Icon, gradient = "from-slate-500 to-slate-600", shadow = "shadow-slate-200" }) {
  return (
    <div className={`bg-linear-to-br ${gradient} rounded-2xl p-5 flex flex-col gap-2 text-white shadow-lg ${shadow}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{label}</p>
        {Icon && <Icon size={18} className="text-white/60" />}
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-white/60">{sub}</p>}
    </div>
  );
}
