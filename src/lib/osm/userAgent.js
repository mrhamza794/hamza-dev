export function getOsmUserAgent() {
  const email =
    process.env.ADMIN_GOOGLE_EMAIL ||
    process.env.GMAIL_USER ||
    process.env.CONTACT_TO_EMAIL ||
    "admin@example.com";
  return `HC-Portfolio-Admin/1.0 (${email})`;
}
