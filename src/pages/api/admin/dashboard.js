import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";
import Contact from "@/lib/models/Contact";
import GameScore from "@/lib/models/GameScore";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  if (!(await requireAdmin(req, res))) return;

  try {
    await connectDB();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalVisitors,
      todayVisitors,
      weekVisitors,
      monthVisitors,
      lastMonthVisitors,
      totalContacts,
      newContacts,
      totalGamePlays,
      topScore,
      recentVisitors,
      recentContacts,
      dailyVisitors,
      topCountries,
      deviceBreakdown,
      contactsPlayed,
      contactsClicked,
    ] = await Promise.all([
      Visitor.countDocuments({ isBot: false }),
      Visitor.countDocuments({ isBot: false, visitedAt: { $gte: today } }),
      Visitor.countDocuments({ isBot: false, visitedAt: { $gte: thisWeek } }),
      Visitor.countDocuments({ isBot: false, visitedAt: { $gte: thisMonth } }),
      Visitor.countDocuments({ isBot: false, visitedAt: { $gte: lastMonth, $lt: thisMonth } }),
      Contact.countDocuments(),
      Contact.countDocuments({ createdAt: { $gte: thisWeek } }),
      GameScore.countDocuments(),
      GameScore.findOne().sort({ score: -1 }).select("playerName score").lean(),
      Visitor.find({ isBot: false })
        .sort({ visitedAt: -1 })
        .limit(5)
        .select("location browser os visitedAt behavior")
        .lean(),
      Contact.find().sort({ createdAt: -1 }).limit(5).select("name email createdAt").lean(),
      Visitor.aggregate([
        { $match: { isBot: false, visitedAt: { $gte: thisWeek } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Visitor.aggregate([
        { $match: { isBot: false, "location.country": { $ne: null } } },
        { $group: { _id: "$location.country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Visitor.aggregate([
        { $match: { isBot: false } },
        { $group: { _id: "$device.type", count: { $sum: 1 } } },
      ]),
      Visitor.countDocuments({ "behavior.playedGame": true }),
      Visitor.countDocuments({ "behavior.clickedContact": true }),
    ]);

    const visitorGrowth =
      lastMonthVisitors > 0
        ? Math.round(((monthVisitors - lastMonthVisitors) / lastMonthVisitors) * 100)
        : 100;

    return sendJson(res, 200, {
      success: true,
      data: {
        stats: {
          totalVisitors,
          todayVisitors,
          weekVisitors,
          monthVisitors,
          visitorGrowth,
          totalContacts,
          newContacts,
          totalGamePlays,
          topScore,
          contactsPlayed,
          contactsClicked,
        },
        recentVisitors,
        recentContacts,
        charts: {
          dailyVisitors,
          topCountries,
          deviceBreakdown,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}
