import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return o.label.toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q);
  });

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {label && <label className="mb-2 block text-sm font-medium">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="admin-input flex w-full items-center justify-between gap-2 text-left disabled:opacity-50"
      >
        <span className={selected ? "truncate" : "truncate admin-text-muted"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-2 dark:border-white/10">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              autoFocus
              className="admin-input w-full py-2 text-sm"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm admin-text-muted">No matches</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/40 ${
                      option.value === value ? "bg-purple-50/80 font-medium text-purple-700 dark:bg-purple-950/30 dark:text-purple-300" : ""
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && <Check size={14} className="shrink-0 text-purple-600" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
