import https from "node:https";
import { getOsmUserAgent } from "@/lib/osm/userAgent";
import { getBboxTiles } from "@/lib/osm/bbox";

const OVERPASS_URLS = [
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const CHUNK_DELAY_MS = 400;
const MAX_RETRIES = 2;
const QUERY_TIMEOUT_SEC = 20;
const REQUEST_TIMEOUT_MS = 25_000;
const WILDCARD_REQUEST_TIMEOUT_MS = 28_000;

function tagSelector(key, value) {
  if (value === null || value === undefined) {
    return `["${key}"]`;
  }
  return `["${key}"="${value}"]`;
}

function buildFilterClause(filters) {
  return filters.map(({ key, value }) => tagSelector(key, value)).join("");
}

function bboxClause(bbox) {
  const { south, west, north, east } = bbox;
  return `(${south},${west},${north},${east})`;
}

function isWildcardFilterSet(filterSets) {
  return filterSets.some((filters) =>
    filters.some((f) => f.value === null || f.value === undefined)
  );
}

function buildQuery(bbox, filterSets) {
  const area = bboxClause(bbox);
  const queryTimeout = isWildcardFilterSet(filterSets) ? 25 : QUERY_TIMEOUT_SEC;
  const lines = filterSets.flatMap((filters) => {
    const tagClause = buildFilterClause(filters);
    return [
      `  node${tagClause}${area};`,
      `  way${tagClause}${area};`,
      `  relation${tagClause}${area};`,
    ];
  });

  return `
[out:json][timeout:${queryTimeout}];
(
${lines.join("\n")}
);
out center tags;
`.trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return (
    msg.includes("timed out") ||
    msg.includes("fetch failed") ||
    msg.includes("timeout") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("socket") ||
    msg.includes("network")
  );
}

function postOverpass(url, body, requestTimeoutMs = REQUEST_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const payload = `data=${encodeURIComponent(body)}`;

    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(payload),
          "User-Agent": getOsmUserAgent(),
          Accept: "*/*",
        },
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => {
          text += chunk;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode || 0, text });
        });
      }
    );

    req.setTimeout(requestTimeoutMs, () => {
      req.destroy(new Error("Overpass request timed out"));
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function runOverpassQuery(query, attempt = 0, requestTimeoutMs = REQUEST_TIMEOUT_MS) {
  const url = OVERPASS_URLS[attempt % OVERPASS_URLS.length];

  try {
    const { status, text } = await postOverpass(url, query, requestTimeoutMs);

    if (status < 200 || status >= 300) {
      const retryable = status === 429 || status === 502 || status === 504;
      if (retryable && attempt < MAX_RETRIES) {
        await sleep(1500 * (attempt + 1));
        return runOverpassQuery(query, attempt + 1, requestTimeoutMs);
      }
      throw new Error(`Overpass error ${status}`);
    }

    try {
      const data = JSON.parse(text);
      return Array.isArray(data.elements) ? data.elements : [];
    } catch {
      throw new Error("Overpass returned an invalid response.");
    }
  } catch (err) {
    if (attempt < MAX_RETRIES && isRetryableError(err)) {
      await sleep(1500 * (attempt + 1));
      return runOverpassQuery(query, attempt + 1, requestTimeoutMs);
    }
    throw err;
  }
}

/** Query one tile for one or more filter sets */
export async function queryTileFilterSets(bbox, filterSets) {
  if (!bbox || filterSets.length === 0) return [];
  const query = buildQuery(bbox, filterSets);
  const requestTimeoutMs = isWildcardFilterSet(filterSets)
    ? WILDCARD_REQUEST_TIMEOUT_MS
    : REQUEST_TIMEOUT_MS;
  return runOverpassQuery(query, 0, requestTimeoutMs);
}

/** Query full area synchronously (small areas only) */
export async function queryPoisInArea({ bbox, filterSets, onProgress }) {
  if (!bbox || filterSets.length === 0) return [];

  const tiles = getBboxTiles(bbox);
  const merged = new Map();
  let step = 0;
  const totalSteps = tiles.length * filterSets.length;

  for (let ti = 0; ti < tiles.length; ti++) {
    for (let fi = 0; fi < filterSets.length; fi++) {
      const chunk = [filterSets[fi]];
      try {
        const elements = await queryTileFilterSets(tiles[ti], chunk);
        for (const el of elements) {
          merged.set(`${el.type}-${el.id}`, el);
        }
      } catch (err) {
        if (filterSets.length === 1) throw err;
        console.warn("Overpass chunk skipped:", err.message);
      }

      step += 1;
      if (onProgress) {
        await onProgress({
          step,
          totalSteps,
          tileIndex: ti,
          tileCount: tiles.length,
          leadsFound: merged.size,
        });
      }

      if (fi + 1 < filterSets.length || ti < tiles.length - 1) {
        await sleep(CHUNK_DELAY_MS);
      }
    }
  }

  return [...merged.values()];
}

export { getBboxTiles };
