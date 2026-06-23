import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function formatLabel(name) {
  if (!name || name === "unknown") return "Unknown";
  return String(name)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PieBreakdownCard({ title, data, colors, chartTheme }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="admin-card p-6">
      <h3 className="admin-heading">{title}</h3>
      {data.length > 0 ? (
        <div className="space-y-4">
          <div className="relative mx-auto h-[180px] w-full max-w-[200px]">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={data.length > 1 ? 2 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={chartTheme.tooltipContent}
                  formatter={(value, name) => {
                    const pct = total ? ((value / total) * 100).toFixed(1) : "0";
                    return [`${value} (${pct}%)`, formatLabel(name)];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs admin-text-muted">Total</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
            </div>
          </div>

          <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {data.map((item, i) => {
              const pct = total ? Math.round((item.value / total) * 100) : 0;
              return (
                <li key={`${item.name}-${i}`} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate admin-text-body" title={formatLabel(item.name)}>
                    {formatLabel(item.name)}
                  </span>
                  <span className="shrink-0 tabular-nums admin-text-muted">{item.value}</span>
                  <span className="w-10 shrink-0 text-right text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="py-12 text-center admin-text-muted">No data yet</p>
      )}
    </div>
  );
}
