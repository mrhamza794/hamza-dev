import { useState, useEffect } from "react";
import {
  Settings,
  Power,
  MessageSquare,
  Gamepad2,
  BarChart2,
  Trash2,
  AlertTriangle,
  Shield,
  Save,
  CheckCircle,
} from "lucide-react";

function Toggle({ enabled, onChange, label, description, icon: Icon, color }) {
  return (
    <div className="admin-card flex items-start justify-between p-5">
      <div className="flex gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${color}20` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <div className="admin-title">{label}</div>
          <div className="mt-0.5 admin-text-muted">{description}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative mt-1 h-6 w-12 shrink-0 rounded-full transition-all ${enabled ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-600"}`}
      >
        <div
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${enabled ? "left-7" : "left-1"}`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteMaintenance: false,
    maintenanceMessage: "Site under maintenance. Coming back soon!",
    allowNewContacts: true,
    allowGameScores: true,
    analyticsEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setSettings(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const d = await res.json();
      if (d.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVisitors = async () => {
    if (deleteConfirm !== "DELETE") {
      setDeleteMsg('Type DELETE to confirm');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/settings?target=visitors", { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        setDeleteMsg(d.message);
        setDeleteConfirm("");
      }
    } catch {
      setDeleteMsg("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="admin-card space-y-4 p-6">
        <h2 className="admin-title mb-6 flex items-center gap-2">
          <Settings size={20} className="text-purple-500 dark:text-purple-400" />
          Site Controls
        </h2>

        <Toggle
          enabled={settings.siteMaintenance}
          onChange={(v) => updateSetting("siteMaintenance", v)}
          label="Maintenance Mode"
          description="Shows maintenance page to all visitors"
          icon={Power}
          color={settings.siteMaintenance ? "#EF4444" : "#8B5CF6"}
        />

        {settings.siteMaintenance && (
          <div className="px-2">
            <label className="mb-2 block admin-text-muted">Maintenance Message</label>
            <textarea
              value={settings.maintenanceMessage}
              onChange={(e) => updateSetting("maintenanceMessage", e.target.value)}
              rows={3}
              className="admin-input resize-none"
            />
          </div>
        )}

        <Toggle
          enabled={settings.allowNewContacts}
          onChange={(v) => updateSetting("allowNewContacts", v)}
          label="Accept Contact Messages"
          description="Allow visitors to submit contact form"
          icon={MessageSquare}
          color="#06B6D4"
        />

        <Toggle
          enabled={settings.allowGameScores}
          onChange={(v) => updateSetting("allowGameScores", v)}
          label="Accept Game Scores"
          description="Allow saving new game scores to leaderboard"
          icon={Gamepad2}
          color="#EC4899"
        />

        <Toggle
          enabled={settings.analyticsEnabled}
          onChange={(v) => updateSetting("analyticsEnabled", v)}
          label="Visitor Analytics"
          description="Track visitor data and analytics"
          icon={BarChart2}
          color="#14B8A6"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold text-white transition-all disabled:opacity-60 ${
          saved
            ? "bg-linear-to-r from-emerald-600 to-emerald-700 shadow-lg shadow-emerald-500/30"
            : "bg-linear-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30"
        }`}
      >
        {saving ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Saving...
          </>
        ) : saved ? (
          <>
            <CheckCircle size={20} />
            Settings Saved!
          </>
        ) : (
          <>
            <Save size={20} />
            Save Settings
          </>
        )}
      </button>

      <div className="admin-danger-zone">
        <h2 className="mb-6 flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
          <AlertTriangle size={20} />
          Danger Zone
        </h2>

        <div className="space-y-4">
          <p className="admin-text-muted">
            Delete all visitor tracking data from the database. This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => {
                setDeleteConfirm(e.target.value);
                setDeleteMsg("");
              }}
              placeholder='Type "DELETE" to confirm'
              className="admin-input flex-1 border-red-200 dark:border-red-800"
            />
            <button
              type="button"
              onClick={handleDeleteVisitors}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-100 px-6 py-3 text-sm font-medium text-red-700 transition-all hover:bg-red-200 disabled:opacity-50 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
            >
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
              ) : (
                <Trash2 size={16} />
              )}
              Delete All Visitors
            </button>
          </div>

          {deleteMsg && (
            <p
              className={`text-sm ${deleteMsg.includes("Deleted") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {deleteMsg}
            </p>
          )}
        </div>
      </div>

      <div className="admin-card p-6">
        <h2 className="admin-title mb-4 flex items-center gap-2">
          <Shield size={20} className="text-purple-500 dark:text-purple-400" />
          Session Info
        </h2>
        <p className="admin-text-muted">
          Admin sessions expire after <span className="font-medium text-purple-600 dark:text-purple-400">24 hours</span>.
          OTP tokens expire after <span className="font-medium text-purple-600 dark:text-purple-400">10 minutes</span>. Max{" "}
          <span className="font-medium text-purple-600 dark:text-purple-400">5 OTP attempts</span> before lockout.
        </p>
      </div>
    </div>
  );
}
