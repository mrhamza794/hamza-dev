import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";

export async function PATCH(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { sessionId, behavior } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    const updateQuery = { $set: { lastActive: new Date() } };

    if (behavior) {
      if (behavior.timeOnSite !== undefined) {
        updateQuery.$set["behavior.timeOnSite"] = behavior.timeOnSite;
      }
      if (behavior.scrollDepth !== undefined) {
        updateQuery.$set["behavior.scrollDepth"] = behavior.scrollDepth;
      }
      if (behavior.clickedContact !== undefined) {
        updateQuery.$set["behavior.clickedContact"] = behavior.clickedContact;
      }
      if (behavior.playedGame !== undefined) {
        updateQuery.$set["behavior.playedGame"] = behavior.playedGame;
      }
      if (behavior.downloadedResume !== undefined) {
        updateQuery.$set["behavior.downloadedResume"] = behavior.downloadedResume;
      }
      if (behavior.sectionsVisited?.length) {
        updateQuery.$addToSet = {
          "behavior.sectionsVisited": { $each: behavior.sectionsVisited },
        };
      }
    }

    await Visitor.findOneAndUpdate({ sessionId }, updateQuery);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visitor behavior PATCH Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
