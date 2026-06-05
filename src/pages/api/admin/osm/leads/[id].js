import connectDB from "@/lib/mongodb";
import OsmLead from "@/lib/models/OsmLead";
import { requireAdmin } from "@/lib/requireAdmin";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query;
  if (!id) return sendJson(res, 400, { success: false, error: "Lead ID required" });

  await connectDB();

  if (req.method === "PATCH") {
    const body = await readJsonBody(req);
    const update = {};

    if (body.email !== undefined) update.email = body.email || null;
    if (body.notes !== undefined) update.notes = body.notes;
    if (body.status !== undefined) {
      if (!["new", "contacted", "skipped"].includes(body.status)) {
        return sendJson(res, 400, { success: false, error: "Invalid status" });
      }
      update.status = body.status;
    }

    const lead = await OsmLead.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!lead) return sendJson(res, 404, { success: false, error: "Lead not found" });

    return sendJson(res, 200, { success: true, data: lead });
  }

  if (req.method === "DELETE") {
    const lead = await OsmLead.findByIdAndDelete(id);
    if (!lead) return sendJson(res, 404, { success: false, error: "Lead not found" });
    return sendJson(res, 200, { success: true, message: "Lead deleted" });
  }

  return methodNotAllowed(res, ["PATCH", "DELETE"]);
}
