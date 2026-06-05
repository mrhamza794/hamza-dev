import { requireAdmin } from "@/lib/requireAdmin";
import { searchPlaces } from "@/lib/osm/nominatim";
import { sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const q = String(req.query.q || "").trim();
  const countryCode = String(req.query.country || "").trim().toLowerCase();

  if (q.length < 2) {
    return sendJson(res, 400, { success: false, error: "Query must be at least 2 characters" });
  }

  try {
    const places = await searchPlaces(q, countryCode);
    return sendJson(res, 200, { success: true, data: places });
  } catch (error) {
    console.error("OSM places search error:", error);
    return sendJson(res, 500, { success: false, error: "Failed to search places" });
  }
}
