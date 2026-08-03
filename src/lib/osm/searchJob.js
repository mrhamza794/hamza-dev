import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import OsmSearchJob from "@/lib/models/OsmSearchJob";
import OsmSearchResult from "@/lib/models/OsmSearchResult";
import { getBusinessTypeById, getFilterSetsForSearch } from "@/lib/osm/businessTypes";
import {
  formatSearchArea,
  getBboxTiles,
  prepareCityBbox,
  validateSearchBbox,
} from "@/lib/osm/bbox";
import { queryTileFilterSets } from "@/lib/osm/overpass";
import { normalizeOsmElement, filterPois } from "@/lib/osm/normalizePoi";

const CHUNK_SIZE = 1;

const JOB_SELECT = "-results -seenKeys";

function buildMeta(job) {
  return {
    businessTypeId: job.businessTypeId,
    categoryLabel: job.businessTypeLabel,
    country: job.country,
    countryCode: job.countryCode,
    region: job.region,
    city: job.city,
    queryPlace: job.placeName,
  };
}

function countSteps(tiles, filterCount, chunkSize) {
  return tiles.length * Math.ceil(filterCount / chunkSize);
}

function resolveJobObjectId(jobOrId) {
  if (!jobOrId) return null;
  if (jobOrId instanceof mongoose.Types.ObjectId) return jobOrId;

  const raw =
    typeof jobOrId === "object"
      ? jobOrId._id ?? jobOrId.id
      : jobOrId;

  if (!raw) return null;
  if (raw instanceof mongoose.Types.ObjectId) return raw;

  const asString = String(raw);
  if (!mongoose.Types.ObjectId.isValid(asString)) return null;
  return new mongoose.Types.ObjectId(asString);
}

async function loadJobResults(jobOrId) {
  const jobId = resolveJobObjectId(jobOrId);
  if (!jobId) return [];

  const results = await OsmSearchResult.find({
    $or: [{ jobId }, { jobId: String(jobId) }],
  })
    .select("-__v -createdAt -updatedAt")
    .lean();

  return results;
}

async function insertJobResults(jobId, pois) {
  if (!pois.length) return 0;

  const resolvedId = resolveJobObjectId(jobId);
  if (!resolvedId) return 0;

  const docs = pois.map((poi) => ({ jobId: resolvedId, ...poi }));

  try {
    const inserted = await OsmSearchResult.insertMany(docs, { ordered: false });
    return inserted.length;
  } catch (err) {
    if (err.name === "MongoBulkWriteError" || err.code === 11000) {
      return err.insertedDocs?.length ?? err.result?.insertedCount ?? 0;
    }
    throw err;
  }
}

export async function createSearchJob(payload) {
  await connectDB();

  const businessType = getBusinessTypeById(payload.businessTypeId);
  if (!businessType) {
    throw new Error("Invalid business type");
  }

  const prepared = prepareCityBbox(payload.bbox, {
    lat: payload.lat,
    lon: payload.lon,
    placeType: payload.placeType,
  });
  const searchBbox = validateSearchBbox(prepared);
  const tiles = getBboxTiles(searchBbox);
  const filterSets = getFilterSetsForSearch(payload.businessTypeId);
  const chunkSize = CHUNK_SIZE;
  const searchArea = {
    ...formatSearchArea(searchBbox),
    expandedFromPoint: Boolean(prepared.expandedFromPoint),
  };

  const job = await OsmSearchJob.create({
    placeName: payload.placeName || null,
    city: payload.city || null,
    region: payload.region || null,
    country: payload.country || null,
    countryCode: payload.countryCode || null,
    businessTypeId: businessType.id,
    businessTypeLabel: businessType.label,
    bbox: searchBbox,
    tiles,
    filterSets,
    chunkSize,
    totalSteps: countSteps(tiles, filterSets.length, chunkSize),
    searchArea,
    matchedCount: 0,
  });

  return job.toObject();
}

export async function jobToClient(job) {
  const jobId = resolveJobObjectId(job);
  const items = await loadJobResults(jobId || job);
  // Results were already email-filtered at insert time; keep a light sanity filter
  // but fall back to stored docs if something odd strips fields on read.
  const filtered = filterPois(items);
  const leads = filtered.length > 0 ? filtered : items.filter((poi) => poi?.email || poi?.companyName);
  const ratio = job.totalSteps > 0 ? (job.completedSteps / job.totalSteps) * 100 : 0;
  // Keep sub-1% visible so large city scans don't look stuck at 0
  const progress =
    job.totalSteps > 0
      ? ratio > 0 && ratio < 1
        ? Math.round(ratio * 10) / 10
        : Math.round(ratio)
      : 0;

  const currentFilters = job.filterSets?.[job.filterIndex];
  const currentFilterLabel = Array.isArray(currentFilters)
    ? currentFilters.map((f) => (f.value == null ? f.key : `${f.key}=${f.value}`)).join(", ")
    : null;

  return {
    id: String(jobId || job._id || job.id),
    status: job.status,
    progress,
    completedSteps: job.completedSteps,
    totalSteps: job.totalSteps,
    rawCount: job.rawCount,
    matchedCount: job.matchedCount || 0,
    filteredCount: leads.length || job.matchedCount || 0,
    items: leads.length ? leads : items,
    businessType: { id: job.businessTypeId, label: job.businessTypeLabel },
    searchArea: job.searchArea,
    placeName: job.placeName,
    error: job.error,
    tileIndex: job.tileIndex,
    tileCount: job.tiles?.length || 0,
    currentStep: job.completedSteps + 1,
    currentFilterLabel,
  };
}

async function processOneChunk(job) {
  const tiles = job.tiles;
  const filterSets = job.filterSets;
  const chunkSize = job.chunkSize || 2;

  if (job.tileIndex >= tiles.length) {
    job.status = "complete";
    await job.save();
    return job;
  }

  // Bail if another request cancelled this job while we were waiting.
  const fresh = await OsmSearchJob.findById(job._id).select("status").lean();
  if (!fresh || fresh.status === "cancelled") {
    job.status = "cancelled";
    return job;
  }

  const tile = tiles[job.tileIndex];
  const chunk = filterSets.slice(job.filterIndex, job.filterIndex + chunkSize);
  const meta = buildMeta(job);

  try {
    const elements = await queryTileFilterSets(tile, chunk);

    const cancelledDuringQuery = await OsmSearchJob.findById(job._id).select("status").lean();
    if (!cancelledDuringQuery || cancelledDuringQuery.status === "cancelled") {
      job.status = "cancelled";
      return job;
    }

    job.rawCount += elements.length;

    const pois = [];
    for (const el of elements) {
      const poi = normalizeOsmElement(el, meta);
      if (filterPois([poi]).length) {
        pois.push(poi);
      }
    }

    const inserted = await insertJobResults(job._id, pois);
    job.matchedCount = (job.matchedCount || 0) + inserted;
  } catch (err) {
    console.warn("Job chunk skipped:", err.message);
  }

  const stillActive = await OsmSearchJob.findById(job._id).select("status").lean();
  if (!stillActive || stillActive.status === "cancelled") {
    job.status = "cancelled";
    return job;
  }

  job.filterIndex += chunkSize;
  if (job.filterIndex >= filterSets.length) {
    job.tileIndex += 1;
    job.filterIndex = 0;
  }

  job.completedSteps = Math.min(job.completedSteps + 1, job.totalSteps);

  if (job.tileIndex >= tiles.length) {
    job.status = "complete";
  }

  // Atomic write that won't revive a cancelled job
  const updated = await OsmSearchJob.findOneAndUpdate(
    { _id: job._id, status: { $ne: "cancelled" } },
    {
      $set: {
        tileIndex: job.tileIndex,
        filterIndex: job.filterIndex,
        completedSteps: job.completedSteps,
        rawCount: job.rawCount,
        matchedCount: job.matchedCount,
        status: job.status === "complete" ? "complete" : "running",
        error: job.error,
      },
    },
    { new: true, select: JOB_SELECT }
  );

  if (!updated) {
    job.status = "cancelled";
    return job;
  }

  Object.assign(job, updated.toObject());
  return job;
}

export async function tickSearchJob(jobId) {
  await connectDB();

  const job = await OsmSearchJob.findById(jobId).select(JOB_SELECT);
  if (!job) {
    throw new Error("Search job not found");
  }

  if (job.status === "cancelled") {
    return job;
  }

  if (job.status === "complete" || job.status === "failed") {
    return job;
  }

  job.status = "running";
  await job.save();

  try {
    // One chunk per tick so the UI can update between Overpass calls.
    if (job.tileIndex < job.tiles.length) {
      await processOneChunk(job);
    }
  } catch (err) {
    const latest = await OsmSearchJob.findById(jobId).select("status").lean();
    if (latest?.status === "cancelled") {
      job.status = "cancelled";
      return job;
    }
    job.status = "failed";
    job.error = err.message || "Search failed";
    await job.save();
  }

  return job;
}

export async function getSearchJob(jobId) {
  await connectDB();
  const job = await OsmSearchJob.findById(jobId).select(JOB_SELECT).lean();
  if (!job) throw new Error("Search job not found");
  return job;
}

export async function cancelSearchJob(jobId) {
  await connectDB();
  const job = await OsmSearchJob.findByIdAndUpdate(
    jobId,
    { $set: { status: "cancelled" } },
    { new: true }
  ).select(JOB_SELECT);
  if (!job) throw new Error("Search job not found");
  return job;
}

export async function deleteSearchJob(jobId) {
  await connectDB();
  await OsmSearchResult.deleteMany({ jobId });
  await OsmSearchJob.findByIdAndDelete(jobId);
}
