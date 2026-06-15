import { requireAdmin } from "@/lib/requireAdmin";
import {
  cancelSearchJob,
  getSearchJob,
  jobToClient,
  tickSearchJob,
} from "@/lib/osm/searchJob";
import { sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query;
  if (!id) {
    return sendJson(res, 400, { success: false, error: "Job id required" });
  }

  try {
    if (req.method === "GET") {
      const job = await getSearchJob(id);
      return sendJson(res, 200, { success: true, data: await jobToClient(job) });
    }

    if (req.method === "POST") {
      const action = req.query.action || "tick";

      if (action === "cancel") {
        const job = await cancelSearchJob(id);
        return sendJson(res, 200, { success: true, data: await jobToClient(job.toObject()) });
      }

      const job = await tickSearchJob(id);
      return sendJson(res, 200, { success: true, data: await jobToClient(job.toObject()) });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (error) {
    console.error("OSM job error:", error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || "Job request failed",
    });
  }
}
