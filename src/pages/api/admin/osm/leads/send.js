import connectDB from "@/lib/mongodb";
import OsmLead from "@/lib/models/OsmLead";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendLeadOutreachEmail } from "@/lib/leadEmail";
import { pickTemplateForLead } from "@/lib/leadEmailTemplates";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

const MAX_PER_REQUEST = 25;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTemplates(body) {
  const noWebsite = body.templates?.noWebsite || {};
  const hasWebsite = body.templates?.hasWebsite || {};

  const templates = {
    noWebsite: {
      subject: String(noWebsite.subject || body.subject || "").trim(),
      message: String(noWebsite.message || body.message || "").trim(),
    },
    hasWebsite: {
      subject: String(hasWebsite.subject || body.subject || "").trim(),
      message: String(hasWebsite.message || body.message || "").trim(),
    },
  };

  if (!templates.noWebsite.subject || !templates.noWebsite.message) {
    return { error: "No-website template subject and message are required." };
  }

  if (!templates.hasWebsite.subject || !templates.hasWebsite.message) {
    return { error: "Has-website template subject and message are required." };
  }

  return { templates };
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const body = await readJsonBody(req);
    const leadIds = Array.isArray(body.leadIds) ? body.leadIds : [];

    if (!leadIds.length) {
      return sendJson(res, 400, { success: false, error: "Select at least one lead." });
    }

    if (leadIds.length > MAX_PER_REQUEST) {
      return sendJson(res, 400, {
        success: false,
        error: `Maximum ${MAX_PER_REQUEST} leads per send. Select fewer and send in batches.`,
      });
    }

    const normalized = normalizeTemplates(body);
    if (normalized.error) {
      return sendJson(res, 400, { success: false, error: normalized.error });
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

      const template = pickTemplateForLead(lead, normalized.templates);

      const result = await sendLeadOutreachEmail({
        to: lead.email,
        companyName: lead.companyName,
        subject: template.subject,
        message: template.message,
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
          ? `Sent ${sent} email(s) using the matching template per lead${failed ? `, ${failed} failed` : ""}.`
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
