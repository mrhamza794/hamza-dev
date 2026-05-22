import connectDB from "@/lib/mongodb";
import Contact from "@/lib/models/Contact";
import { parseUserAgent } from "@/lib/getDeviceInfo";
import { sendContactEmail } from "@/lib/contactEmail";
import { getClientIp, getUserAgent } from "@/lib/requestMeta";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

async function handlePost(req, res) {
  try {
    await connectDB();

    const body = await readJsonBody(req);
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return sendJson(res, 400, { success: false, error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendJson(res, 400, { success: false, error: "Invalid email address" });
    }

    const userAgent = getUserAgent(req);
    const cleanIp = getClientIp(req);
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
      return sendJson(res, 502, { success: false, error: emailResult.error });
    }

    return sendJson(res, 201, {
      success: true,
      message: "Message received! I will get back to you soon.",
      id: contact._id,
    });
  } catch (error) {
    console.error("Contact API Error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}

async function handleGet(req, res) {
  try {
    await connectDB();

    const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean();

    return sendJson(res, 200, { success: true, data: contacts });
  } catch (error) {
    console.error("Contact GET Error:", error);
    return sendJson(res, 500, { success: false, error: "Internal server error" });
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") return handlePost(req, res);
  if (req.method === "GET") return handleGet(req, res);
  return methodNotAllowed(res, ["POST", "GET"]);
}
