import connectDB from "@/lib/mongodb";
import OsmLead from "@/lib/models/OsmLead";
import { requireAdmin } from "@/lib/requireAdmin";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";
import { buildLeadListFilter } from "@/lib/osm/leadFilters";

function buildListFilter(query) {
  return buildLeadListFilter(query);
}

function normalizeEmailKey(email) {
  return email?.trim().toLowerCase() || null;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findExistingLead(lead, emailKey) {
  return OsmLead.findOne({
    $or: [
      { osmType: lead.osmType, osmId: lead.osmId },
      { emailKey },
      { email: { $regex: new RegExp(`^${escapeRegex(emailKey)}$`, "i") } },
    ],
  })
    .select("_id")
    .lean();
}

async function handleGet(req, res) {
  await connectDB();

  if (!global._osmLeadStatusMigrated) {
    await OsmLead.updateMany({ status: "contacted" }, { $set: { status: "emailed" } });
    global._osmLeadStatusMigrated = true;
  }

  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 100);
  const sortBy = req.query.sortBy === "city" ? "city" : req.query.sortBy === "createdAt" ? "createdAt" : "companyName";
  const sortDir = req.query.sortDir === "desc" ? -1 : 1;
  const filter = buildListFilter(req.query);

  const [items, total] = await Promise.all([
    OsmLead.find(filter)
      .sort({ [sortBy]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    OsmLead.countDocuments(filter),
  ]);

  const normalizedItems = items.map((lead) => ({
    ...lead,
    status: lead.status === "contacted" ? "emailed" : lead.status,
  }));

  return sendJson(res, 200, {
    success: true,
    data: {
      items: normalizedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
}

async function handlePost(req, res) {
  await connectDB();

  const body = await readJsonBody(req);
  const { leads = [], searchMeta = {} } = body;

  if (!Array.isArray(leads) || leads.length === 0) {
    return sendJson(res, 400, { success: false, error: "No leads to save" });
  }

  if (leads.length > 200) {
    return sendJson(res, 400, { success: false, error: "Maximum 200 leads per save" });
  }

  let saved = 0;
  let duplicates = 0;
  let invalid = 0;

  const seenOsm = new Set();
  const seenEmail = new Set();

  for (const lead of leads) {
    if (!lead.osmType || lead.osmId == null || !lead.companyName) {
      invalid += 1;
      continue;
    }

    const emailKey = normalizeEmailKey(lead.email);
    if (!emailKey) {
      invalid += 1;
      continue;
    }

    const osmKey = `${lead.osmType}-${lead.osmId}`;
    if (seenOsm.has(osmKey) || seenEmail.has(emailKey)) {
      duplicates += 1;
      continue;
    }

    const existing = await findExistingLead(lead, emailKey);

    if (existing) {
      duplicates += 1;
      continue;
    }

    try {
      await OsmLead.create({
        osmType: lead.osmType,
        osmId: lead.osmId,
        companyName: lead.companyName,
        city: lead.city || null,
        address: lead.address || null,
        postalCode: lead.postalCode || null,
        description: lead.description || null,
        phone: lead.phone || null,
        website: lead.website || null,
        email: lead.email.trim(),
        emailKey,
        category: lead.category || null,
        categoryLabel: lead.categoryLabel || null,
        country: lead.country || null,
        countryCode: lead.countryCode || null,
        region: lead.region || null,
        latitude: lead.latitude ?? null,
        longitude: lead.longitude ?? null,
        leadType: lead.leadType || (lead.website ? "has_website" : "no_website"),
        status: "new",
        notes: "",
        searchMeta: {
          queryPlace: searchMeta.queryPlace || null,
          businessTypeId: searchMeta.businessTypeId || lead.category || null,
          radiusKm: searchMeta.radiusKm ?? null,
        },
      });

      seenOsm.add(osmKey);
      seenEmail.add(emailKey);
      saved += 1;
    } catch (err) {
      if (err.code === 11000) {
        duplicates += 1;
      } else {
        throw err;
      }
    }
  }

  const parts = [];
  if (saved) parts.push(`${saved} new`);
  if (duplicates) parts.push(`${duplicates} duplicate(s) skipped`);
  if (invalid) parts.push(`${invalid} invalid skipped`);

  return sendJson(res, 201, {
    success: true,
    message: parts.length ? parts.join(", ") : "Nothing to save",
    data: { saved, duplicates, invalid },
  });
}

async function handleDelete(req, res) {
  await connectDB();

  let body = {};
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { success: false, error: "Invalid JSON body" });
  }

  const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
  let filter;

  if (ids.length > 0) {
    filter = { _id: { $in: ids } };
  } else {
    const deleteAll = req.query.all === "1" || req.query.all === "true";
    filter = deleteAll ? {} : buildListFilter(req.query);
  }

  const count = await OsmLead.countDocuments(filter);
  if (count === 0) {
    return sendJson(res, 200, {
      success: true,
      message: "No leads to delete",
      data: { deleted: 0 },
    });
  }

  const result = await OsmLead.deleteMany(filter);

  return sendJson(res, 200, {
    success: true,
    message: `Deleted ${result.deletedCount} lead(s)`,
    data: { deleted: result.deletedCount },
  });
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "POST") return handlePost(req, res);
  if (req.method === "DELETE") return handleDelete(req, res);
  return methodNotAllowed(res, ["GET", "POST", "DELETE"]);
}
