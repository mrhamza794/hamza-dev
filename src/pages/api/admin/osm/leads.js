import connectDB from "@/lib/mongodb";
import OsmLead from "@/lib/models/OsmLead";
import { requireAdmin } from "@/lib/requireAdmin";
import { readJsonBody, sendJson, methodNotAllowed } from "@/lib/pagesApi";

function buildListFilter(query) {
  const filter = { email: { $nin: [null, ""] } };
  if (query.city) filter.city = query.city;
  if (query.countryCode) filter.countryCode = query.countryCode.toUpperCase();
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.q) {
    filter.companyName = { $regex: query.q, $options: "i" };
  }
  return filter;
}

async function handleGet(req, res) {
  await connectDB();

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

  return sendJson(res, 200, {
    success: true,
    data: {
      items,
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
  let skipped = 0;

  for (const lead of leads) {
    if (!lead.osmType || lead.osmId == null || !lead.companyName) {
      skipped += 1;
      continue;
    }

    if (!lead.email?.trim()) {
      skipped += 1;
      continue;
    }

    await OsmLead.findOneAndUpdate(
      { osmType: lead.osmType, osmId: lead.osmId },
      {
        $set: {
          companyName: lead.companyName,
          city: lead.city || null,
          address: lead.address || null,
          postalCode: lead.postalCode || null,
          description: lead.description || null,
          phone: lead.phone || null,
          website: lead.website || null,
          email: lead.email || null,
          category: lead.category || null,
          categoryLabel: lead.categoryLabel || null,
          country: lead.country || null,
          countryCode: lead.countryCode || null,
          region: lead.region || null,
          latitude: lead.latitude ?? null,
          longitude: lead.longitude ?? null,
          leadType: lead.leadType || (lead.website ? "has_website" : "no_website"),
          searchMeta: {
            queryPlace: searchMeta.queryPlace || lead.searchMeta?.queryPlace || null,
            businessTypeId: searchMeta.businessTypeId || lead.category || null,
            radiusKm: searchMeta.radiusKm ?? null,
          },
        },
        $setOnInsert: {
          status: "new",
          notes: "",
        },
      },
      { upsert: true, new: true }
    );
    saved += 1;
  }

  return sendJson(res, 201, {
    success: true,
    message: `Saved ${saved} lead(s)${skipped ? `, skipped ${skipped}` : ""}`,
    data: { saved, skipped },
  });
}

async function handleDelete(req, res) {
  await connectDB();

  const deleteAll = req.query.all === "1" || req.query.all === "true";
  const filter = deleteAll ? {} : buildListFilter(req.query);

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
