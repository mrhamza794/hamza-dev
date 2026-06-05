import connectDB from "@/lib/mongodb";
import GameScore from "@/lib/models/GameScore";
import { getSiteSettings } from "@/lib/siteSettings";
import { parseUserAgent, getRankFromScore } from "@/lib/getDeviceInfo";
import { getClientIp, getUserAgent, lookupIpLocation } from "@/lib/requestMeta";
import { getPersonalBest } from "@/lib/gameScores";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

async function handlePost(req, res) {
  try {
    const settings = await getSiteSettings();
    if (settings.siteMaintenance) {
      return sendJson(res, 503, { success: false, error: "Site is under maintenance." });
    }

    await connectDB();

    const body = await readJsonBody(req);
    const { playerName, score, bugsSquashed, timeSpent } = body;

    if (!playerName || score === undefined || score === null) {
      return sendJson(res, 400, {
        success: false,
        error: "Player name and score are required",
      });
    }

    if (playerName.trim().length < 2 || playerName.trim().length > 20) {
      return sendJson(res, 400, {
        success: false,
        error: "Name must be between 2 and 20 characters",
      });
    }

    if (score < 0 || score > 200) {
      return sendJson(res, 400, { success: false, error: "Invalid score" });
    }

    const userAgent = getUserAgent(req);
    const cleanIp = getClientIp(req);
    const deviceInfo = parseUserAgent(userAgent);
    const rank = getRankFromScore(score);
    const location = await lookupIpLocation(cleanIp);

    const gameScore = await GameScore.create({
      playerName: playerName.trim(),
      score,
      bugsSquashed: bugsSquashed ?? score,
      timeSpent: timeSpent ?? 30,
      rank,
      device: deviceInfo.device.type,
      browser: deviceInfo.browser.name,
      os: deviceInfo.os.name,
      ipAddress: cleanIp,
      location,
    });

    const rankPosition = (await GameScore.countDocuments({ score: { $gt: score } })) + 1;
    const personalBest = await getPersonalBest(gameScore.playerName);

    return sendJson(res, 201, {
      success: true,
      data: {
        id: gameScore._id,
        playerName: gameScore.playerName,
        score: gameScore.score,
        rank: gameScore.rank,
        rankPosition,
        location: gameScore.location,
        personalBest,
      },
    });
  } catch (error) {
    console.error("Game Score API Error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}

async function handleGet(req, res) {
  try {
    const settings = await getSiteSettings();
    if (settings.siteMaintenance) {
      return sendJson(res, 503, { success: false, error: "Site is under maintenance." });
    }

    await connectDB();

    const limit = parseInt(req.query.limit ?? "10", 10);
    const playerName = req.query.playerName;

    const leaderboard = await GameScore.find({})
      .sort({ score: -1, playedAt: 1 })
      .limit(limit)
      .select("playerName score rank playedAt location device")
      .lean();

    const totalPlayers = await GameScore.countDocuments();
    const highestScore = leaderboard[0]?.score ?? 0;
    const averageScore = await GameScore.aggregate([
      { $group: { _id: null, avg: { $avg: "$score" } } },
    ]);

    const personalBest = playerName ? await getPersonalBest(playerName) : null;

    return sendJson(res, 200, {
      success: true,
      data: {
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          playerName: entry.playerName,
          score: entry.score,
          badge: entry.rank,
          location: entry.location?.country || "Unknown",
          device: entry.device || "Unknown",
          playedAt: entry.playedAt,
        })),
        stats: {
          totalPlayers,
          highestScore,
          averageScore: Math.round(averageScore[0]?.avg ?? 0),
          ...(personalBest !== null && { personalBest }),
        },
      },
    });
  } catch (error) {
    console.error("Leaderboard API Error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") return handlePost(req, res);
  if (req.method === "GET") return handleGet(req, res);
  return methodNotAllowed(res, ["POST", "GET"]);
}
