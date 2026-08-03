import { requireAdmin } from "@/lib/requireAdmin";
import {
  cancelSearchJob,
  createSearchJob,
  getSearchJob,
  jobToClient,
  tickSearchJob,
} from "@/lib/osm/searchJob";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

/**
 * Job routes live on this static path (not /jobs/[id]) because Next 16 Turbopack
 * currently 404s the dynamic pages API segment and returns HTML instead of JSON.
 *
 * GET  /api/admin/osm/jobs?id=JOB_ID
 * POST /api/admin/osm/jobs                 -> create
 * POST /api/admin/osm/jobs?id=JOB_ID       -> tick
 * POST /api/admin/osm/jobs?id=JOB_ID&action=cancel
 */
export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  const jobId = typeof req.query.id === "string" ? req.query.id : req.query.id?.[0];
  const action = typeof req.query.action === "string" ? req.query.action : "tick";

  try {
    if (req.method === "GET") {
      if (!jobId) {
        return sendJson(res, 400, { success: false, error: "Job id required" });
      }
      const job = await getSearchJob(jobId);
      return sendJson(res, 200, { success: true, data: await jobToClient(job) });
    }

    if (req.method !== "POST") {
      return methodNotAllowed(res, ["GET", "POST"]);
    }

    // Existing job: tick or cancel
    if (jobId) {
      if (action === "cancel") {
        const job = await cancelSearchJob(jobId);
        return sendJson(res, 200, {
          success: true,
          data: await jobToClient(job.toObject()),
        });
      }

      const job = await tickSearchJob(jobId);
      return sendJson(res, 200, {
        success: true,
        data: await jobToClient(job.toObject()),
      });
    }

    // New job: create
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
      data: await jobToClient(job),
    });
  } catch (error) {
    console.error("OSM job error:", error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || "Job request failed",
    });
  }
}
