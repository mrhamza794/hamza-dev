import { parse, serialize } from "cookie";

export function getHeader(req, name) {
  if (!req?.headers) return "";
  if (typeof req.headers.get === "function") {
    return req.headers.get(name) || "";
  }
  const key = name.toLowerCase();
  const value = req.headers[key] ?? req.headers[name];
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export function getClientIp(req) {
  const ip =
    getHeader(req, "x-forwarded-for") ||
    getHeader(req, "x-real-ip") ||
    req.socket?.remoteAddress ||
    "0.0.0.0";
  return String(ip).split(",")[0].trim();
}

export function getUserAgent(req) {
  return getHeader(req, "user-agent");
}

export function getCookie(req, name) {
  const raw = getHeader(req, "cookie");
  if (!raw) return undefined;
  return parse(raw)[name];
}

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

export function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

export function methodNotAllowed(res, allowed = []) {
  res.setHeader("Allow", allowed.join(", "));
  return sendJson(res, 405, { success: false, error: "Method not allowed" });
}

export function setResponseCookies(res, cookies = []) {
  if (cookies.length) {
    res.setHeader("Set-Cookie", cookies);
  }
}

export function serializeCookie(name, value, options) {
  return serialize(name, value, options);
}
