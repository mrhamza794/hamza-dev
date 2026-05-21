import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";
import { parseUserAgent } from "@/lib/getDeviceInfo";
import { getClientIp, getUserAgent, lookupIpLocationFull } from "@/lib/requestMeta";

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

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
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
      return NextResponse.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    const userAgent = getUserAgent(request);
    const cleanIp = getClientIp(request);
    const deviceInfo = parseUserAgent(userAgent);

    if (deviceInfo.isBot) {
      return NextResponse.json({ success: true, message: "Bot detected, skipped" });
    }

    const existingVisitor = await Visitor.findOne({ sessionId });

    if (existingVisitor) {
      const update = buildBehaviorUpdate(behavior) ?? { $set: { lastActive: new Date() } };
      if (!update.$set) update.$set = {};
      update.$set.lastActive = new Date();

      await Visitor.findOneAndUpdate({ sessionId }, update, { new: true });

      return NextResponse.json({ success: true, message: "Visitor updated" });
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

    return NextResponse.json(
      { success: true, message: "Visitor tracked successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Visitor Tracking Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const visitors = await Visitor.find({ isBot: false })
      .sort({ visitedAt: -1 })
      .lean();

    const totalVisitors = await Visitor.countDocuments({ isBot: false });

    const deviceBreakdown = await Visitor.aggregate([
      { $match: { isBot: false } },
      { $group: { _id: "$device.type", count: { $sum: 1 } } },
    ]);

    const countryBreakdown = await Visitor.aggregate([
      { $match: { isBot: false, "location.country": { $ne: null } } },
      { $group: { _id: "$location.country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const browserBreakdown = await Visitor.aggregate([
      { $match: { isBot: false } },
      { $group: { _id: "$browser.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const dailyVisitors = await Visitor.aggregate([
      { $match: { isBot: false } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        visitors,
        analytics: {
          totalVisitors,
          deviceBreakdown,
          countryBreakdown,
          browserBreakdown,
          dailyVisitors,
        },
      },
    });
  } catch (error) {
    console.error("Visitor GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
