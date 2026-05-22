import connectDB from "@/lib/mongodb";
import GameScore from "@/lib/models/GameScore";
import { getRankFromScore } from "@/lib/getDeviceInfo";
import { requireAdmin } from "@/lib/requireAdmin";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

export default async function handler(req, res) {
  if (req.method !== "PATCH") return methodNotAllowed(res, ["PATCH"]);
  if (!requireAdmin(req, res)) return;

  try {
    const id = req.query.id;
    if (!id) {
      return sendJson(res, 400, { success: false, error: "Score ID is required" });
    }

    const body = await readJsonBody(req);
    const { playerName, score, bugsSquashed } = body;

    if (!playerName?.trim()) {
      return sendJson(res, 400, { success: false, error: "Player name is required" });
    }

    const trimmedName = playerName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      return sendJson(res, 400, {
        success: false,
        error: "Name must be between 2 and 20 characters",
      });
    }

    const scoreNum = Number(score);
    if (Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > 200) {
      return sendJson(res, 400, { success: false, error: "Score must be between 0 and 200" });
    }

    const bugsNum = Number(bugsSquashed);
    if (Number.isNaN(bugsNum) || bugsNum < 0) {
      return sendJson(res, 400, { success: false, error: "Bugs squashed must be 0 or greater" });
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
      return sendJson(res, 404, { success: false, error: "Score not found" });
    }

    return sendJson(res, 200, {
      success: true,
      message: "Score updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update game score error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}
