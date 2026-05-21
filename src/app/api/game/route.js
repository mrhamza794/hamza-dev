import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import GameScore from "@/lib/models/GameScore";
import { parseUserAgent, getRankFromScore } from "@/lib/getDeviceInfo";
import { getClientIp, getUserAgent, lookupIpLocation } from "@/lib/requestMeta";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { playerName, score, bugsSquashed, timeSpent } = body;

    if (!playerName || score === undefined || score === null) {
      return NextResponse.json(
        { success: false, error: "Player name and score are required" },
        { status: 400 }
      );
    }

    if (playerName.trim().length < 2 || playerName.trim().length > 20) {
      return NextResponse.json(
        { success: false, error: "Name must be between 2 and 20 characters" },
        { status: 400 }
      );
    }

    if (score < 0 || score > 200) {
      return NextResponse.json(
        { success: false, error: "Invalid score" },
        { status: 400 }
      );
    }

    const userAgent = getUserAgent(request);
    const cleanIp = getClientIp(request);
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

    return NextResponse.json(
      {
        success: true,
        data: {
          id: gameScore._id,
          playerName: gameScore.playerName,
          score: gameScore.score,
          rank: gameScore.rank,
          rankPosition,
          location: gameScore.location,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Game Score API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);

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

    return NextResponse.json({
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
        },
      },
    });
  } catch (error) {
    console.error("Leaderboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
