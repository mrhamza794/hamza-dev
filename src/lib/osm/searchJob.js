import connectDB from "@/lib/mongodb";
import OsmSearchJob from "@/lib/models/OsmSearchJob";
import { getBusinessTypeById, getFilterSetsForSearch } from "@/lib/osm/businessTypes";
import {
  formatSearchArea,
  getBboxTiles,
  prepareCityBbox,
  validateSearchBbox,
} from "@/lib/osm/bbox";
import { queryTileFilterSets } from "@/lib/osm/overpass";
import { normalizeOsmElement, filterPois } from "@/lib/osm/normalizePoi";

const TICK_BUDGET_MS = 22_000;
const CHUNK_SIZE = 1;

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
  });

  return job.toObject();
}

export function jobToClient(job) {
  const filtered = filterPois(job.results || []);
  const progress =
    job.totalSteps > 0 ? Math.round((job.completedSteps / job.totalSteps) * 100) : 0;

  return {
    id: String(job._id),
    status: job.status,
    progress,
    completedSteps: job.completedSteps,
    totalSteps: job.totalSteps,
    rawCount: job.rawCount,
    filteredCount: filtered.length,
    items: filtered,
    businessType: { id: job.businessTypeId, label: job.businessTypeLabel },
    searchArea: job.searchArea,
    placeName: job.placeName,
    error: job.error,
    tileIndex: job.tileIndex,
    tileCount: job.tiles?.length || 0,
    currentStep: job.completedSteps + 1,
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

  const tile = tiles[job.tileIndex];
  const chunk = filterSets.slice(job.filterIndex, job.filterIndex + chunkSize);
  const meta = buildMeta(job);

  try {
    const elements = await queryTileFilterSets(tile, chunk);
    job.rawCount += elements.length;

    const seen = new Set(job.seenKeys || []);
    for (const el of elements) {
      const key = `${el.type}-${el.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      job.results.push(normalizeOsmElement(el, meta));
    }
    job.seenKeys = [...seen];
  } catch (err) {
    console.warn("Job chunk skipped:", err.message);
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

  await job.save();
  return job;
}

export async function tickSearchJob(jobId) {
  await connectDB();

  const job = await OsmSearchJob.findById(jobId);
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

  try {
    const deadline = Date.now() + TICK_BUDGET_MS;

    while (Date.now() < deadline && job.tileIndex < job.tiles.length) {
      await processOneChunk(job);
      if (job.status === "complete") break;
    }
  } catch (err) {
    job.status = "failed";
    job.error = err.message || "Search failed";
    await job.save();
  }

  return job;
}

export async function getSearchJob(jobId) {
  await connectDB();
  const job = await OsmSearchJob.findById(jobId).lean();
  if (!job) throw new Error("Search job not found");
  return job;
}

export async function cancelSearchJob(jobId) {
  await connectDB();
  const job = await OsmSearchJob.findById(jobId);
  if (!job) throw new Error("Search job not found");
  if (job.status === "running") {
    job.status = "cancelled";
    await job.save();
  }
  return job;
}

export async function deleteSearchJob(jobId) {
  await connectDB();
  await OsmSearchJob.findByIdAndDelete(jobId);
}
