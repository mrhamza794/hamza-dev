import nodemailer from "nodemailer";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildContactEmailHtml({ name, email, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
  const now = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b1020;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;color:#e2e8f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1020;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#111a2f;border:1px solid #26324f;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(120deg,#6d28d9,#06b6d4);padding:20px 24px;">
                <div style="font-size:20px;line-height:1.3;font-weight:700;color:#ffffff;">New Contact Submission</div>
                <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.9);">Sent from your portfolio contact form</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:12px 14px;border:1px solid #24304a;border-radius:12px;background:#0f172a;">
                      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#93c5fd;">Name</div>
                      <div style="margin-top:6px;font-size:15px;color:#f8fafc;">${safeName}</div>
                    </td>
                  </tr>
                  <tr><td style="height:10px;"></td></tr>
                  <tr>
                    <td style="padding:12px 14px;border:1px solid #24304a;border-radius:12px;background:#0f172a;">
                      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#93c5fd;">Email</div>
                      <div style="margin-top:6px;font-size:15px;color:#f8fafc;">${safeEmail}</div>
                    </td>
                  </tr>
                  <tr><td style="height:10px;"></td></tr>
                  <tr>
                    <td style="padding:12px 14px;border:1px solid #24304a;border-radius:12px;background:#0f172a;">
                      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#93c5fd;">Message</div>
                      <div style="margin-top:8px;font-size:15px;line-height:1.7;color:#e2e8f0;">${safeMessage}</div>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:20px;">
                  <a href="mailto:${safeEmail}" style="display:inline-block;background:#06b6d4;color:#082f49;text-decoration:none;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;">Reply to sender</a>
                </div>

                <div style="margin-top:20px;font-size:12px;color:#94a3b8;">
                  Received ${escapeHtml(now)}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendContactEmail({ name, email, message }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.CONTACT_TO_EMAIL?.trim() || user;

  if (!user || !pass || !to) {
    return { ok: false, error: "Email is not configured on the server." };
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
  const emailHtml = buildContactEmailHtml({
    name: safeName,
    email: safeEmail,
    message: safeMessage,
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio contact" <${user}>`,
      to,
      replyTo: safeEmail,
      subject: `[Portfolio] Message from ${safeName}`,
      text: `From: ${safeName} <${safeEmail}>\n\n${safeMessage}`,
      html: emailHtml,
    });
    return { ok: true };
  } catch (err) {
    console.error("[contact email]", err);
    return { ok: false, error: "Could not send email. Try again later." };
  }
}
