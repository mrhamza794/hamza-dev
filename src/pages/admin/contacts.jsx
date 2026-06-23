import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Mail,
  RefreshCw,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ContactsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const searchTimer = useRef(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        ...(query && { q: query }),
      });
      const res = await fetch(`/api/admin/contacts?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setData(json.data);
      else setMsg(json.error || "Failed to load contacts");
    } catch (err) {
      console.error(err);
      setMsg("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const deleteContact = async (id) => {
    if (!window.confirm("Delete this contact message?")) return;
    setMsg("");
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Delete failed");
      setMsg("Contact deleted");
      fetchContacts();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const deleteAllContacts = async () => {
    const total = data?.total ?? 0;
    if (total === 0) return;

    const label = query ? `${total} filtered contact(s)` : `all ${total} contact(s)`;
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;

    setDeleteAllLoading(true);
    setMsg("");
    try {
      const params = new URLSearchParams();
      if (!query) params.set("all", "1");
      else params.set("q", query);

      const res = await fetch(`/api/admin/contacts?${params}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Delete failed");
      setMsg(json.message || "Contacts deleted");
      setPage(1);
      fetchContacts();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteAllLoading(false);
    }
  };

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      <div>
        <h1 className="admin-title text-2xl font-bold">Contact Us</h1>
        <p className="admin-text-muted mt-1">
          Messages submitted through the portfolio contact form.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchContacts}
            disabled={loading}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/10"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh
          </button>
          <button
            type="button"
            onClick={deleteAllContacts}
            disabled={deleteAllLoading || !data?.total}
            className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 disabled:opacity-50 dark:border-red-800 dark:text-red-400"
          >
            {deleteAllLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete all{data?.total ? ` (${data.total})` : ""}
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 admin-text-muted"
          />
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => {
              const value = e.target.value;
              setSearchDraft(value);
              clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(() => {
                setQuery(value);
                setPage(1);
              }, 300);
            }}
            placeholder="Search name, email, message…"
            className="admin-input w-full py-2 pl-9 text-sm"
          />
        </div>
      </div>

      {msg && (
        <p
          className={`text-sm ${
            msg.includes("deleted") || msg.includes("Deleted") ? "text-green-600" : "text-red-500"
          }`}
        >
          {msg}
        </p>
      )}

      {loading && !data ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="admin-card max-w-full overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium min-w-[280px]">Message</th>
                  <th className="p-3 font-medium">Device</th>
                  <th className="p-3 font-medium">IP</th>
                  <th className="p-3 w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.length ? (
                  data.items.map((contact) => (
                    <tr key={contact._id} className="border-b border-slate-100 dark:border-white/5">
                      <td className="p-3 admin-text-muted whitespace-nowrap text-xs">
                        {formatDate(contact.createdAt || contact.submittedAt)}
                      </td>
                      <td className="p-3 font-medium">{contact.name}</td>
                      <td className="p-3">
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-purple-600 hover:underline dark:text-purple-400"
                        >
                          {contact.email}
                        </a>
                      </td>
                      <td className="p-3 admin-text-muted">
                        <p className="max-w-md whitespace-pre-wrap wrap-break-word">{contact.message}</p>
                      </td>
                      <td className="p-3 admin-text-muted text-xs">
                        <div>{contact.device || "—"}</div>
                        <div className="mt-0.5 opacity-80">
                          {[contact.browser, contact.os].filter(Boolean).join(" · ") || "—"}
                        </div>
                      </td>
                      <td className="p-3 admin-text-muted text-xs">{contact.ipAddress || "—"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <a
                            href={`mailto:${contact.email}?subject=${encodeURIComponent(`Re: Your message to Hamza Choudhary`)}`}
                            className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/40"
                            title="Reply by email"
                            aria-label={`Reply to ${contact.name}`}
                          >
                            <Mail size={16} />
                          </a>
                          <button
                            type="button"
                            onClick={() => deleteContact(contact._id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                            aria-label="Delete contact"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center admin-text-muted">
                      No contact messages yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data?.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 border-t border-slate-200 p-4 dark:border-white/10">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg p-2 disabled:opacity-40"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm admin-text-muted">
                Page {page} of {data.totalPages} · {data.total} total
              </span>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg p-2 disabled:opacity-40"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
