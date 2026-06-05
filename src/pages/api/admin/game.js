import connectDB from "@/lib/mongodb";
import GameScore from "@/lib/models/GameScore";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  if (!(await requireAdmin(req, res))) return;

  try {
    await connectDB();

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = 20;
    const skip = (page - 1) * limit;

    const [
      allScores,
      total,
      aggregation,
      rankDistribution,
      deviceDistribution,
      countryDistribution,
      scoreDistribution,
      dailyPlays,
      topPlayers,
    ] = await Promise.all([
      GameScore.find({})
        .sort({ score: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GameScore.countDocuments(),
      GameScore.aggregate([
        {
          $group: {
            _id: null,
            avgScore: { $avg: "$score" },
            maxScore: { $max: "$score" },
            minScore: { $min: "$score" },
            totalBugs: { $sum: "$bugsSquashed" },
          },
        },
      ]),
      GameScore.aggregate([
        { $group: { _id: "$rank", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      GameScore.aggregate([
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      GameScore.aggregate([
        { $match: { "location.country": { $ne: null } } },
        { $group: { _id: "$location.country", count: { $sum: 1 }, avgScore: { $avg: "$score" } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      GameScore.aggregate([
        {
          $bucket: {
            groupBy: "$score",
            boundaries: [0, 5, 10, 15, 20, 25, 50],
            default: "50+",
            output: { count: { $sum: 1 } },
          },
        },
      ]),
      GameScore.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            plays: { $sum: 1 },
            avgScore: { $avg: "$score" },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
      GameScore.find({})
        .sort({ score: -1 })
        .limit(10)
        .select("playerName score bugsSquashed rank location device createdAt")
        .lean(),
    ]);

    const stats = aggregation[0] || {};

    return sendJson(res, 200, {
      success: true,
      data: {
        scores: allScores,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalGames: total,
          avgScore: Math.round(stats.avgScore || 0),
          maxScore: stats.maxScore || 0,
          minScore: stats.minScore || 0,
          totalBugsSquashed: stats.totalBugs || 0,
        },
        charts: {
          rankDistribution,
          deviceDistribution,
          countryDistribution,
          scoreDistribution: scoreDistribution.map((b) => ({
            range: b._id === "50+" ? "50+" : `${b._id}-${b._id + 4}`,
            count: b.count,
          })),
          dailyPlays: dailyPlays.reverse(),
        },
        topPlayers,
      },
    });
  } catch (error) {
    console.error("Game admin error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}
