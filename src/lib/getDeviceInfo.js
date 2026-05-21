import { UAParser } from "ua-parser-js";

export function parseUserAgent(userAgentString) {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  return {
    device: {
      type: result.device.type || "desktop",
      brand: result.device.vendor || null,
      model: result.device.model || null,
    },
    browser: {
      name: result.browser.name || null,
      version: result.browser.version || null,
      engine: result.engine.name || null,
    },
    os: {
      name: result.os.name || null,
      version: result.os.version || null,
    },
    isBot: /bot|crawler|spider|crawling/i.test(userAgentString),
  };
}

export function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getRankFromScore(score) {
  if (score <= 5) return "Just Getting Started";
  if (score <= 10) return "Not Bad For a Human";
  if (score <= 15) return "Bug Hunter";
  if (score <= 20) return "Senior Debugger";
  if (score <= 25) return "Legendary Developer";
  return "Bug Terminator";
}
