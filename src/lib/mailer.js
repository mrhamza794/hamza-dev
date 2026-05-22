import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail(otp, toEmail) {
  if (!toEmail) {
    throw new Error("Admin email is not configured in the database");
  }

  const mailOptions = {
    from: `"HC Portfolio Admin" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "🔐 Admin Login OTP - HC Portfolio",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #0f172a; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b, #0f172a); border-radius: 20px; padding: 40px; border: 1px solid rgba(139,92,246,0.3); }
          .logo { text-align: center; font-size: 48px; margin-bottom: 8px; }
          .title { text-align: center; color: #f8fafc; font-size: 24px; font-weight: bold; margin-bottom: 4px; }
          .subtitle { text-align: center; color: #94a3b8; font-size: 14px; margin-bottom: 32px; }
          .otp-box { background: rgba(139,92,246,0.15); border: 2px solid rgba(139,92,246,0.5); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px; }
          .otp-label { color: #94a3b8; font-size: 13px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px; }
          .otp-code { color: #a78bfa; font-size: 48px; font-weight: bold; letter-spacing: 12px; font-family: monospace; }
          .expiry { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 24px; }
          .warning { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 16px; color: #fca5a5; font-size: 13px; text-align: center; }
          .footer { text-align: center; color: #475569; font-size: 12px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🔐</div>
          <div class="title">Admin Login</div>
          <div class="subtitle">HC Portfolio Dashboard</div>
          
          <div class="otp-box">
            <div class="otp-label">Your One-Time Password</div>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="expiry">⏱️ This OTP expires in <strong style="color:#a78bfa">10 minutes</strong></div>
          
          <div class="warning">
            ⚠️ Never share this OTP with anyone. If you didn't request this, ignore this email.
          </div>
          
          <div class="footer">
            HC Portfolio Admin Panel • ${new Date().toLocaleString()}
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendLoginNotification(ipAddress, device, toEmail) {
  if (!toEmail) return;

  const mailOptions = {
    from: `"HC Portfolio Admin" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "✅ Successful Admin Login - HC Portfolio",
    html: `
      <div style="font-family:sans-serif;background:#0f172a;padding:20px;border-radius:12px;color:#f8fafc;max-width:400px">
        <h2 style="color:#a78bfa">✅ Login Successful</h2>
        <p style="color:#94a3b8">Someone logged into your admin panel.</p>
        <p><strong>IP:</strong> ${ipAddress}</p>
        <p><strong>Device:</strong> ${device}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p style="color:#ef4444;font-size:13px">If this wasn't you, change your password immediately.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
}
