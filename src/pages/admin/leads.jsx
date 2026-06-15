import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Save,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckSquare,
  Square,
  Trash2,
} from "lucide-react";
import { COUNTRIES } from "@/lib/osm/countries";
import { ALL_TYPES_ID, BUSINESS_TYPES } from "@/lib/osm/businessTypes";
import SearchableSelect from "@/components/admin/SearchableSelect";

const TABS = ["Search", "Saved leads"];

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

const BUSINESS_TYPE_OPTIONS = [
  { value: ALL_TYPES_ID, label: "All business types (full city scan)" },
  ...BUSINESS_TYPES.map((t) => ({ value: t.id, label: t.label })).sort((a, b) =>
    a.label.localeCompare(b.label)
  ),
];

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState("Search");

  // Search wizard state
  const [countryCode, setCountryCode] = useState("PK");
  const [cityQuery, setCityQuery] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [businessTypeId, setBusinessTypeId] = useState(ALL_TYPES_ID);

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [allResults, setAllResults] = useState([]);
  const [searchMeta, setSearchMeta] = useState(null);
  const [searchPage, setSearchPage] = useState(1);
  const PAGE_SIZE = 50;
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [saveMsg, setSaveMsg] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Saved leads state
  const [savedData, setSavedData] = useState(null);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedPage, setSavedPage] = useState(1);
  const [savedFilter, setSavedFilter] = useState({ status: "" });
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const suggestTimer = useRef(null);
  const searchAbortRef = useRef(false);
  const activeJobIdRef = useRef(null);

  const leadKey = (lead) => `${lead.osmType}-${lead.osmId}`;

  // City autocomplete
  useEffect(() => {
    if (!cityQuery.trim() || cityQuery.length < 2 || selectedPlace?.displayName === cityQuery) {
      setPlaceSuggestions([]);
      return;
    }

    clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: cityQuery, country: countryCode });
        const res = await fetch(`/api/admin/osm/places?${params}`, { credentials: "include" });
        const data = await res.json();
        if (data.success) setPlaceSuggestions(data.data || []);
      } catch {
        setPlaceSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(suggestTimer.current);
  }, [cityQuery, countryCode, selectedPlace?.displayName]);

  const runSearch = useCallback(async () => {
      if (!selectedPlace?.bbox) {
        setSearchError("Select a city or region from the suggestions (full area will be searched).");
        return;
      }

      searchAbortRef.current = false;
      setSearchLoading(true);
      setSearchError("");
      setSaveMsg("");
      setSearchProgress(null);
      setAllResults([]);
      setSearchMeta(null);

      try {
        const createRes = await fetch("/api/admin/osm/jobs", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bbox: selectedPlace.bbox,
            lat: selectedPlace.lat,
            lon: selectedPlace.lon,
            placeType: selectedPlace.placeType,
            businessTypeId,
            placeName: selectedPlace.displayName,
            country: selectedPlace.country,
            countryCode: selectedPlace.countryCode || countryCode,
            region: selectedPlace.region,
            city: selectedPlace.city,
          }),
        });
        const createData = await createRes.json();
        if (!createData.success) throw new Error(createData.error || "Search failed to start");

        let job = createData.data;
        activeJobIdRef.current = job.id;
        setSearchProgress(job);
        setAllResults(job.items || []);
        setSearchMeta(job);

        while (
          (job.status === "running" || job.completedSteps < job.totalSteps) &&
          job.status !== "complete" &&
          job.status !== "failed" &&
          job.status !== "cancelled" &&
          !searchAbortRef.current
        ) {
          const tickRes = await fetch(`/api/admin/osm/jobs/${job.id}`, {
            method: "POST",
            credentials: "include",
          });
          const tickData = await tickRes.json();
          if (!tickData.success) throw new Error(tickData.error || "Search step failed");

          job = tickData.data;
          setSearchProgress(job);
          setAllResults(job.items || []);
          setSearchMeta(job);

          if (job.status === "complete") break;
        }

        if (searchAbortRef.current && job.id) {
          await fetch(`/api/admin/osm/jobs/${job.id}?action=cancel`, {
            method: "POST",
            credentials: "include",
          });
        }

        if (job.status === "failed") {
          throw new Error(job.error || "Search failed");
        }

        if (job.status === "complete" && job.filteredCount === 0) {
          setSearchError(
            job.rawCount > 0
              ? "Search found businesses in this area but none have an email on OpenStreetMap."
              : "Search finished with no businesses in this area. Try a different city or business type."
          );
        }

        setSearchPage(1);
        setSelectedKeys(new Set());
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : "Search failed");
        if (!searchAbortRef.current) {
          setAllResults([]);
          setSearchMeta(null);
        }
      } finally {
        setSearchLoading(false);
        setSearchProgress(null);
        activeJobIdRef.current = null;
      }
    },
    [selectedPlace, businessTypeId, countryCode]
  );

  const cancelSearch = useCallback(() => {
    searchAbortRef.current = true;
  }, []);

  const searchPageItems = allResults.slice(
    (searchPage - 1) * PAGE_SIZE,
    searchPage * PAGE_SIZE
  );
  const searchTotalPages = Math.ceil(allResults.length / PAGE_SIZE) || 1;

  const fetchSaved = useCallback(async () => {
    setSavedLoading(true);
    try {
      const params = new URLSearchParams({
        page: savedPage.toString(),
        limit: "50",
        sortBy: "companyName",
        ...(savedFilter.status && { status: savedFilter.status }),
      });
      const res = await fetch(`/api/admin/osm/leads?${params}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setSavedData(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSavedLoading(false);
    }
  }, [savedPage, savedFilter]);

  useEffect(() => {
    if (activeTab === "Saved leads") fetchSaved();
  }, [activeTab, fetchSaved]);

  const toggleSelect = (lead) => {
    const key = leadKey(lead);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!searchPageItems.length) return;
    const allKeys = searchPageItems.map(leadKey);
    const allSelected = allKeys.every((k) => selectedKeys.has(k));
    if (allSelected) {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        allKeys.forEach((k) => next.delete(k));
        return next;
      });
    } else {
      setSelectedKeys((prev) => new Set([...prev, ...allKeys]));
    }
  };

  const saveLeads = async (leadsToSave) => {
    if (!leadsToSave.length || saveLoading) return;
    setSaveMsg("");
    setSaveLoading(true);
    try {
      const res = await fetch("/api/admin/osm/leads", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leads: leadsToSave,
          searchMeta: {
            queryPlace: selectedPlace?.displayName,
            businessTypeId,
          },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSaveMsg(data.message);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSelected = () => {
    const selected = allResults.filter((l) => selectedKeys.has(leadKey(l)));
    saveLeads(selected);
  };

  const handleSaveAllPage = () => {
    saveLeads(searchPageItems);
  };

  const handleSaveAllResults = () => {
    saveLeads(allResults);
  };

  const updateLead = async (id, patch) => {
    await fetch(`/api/admin/osm/leads/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    fetchSaved();
  };

  const deleteLead = async (id) => {
    await fetch(`/api/admin/osm/leads/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchSaved();
  };

  const deleteAllSavedLeads = async () => {
    const total = savedData?.total ?? 0;
    if (total === 0) return;

    const label =
      savedFilter.status === ""
        ? `all ${total} saved lead(s)`
        : `${total} lead(s) with status "${savedFilter.status}"`;

    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;

    setDeleteAllLoading(true);
    setSavedMsg("");
    try {
      const params = new URLSearchParams();
      if (savedFilter.status === "") {
        params.set("all", "1");
      } else {
        params.set("status", savedFilter.status);
      }

      const res = await fetch(`/api/admin/osm/leads?${params}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Delete failed");

      setSavedMsg(data.message || "All leads deleted");
      setSavedPage(1);
      fetchSaved();
    } catch (err) {
      setSavedMsg(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteAllLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-title text-2xl font-bold">OSM Leads</h1>
        <p className="admin-text-muted mt-1">
          Pick a city from suggestions. Full city is searched tile-by-tile — works for large cities without timeouts.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                : "admin-card admin-text-muted hover:text-purple-600 dark:hover:text-purple-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Search" && (
        <div className="space-y-6">
          <div className="admin-card space-y-5 p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <SearchableSelect
                label="Country"
                value={countryCode}
                onChange={(code) => {
                  setCountryCode(code);
                  setSelectedPlace(null);
                  setCityQuery("");
                }}
                options={COUNTRY_OPTIONS}
                placeholder="Select country"
              />

              <SearchableSelect
                label="Business type"
                value={businessTypeId}
                onChange={setBusinessTypeId}
                options={BUSINESS_TYPE_OPTIONS}
                placeholder="Select type"
              />
            </div>

            <div className="relative">
              <label className="mb-2 block text-sm font-medium">City or town</label>
              <p className="mb-2 text-xs admin-text-muted">
                Choose the city to scan. All businesses, hospitals, shops, and offices in that area are
                included — results only show places that have an email on OpenStreetMap.
              </p>
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  setSelectedPlace(null);
                }}
                placeholder="e.g. New York, Brooklyn, Lahore…"
                className="admin-input w-full"
              />
              {selectedPlace && selectedPlace.searchArea && (
                <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  {selectedPlace.shortLabel || selectedPlace.displayName} — scan area ~{selectedPlace.searchArea.kmLat}×{selectedPlace.searchArea.kmLon} km
                  {selectedPlace.searchArea.tileCount > 1 &&
                    ` · ${selectedPlace.searchArea.tileCount} tiles`}
                  {selectedPlace.searchArea.expandedFromPoint && " · expanded from city center"}
                </p>
              )}
              {placeSuggestions.length === 0 && cityQuery.length >= 2 && !selectedPlace && (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                  No cities found — check the country is correct, or try the English spelling.
                </p>
              )}
              {placeSuggestions.length > 0 && !selectedPlace && (
                <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900">
                  {placeSuggestions.map((p) => (
                    <li key={p.placeId}>
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 dark:hover:bg-purple-950/40"
                        onClick={() => {
                          setSelectedPlace(p);
                          setCityQuery(p.shortLabel || p.displayName);
                          setPlaceSuggestions([]);
                        }}
                      >
                        <span className="font-medium">{p.shortLabel || p.displayName}</span>
                        {p.placeType && (
                          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-500 dark:bg-white/10">
                            {p.placeType}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => runSearch()}
              disabled={searchLoading || !selectedPlace?.bbox}
              className="flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/30 disabled:opacity-50"
            >
              {searchLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {searchLoading ? "Searching city…" : "Search full city"}
            </button>
            {searchLoading && (
              <button
                type="button"
                onClick={cancelSearch}
                className="rounded-xl border border-red-300 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-800 dark:text-red-400"
              >
                Cancel
              </button>
            )}
          </div>

          {searchLoading && searchProgress && (
            <div className="admin-card space-y-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="admin-text-muted">
                  Tile {Math.min(searchProgress.tileIndex + 1, searchProgress.tileCount)}/
                  {searchProgress.tileCount} · step {searchProgress.completedSteps}/
                  {searchProgress.totalSteps} · {searchProgress.filteredCount} leads
                </span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {searchProgress.progress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-purple-600 to-blue-600 transition-all duration-300"
                  style={{ width: `${Math.max(searchProgress.progress, 2)}%` }}
                />
              </div>
              <p className="text-xs admin-text-muted">
                Querying OpenStreetMap tile-by-tile. Progress updates every few seconds.
              </p>
            </div>
          )}

          {searchError && <p className="text-sm text-red-500">{searchError}</p>}
          {saveMsg && (
            <p className={`text-sm ${saveMsg.includes("Saved") ? "text-green-600" : "text-red-500"}`}>
              {saveMsg}
            </p>
          )}

          {searchMeta && allResults.length > 0 && (
            <div className="admin-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-white/10">
                <p className="text-sm admin-text-muted">
                  {searchMeta.filteredCount} results with email
                  {searchMeta.rawCount > searchMeta.filteredCount &&
                    ` (${searchMeta.rawCount} from OSM, ${searchMeta.rawCount - searchMeta.filteredCount} without email)`}{" "}
                  · {searchMeta.businessType?.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSaveSelected}
                    disabled={saveLoading || selectedKeys.size === 0}
                    className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  >
                    {saveLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save selected ({selectedKeys.size})
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAllPage}
                    disabled={saveLoading}
                    className="flex items-center gap-1 rounded-lg border border-purple-500/50 px-3 py-1.5 text-sm text-purple-600 disabled:opacity-50 dark:text-purple-400"
                  >
                    {saveLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save this page
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAllResults}
                    disabled={saveLoading}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-white/10"
                  >
                    {saveLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save all ({allResults.length})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="p-3">
                        <button type="button" onClick={toggleSelectAll} className="text-slate-400">
                          {searchPageItems.length &&
                          searchPageItems.every((l) => selectedKeys.has(leadKey(l))) ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </th>
                      <th className="p-3 font-medium">Name</th>
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">City</th>
                      <th className="p-3 font-medium">Address</th>
                      <th className="p-3 font-medium">Postcode</th>
                      <th className="p-3 font-medium">Phone</th>
                      <th className="p-3 font-medium">Email</th>
                      <th className="p-3 font-medium">Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchPageItems.map((lead) => {
                      const key = leadKey(lead);
                      return (
                      <tr
                        key={key}
                        className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        <td className="p-3">
                          <button type="button" onClick={() => toggleSelect(lead)}>
                            {selectedKeys.has(key) ? (
                              <CheckSquare size={16} className="text-purple-500" />
                            ) : (
                              <Square size={16} className="text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 font-medium">{lead.companyName}</td>
                        <td className="p-3 admin-text-muted">{lead.categoryLabel || lead.category || "—"}</td>
                        <td className="p-3 admin-text-muted">{lead.city || "—"}</td>
                        <td className="p-3 admin-text-muted max-w-[180px] truncate">{lead.address || "—"}</td>
                        <td className="p-3 admin-text-muted">{lead.postalCode || "—"}</td>
                        <td className="p-3">{lead.phone || "—"}</td>
                        <td className="p-3 text-purple-600 dark:text-purple-400">{lead.email || "—"}</td>
                        <td className="p-3 admin-text-muted">{lead.website || "—"}</td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>

              {searchTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4 p-4">
                  <button
                    type="button"
                    disabled={searchPage <= 1}
                    onClick={() => setSearchPage((p) => p - 1)}
                    className="rounded-lg p-2 disabled:opacity-40"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm admin-text-muted">
                    Page {searchPage} of {searchTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={searchPage >= searchTotalPages}
                    onClick={() => setSearchPage((p) => p + 1)}
                    className="rounded-lg p-2 disabled:opacity-40"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}

          {searchMeta && allResults.length === 0 && !searchLoading && (
            <p className="admin-text-muted text-center py-8">
              No businesses with an email found in this area. Try a smaller city/region, another business type, or a different country.
            </p>
          )}
        </div>
      )}

      {activeTab === "Saved leads" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={savedFilter.status}
              onChange={(e) => {
                setSavedFilter({ status: e.target.value });
                setSavedPage(1);
              }}
              className="admin-input"
            >
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="skipped">Skipped</option>
            </select>
            <a
              href="/api/admin/osm/export"
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/10"
            >
              <Download size={14} /> Export CSV
            </a>
            <button
              type="button"
              onClick={deleteAllSavedLeads}
              disabled={deleteAllLoading || !savedData?.total}
              className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 disabled:opacity-50 dark:border-red-800 dark:text-red-400"
            >
              {deleteAllLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete all{savedData?.total ? ` (${savedData.total})` : ""}
            </button>
          </div>

          {savedMsg && (
            <p
              className={`text-sm ${savedMsg.includes("Deleted") ? "text-green-600" : "text-red-500"}`}
            >
              {savedMsg}
            </p>
          )}

          {savedLoading && !savedData ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="admin-card overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="p-3">Name</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Postcode</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3 min-w-[200px]">Email</th>
                    <th className="p-3">Website</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {savedData?.items?.map((lead) => (
                    <tr key={lead._id} className="border-b border-slate-100 dark:border-white/5">
                      <td className="p-3">
                        <div className="font-medium">{lead.companyName}</div>
                        <div className="text-xs admin-text-muted">{lead.categoryLabel}</div>
                      </td>
                      <td className="p-3 admin-text-muted">{lead.city || "—"}</td>
                      <td className="p-3 admin-text-muted max-w-[160px] truncate">{lead.address || "—"}</td>
                      <td className="p-3 admin-text-muted">{lead.postalCode || "—"}</td>
                      <td className="p-3">{lead.phone || "—"}</td>
                      <td className="p-3 text-purple-600 dark:text-purple-400">{lead.email || "—"}</td>
                      <td className="p-3 admin-text-muted text-xs">{lead.website || "—"}</td>
                      <td className="p-3">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLead(lead._id, { status: e.target.value })}
                          className="admin-input text-xs"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="skipped">Skipped</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={lead.notes || ""}
                          placeholder="Notes…"
                          className="admin-input w-32 text-xs"
                          onBlur={(e) => {
                            if (e.target.value !== (lead.notes || "")) {
                              updateLead(lead._id, { notes: e.target.value });
                            }
                          }}
                        />
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => deleteLead(lead._id)}
                          className="text-red-500 hover:text-red-600"
                          aria-label="Delete lead"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {savedData?.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 p-4">
                  <button
                    type="button"
                    disabled={savedPage <= 1}
                    onClick={() => setSavedPage((p) => p - 1)}
                    className="rounded-lg p-2 disabled:opacity-40"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm admin-text-muted">
                    Page {savedPage} of {savedData.totalPages} ({savedData.total} total)
                  </span>
                  <button
                    type="button"
                    disabled={savedPage >= savedData.totalPages}
                    onClick={() => setSavedPage((p) => p + 1)}
                    className="rounded-lg p-2 disabled:opacity-40"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {savedData?.items?.length === 0 && (
                <p className="p-8 text-center admin-text-muted">
                  No saved leads with email yet. Search and save from the Search tab.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
