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
  Mail,
  X,
  RefreshCw,
} from "lucide-react";
import { COUNTRIES } from "@/lib/osm/countries";
import { ALL_TYPES_ID, BUSINESS_TYPES } from "@/lib/osm/businessTypes";
import {
  DEFAULT_LEAD_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_TYPES,
  getDefaultEmailTemplates,
  leadHasWebsite,
  personalizeEmailText,
  prepareTemplatesForModal,
} from "@/lib/leadEmailTemplates";
import SearchableSelect from "@/components/admin/SearchableSelect";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

const TABS = ["Search", "Saved leads"];
const EMAIL_BATCH_SIZE = 25;
const OSM_JOB_STORAGE_KEY = "osm-search-job-id";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

const BUSINESS_TYPE_OPTIONS = [
  { value: ALL_TYPES_ID, label: "All business types (full city scan)" },
  ...BUSINESS_TYPES.map((t) => ({ value: t.id, label: t.label })).sort((a, b) =>
    a.label.localeCompare(b.label)
  ),
];

function readStoredJobId() {
  try {
    return sessionStorage.getItem(OSM_JOB_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredJobId(id) {
  try {
    if (id) sessionStorage.setItem(OSM_JOB_STORAGE_KEY, id);
    else sessionStorage.removeItem(OSM_JOB_STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

function isTerminalJobStatus(status) {
  return status === "complete" || status === "failed" || status === "cancelled";
}

function isResumableJob(job) {
  return Boolean(job?.id && job.status === "running");
}

async function readApiJson(res) {
  const text = await res.text();
  if (!text) {
    throw new Error(res.ok ? "Empty response from server" : `Request failed (${res.status})`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      res.status === 404
        ? "Search API route not found. Refresh the page and try again."
        : `Server returned a non-JSON response (${res.status}). Search interrupted.`
    );
  }
}

function jobTickUrl(jobId, action) {
  const params = new URLSearchParams({ id: jobId });
  if (action) params.set("action", action);
  return `/api/admin/osm/jobs?${params}`;
}

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
  const [resumableJobId, setResumableJobId] = useState(null);
  const [searchElapsedSec, setSearchElapsedSec] = useState(0);

  // Saved leads state
  const [savedData, setSavedData] = useState(null);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedPage, setSavedPage] = useState(1);
  const [savedFilter, setSavedFilter] = useState({ status: "", hasWebsite: "", q: "" });
  const [savedSearchDraft, setSavedSearchDraft] = useState("");
  const savedSearchTimer = useRef(null);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [savedSelectedIds, setSavedSelectedIds] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSendIds, setEmailSendIds] = useState([]);
  const [emailPreviewLeads, setEmailPreviewLeads] = useState([]);
  const [emailTemplateTab, setEmailTemplateTab] = useState(EMAIL_TEMPLATE_TYPES.NO_WEBSITE);
  const [emailTemplates, setEmailTemplates] = useState(getDefaultEmailTemplates);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSendProgress, setEmailSendProgress] = useState("");

  const suggestTimer = useRef(null);
  const searchAbortRef = useRef(false);
  const activeJobIdRef = useRef(null);
  const prevJobIdRef = useRef(null);
  const allResultsRef = useRef([]);
  const tickAbortControllerRef = useRef(null);

  useEffect(() => {
    allResultsRef.current = allResults;
  }, [allResults]);

  useEffect(() => {
    if (!searchLoading) {
      setSearchElapsedSec(0);
      return undefined;
    }
    const started = Date.now();
    const timer = setInterval(() => {
      setSearchElapsedSec(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [searchLoading]);

  const leadKey = (lead) => `${lead.osmType}-${lead.osmId}`;

  const websiteHref = (url) => {
    const trimmed = url?.trim();
    if (!trimmed) return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

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

  const applyJobToUi = useCallback((job, { preserveExisting = true } = {}) => {
    if (!job) return;

    const prev = allResultsRef.current;
    const next = Array.isArray(job.items) ? job.items : [];
    let merged = next;

    if (preserveExisting) {
      if (
        next.length === 0 &&
        prev.length > 0 &&
        job.status === "running" &&
        (!job.id || !prevJobIdRef.current || job.id === prevJobIdRef.current)
      ) {
        merged = prev;
      } else if (next.length === 0) {
        merged = prev.length && job.status === "running" ? prev : next;
      } else if (prev.length > 0) {
        const map = new Map();
        for (const lead of prev) map.set(leadKey(lead), lead);
        for (const lead of next) map.set(leadKey(lead), lead);
        merged = Array.from(map.values());
      }
    }

    allResultsRef.current = merged;
    const filteredCount = Math.max(
      merged.length,
      job.filteredCount || 0,
      job.matchedCount || 0
    );
    const synced = { ...job, filteredCount, items: merged };

    setAllResults(merged);
    setSearchProgress(synced);
    setSearchMeta(synced);
    if (job.id) prevJobIdRef.current = job.id;
  }, []);

  const markJobInterrupted = useCallback((jobId, job, message) => {
    if (!jobId) return;
    writeStoredJobId(jobId);
    setResumableJobId(jobId);
    if (job) applyJobToUi(job);
    setSearchError(
      message
        ? `${message} Search interrupted — you can resume.`
        : "Search interrupted — you can resume."
    );
  }, [applyJobToUi]);

  const clearPersistedJob = useCallback(() => {
    writeStoredJobId(null);
    setResumableJobId(null);
  }, []);

  const tickJobUntilDone = useCallback(
    async (initialJob) => {
      let job = initialJob;
      const jobId = job.id;

      activeJobIdRef.current = jobId;
      writeStoredJobId(jobId);
      setResumableJobId(null);
      applyJobToUi(job);

      while (job.status === "running" && !searchAbortRef.current) {
        const controller = new AbortController();
        tickAbortControllerRef.current = controller;

        try {
          const tickRes = await fetch(jobTickUrl(jobId), {
            method: "POST",
            credentials: "include",
            signal: controller.signal,
          });
          const tickData = await readApiJson(tickRes);
          if (!tickData.success) throw new Error(tickData.error || "Search step failed");

          job = tickData.data;
          if (searchAbortRef.current) break;
          applyJobToUi(job);

          if (isTerminalJobStatus(job.status)) break;
        } catch (err) {
          if (err?.name === "AbortError" || searchAbortRef.current) break;
          throw err;
        } finally {
          if (tickAbortControllerRef.current === controller) {
            tickAbortControllerRef.current = null;
          }
        }
      }

      if (searchAbortRef.current && jobId) {
        try {
          await fetch(jobTickUrl(jobId, "cancel"), {
            method: "POST",
            credentials: "include",
          });
        } catch {
          /* best-effort */
        }
        clearPersistedJob();
        setSearchError("Search cancelled.");
        return job;
      }

      if (job.status === "failed") {
        clearPersistedJob();
        throw new Error(job.error || "Search failed");
      }

      if (job.status === "complete") {
        clearPersistedJob();
        if (job.filteredCount === 0) {
          setSearchError(
            job.rawCount > 0
              ? "Search found businesses in this area but none have an email on OpenStreetMap."
              : "Search finished with no businesses in this area. Try a different city or business type."
          );
        }
        setSearchPage(1);
        setSelectedKeys(new Set());
      }

      return job;
    },
    [applyJobToUi, clearPersistedJob]
  );

  const resumeJob = useCallback(
    async (jobId) => {
      if (!jobId || searchLoading) return;

      searchAbortRef.current = false;
      setSearchLoading(true);
      setSearchError("");
      setSaveMsg("");
      setResumableJobId(null);

      try {
        const getRes = await fetch(jobTickUrl(jobId), {
          credentials: "include",
        });
        const getData = await readApiJson(getRes);
        if (!getData.success) throw new Error(getData.error || "Could not load search job");

        const job = getData.data;

        if (isTerminalJobStatus(job.status)) {
          clearPersistedJob();
          applyJobToUi(job);
          if (job.status === "failed") {
            throw new Error(job.error || "Search failed");
          }
          if (job.status === "cancelled") {
            setSearchError("Search was cancelled.");
          }
          return;
        }

        if (!isResumableJob(job)) {
          clearPersistedJob();
          applyJobToUi(job);
          return;
        }

        await tickJobUntilDone(job);
      } catch (err) {
        if (searchAbortRef.current) {
          clearPersistedJob();
          setSearchError("Search cancelled.");
        } else {
          const storedId = readStoredJobId();
          if (storedId) {
            markJobInterrupted(
              storedId,
              null,
              err instanceof Error ? err.message : "Search failed."
            );
          } else {
            setSearchError(err instanceof Error ? err.message : "Search failed");
          }
        }
      } finally {
        setSearchLoading(false);
        activeJobIdRef.current = null;
      }
    },
    [searchLoading, clearPersistedJob, applyJobToUi, tickJobUntilDone, markJobInterrupted]
  );

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
    setResumableJobId(null);
    prevJobIdRef.current = null;
    allResultsRef.current = [];

    const previousJobId = readStoredJobId();
    if (previousJobId) {
      try {
        await fetch(jobTickUrl(previousJobId, "cancel"), {
          method: "POST",
          credentials: "include",
        });
      } catch {
        /* best-effort abandon of previous job */
      }
      writeStoredJobId(null);
    }

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
      const createData = await readApiJson(createRes);
      if (!createData.success) throw new Error(createData.error || "Search failed to start");

      const job = createData.data;
      await tickJobUntilDone(job);
    } catch (err) {
      if (searchAbortRef.current) {
        clearPersistedJob();
        setSearchError("Search cancelled.");
      } else {
        const storedId = readStoredJobId();
        if (storedId) {
          markJobInterrupted(
            storedId,
            null,
            err instanceof Error ? err.message : "Search failed."
          );
        } else {
          setSearchError(err instanceof Error ? err.message : "Search failed");
          setAllResults([]);
          setSearchMeta(null);
          setSearchProgress(null);
        }
      }
    } finally {
      setSearchLoading(false);
      activeJobIdRef.current = null;
    }
  }, [selectedPlace, businessTypeId, countryCode, tickJobUntilDone, clearPersistedJob, markJobInterrupted]);

  const cancelSearch = useCallback(async () => {
    const id = activeJobIdRef.current || resumableJobId || readStoredJobId();

    searchAbortRef.current = true;
    tickAbortControllerRef.current?.abort();
    tickAbortControllerRef.current = null;

    if (!id) {
      setSearchLoading(false);
      setSearchError("Search cancelled.");
      return;
    }

    // Cancel on the server immediately — don't wait for the in-flight Overpass tick.
    try {
      await fetch(jobTickUrl(id, "cancel"), {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }

    clearPersistedJob();
    setSearchLoading(false);
    setSearchError("Search cancelled.");
  }, [resumableJobId, clearPersistedJob]);

  useEffect(() => {
    let cancelled = false;

    const recoverInterruptedJob = async () => {
      const jobId = readStoredJobId();
      if (!jobId) return;

      try {
        const res = await fetch(jobTickUrl(jobId), {
          credentials: "include",
        });
        const data = await readApiJson(res);
        if (cancelled) return;

        if (!data.success || !data.data) {
          writeStoredJobId(null);
          return;
        }

        const job = data.data;
        if (isResumableJob(job)) {
          applyJobToUi(job);
          setResumableJobId(job.id);
          setSearchError("Search interrupted — you can resume.");
        } else {
          writeStoredJobId(null);
          if (job.status === "complete") {
            applyJobToUi(job);
          }
        }
      } catch {
        if (!cancelled) {
          /* keep stored id so Resume can retry later */
          setResumableJobId(jobId);
          setSearchError("Search interrupted — you can resume.");
        }
      }
    };

    recoverInterruptedJob();
    return () => {
      cancelled = true;
    };
  }, [applyJobToUi]);

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
        ...(savedFilter.hasWebsite && { hasWebsite: savedFilter.hasWebsite }),
        ...(savedFilter.q && { q: savedFilter.q }),
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

  useEffect(() => {
    setSavedSelectedIds(new Set());
  }, [savedPage, savedFilter]);

  const toggleSavedSelect = (id) => {
    setSavedSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSavedSelectAll = () => {
    const pageIds = (savedData?.items || []).map((l) => l._id);
    if (!pageIds.length) return;
    const allSelected = pageIds.every((id) => savedSelectedIds.has(id));
    if (allSelected) {
      setSavedSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSavedSelectedIds((prev) => new Set([...prev, ...pageIds]));
    }
  };

  const openEmailModal = (leadsOrIds = null) => {
    let ids = [];
    let previewLeads = [];

    if (Array.isArray(leadsOrIds)) {
      if (leadsOrIds.length && leadsOrIds[0]?._id) {
        previewLeads = leadsOrIds;
        ids = leadsOrIds.map((l) => l._id);
      } else {
        ids = leadsOrIds;
        previewLeads = ids
          .map((id) => savedData?.items?.find((l) => String(l._id) === String(id)))
          .filter(Boolean);
      }
    } else if (leadsOrIds?._id) {
      ids = [leadsOrIds._id];
      previewLeads = [leadsOrIds];
    } else {
      ids = [...savedSelectedIds];
      previewLeads = ids
        .map((id) => savedData?.items?.find((l) => String(l._id) === String(id)))
        .filter(Boolean);
    }

    if (!ids.length) return;

    setEmailSendIds(ids);
    setEmailPreviewLeads(previewLeads);
    setEmailTemplates(prepareTemplatesForModal(getDefaultEmailTemplates(), previewLeads));

    const firstLead = previewLeads[0] || null;
    setEmailTemplateTab(
      firstLead && leadHasWebsite(firstLead)
        ? EMAIL_TEMPLATE_TYPES.HAS_WEBSITE
        : EMAIL_TEMPLATE_TYPES.NO_WEBSITE
    );
    setEmailModalOpen(true);
  };

  const closeEmailModal = () => {
    setEmailModalOpen(false);
    setEmailSendIds([]);
    setEmailPreviewLeads([]);
  };

  const updateActiveTemplate = (field, value) => {
    setEmailTemplates((prev) => ({
      ...prev,
      [emailTemplateTab]: {
        ...prev[emailTemplateTab],
        [field]: value,
      },
    }));
  };

  const resetActiveTemplate = () => {
    const defaults = getDefaultEmailTemplates();
    const fresh = prepareTemplatesForModal(defaults, emailPreviewLeads);
    setEmailTemplates((prev) => ({
      ...prev,
      [emailTemplateTab]: fresh[emailTemplateTab],
    }));
  };

  const activeTemplate = emailTemplates[emailTemplateTab];
  const previewLead = emailPreviewLeads[0] || null;
  const previewName = previewLead?.companyName?.trim() || null;
  const isSingleLeadEmail = emailSendIds.length === 1 && Boolean(previewName);

  const sendEmailsToSelected = async () => {
    if (!emailSendIds.length || emailSending) return;
    setEmailSending(true);
    setEmailSendProgress("");
    setSavedMsg("");

    const batches = [];
    for (let i = 0; i < emailSendIds.length; i += EMAIL_BATCH_SIZE) {
      batches.push(emailSendIds.slice(i, i + EMAIL_BATCH_SIZE));
    }

    const payload = {
      templates: {
        noWebsite: {
          subject: emailTemplates.noWebsite.subject,
          message: emailTemplates.noWebsite.message,
        },
        hasWebsite: {
          subject: emailTemplates.hasWebsite.subject,
          message: emailTemplates.hasWebsite.message,
        },
      },
    };

    let totalSent = 0;
    let totalFailed = 0;

    try {
      for (let i = 0; i < batches.length; i += 1) {
        if (batches.length > 1) {
          setEmailSendProgress(`Sending batch ${i + 1} of ${batches.length} (${batches[i].length} leads)…`);
        }

        const res = await fetch("/api/admin/osm/leads/send", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadIds: batches[i], ...payload }),
        });
        const data = await res.json();
        if (!data.success && !data.data?.sent) {
          throw new Error(data.error || data.message || "Send failed");
        }

        totalSent += data.data?.sent || 0;
        totalFailed += data.data?.failed || 0;
      }

      const batchNote = batches.length > 1 ? ` in ${batches.length} batches` : "";
      const failNote = totalFailed ? `, ${totalFailed} failed` : "";
      setSavedMsg(
        totalSent > 0
          ? `Sent ${totalSent} email(s)${failNote}${batchNote}.`
          : `No emails sent.${totalFailed ? ` ${totalFailed} failed.` : ""}`
      );
      closeEmailModal();
      setSavedSelectedIds(new Set());
      fetchSaved();
    } catch (err) {
      const partial =
        totalSent > 0 ? ` Sent ${totalSent} before the error.` : "";
      setSavedMsg(`${err instanceof Error ? err.message : "Send failed"}${partial}`);
    } finally {
      setEmailSending(false);
      setEmailSendProgress("");
    }
  };

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

  const openDeleteOneLead = (lead) => {
    setDeleteModal({
      mode: "one",
      ids: [lead._id],
      title: "Delete lead",
      description: `Delete “${lead.companyName}”? This cannot be undone.`,
      confirmLabel: "Delete",
    });
  };

  const openBulkDeleteLeads = () => {
    if (savedSelectedIds.size > 0) {
      const count = savedSelectedIds.size;
      setDeleteModal({
        mode: "selected",
        ids: [...savedSelectedIds],
        title: "Delete selected leads",
        description: `Delete ${count} selected lead${count === 1 ? "" : "s"}? This cannot be undone.`,
        confirmLabel: `Delete selected (${count})`,
      });
      return;
    }

    const total = savedData?.total ?? 0;
    if (total === 0) return;

    const label =
      !savedFilter.status && !savedFilter.hasWebsite && !savedFilter.q
        ? `all ${total} saved lead(s)`
        : `${total} filtered lead(s)`;

    setDeleteModal({
      mode: "all",
      ids: [],
      title: "Delete leads",
      description: `Delete ${label}? This cannot be undone.`,
      confirmLabel: `Delete all (${total})`,
    });
  };

  const closeDeleteModal = () => {
    if (deleteAllLoading) return;
    setDeleteModal(null);
  };

  const confirmDeleteLeads = async () => {
    if (!deleteModal) return;

    setDeleteAllLoading(true);
    setSavedMsg("");
    try {
      if (deleteModal.mode === "one") {
        const id = deleteModal.ids[0];
        const res = await fetch(`/api/admin/osm/leads/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Delete failed");
        setSavedMsg("Lead deleted");
        setSavedSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else if (deleteModal.mode === "selected") {
        const res = await fetch("/api/admin/osm/leads", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteModal.ids }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Delete failed");
        setSavedMsg(data.message || "Leads deleted");
        setSavedSelectedIds(new Set());
      } else {
        const params = new URLSearchParams();
        const hasFilters = savedFilter.status || savedFilter.hasWebsite || savedFilter.q;
        if (!hasFilters) {
          params.set("all", "1");
        } else {
          if (savedFilter.status) params.set("status", savedFilter.status);
          if (savedFilter.hasWebsite) params.set("hasWebsite", savedFilter.hasWebsite);
          if (savedFilter.q) params.set("q", savedFilter.q);
        }

        const res = await fetch(`/api/admin/osm/leads?${params}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Delete failed");
        setSavedMsg(data.message || "All leads deleted");
        setSavedSelectedIds(new Set());
        setSavedPage(1);
      }

      setDeleteModal(null);
      fetchSaved();
    } catch (err) {
      setSavedMsg(err instanceof Error ? err.message : "Delete failed");
      setDeleteModal(null);
    } finally {
      setDeleteAllLoading(false);
    }
  };

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
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
        <div className="min-w-0 space-y-6">
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
            {resumableJobId && !searchLoading && (
              <button
                type="button"
                onClick={() => resumeJob(resumableJobId)}
                className="flex items-center gap-2 rounded-xl border border-purple-400 bg-purple-50 px-5 py-3 font-semibold text-purple-700 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
              >
                <RefreshCw size={18} />
                Resume search
              </button>
            )}
            {(searchLoading || resumableJobId) && (
              <button
                type="button"
                onClick={cancelSearch}
                className="rounded-xl border border-red-300 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-800 dark:text-red-400"
              >
                Cancel
              </button>
            )}
          </div>

          {(searchLoading || resumableJobId) && searchProgress && (
            <div className="admin-card space-y-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="admin-text-muted">
                  {resumableJobId && !searchLoading ? "Interrupted at " : ""}
                  Tile {Math.min((searchProgress.tileIndex || 0) + 1, searchProgress.tileCount || 1)}/
                  {searchProgress.tileCount || 0} · step {searchProgress.completedSteps || 0}/
                  {searchProgress.totalSteps || 0} ·{" "}
                  {Math.max(allResults.length, searchProgress.filteredCount || 0)} leads
                  {searchLoading ? ` · ${searchElapsedSec}s` : ""}
                </span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {searchProgress.progress > 0 && searchProgress.progress < 1
                    ? `${searchProgress.progress}%`
                    : `${searchProgress.progress || 0}%`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-purple-600 to-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      searchProgress.progress || 0,
                      searchProgress.completedSteps > 0 ? 1 : searchLoading ? 2 : 0,
                      2
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs admin-text-muted">
                {resumableJobId && !searchLoading
                  ? "Connection dropped or the tab was closed. Click Resume to continue from this progress."
                  : searchProgress.completedSteps === 0
                    ? "Contacting OpenStreetMap… the first tile/filter can take 15–30s. Progress updates after each step."
                    : searchProgress.currentFilterLabel
                      ? `Querying “${searchProgress.currentFilterLabel}”. Full-city scans often stay near 0% and 0 leads for a while — that is normal.`
                      : "Querying OpenStreetMap tile-by-tile. Early steps often find 0 emails; leads usually appear later."}
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
            <div className="admin-card max-w-full overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-white/10">
                <p className="text-sm admin-text-muted">
                  {Math.max(allResults.length, searchMeta.filteredCount || 0)} results with email
                  {searchMeta.rawCount > (searchMeta.filteredCount || 0) &&
                    ` (${searchMeta.rawCount} from OSM, ${searchMeta.rawCount - (searchMeta.filteredCount || 0)} without email)`}{" "}
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

              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-275 text-left text-sm">
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
                        <td className="p-3 admin-text-muted max-w-45 truncate">{lead.address || "—"}</td>
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
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openEmailModal()}
                disabled={savedSelectedIds.size === 0}
                className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                <Mail size={14} />
                Email selected ({savedSelectedIds.size})
              </button>
              <a
                href={`/api/admin/osm/export?${new URLSearchParams({
                  ...(savedFilter.status && { status: savedFilter.status }),
                  ...(savedFilter.hasWebsite && { hasWebsite: savedFilter.hasWebsite }),
                  ...(savedFilter.q && { q: savedFilter.q }),
                }).toString()}`}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/10"
              >
                <Download size={14} /> Export CSV
              </a>
              <select
                value={savedFilter.status}
                onChange={(e) => {
                  setSavedFilter((prev) => ({ ...prev, status: e.target.value }));
                  setSavedPage(1);
                }}
                className="admin-input w-27 shrink-0 px-2 py-2 text-sm"
                title="Filter by status"
              >
                <option value="">Status</option>
                <option value="new">New</option>
                <option value="emailed">Emailed</option>
                <option value="skipped">Skipped</option>
                <option value="completed">Done</option>
              </select>
              <select
                value={savedFilter.hasWebsite}
                onChange={(e) => {
                  setSavedFilter((prev) => ({ ...prev, hasWebsite: e.target.value }));
                  setSavedPage(1);
                }}
                className="admin-input w-27 shrink-0 px-2 py-2 text-sm"
                title="Filter by website"
              >
                <option value="">Website</option>
                <option value="yes">Has</option>
                <option value="no">No</option>
              </select>
              <button
                type="button"
                onClick={openBulkDeleteLeads}
                disabled={
                  deleteAllLoading || (savedSelectedIds.size === 0 && !savedData?.total)
                }
                className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 disabled:opacity-50 dark:border-red-800 dark:text-red-400"
              >
                {deleteAllLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {savedSelectedIds.size > 0
                  ? `Delete selected (${savedSelectedIds.size})`
                  : `Delete all${savedData?.total ? ` (${savedData.total})` : ""}`}
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 admin-text-muted"
              />
              <input
                type="search"
                value={savedSearchDraft}
                onChange={(e) => {
                  const value = e.target.value;
                  setSavedSearchDraft(value);
                  clearTimeout(savedSearchTimer.current);
                  savedSearchTimer.current = setTimeout(() => {
                    setSavedFilter((prev) => ({ ...prev, q: value }));
                    setSavedPage(1);
                  }, 300);
                }}
                placeholder="Search all fields…"
                className="admin-input w-full py-2 pl-9 text-sm"
              />
            </div>
          </div>

          {savedMsg && (
            <p
              className={`text-sm ${
                savedMsg.includes("Deleted") ||
                savedMsg.includes("Sent") ||
                savedMsg.includes("new")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {savedMsg}
            </p>
          )}

          {emailModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="admin-card max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Email {emailSendIds.length} lead{emailSendIds.length === 1 ? "" : "s"}
                  </h3>
                  <button
                    type="button"
                    onClick={closeEmailModal}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-xs admin-text-muted">
                  {isSingleLeadEmail ? (
                    <>
                      Emailing <strong>{previewName}</strong> — their name is filled in below. You can
                      edit before sending.
                    </>
                  ) : (
                    <>
                      Two templates are used automatically: leads <strong>without</strong> a website get
                      the no-website proposal; leads <strong>with</strong> a website get the enhancement
                      proposal. Use {"{{companyName}}"} in subject or message for bulk sends.
                      {emailSendIds.length > EMAIL_BATCH_SIZE && (
                        <>
                          {" "}
                          Large selections are sent in batches of {EMAIL_BATCH_SIZE} automatically.
                        </>
                      )}
                    </>
                  )}
                </p>

                <div className="flex rounded-xl border border-slate-200 p-1 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setEmailTemplateTab(EMAIL_TEMPLATE_TYPES.NO_WEBSITE)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      emailTemplateTab === EMAIL_TEMPLATE_TYPES.NO_WEBSITE
                        ? "bg-purple-600 text-white shadow"
                        : "admin-text-muted hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    No website
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailTemplateTab(EMAIL_TEMPLATE_TYPES.HAS_WEBSITE)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      emailTemplateTab === EMAIL_TEMPLATE_TYPES.HAS_WEBSITE
                        ? "bg-purple-600 text-white shadow"
                        : "admin-text-muted hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    Has website
                  </button>
                </div>

                <p className="text-xs admin-text-muted">
                  {DEFAULT_LEAD_EMAIL_TEMPLATES[emailTemplateTab].description}
                </p>

                <div>
                  <label className="mb-1 block text-sm font-medium">Subject</label>
                  <input
                    type="text"
                    value={activeTemplate.subject}
                    onChange={(e) => updateActiveTemplate("subject", e.target.value)}
                    className="admin-input w-full"
                  />
                  {!isSingleLeadEmail && previewName && (
                    <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                      Example: {personalizeEmailText(activeTemplate.subject, previewName)}
                    </p>
                  )}
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="block text-sm font-medium">Message</label>
                    <button
                      type="button"
                      onClick={resetActiveTemplate}
                      className="text-xs text-purple-600 hover:underline dark:text-purple-400"
                    >
                      Reset template
                    </button>
                  </div>
                  <textarea
                    value={activeTemplate.message}
                    onChange={(e) => updateActiveTemplate("message", e.target.value)}
                    rows={14}
                    className="admin-input w-full resize-y font-mono text-sm leading-relaxed"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide admin-text-muted">
                    Preview{previewName ? ` — ${previewName}` : ""}
                    {emailPreviewLeads.length > 1
                      ? ` (+${emailPreviewLeads.length - 1} more)`
                      : ""}
                  </p>
                  {previewName ? (
                    <>
                      <p className="font-medium">
                        {personalizeEmailText(activeTemplate.subject, previewName)}
                      </p>
                      <p className="mt-3 whitespace-pre-wrap admin-text-muted">
                        Hi {previewName},{"\n\n"}
                        {personalizeEmailText(activeTemplate.message, previewName)}
                      </p>
                    </>
                  ) : (
                    <p className="admin-text-muted">Select at least one lead to preview.</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {emailSendProgress && (
                    <p className="mr-auto text-xs text-purple-600 dark:text-purple-400">{emailSendProgress}</p>
                  )}
                  <button
                    type="button"
                    onClick={closeEmailModal}
                    disabled={emailSending}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={sendEmailsToSelected}
                    disabled={
                      emailSending ||
                      !emailTemplates.noWebsite.subject.trim() ||
                      !emailTemplates.noWebsite.message.trim() ||
                      !emailTemplates.hasWebsite.subject.trim() ||
                      !emailTemplates.hasWebsite.message.trim()
                    }
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {emailSending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    {emailSending
                      ? "Sending…"
                      : emailSendIds.length > EMAIL_BATCH_SIZE
                        ? `Send in ${Math.ceil(emailSendIds.length / EMAIL_BATCH_SIZE)} batches`
                        : "Send with smart templates"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {savedLoading && !savedData ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="admin-card max-w-full overflow-hidden">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-300 text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="p-3">
                      <button type="button" onClick={toggleSavedSelectAll} className="text-slate-400">
                        {savedData?.items?.length &&
                        savedData.items.every((l) => savedSelectedIds.has(l._id)) ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="p-3">Name</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Postcode</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3 min-w-50">Email</th>
                    <th className="p-3">Website</th>
                    <th className="p-3 w-28">Status</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedData?.items?.map((lead) => (
                    <tr key={lead._id} className="border-b border-slate-100 dark:border-white/5">
                      <td className="p-3">
                        <button type="button" onClick={() => toggleSavedSelect(lead._id)}>
                          {savedSelectedIds.has(lead._id) ? (
                            <CheckSquare size={16} className="text-purple-500" />
                          ) : (
                            <Square size={16} className="text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{lead.companyName}</div>
                        <div className="text-xs admin-text-muted">{lead.categoryLabel}</div>
                      </td>
                      <td className="p-3 admin-text-muted">{lead.city || "—"}</td>
                      <td className="p-3 admin-text-muted max-w-40 truncate">{lead.address || "—"}</td>
                      <td className="p-3 admin-text-muted">{lead.postalCode || "—"}</td>
                      <td className="p-3">{lead.phone || "—"}</td>
                      <td className="p-3 text-purple-600 dark:text-purple-400">{lead.email || "—"}</td>
                      <td className="p-3 admin-text-muted text-xs max-w-45 truncate">
                        {lead.website?.trim() ? (
                          <a
                            href={websiteHref(lead.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline dark:text-purple-400"
                            title={lead.website}
                          >
                            {lead.website}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          value={lead.status === "contacted" ? "emailed" : lead.status}
                          onChange={(e) => updateLead(lead._id, { status: e.target.value })}
                          className="admin-input w-27 px-2 py-1.5 text-sm"
                        >
                          <option value="new">New</option>
                          <option value="emailed">Emailed</option>
                          <option value="skipped">Skipped</option>
                          <option value="completed">Completed</option>
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
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEmailModal(lead)}
                            disabled={!lead.email?.trim() || emailSending}
                            className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50 disabled:opacity-40 dark:text-purple-400 dark:hover:bg-purple-950/40"
                            title={lead.email ? "Send email" : "No email"}
                            aria-label={`Email ${lead.companyName}`}
                          >
                            <Mail size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteOneLead(lead)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                            aria-label="Delete lead"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

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

      <DeleteConfirmModal
        open={Boolean(deleteModal)}
        title={deleteModal?.title}
        description={deleteModal?.description}
        confirmLabel={deleteModal?.confirmLabel}
        loading={deleteAllLoading}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteLeads}
      />
    </div>
  );
}
