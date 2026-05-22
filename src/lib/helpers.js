import { parseUserAgent as parseUA } from "@/lib/getDeviceInfo";

export function getIpFromRequest(request) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0";
  return ip.split(",")[0].trim();
}

export function parseUserAgent(userAgentString) {
  return parseUA(userAgentString);
}
