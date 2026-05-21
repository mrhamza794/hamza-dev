import GameScore from "@/lib/models/GameScore";

export async function getPersonalBest(playerName) {
  const trimmed = playerName?.trim();
  if (!trimmed) return null;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const best = await GameScore.findOne({
    playerName: { $regex: new RegExp(`^${escaped}$`, "i") },
  })
    .sort({ score: -1 })
    .select("score")
    .lean();

  return best?.score ?? null;
}
