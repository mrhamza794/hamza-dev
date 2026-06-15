import { formatOsmTagLabel } from "@/lib/osm/businessTypes";

function getCoords(element) {
  if (element.type === "node") {
    return { lat: element.lat, lon: element.lon };
  }
  if (element.center) {
    return { lat: element.center.lat, lon: element.center.lon };
  }
  return { lat: null, lon: null };
}

function buildAddress(tags = {}) {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:place"],
  ].filter(Boolean);
  return parts.join(", ") || tags["addr:full"] || null;
}

function inferCategoryFromTags(tags = {}) {
  if (tags.craft) {
    return { id: tags.craft, label: formatOsmTagLabel(tags.craft) };
  }
  if (tags.service) {
    return { id: tags.service, label: formatOsmTagLabel(tags.service) };
  }
  if (tags.amenity) {
    return { id: tags.amenity, label: formatOsmTagLabel(tags.amenity) };
  }
  if (tags.shop) {
    return { id: tags.shop, label: formatOsmTagLabel(tags.shop) };
  }
  if (tags.office) {
    return { id: tags.office, label: formatOsmTagLabel(tags.office) };
  }
  if (tags.tourism) {
    return { id: tags.tourism, label: formatOsmTagLabel(tags.tourism) };
  }
  if (tags.leisure) {
    return { id: tags.leisure, label: formatOsmTagLabel(tags.leisure) };
  }
  if (tags.healthcare) {
    return { id: tags.healthcare, label: formatOsmTagLabel(tags.healthcare) };
  }
  if (tags.industrial) {
    return { id: tags.industrial, label: formatOsmTagLabel(tags.industrial) };
  }
  if (tags.company) {
    return { id: "company", label: tags.company || "Company" };
  }
  if (tags.landuse) {
    return { id: tags.landuse, label: formatOsmTagLabel(tags.landuse) };
  }
  if (tags.building) {
    return { id: tags.building, label: formatOsmTagLabel(tags.building) };
  }
  return { id: null, label: null };
}

export function normalizeOsmElement(element, meta = {}) {
  const tags = element.tags || {};
  const inferred = inferCategoryFromTags(tags);
  const { lat, lon } = getCoords(element);
  const website = tags.website || tags["contact:website"] || null;
  const phone = tags.phone || tags["contact:phone"] || tags["contact:mobile"] || null;
  const email =
    tags.email ||
    tags["contact:email"] ||
    tags["addr:email"] ||
    null;

  return {
    osmType: element.type,
    osmId: element.id,
    companyName: tags.name || tags.brand || "Unnamed",
    city: tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || meta.city || null,
    address: buildAddress(tags),
    postalCode: tags["addr:postcode"] || null,
    description: tags.description || meta.categoryLabel || null,
    phone,
    website,
    email,
    category: meta.businessTypeId === "all" ? inferred.id : meta.businessTypeId || inferred.id,
    categoryLabel:
      meta.businessTypeId === "all"
        ? inferred.label
        : meta.categoryLabel || inferred.label,
    country: meta.country || tags["addr:country"] || null,
    countryCode: meta.countryCode || null,
    region: meta.region || tags["addr:state"] || null,
    latitude: lat,
    longitude: lon,
    leadType: website ? "has_website" : "no_website",
  };
}

export function filterPois(pois) {
  return pois.filter((poi) => {
    if (!poi.email?.trim()) return false;
    if (!poi.companyName || poi.companyName === "Unnamed") return false;
    return true;
  });
}

export function sortPois(pois, sortBy = "name", sortDir = "asc") {
  const dir = sortDir === "desc" ? -1 : 1;
  return [...pois].sort((a, b) => {
    let av = a[sortBy === "name" ? "companyName" : sortBy] || "";
    let bv = b[sortBy === "name" ? "companyName" : sortBy] || "";
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

export function paginatePois(pois, page = 1, limit = 50) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);
  const start = (safePage - 1) * safeLimit;
  return {
    items: pois.slice(start, start + safeLimit),
    total: pois.length,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(pois.length / safeLimit) || 1,
  };
}
