import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  if (!requireAdmin(req, res)) return;

  try {
    await connectDB();

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;
    const device = req.query.device || "";
    const country = req.query.country || "";
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;

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

    return sendJson(res, 200, {
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
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}
