import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Contact from "@/lib/models/Contact";
import { parseUserAgent } from "@/lib/getDeviceInfo";
import { sendContactEmail } from "@/lib/contactEmail";
import { getClientIp, getUserAgent } from "@/lib/requestMeta";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const userAgent = getUserAgent(request);
    const cleanIp = getClientIp(request);
    const deviceInfo = parseUserAgent(userAgent);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();

    const contact = await Contact.create({
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      ipAddress: cleanIp,
      userAgent,
      device: deviceInfo.device.type,
      browser: deviceInfo.browser.name,
      os: deviceInfo.os.name,
    });

    const emailResult = await sendContactEmail({
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
    });

    if (!emailResult.ok) {
      return NextResponse.json(
        { success: false, error: emailResult.error },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message received! I will get back to you soon.",
        id: contact._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error("Contact GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
