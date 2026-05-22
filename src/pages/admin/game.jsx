import { useState, useEffect } from "react";
import { Trophy, Bug, Gamepad2, TrendingUp, ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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

const COLORS = ["#8B5CF6", "#06B6D4", "#EC4899", "#14B8A6", "#F59E0B", "#EF4444", "#10B981"];
const TABS = ["Overview", "Leaderboard", "Score Analysis", "Player Insights"];

export default function GamePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [page, setPage] = useState(1);
  const chart = useAdminChartTheme();

  useEffect(() => {
    fetch(`/api/admin/game?page=${page}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "admin-tab-active" : "admin-tab-inactive"}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              { icon: Gamepad2, label: "Total Games", value: data.stats.totalGames, color: "#8B5CF6" },
              { icon: TrendingUp, label: "Avg Score", value: data.stats.avgScore, color: "#06B6D4" },
              { icon: Trophy, label: "High Score", value: data.stats.maxScore, color: "#F59E0B" },
              { icon: Bug, label: "Total Bugs Squashed", value: data.stats.totalBugsSquashed?.toLocaleString(), color: "#EC4899" },
              { icon: Trophy, label: "Lowest Score", value: data.stats.minScore, color: "#14B8A6" },
            ].map((s, i) => (
              <div key={i} className="admin-card p-5">
                <s.icon size={20} style={{ color: s.color }} className="mb-3" />
                <div className="admin-stat-value text-2xl">{s.value}</div>
                <div className="admin-stat-sub">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="admin-card p-6">
            <h3 className="admin-heading">Daily Game Plays</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.charts.dailyPlays.map((d) => ({ date: d._id, plays: d.plays, avg: Math.round(d.avgScore) }))}>
                <defs>
                  <linearGradient id="playGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                <XAxis dataKey="date" stroke={chart.axisStroke} tick={{ fontSize: 11 }} />
                <YAxis stroke={chart.axisStroke} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={chart.tooltipContent} labelStyle={chart.labelStyle} />
                <Area type="monotone" dataKey="plays" stroke="#EC4899" fill="url(#playGrad)" strokeWidth={2} name="Plays" />
                <Area type="monotone" dataKey="avg" stroke="#8B5CF6" fill="none" strokeWidth={2} name="Avg Score" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "Leaderboard" && data && (
        <div className="space-y-4">
          <div className="admin-card overflow-hidden">
            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="admin-title">🏆 All-Time Top 10</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Rank", "Player", "Score", "Badge", "Country", "Device", "Date"].map((h) => (
                      <th key={h} className="admin-th whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topPlayers.map((p, i) => (
                    <tr key={i} className="admin-tr">
                      <td className="admin-td text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</td>
                      <td className="admin-td-bold">{p.playerName}</td>
                      <td className="admin-td">
                        <div
                          className="text-2xl font-bold"
                          style={{
                            background: "linear-gradient(135deg,#8B5CF6,#06B6D4)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {p.score}
                        </div>
                      </td>
                      <td className="admin-td admin-text-muted">{p.rank}</td>
                      <td className="admin-td admin-text-body">{p.location?.country || "—"}</td>
                      <td className="admin-td">
                        {p.device === "mobile" ? (
                          <Smartphone size={16} className="text-cyan-500 dark:text-cyan-400" />
                        ) : (
                          <Monitor size={16} className="text-purple-500 dark:text-purple-400" />
                        )}
                      </td>
                      <td className="admin-td admin-text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-card overflow-hidden">
            <div className="border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="admin-title">All Scores</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["#", "Player", "Score", "Bugs", "Badge", "Location", "Device", "Date"].map((h) => (
                      <th key={h} className="admin-th whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.scores.map((s, i) => (
                    <tr key={i} className="admin-tr">
                      <td className="admin-td admin-text-muted">{(page - 1) * 20 + i + 1}</td>
                      <td className="admin-td-bold">{s.playerName}</td>
                      <td className="admin-td font-bold text-purple-600 dark:text-purple-400">{s.score}</td>
                      <td className="admin-td admin-text-muted">{s.bugsSquashed}</td>
                      <td className="admin-td text-xs admin-text-muted">{s.rank}</td>
                      <td className="admin-td admin-text-muted">
                        {s.location?.city && `${s.location.city}, `}
                        {s.location?.country || "—"}
                      </td>
                      <td className="admin-td admin-text-muted capitalize">{s.device || "—"}</td>
                      <td className="admin-td text-xs admin-text-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="admin-text-muted">
                {(page - 1) * 20 + 1}–{Math.min(page * 20, data.pagination.total)} of {data.pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="admin-btn-ghost"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 text-sm admin-text-body">
                  {page} / {data.pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                  className="admin-btn-ghost"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Score Analysis" && data && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="admin-card p-6">
            <h3 className="admin-heading">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.charts.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                <XAxis dataKey="range" stroke={chart.axisStroke} tick={{ fontSize: 11 }} />
                <YAxis stroke={chart.axisStroke} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={chart.tooltipContent} labelStyle={chart.labelStyle} />
                <Bar dataKey="count" name="Players" radius={[6, 6, 0, 0]}>
                  {data.charts.scoreDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="admin-card p-6">
            <h3 className="admin-heading">Rank Distribution</h3>
            <div className="space-y-3">
              {data.charts.rankDistribution.map((r, i) => (
                <div key={i}>
                  <div className="mb-1 flex justify-between">
                    <span className="admin-text-body">{r._id}</span>
                    <span className="admin-text-muted">{r.count} players</span>
                  </div>
                  <div className="admin-progress-track h-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(r.count / data.stats.totalGames) * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Player Insights" && data && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="admin-card p-6">
            <h3 className="admin-heading">Players by Country</h3>
            <div className="space-y-3">
              {data.charts.countryDistribution.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-4 admin-text-muted">{i + 1}</span>
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between">
                      <span className="admin-text-body">{c._id}</span>
                      <div className="flex gap-3">
                        <span className="text-xs admin-text-muted">Avg: {Math.round(c.avgScore)}</span>
                        <span className="admin-text-muted">{c.count}</span>
                      </div>
                    </div>
                    <div className="admin-progress-track">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(c.count / data.charts.countryDistribution[0].count) * 100}%`,
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card p-6">
            <h3 className="admin-heading">Device Usage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.charts.deviceDistribution.map((d) => ({ name: d._id || "unknown", value: d.count }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                >
                  {data.charts.deviceDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chart.tooltipContent} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-6">
              {data.charts.deviceDistribution.map((d, i) => (
                <div key={i} className="flex items-center gap-2 admin-text-muted">
                  <div className="h-3 w-3 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="capitalize">
                    {d._id || "unknown"} ({d.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
