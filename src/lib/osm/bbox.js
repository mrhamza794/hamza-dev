/** Max span per side (~280 km) — blocks provinces/countries */
export const MAX_SEARCH_BBOX_SPAN_DEG = 2.5;

/** Each Overpass tile ~25 km — reliable for large cities */
export const TILE_SIZE_DEG = 0.25;

/** When Nominatim returns a point, expand to this for city/town (~45 km) */
export const MIN_CITY_SPAN_DEG = 0.4;

const CITY_PLACE_TYPES = new Set([
  "city",
  "town",
  "municipality",
  "borough",
  "suburb",
]);

export function getBboxSpans(bbox) {
  if (!bbox) return { latSpan: 0, lonSpan: 0 };
  return {
    latSpan: bbox.north - bbox.south,
    lonSpan: bbox.east - bbox.west,
  };
}

function splitBboxGrid(bbox, rows, cols) {
  const { south, west, north, east } = bbox;
  const latStep = (north - south) / rows;
  const lonStep = (east - west) / cols;
  const tiles = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({
        south: south + r * latStep,
        north: south + (r + 1) * latStep,
        west: west + c * lonStep,
        east: west + (c + 1) * lonStep,
      });
    }
  }

  return tiles;
}

/** Expand tiny point-only bboxes so a named city still gets full coverage */
export function prepareCityBbox(bbox, { lat, lon, placeType } = {}) {
  if (!bbox) return null;

  const { latSpan, lonSpan } = getBboxSpans(bbox);
  const type = String(placeType || "").toLowerCase();

  if (
    lat != null &&
    lon != null &&
    CITY_PLACE_TYPES.has(type) &&
    latSpan < 0.12 &&
    lonSpan < 0.12
  ) {
    const half = MIN_CITY_SPAN_DEG / 2;
    return {
      south: lat - half,
      north: lat + half,
      west: lon - half,
      east: lon + half,
      expandedFromPoint: true,
    };
  }

  return { ...bbox, expandedFromPoint: false };
}

/** Split bbox into fixed-size tiles — no cap, covers entire city */
export function getBboxTiles(bbox) {
  const { latSpan, lonSpan } = getBboxSpans(bbox);

  if (latSpan <= TILE_SIZE_DEG && lonSpan <= TILE_SIZE_DEG) {
    return [bbox];
  }

  const rows = Math.max(1, Math.ceil(latSpan / TILE_SIZE_DEG));
  const cols = Math.max(1, Math.ceil(lonSpan / TILE_SIZE_DEG));
  return splitBboxGrid(bbox, rows, cols);
}

export function getSearchTileGrid(bbox) {
  const tiles = getBboxTiles(bbox);
  const side = Math.sqrt(tiles.length);
  return {
    rows: Math.max(1, Math.ceil(getBboxSpans(bbox).latSpan / TILE_SIZE_DEG)),
    cols: Math.max(1, Math.ceil(getBboxSpans(bbox).lonSpan / TILE_SIZE_DEG)),
    count: tiles.length,
  };
}

export function formatSearchArea(bbox) {
  const { latSpan, lonSpan } = getBboxSpans(bbox);
  const centerLat = (bbox.north + bbox.south) / 2;
  const kmLat = Math.round(latSpan * 111);
  const kmLon = Math.round(lonSpan * 111 * Math.cos((centerLat * Math.PI) / 180));
  const { count } = getSearchTileGrid(bbox);
  return { kmLat, kmLon, tileCount: count };
}

export function validateSearchBbox(bbox) {
  if (!bbox) {
    throw new Error("Area bounding box is required.");
  }

  const { latSpan, lonSpan } = getBboxSpans(bbox);
  if (latSpan > MAX_SEARCH_BBOX_SPAN_DEG || lonSpan > MAX_SEARCH_BBOX_SPAN_DEG) {
    throw new Error(
      "Selected area is too large. Pick a city or town from suggestions — not a whole province or country."
    );
  }

  return {
    south: bbox.south,
    west: bbox.west,
    north: bbox.north,
    east: bbox.east,
  };
}
