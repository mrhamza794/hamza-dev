import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

export default function GameScoreEditModal({ score, onClose, onSaved }) {
  const [playerName, setPlayerName] = useState("");
  const [scoreValue, setScoreValue] = useState("");
  const [bugsSquashed, setBugsSquashed] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!score) return;
    setPlayerName(score.playerName || "");
    setScoreValue(String(score.score ?? ""));
    setBugsSquashed(String(score.bugsSquashed ?? ""));
    setError("");
  }, [score]);

  if (!score) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/game/${score._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName,
          score: Number(scoreValue),
          bugsSquashed: Number(bugsSquashed),
        }),
      });
      const data = await res.json();

      if (data.success) {
        onSaved(data.data);
        onClose();
      } else {
        setError(data.error || "Failed to update score");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="admin-card relative z-10 w-full max-w-md p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="admin-title">Edit Game Score</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Player name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Score</label>
            <input
              type="number"
              min={0}
              max={200}
              value={scoreValue}
              onChange={(e) => setScoreValue(e.target.value)}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Bugs squashed
            </label>
            <input
              type="number"
              min={0}
              value={bugsSquashed}
              onChange={(e) => setBugsSquashed(e.target.value)}
              className="admin-input"
              required
            />
          </div>

          <p className="text-xs admin-text-muted">Badge rank updates automatically from the score.</p>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="admin-tab-inactive flex-1 py-2.5"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
            >
              {saving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Save size={18} />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
