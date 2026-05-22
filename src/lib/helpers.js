import { parseUserAgent as parseUA } from "@/lib/getDeviceInfo";

import { getClientIp } from "@/lib/requestMeta";

export function getIpFromRequest(request) {
  return getClientIp(request);
}

export function parseUserAgent(userAgentString) {
  return parseUA(userAgentString);
}
