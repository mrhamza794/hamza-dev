import { getOsmUserAgent } from "@/lib/osm/userAgent";
import { formatSearchArea, getBboxSpans, prepareCityBbox } from "@/lib/osm/bbox";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const EXCLUDED_PLACE_TYPES = new Set(["country", "continent", "supername"]);

/** City/town suggestions only — so the scan covers a full area, not one building */
const ALLOWED_PLACE_TYPES = new Set([
  "city",
  "town",
  "village",
  "municipality",
  "borough",
  "hamlet",
  "locality",
  "administrative",
  "city_district",
]);

const BLOCKED_CLASSES = new Set([
  "amenity",
  "shop",
  "healthcare",
  "office",
  "tourism",
  "leisure",
  "building",
  "highway",
  "historic",
  "craft",
  "emergency",
  "man_made",
  "railway",
  "aeroway",
]);

async function nominatimFetch(path) {
  const res = await fetch(`${NOMINATIM_BASE}${path}`, {
    headers: {
      "User-Agent": getOsmUserAgent(),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Nominatim error: ${res.status}`);
  }

  return res.json();
}

function parseBoundingBox(item) {
  if (!item.boundingbox || item.boundingbox.length < 4) return null;
  const south = parseFloat(item.boundingbox[0]);
  const north = parseFloat(item.boundingbox[1]);
  const west = parseFloat(item.boundingbox[2]);
  const east = parseFloat(item.boundingbox[3]);
  if ([south, north, west, east].some((n) => Number.isNaN(n))) return null;
  return { south, west, north, east };
}

function getShortLabel(item) {
  const addr = item.address || {};
  const primary =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.borough ||
    addr.county ||
    item.name ||
    item.display_name?.split(",")[0]?.trim();
  const region = addr.state || addr.region || null;
  const country = addr.country || null;
  const parts = [primary, region, country].filter(Boolean);
  return parts.join(", ") || item.display_name;
}

function isSettlementPlace(item) {
  const type = String(item.type || "").toLowerCase();
  const osmClass = String(item.class || "").toLowerCase();

  if (EXCLUDED_PLACE_TYPES.has(type)) return false;
  if (BLOCKED_CLASSES.has(osmClass)) return false;

  if (osmClass === "place") {
    return ALLOWED_PLACE_TYPES.has(type);
  }

  if (osmClass === "boundary" && type === "administrative") {
    const level = parseInt(item.extratags?.admin_level || item.address?.admin_level || "99", 10);
    // Cities / towns / municipalities (varies by country; 6–10 covers most)
    return level >= 6 && level <= 10;
  }

  return false;
}

function isUsefulPlace(item) {
  if (!isSettlementPlace(item)) return false;

  const bbox = parseBoundingBox(item);
  if (!bbox) return false;

  const { latSpan, lonSpan } = getBboxSpans(bbox);
  if (typeIsState(item) && (latSpan > 1.2 || lonSpan > 1.2)) return false;
  if (latSpan > 2.5 || lonSpan > 2.5) return false;

  return true;
}

function typeIsState(item) {
  const type = String(item.type || "").toLowerCase();
  return type === "state" || type === "region";
}

function placeRank(item) {
  const type = String(item.type || "").toLowerCase();
  const typeScore = {
    city: 100,
    town: 80,
    municipality: 75,
    administrative: 70,
    borough: 65,
    village: 60,
    locality: 50,
    hamlet: 40,
    city_district: 35,
  };
  const importance = parseFloat(item.importance) || 0;
  return (typeScore[type] || 30) + importance * 10;
}

function dedupePlaces(items) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = `${item.osm_type || ""}-${item.osm_id || item.place_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function mapPlace(item, countryCode) {
  const lat = parseFloat(item.lat);
  const lon = parseFloat(item.lon);
  const rawBbox = parseBoundingBox(item);
  const placeType = item.type || null;
  const prepared = prepareCityBbox(rawBbox, { lat, lon, placeType });
  const bbox = prepared
    ? {
        south: prepared.south,
        west: prepared.west,
        north: prepared.north,
        east: prepared.east,
      }
    : null;
  const area = bbox
    ? { ...formatSearchArea(bbox), expandedFromPoint: Boolean(prepared?.expandedFromPoint) }
    : null;

  return {
    placeId: item.place_id,
    displayName: item.display_name,
    shortLabel: getShortLabel(item),
    lat,
    lon,
    bbox,
    searchArea: area,
    placeType,
    osmType: item.osm_type || null,
    osmId: item.osm_id || null,
    city:
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      item.address?.municipality ||
      item.address?.county ||
      item.name ||
      null,
    region: item.address?.state || item.address?.region || null,
    country: item.address?.country || null,
    countryCode: item.address?.country_code?.toUpperCase() || countryCode?.toUpperCase() || null,
  };
}

async function fetchSettlementResults(query, countryCode, limit) {
  const q = encodeURIComponent(query.trim());
  const cc = countryCode ? `&countrycodes=${encodeURIComponent(countryCode.toLowerCase())}` : "";
  const perRequest = Math.min(limit * 4, 40);

  const [settlementResults, cityResults] = await Promise.all([
    nominatimFetch(
      `/search?q=${q}&format=json&addressdetails=1&extratags=1&limit=${perRequest}&featuretype=settlement${cc}`
    ),
    nominatimFetch(
      `/search?q=${q}&format=json&addressdetails=1&extratags=1&limit=${perRequest}&featuretype=city${cc}`
    ),
  ]);

  return dedupePlaces([
    ...(Array.isArray(settlementResults) ? settlementResults : []),
    ...(Array.isArray(cityResults) ? cityResults : []),
  ]);
}

export async function searchPlaces(query, countryCode, limit = 8) {
  const data = await fetchSettlementResults(query, countryCode, limit);

  return data
    .filter(isUsefulPlace)
    .sort((a, b) => placeRank(b) - placeRank(a))
    .slice(0, limit)
    .map((item) => mapPlace(item, countryCode));
}
