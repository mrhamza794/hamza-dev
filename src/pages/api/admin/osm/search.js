import { requireAdmin } from "@/lib/requireAdmin";
import { createSearchJob, jobToClient, tickSearchJob } from "@/lib/osm/searchJob";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

/** Legacy sync endpoint — runs one tick loop server-side (small cities only) */
export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const body = await readJsonBody(req);
    const job = await createSearchJob(body);

    let current = job;
    let guard = 0;
    while (current.status === "running" && guard < 500) {
      current = (await tickSearchJob(String(current._id))).toObject();
      guard += 1;
    }

    const data = jobToClient(current);
    return sendJson(res, 200, { success: true, data });
  } catch (error) {
    console.error("OSM search error:", error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || "OSM search failed",
    });
  }
}
