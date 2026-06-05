import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";
import { getSiteSettings } from "@/lib/siteSettings";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "PATCH") return methodNotAllowed(res, ["PATCH"]);

  try {
    const settings = await getSiteSettings();

    if (settings.siteMaintenance || !settings.analyticsEnabled) {
      return sendJson(res, 200, { success: true, message: "Tracking disabled" });
    }

    await connectDB();

    const body = await readJsonBody(req);
    const { sessionId, behavior } = body;

    if (!sessionId) {
      return sendJson(res, 400, { success: false, error: "Session ID required" });
    }

    const updateQuery = { $set: { lastActive: new Date() } };

    if (behavior) {
      if (behavior.timeOnSite !== undefined) {
        updateQuery.$set["behavior.timeOnSite"] = behavior.timeOnSite;
      }
      if (behavior.scrollDepth !== undefined) {
        updateQuery.$set["behavior.scrollDepth"] = behavior.scrollDepth;
      }
      if (behavior.clickedContact !== undefined) {
        updateQuery.$set["behavior.clickedContact"] = behavior.clickedContact;
      }
      if (behavior.playedGame !== undefined) {
        updateQuery.$set["behavior.playedGame"] = behavior.playedGame;
      }
      if (behavior.downloadedResume !== undefined) {
        updateQuery.$set["behavior.downloadedResume"] = behavior.downloadedResume;
      }
      if (behavior.sectionsVisited?.length) {
        updateQuery.$addToSet = {
          "behavior.sectionsVisited": { $each: behavior.sectionsVisited },
        };
      }
    }

    await Visitor.findOneAndUpdate({ sessionId }, updateQuery);

    return sendJson(res, 200, { success: true });
  } catch (error) {
    console.error("Visitor behavior PATCH Error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}
