import nodemailer from "nodemailer";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body ?? {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.CONTACT_TO_EMAIL?.trim() || user;

  if (!user || !pass || !to) {
    return res.status(500).json({ error: "Email is not configured on the server." });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  const safeName = name.trim().slice(0, 200);
  const safeEmail = email.trim().slice(0, 320);
  const safeMessage = message.trim().slice(0, 10000);

  try {
    await transporter.sendMail({
      from: `"Portfolio contact" <${user}>`,
      to,
      replyTo: safeEmail,
      subject: `[Portfolio] Message from ${safeName}`,
      text: `From: ${safeName} <${safeEmail}>\n\n${safeMessage}`,
      html: `<p><strong>From:</strong> ${escapeHtml(safeName)} &lt;${escapeHtml(safeEmail)}&gt;</p><p>${escapeHtml(safeMessage).replace(/\n/g, "<br/>")}</p>`,
    });
  } catch (err) {
    console.error("[contact]", err);
    return res.status(502).json({ error: "Could not send email. Try again later." });
  }

  return res.status(200).json({ ok: true });
}
