import nodemailer from "nodemailer";
import { personalizeEmailText } from "@/lib/leadEmailTemplates";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOutreachHtml({ companyName, message, senderName }) {
  const safeCompany = escapeHtml(companyName);
  const safeMessage = escapeHtml(personalizeEmailText(message, companyName)).replace(/\n/g, "<br/>");
  const safeSender = escapeHtml(senderName);

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">Hi ${safeCompany},</p>
                <div style="font-size:15px;line-height:1.7;color:#334155;">${safeMessage}</div>
                <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#334155;">Best regards,<br/>${safeSender}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

export async function sendLeadOutreachEmail({ to, companyName, subject, message }) {
  const transporter = getTransporter();
  const from = process.env.GMAIL_USER;

  if (!transporter || !from) {
    return { ok: false, error: "Email is not configured on the server (GMAIL_USER / GMAIL_APP_PASSWORD)." };
  }

  const safeTo = to.trim().slice(0, 320);
  const safeSubject = subject.trim().slice(0, 200);
  const safeMessage = message.trim().slice(0, 10000);
  const senderName = process.env.LEAD_EMAIL_SENDER_NAME?.trim() || "Hamza Choudhary";
  const personalized = personalizeEmailText(safeMessage, companyName);
  const html = buildOutreachHtml({ companyName, message: safeMessage, senderName });

  try {
    await transporter.sendMail({
      from: `"${senderName}" <${from}>`,
      to: safeTo,
      replyTo: from,
      subject: personalizeEmailText(safeSubject, companyName),
      text: `Hi ${companyName},\n\n${personalized}\n\nBest regards,\n${senderName}`,
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error("[lead outreach email]", err);
    return { ok: false, error: err.message || "Could not send email." };
  }
}
