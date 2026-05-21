export function getClientIp(request) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0";
  return ip.split(",")[0].trim();
}

export function getUserAgent(request) {
  return request.headers.get("user-agent") || "";
}

export async function lookupIpLocation(ip) {
  const location = { country: null, city: null, region: null };

  try {
    const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      if (geoData.status === "success") {
        return {
          country: geoData.country || null,
          city: geoData.city || null,
          region: geoData.regionName || null,
        };
      }
    }
  } catch {
    console.log("Geo lookup failed, continuing without location");
  }

  return location;
}

export async function lookupIpLocationFull(ip) {
  try {
    const geoResponse = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org`
    );
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      if (geoData.status === "success") {
        return {
          country: geoData.country || null,
          countryCode: geoData.countryCode || null,
          city: geoData.city || null,
          region: geoData.regionName || null,
          regionCode: geoData.region || null,
          latitude: geoData.lat || null,
          longitude: geoData.lon || null,
          timezone: geoData.timezone || null,
          isp: geoData.isp || null,
          org: geoData.org || null,
        };
      }
    }
  } catch {
    console.log("Geo lookup failed");
  }

  return {};
}
