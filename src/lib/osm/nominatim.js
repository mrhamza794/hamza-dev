import { getOsmUserAgent } from "@/lib/osm/userAgent";
import { formatSearchArea, getBboxSpans, prepareCityBbox } from "@/lib/osm/bbox";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const EXCLUDED_PLACE_TYPES = new Set([
  "country",
  "continent",
  "supername",
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

function isUsefulPlace(item) {
  const type = String(item.type || "").toLowerCase();
  if (EXCLUDED_PLACE_TYPES.has(type)) return false;

  const bbox = parseBoundingBox(item);
  if (!bbox) return false;

  const { latSpan, lonSpan } = getBboxSpans(bbox);
  if (type === "state" || type === "region") {
    return latSpan <= 1.2 && lonSpan <= 1.2;
  }
  if (type === "administrative" && (latSpan > 1.5 || lonSpan > 1.5)) {
    return false;
  }

  return true;
}

export async function searchPlaces(query, countryCode, limit = 8) {
  const q = encodeURIComponent(query.trim());
  const cc = countryCode ? `&countrycodes=${encodeURIComponent(countryCode.toLowerCase())}` : "";
  const data = await nominatimFetch(
    `/search?q=${q}&format=json&addressdetails=1&limit=${limit * 3}${cc}`
  );

  return (Array.isArray(data) ? data : [])
    .filter(isUsefulPlace)
    .sort((a, b) => {
      const aBbox = parseBoundingBox(a);
      const bBbox = parseBoundingBox(b);
      const aArea = aBbox ? getBboxSpans(aBbox).latSpan * getBboxSpans(aBbox).lonSpan : 999;
      const bArea = bBbox ? getBboxSpans(bBbox).latSpan * getBboxSpans(bBbox).lonSpan : 999;
      return aArea - bArea;
    })
    .slice(0, limit)
    .map((item) => {
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
        lat,
        lon,
        bbox,
        searchArea: area,
        placeType,
        city:
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.address?.municipality ||
          item.address?.county ||
          null,
        region: item.address?.state || item.address?.region || null,
        country: item.address?.country || null,
        countryCode: item.address?.country_code?.toUpperCase() || countryCode?.toUpperCase() || null,
      };
    });
}
