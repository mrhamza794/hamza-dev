import { Monitor, Smartphone, Tablet } from "lucide-react";

function fmt(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function fmtDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatTime(seconds) {
  if (!seconds) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function DeviceIcon({ type }) {
  if (type === "mobile") return <Smartphone size={14} className="text-cyan-500 dark:text-cyan-400" />;
  if (type === "tablet") return <Tablet size={14} className="text-pink-500 dark:text-pink-400" />;
  return <Monitor size={14} className="text-purple-500 dark:text-purple-400" />;
}

function BoolCell({ value, label }) {
  if (!value) return <span className="admin-text-muted">—</span>;
  return (
    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
      {label}
    </span>
  );
}

function TruncateCell({ value, maxWidth = "max-w-[180px]" }) {
  const text = fmt(value);
  if (text === "—") return <span className="admin-text-muted">—</span>;
  return (
    <span className={`block truncate text-xs ${maxWidth}`} title={text}>
      {text}
    </span>
  );
}

const COLUMNS = [
  { key: "index", label: "#", minW: "min-w-[40px]" },
  { key: "sessionId", label: "Session ID", minW: "min-w-[100px]" },
  { key: "visitedAt", label: "Visited At", minW: "min-w-[140px]" },
  { key: "lastActive", label: "Last Active", minW: "min-w-[140px]" },
  { key: "ipAddress", label: "IP Address", minW: "min-w-[110px]" },
  { key: "country", label: "Country", minW: "min-w-[100px]" },
  { key: "countryCode", label: "Country Code", minW: "min-w-[80px]" },
  { key: "city", label: "City", minW: "min-w-[90px]" },
  { key: "region", label: "Region", minW: "min-w-[90px]" },
  { key: "regionCode", label: "Region Code", minW: "min-w-[80px]" },
  { key: "timezone", label: "Timezone", minW: "min-w-[100px]" },
  { key: "isp", label: "ISP", minW: "min-w-[120px]" },
  { key: "org", label: "Org", minW: "min-w-[120px]" },
  { key: "coordinates", label: "Lat / Lng", minW: "min-w-[110px]" },
  { key: "deviceType", label: "Device", minW: "min-w-[90px]" },
  { key: "deviceBrand", label: "Brand", minW: "min-w-[80px]" },
  { key: "deviceModel", label: "Model", minW: "min-w-[90px]" },
  { key: "browserName", label: "Browser", minW: "min-w-[90px]" },
  { key: "browserVersion", label: "Browser Ver.", minW: "min-w-[90px]" },
  { key: "browserEngine", label: "Engine", minW: "min-w-[80px]" },
  { key: "osName", label: "OS", minW: "min-w-[80px]" },
  { key: "osVersion", label: "OS Ver.", minW: "min-w-[80px]" },
  { key: "referrer", label: "Referrer", minW: "min-w-[160px]" },
  { key: "utmSource", label: "UTM Source", minW: "min-w-[100px]" },
  { key: "utmMedium", label: "UTM Medium", minW: "min-w-[100px]" },
  { key: "utmCampaign", label: "UTM Campaign", minW: "min-w-[110px]" },
  { key: "screen", label: "Screen", minW: "min-w-[90px]" },
  { key: "colorDepth", label: "Color Depth", minW: "min-w-[80px]" },
  { key: "pagesViewed", label: "Pages", minW: "min-w-[60px]" },
  { key: "timeOnSite", label: "Time on Site", minW: "min-w-[90px]" },
  { key: "scrollDepth", label: "Scroll %", minW: "min-w-[70px]" },
  { key: "sectionsVisited", label: "Sections", minW: "min-w-[140px]" },
  { key: "clickedContact", label: "Contact", minW: "min-w-[80px]" },
  { key: "playedGame", label: "Game", minW: "min-w-[70px]" },
  { key: "downloadedResume", label: "Resume", minW: "min-w-[70px]" },
  { key: "language", label: "Language", minW: "min-w-[80px]" },
  { key: "connectionType", label: "Connection", minW: "min-w-[90px]" },
  { key: "userAgent", label: "User Agent", minW: "min-w-[200px]" },
  { key: "createdAt", label: "Created", minW: "min-w-[140px]" },
  { key: "updatedAt", label: "Updated", minW: "min-w-[140px]" },
];

export default function VisitorsDataTable({ visitors, page, limit }) {
  return (
    <div className="admin-table-scroll w-full overflow-x-auto">
      <p className="mb-3 text-xs admin-text-muted">
        Scroll horizontally to view all collected fields. Showing every data point stored per visitor session.
      </p>
      <table className="w-max min-w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`sticky top-0 z-10 whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 ${col.minW} bg-slate-50 dark:bg-slate-800/80`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visitors.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-12 text-center admin-text-muted">
                No visitors found
              </td>
            </tr>
          ) : (
            visitors.map((v, i) => {
              const lat = v.location?.latitude;
              const lng = v.location?.longitude;
              const coords =
                lat != null && lng != null ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : null;
              const screen =
                v.screen?.width && v.screen?.height
                  ? `${v.screen.width}×${v.screen.height}`
                  : null;
              const sections = Array.isArray(v.behavior?.sectionsVisited)
                ? v.behavior.sectionsVisited.join(", ")
                : null;

              return (
                <tr key={v._id || v.sessionId || i} className="admin-tr align-top">
                  <td className="admin-td whitespace-nowrap">{(page - 1) * limit + i + 1}</td>
                  <td className="admin-td">
                    <TruncateCell value={v.sessionId} maxWidth="max-w-[100px]" />
                  </td>
                  <td className="admin-td whitespace-nowrap">{fmtDate(v.visitedAt)}</td>
                  <td className="admin-td whitespace-nowrap">{fmtDate(v.lastActive)}</td>
                  <td className="admin-td whitespace-nowrap">{fmt(v.ipAddress)}</td>
                  <td className="admin-td">{fmt(v.location?.country)}</td>
                  <td className="admin-td">{fmt(v.location?.countryCode)}</td>
                  <td className="admin-td">{fmt(v.location?.city)}</td>
                  <td className="admin-td">{fmt(v.location?.region)}</td>
                  <td className="admin-td">{fmt(v.location?.regionCode)}</td>
                  <td className="admin-td">{fmt(v.location?.timezone)}</td>
                  <td className="admin-td">
                    <TruncateCell value={v.location?.isp} />
                  </td>
                  <td className="admin-td">
                    <TruncateCell value={v.location?.org} />
                  </td>
                  <td className="admin-td whitespace-nowrap">{fmt(coords)}</td>
                  <td className="admin-td">
                    <div className="flex items-center gap-1 capitalize">
                      <DeviceIcon type={v.device?.type} />
                      {fmt(v.device?.type)}
                    </div>
                  </td>
                  <td className="admin-td">{fmt(v.device?.brand)}</td>
                  <td className="admin-td">{fmt(v.device?.model)}</td>
                  <td className="admin-td">{fmt(v.browser?.name)}</td>
                  <td className="admin-td">{fmt(v.browser?.version)}</td>
                  <td className="admin-td">{fmt(v.browser?.engine)}</td>
                  <td className="admin-td">{fmt(v.os?.name)}</td>
                  <td className="admin-td">{fmt(v.os?.version)}</td>
                  <td className="admin-td">
                    <TruncateCell value={v.source?.referrer} maxWidth="max-w-[160px]" />
                  </td>
                  <td className="admin-td">{fmt(v.source?.utm_source)}</td>
                  <td className="admin-td">{fmt(v.source?.utm_medium)}</td>
                  <td className="admin-td">{fmt(v.source?.utm_campaign)}</td>
                  <td className="admin-td whitespace-nowrap">{fmt(screen)}</td>
                  <td className="admin-td">{v.screen?.colorDepth != null ? `${v.screen.colorDepth}-bit` : "—"}</td>
                  <td className="admin-td">{fmt(v.behavior?.pagesViewed)}</td>
                  <td className="admin-td whitespace-nowrap">{formatTime(v.behavior?.timeOnSite)}</td>
                  <td className="admin-td">{v.behavior?.scrollDepth != null ? `${v.behavior.scrollDepth}%` : "—"}</td>
                  <td className="admin-td">
                    <TruncateCell value={sections} maxWidth="max-w-[140px]" />
                  </td>
                  <td className="admin-td">
                    <BoolCell value={v.behavior?.clickedContact} label="Yes" />
                  </td>
                  <td className="admin-td">
                    <BoolCell value={v.behavior?.playedGame} label="Yes" />
                  </td>
                  <td className="admin-td">
                    <BoolCell value={v.behavior?.downloadedResume} label="Yes" />
                  </td>
                  <td className="admin-td">{fmt(v.language)}</td>
                  <td className="admin-td">{fmt(v.connectionType)}</td>
                  <td className="admin-td">
                    <TruncateCell value={v.userAgent} maxWidth="max-w-[220px]" />
                  </td>
                  <td className="admin-td whitespace-nowrap">{fmtDate(v.createdAt)}</td>
                  <td className="admin-td whitespace-nowrap">{fmtDate(v.updatedAt)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
