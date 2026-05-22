import { useState, useEffect } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  MousePointer,
  Gamepad2,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

const COLORS = ["#8B5CF6", "#06B6D4", "#EC4899", "#14B8A6", "#F59E0B", "#EF4444", "#10B981", "#3B82F6"];
const TABS = ["Overview", "Visitors Table", "Geography", "Technology", "Behavior"];

export default function VisitorsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [page, setPage] = useState(1);
  const [deviceFilter, setDeviceFilter] = useState("");
  const chart = useAdminChartTheme();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(deviceFilter && { device: deviceFilter }),
      });
      const res = await fetch(`/api/admin/visitors?${params}`);
      const d = await res.json();
      if (d.success) setData(d.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, deviceFilter]);

  const formatTime = (seconds) => {
    if (!seconds) return "0s";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  const DeviceIcon = ({ type }) => {
    if (type === "mobile") return <Smartphone size={16} className="text-cyan-500 dark:text-cyan-400" />;
    if (type === "tablet") return <Tablet size={16} className="text-pink-500 dark:text-pink-400" />;
    return <Monitor size={16} className="text-purple-500 dark:text-purple-400" />;
  };

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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                icon: Clock,
                label: "Avg Time on Site",
                value: formatTime(data.analytics.behavior.avgTime),
                color: "#8B5CF6",
              },
              {
                icon: MousePointer,
                label: "Avg Scroll Depth",
                value: `${Math.round(data.analytics.behavior.avgScroll || 0)}%`,
                color: "#06B6D4",
              },
              {
                icon: Gamepad2,
                label: "Played Game",
                value: data.analytics.behavior.playedGame || 0,
                color: "#EC4899",
              },
              {
                icon: Mail,
                label: "Clicked Contact",
                value: data.analytics.behavior.clickedContact || 0,
                color: "#14B8A6",
              },
            ].map((s, i) => (
              <div key={i} className="admin-card p-5">
                <s.icon size={20} style={{ color: s.color }} className="mb-3" />
                <div className="admin-stat-value text-2xl">{s.value}</div>
                <div className="admin-stat-sub">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="admin-card p-6">
            <h3 className="admin-heading">Daily Visitors (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.analytics.daily.map((d) => ({ date: d._id, visitors: d.count }))}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                <XAxis dataKey="date" stroke={chart.axisStroke} tick={{ fontSize: 11 }} />
                <YAxis stroke={chart.axisStroke} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={chart.tooltipContent} labelStyle={chart.labelStyle} />
                <Area type="monotone" dataKey="visitors" stroke="#8B5CF6" fill="url(#grad1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "Visitors Table" && data && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value);
                setPage(1);
              }}
              className="admin-select"
            >
              <option value="">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>

          <div className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {[
                      "Device",
                      "Browser / OS",
                      "Location",
                      "Source",
                      "Time on Site",
                      "Scroll",
                      "Actions",
                      "Visited",
                    ].map((h) => (
                      <th key={h} className="admin-th whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.visitors.map((v, i) => (
                    <tr key={i} className="admin-tr">
                      <td className="admin-td">
                        <div className="flex items-center gap-2">
                          <DeviceIcon type={v.device?.type} />
                          <span className="admin-text-body capitalize">{v.device?.type || "desktop"}</span>
                        </div>
                        {v.device?.brand && (
                          <div className="mt-0.5 text-xs admin-text-muted">
                            {v.device.brand} {v.device.model}
                          </div>
                        )}
                      </td>
                      <td className="admin-td">
                        <div className="admin-text-body">
                          {v.browser?.name || "—"} {v.browser?.version?.split(".")[0]}
                        </div>
                        <div className="text-xs admin-text-muted">
                          {v.os?.name} {v.os?.version}
                        </div>
                      </td>
                      <td className="admin-td">
                        <div className="admin-text-body">{v.location?.city || "—"}</div>
                        <div className="text-xs admin-text-muted">
                          {v.location?.country} · {v.location?.timezone}
                        </div>
                      </td>
                      <td className="admin-td">
                        <div className="max-w-[120px] truncate text-xs admin-text-muted">
                          {v.source?.referrer || "Direct"}
                        </div>
                      </td>
                      <td className="admin-td admin-text-body">{formatTime(v.behavior?.timeOnSite)}</td>
                      <td className="admin-td admin-text-body">{v.behavior?.scrollDepth || 0}%</td>
                      <td className="admin-td">
                        <div className="flex gap-2">
                          {v.behavior?.playedGame && (
                            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700 dark:bg-pink-500/20 dark:text-pink-400">
                              🎮 Played
                            </span>
                          )}
                          {v.behavior?.clickedContact && (
                            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400">
                              📧 Contact
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="admin-td">
                        <div className="text-xs admin-text-muted">{new Date(v.visitedAt).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(v.visitedAt).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="admin-text-muted">
                {(page - 1) * 20 + 1}–{Math.min(page * 20, data.pagination.total)} of {data.pagination.total}
              </div>
              <div className="flex gap-2">
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

      {activeTab === "Geography" && data && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="admin-card p-6">
            <h3 className="admin-heading">Visitors by Country</h3>
            {data.analytics.countries.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.analytics.countries.map((c) => ({ country: c._id, count: c.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
                  <XAxis dataKey="country" stroke={chart.axisStroke} tick={{ fontSize: 11 }} />
                  <YAxis stroke={chart.axisStroke} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={chart.tooltipContent} labelStyle={chart.labelStyle} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.analytics.countries.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center admin-text-muted">No country data yet</p>
            )}
          </div>

          <div className="admin-card space-y-3 p-6">
            <h3 className="admin-heading">Country Breakdown</h3>
            {data.analytics.countries.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-4 admin-text-muted">{i + 1}</span>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between">
                    <span className="admin-text-body">{c._id}</span>
                    <span className="text-sm font-medium admin-text-muted">{c.count}</span>
                  </div>
                  <div className="admin-progress-track h-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(c.count / data.analytics.countries[0].count) * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Technology" && data && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              title: "Devices",
              data: data.analytics.devices.map((d) => ({ name: d._id || "unknown", value: d.count })),
            },
            {
              title: "Browsers",
              data: data.analytics.browsers.map((b) => ({ name: b._id || "unknown", value: b.count })),
            },
            {
              title: "Operating Systems",
              data: data.analytics.operatingSystems.map((o) => ({ name: o._id || "unknown", value: o.count })),
            },
          ].map((chartBlock, ci) => (
            <div key={ci} className="admin-card p-6">
              <h3 className="admin-heading">{chartBlock.title}</h3>
              {chartBlock.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartBlock.data}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartBlock.data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chart.tooltipContent} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center admin-text-muted">No data yet</p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "Behavior" && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="admin-card p-6">
              <h3 className="admin-heading">Traffic Sources</h3>
              <div className="space-y-3">
                {data.analytics.referrers.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-700/60"
                  >
                    <span className="max-w-[200px] truncate admin-text-body">{r._id || "Direct / None"}</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-card p-6">
              <h3 className="admin-heading">Engagement Metrics</h3>
              <div className="space-y-6">
                {[
                  {
                    label: "Avg Time on Site",
                    value: formatTime(data.analytics.behavior.avgTime),
                    pct: Math.min(100, (data.analytics.behavior.avgTime || 0) / 3),
                    color: "#8B5CF6",
                  },
                  {
                    label: "Avg Scroll Depth",
                    value: `${Math.round(data.analytics.behavior.avgScroll || 0)}%`,
                    pct: data.analytics.behavior.avgScroll || 0,
                    color: "#06B6D4",
                  },
                  {
                    label: "Avg Clicks",
                    value: Math.round(data.analytics.behavior.avgClicks || 0),
                    pct: Math.min(100, (data.analytics.behavior.avgClicks || 0) / 2),
                    color: "#EC4899",
                  },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="mb-2 flex justify-between">
                      <span className="admin-text-muted">{m.label}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{m.value}</span>
                    </div>
                    <div className="admin-progress-track h-2">
                      <div className="h-full rounded-full transition-all" style={{ width: `${m.pct}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
