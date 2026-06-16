import connectDB from "@/lib/mongodb";
import OsmLead from "@/lib/models/OsmLead";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendLeadOutreachEmail } from "@/lib/leadEmail";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

const MAX_PER_REQUEST = 25;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const body = await readJsonBody(req);
    const leadIds = Array.isArray(body.leadIds) ? body.leadIds : [];
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!leadIds.length) {
      return sendJson(res, 400, { success: false, error: "Select at least one lead." });
    }

    if (leadIds.length > MAX_PER_REQUEST) {
      return sendJson(res, 400, {
        success: false,
        error: `Maximum ${MAX_PER_REQUEST} leads per send. Select fewer and send in batches.`,
      });
    }

    if (!subject) {
      return sendJson(res, 400, { success: false, error: "Subject is required." });
    }

    if (!message) {
      return sendJson(res, 400, { success: false, error: "Message is required." });
    }

    await connectDB();

    const leads = await OsmLead.find({ _id: { $in: leadIds } }).lean();
    if (!leads.length) {
      return sendJson(res, 404, { success: false, error: "No matching leads found." });
    }

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const lead of leads) {
      if (!lead.email?.trim()) {
        failed += 1;
        errors.push(`${lead.companyName}: no email`);
        continue;
      }

      const result = await sendLeadOutreachEmail({
        to: lead.email,
        companyName: lead.companyName,
        subject,
        message,
      });

      if (result.ok) {
        sent += 1;
        await OsmLead.findByIdAndUpdate(lead._id, {
          $set: { status: "emailed" },
        });
      } else {
        failed += 1;
        errors.push(`${lead.companyName}: ${result.error}`);
      }

      if (sent + failed < leads.length) {
        await sleep(600);
      }
    }

    return sendJson(res, 200, {
      success: sent > 0,
      message:
        sent > 0
          ? `Sent ${sent} email(s)${failed ? `, ${failed} failed` : ""}.`
          : `No emails sent.${failed ? ` ${failed} failed.` : ""}`,
      data: { sent, failed, errors: errors.slice(0, 5) },
    });
  } catch (error) {
    console.error("Lead email send error:", error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || "Failed to send emails",
    });
  }
}
