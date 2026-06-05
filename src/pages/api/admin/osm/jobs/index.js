import { requireAdmin } from "@/lib/requireAdmin";
import { createSearchJob, jobToClient } from "@/lib/osm/searchJob";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const body = await readJsonBody(req);
    const {
      bbox,
      lat,
      lon,
      placeType,
      businessTypeId,
      placeName = "",
      country = "",
      countryCode = "",
      region = "",
      city = "",
    } = body;

    if (!bbox?.south || !bbox?.north || !bbox?.west || !bbox?.east) {
      return sendJson(res, 400, {
        success: false,
        error: "Select a city from suggestions first.",
      });
    }

    if (!businessTypeId) {
      return sendJson(res, 400, { success: false, error: "Business type is required" });
    }

    const job = await createSearchJob({
      bbox,
      lat,
      lon,
      placeType,
      businessTypeId,
      placeName,
      country,
      countryCode,
      region,
      city,
    });

    return sendJson(res, 201, {
      success: true,
      data: jobToClient(job),
    });
  } catch (error) {
    console.error("OSM job create error:", error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || "Failed to start search",
    });
  }
}
