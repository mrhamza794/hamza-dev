import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Visitor from "@/lib/models/Visitor";
import { AdminSettings } from "@/lib/models/AdminSession";
import { verifyToken, COOKIE_NAME } from "@/lib/adminAuth";

export async function GET(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const settings = await AdminSettings.find({}).lean();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      data: {
        siteMaintenance: settingsMap.siteMaintenance || false,
        maintenanceMessage: settingsMap.maintenanceMessage || "Site under maintenance. Coming back soon!",
        allowNewContacts: settingsMap.allowNewContacts !== false,
        allowGameScores: settingsMap.allowGameScores !== false,
        analyticsEnabled: settingsMap.analyticsEnabled !== false,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      await AdminSettings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
    }

    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target");

    if (target === "visitors") {
      const result = await Visitor.deleteMany({});
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} visitor records`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid target" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
