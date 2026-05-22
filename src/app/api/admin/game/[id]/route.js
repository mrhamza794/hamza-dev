import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import GameScore from "@/lib/models/GameScore";
import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";
import { getRankFromScore } from "@/lib/getDeviceInfo";

export async function PATCH(request, { params }) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Score ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { playerName, score, bugsSquashed } = body;

    if (!playerName?.trim()) {
      return NextResponse.json({ success: false, error: "Player name is required" }, { status: 400 });
    }

    const trimmedName = playerName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      return NextResponse.json(
        { success: false, error: "Name must be between 2 and 20 characters" },
        { status: 400 }
      );
    }

    const scoreNum = Number(score);
    if (Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > 200) {
      return NextResponse.json({ success: false, error: "Score must be between 0 and 200" }, { status: 400 });
    }

    const bugsNum = Number(bugsSquashed);
    if (Number.isNaN(bugsNum) || bugsNum < 0) {
      return NextResponse.json({ success: false, error: "Bugs squashed must be 0 or greater" }, { status: 400 });
    }

    await connectDB();

    const updated = await GameScore.findByIdAndUpdate(
      id,
      {
        playerName: trimmedName,
        score: scoreNum,
        bugsSquashed: bugsNum,
        rank: getRankFromScore(scoreNum),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Score not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Score updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update game score error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
