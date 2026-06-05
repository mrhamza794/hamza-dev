import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";
import { getSiteSettings } from "@/lib/siteSettings";
import { parseUserAgent } from "@/lib/getDeviceInfo";
import { getClientIp, getUserAgent, lookupIpLocationFull } from "@/lib/requestMeta";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

function buildBehaviorUpdate(behavior) {
  if (!behavior) return null;

  const update = { $set: { lastActive: new Date() } };

  if (behavior.timeOnSite !== undefined) {
    update.$set["behavior.timeOnSite"] = behavior.timeOnSite;
  }
  if (behavior.scrollDepth !== undefined) {
    update.$set["behavior.scrollDepth"] = behavior.scrollDepth;
  }
  if (behavior.clickedContact) {
    update.$set["behavior.clickedContact"] = true;
  }
  if (behavior.playedGame) {
    update.$set["behavior.playedGame"] = true;
  }
  if (behavior.downloadedResume) {
    update.$set["behavior.downloadedResume"] = true;
  }
  if (behavior.sectionsVisited?.length) {
    update.$addToSet = {
      "behavior.sectionsVisited": { $each: behavior.sectionsVisited },
    };
  }

  return update;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const settings = await getSiteSettings();

    if (settings.siteMaintenance || !settings.analyticsEnabled) {
      return sendJson(res, 200, { success: true, message: "Tracking disabled" });
    }

    await connectDB();

    const body = await readJsonBody(req);
    const {
      sessionId,
      screen,
      language,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      connectionType,
      behavior,
    } = body;

    if (!sessionId) {
      return sendJson(res, 400, { success: false, error: "Session ID required" });
    }

    const userAgent = getUserAgent(req);
    const cleanIp = getClientIp(req);
    const deviceInfo = parseUserAgent(userAgent);

    if (deviceInfo.isBot) {
      return sendJson(res, 200, { success: true, message: "Bot detected, skipped" });
    }

    const existingVisitor = await Visitor.findOne({ sessionId });

    if (existingVisitor) {
      const update = buildBehaviorUpdate(behavior) ?? { $set: { lastActive: new Date() } };
      if (!update.$set) update.$set = {};
      update.$set.lastActive = new Date();

      await Visitor.findOneAndUpdate({ sessionId }, update, { new: true });

      return sendJson(res, 200, { success: true, message: "Visitor updated" });
    }

    const locationData = await lookupIpLocationFull(cleanIp);

    await Visitor.create({
      sessionId,
      ipAddress: cleanIp,
      location: locationData,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      source: {
        referrer: referrer ?? null,
        utm_source: utm_source ?? null,
        utm_medium: utm_medium ?? null,
        utm_campaign: utm_campaign ?? null,
      },
      screen: screen ?? {},
      behavior: behavior ?? {},
      userAgent,
      language: language ?? null,
      isBot: deviceInfo.isBot,
      connectionType: connectionType ?? null,
    });

    return sendJson(res, 201, {
      success: true,
      message: "Visitor tracked successfully",
    });
  } catch (error) {
    console.error("Visitor Tracking Error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}
