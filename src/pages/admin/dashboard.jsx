import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Mail,
  Gamepad2,
  Trophy,
  TrendingUp,
  TrendingDown,
  Globe,
  Eye,
  MousePointer,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdminChartTheme } from "@/components/admin/useAdminChartTheme";

const COLORS = ["#8B5CF6", "#06B6D4", "#EC4899", "#14B8A6", "#F59E0B"];

function StatCard({ icon: Icon, label, value, sub, trend, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-card relative overflow-hidden p-6"
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="admin-stat-value mb-1 text-3xl">{value?.toLocaleString() ?? "—"}</div>
      <div className="admin-stat-label">{label}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chart = useAdminChartTheme();

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <div className="py-20 text-center admin-text-muted">Failed to load dashboard</div>;
  }

  const { stats, recentContacts, charts } = data;

  const deviceData = charts.deviceBreakdown
    .map((d) => ({
      name: (d._id || "unknown").replace(/^\w/, (c) => c.toUpperCase()),
      value: d.count,
    }))
    .sort((a, b) => b.value - a.value);

  const deviceTotal = deviceData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Visitors"
          value={stats.totalVisitors}
          sub={`${stats.todayVisitors} today`}
          trend={stats.visitorGrowth}
          color="#8B5CF6"
        />
        <StatCard
          icon={Mail}
          label="Contact Messages"
          value={stats.totalContacts}
          sub={`${stats.newContacts} this week`}
          color="#06B6D4"
        />
        <StatCard
          icon={Gamepad2}
          label="Game Plays"
          value={stats.totalGamePlays}
          sub={`${stats.contactsPlayed} visitors played`}
          color="#EC4899"
        />
        <StatCard
          icon={Trophy}
          label="Top Score"
          value={stats.topScore?.score || 0}
          sub={stats.topScore?.playerName || "—"}
          color="#F59E0B"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Eye}
          label="This Week"
          value={stats.weekVisitors}
          sub="unique visitors"
          color="#14B8A6"
        />
        <StatCard
          icon={MousePointer}
          label="Clicked Contact"
          value={stats.contactsClicked}
          sub="visitors engaged"
          color="#8B5CF6"
        />
        <StatCard
          icon={Globe}
          label="This Month"
          value={stats.monthVisitors}
          sub="unique visitors"
          color="#06B6D4"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="admin-card p-6 xl:col-span-2">
          <h3 className="admin-heading">Daily Visitors (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={charts.dailyVisitors.map((d) => ({ date: d._id, visitors: d.count }))}>
              <defs>
                <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
              <XAxis dataKey="date" stroke={chart.axisStroke} tick={{ fontSize: 12 }} />
              <YAxis stroke={chart.axisStroke} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={chart.tooltipContent} labelStyle={chart.labelStyle} />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#8B5CF6"
                fill="url(#visitorGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card p-6">
          <h3 className="admin-heading">Device Types</h3>
          {deviceData.length > 0 ? (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative mx-auto h-[180px] w-full max-w-[180px] shrink-0 sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {deviceData.map((entry, i) => (
                        <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={chart.tooltipContent}
                      formatter={(value, name) => [`${value} visitors`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs admin-text-muted">Total</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{deviceTotal}</span>
                </div>
              </div>

              <ul className="flex w-full flex-1 flex-col justify-center gap-3">
                {deviceData.map((d, i) => {
                  const pct = deviceTotal ? Math.round((d.value / deviceTotal) * 100) : 0;
                  return (
                    <li key={d.name} className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="min-w-0 flex-1 capitalize admin-text-body">{d.name}</span>
                      <span className="shrink-0 tabular-nums admin-text-muted">{d.value}</span>
                      <span className="w-11 shrink-0 text-right text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="py-12 text-center admin-text-muted">No device data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="admin-card p-6">
          <h3 className="admin-heading">Top Countries</h3>
          <div className="space-y-3">
            {charts.topCountries.length === 0 ? (
              <p className="admin-text-muted">No country data yet</p>
            ) : (
              charts.topCountries.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 admin-text-muted">{i + 1}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between">
                      <span className="admin-text-body">{c._id}</span>
                      <span className="admin-text-muted">{c.count}</span>
                    </div>
                    <div className="admin-progress-track">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(c.count / charts.topCountries[0].count) * 100}%`,
                          background: COLORS[i],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-card p-6">
          <h3 className="admin-heading">Recent Contacts</h3>
          <div className="space-y-3">
            {recentContacts.length === 0 ? (
              <p className="admin-text-muted">No messages yet</p>
            ) : (
              recentContacts.map((c, i) => (
                <div key={i} className="admin-card-inner flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-purple-600 to-blue-600 text-sm font-bold text-white">
                    {c.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900 dark:text-white">{c.name}</div>
                    <div className="truncate text-xs admin-text-muted">{c.email}</div>
                  </div>
                  <div className="shrink-0 text-xs admin-text-muted">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
