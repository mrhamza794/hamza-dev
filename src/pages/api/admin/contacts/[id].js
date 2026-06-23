import connectDB from "@/lib/mongodb";
import Contact from "@/lib/models/Contact";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query;
  if (!id) return sendJson(res, 400, { success: false, error: "Contact ID required" });

  if (req.method !== "DELETE") return methodNotAllowed(res, ["DELETE"]);

  await connectDB();

  const contact = await Contact.findByIdAndDelete(id);
  if (!contact) return sendJson(res, 404, { success: false, error: "Contact not found" });

  return sendJson(res, 200, { success: true, message: "Contact deleted" });
}
