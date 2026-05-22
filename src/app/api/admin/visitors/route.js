import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";
import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";

export async function GET(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;
    const device = searchParams.get("device") || "";
    const country = searchParams.get("country") || "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const filter = { isBot: false };
    if (device) filter["device.type"] = device;
    if (country) filter["location.country"] = country;
    if (dateFrom || dateTo) {
      filter.visitedAt = {};
      if (dateFrom) filter.visitedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.visitedAt.$lte = new Date(dateTo);
    }

    const [visitors, total, analytics] = await Promise.all([
      Visitor.find(filter).sort({ visitedAt: -1 }).skip(skip).limit(limit).lean(),

      Visitor.countDocuments(filter),

      Promise.all([
        Visitor.aggregate([
          { $match: { isBot: false } },
          { $group: { _id: "$device.type", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Visitor.aggregate([
          { $match: { isBot: false, "location.country": { $ne: null } } },
          {
            $group: {
              _id: "$location.country",
              countryCode: { $first: "$location.countryCode" },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 15 },
        ]),
        Visitor.aggregate([
          { $match: { isBot: false } },
          { $group: { _id: "$browser.name", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
        Visitor.aggregate([
          { $match: { isBot: false } },
          { $group: { _id: "$os.name", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Visitor.aggregate([
          { $match: { isBot: false } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 30 },
        ]),
        Visitor.aggregate([
          { $match: { isBot: false } },
          {
            $group: {
              _id: null,
              avgTime: { $avg: "$behavior.timeOnSite" },
              avgScroll: { $avg: "$behavior.scrollDepth" },
              avgClicks: { $avg: "$behavior.totalClicks" },
              playedGame: { $sum: { $cond: ["$behavior.playedGame", 1, 0] } },
              clickedContact: { $sum: { $cond: ["$behavior.clickedContact", 1, 0] } },
            },
          },
        ]),
        Visitor.aggregate([
          { $match: { isBot: false } },
          { $group: { _id: "$source.referrer", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]),
    ]);

    const [devices, countries, browsers, operatingSystems, daily, behavior, referrers] = analytics;

    return NextResponse.json({
      success: true,
      data: {
        visitors,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        analytics: {
          devices,
          countries,
          browsers,
          operatingSystems,
          daily: daily.reverse(),
          behavior: behavior[0] || {},
          referrers,
        },
      },
    });
  } catch (error) {
    console.error("Visitors admin error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
