import { getOsmUserAgent } from "@/lib/osm/userAgent";
import { formatSearchArea, getBboxSpans, prepareCityBbox } from "@/lib/osm/bbox";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const EXCLUDED_PLACE_TYPES = new Set(["country", "continent", "supername"]);

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
  "suburb",
]);

const CITY_ADDRESSTYPES = new Set([
  "city",
  "town",
  "village",
  "municipality",
  "borough",
  "hamlet",
  "suburb",
  "city_district",
  "quarter",
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

function getAdminLevel(item) {
  const raw = item.extratags?.admin_level;
  const level = parseInt(raw, 10);
  return Number.isNaN(level) ? null : level;
}

function isSettlementPlace(item) {
  const type = String(item.type || "").toLowerCase();
  const osmClass = String(item.class || "").toLowerCase();
  const addresstype = String(item.addresstype || "").toLowerCase();

  if (EXCLUDED_PLACE_TYPES.has(type)) return false;
  if (BLOCKED_CLASSES.has(osmClass)) return false;

  if (osmClass === "place") {
    return ALLOWED_PLACE_TYPES.has(type);
  }

  if (osmClass === "boundary" && type === "administrative") {
    if (CITY_ADDRESSTYPES.has(addresstype)) return true;
    if (item.extratags?.linked_place === "city") return true;

    const level = getAdminLevel(item);
    // 5–10 covers major cities worldwide (e.g. Karachi division = 5, many US cities = 8)
    if (level != null && level >= 5 && level <= 10) return true;

    const placeRank = parseInt(item.place_rank, 10);
    if (!Number.isNaN(placeRank) && placeRank >= 8 && placeRank <= 16) return true;
  }

  return false;
}

function isUsefulPlace(item) {
  if (!isSettlementPlace(item)) return false;

  const bbox = parseBoundingBox(item);
  if (!bbox) return false;

  const { latSpan, lonSpan } = getBboxSpans(bbox);
  const type = String(item.type || "").toLowerCase();
  if ((type === "state" || type === "region") && (latSpan > 1.2 || lonSpan > 1.2)) {
    return false;
  }
  if (latSpan > 2.5 || lonSpan > 2.5) return false;

  return true;
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
    suburb: 30,
  };
  const importance = parseFloat(item.importance) || 0;
  const addresstypeBonus = CITY_ADDRESSTYPES.has(String(item.addresstype || "").toLowerCase())
    ? 20
    : 0;
  return (typeScore[type] || 30) + addresstypeBonus + importance * 10;
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
  const placeType = item.addresstype || item.type || null;
  const prepared = prepareCityBbox(rawBbox, { lat, lon, placeType: item.type || placeType });
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

async function fetchNominatimResults(query, countryCode, limit) {
  const q = encodeURIComponent(query.trim());
  const cc = countryCode ? `&countrycodes=${encodeURIComponent(countryCode.toLowerCase())}` : "";
  const perRequest = Math.min(limit * 5, 40);

  const data = await nominatimFetch(
    `/search?q=${q}&format=json&addressdetails=1&extratags=1&limit=${perRequest}${cc}`
  );

  return dedupePlaces(Array.isArray(data) ? data : []);
}

export async function searchPlaces(query, countryCode, limit = 8) {
  const data = await fetchNominatimResults(query, countryCode, limit);

  const places = data
    .filter(isUsefulPlace)
    .sort((a, b) => placeRank(b) - placeRank(a))
    .slice(0, limit)
    .map((item) => mapPlace(item, countryCode));

  if (places.length > 0) return places;

  // Retry without country filter when the selected country hides valid matches
  if (countryCode) {
    const broader = await fetchNominatimResults(query, "", limit);
    return broader
      .filter(isUsefulPlace)
      .sort((a, b) => placeRank(b) - placeRank(a))
      .slice(0, limit)
      .map((item) => mapPlace(item, countryCode));
  }

  return places;
}
