import connectDB from "@/lib/mongodb";
import Contact from "@/lib/models/Contact";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendJson, methodNotAllowed } from "@/lib/pagesApi";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter(query) {
  const filter = {};
  const q = query.q?.trim();

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { name: regex },
      { email: regex },
      { message: regex },
      { ipAddress: regex },
      { device: regex },
      { browser: regex },
      { os: regex },
    ];
  }

  return filter;
}

async function handleGet(req, res) {
  await connectDB();

  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "25", 10), 1), 100);
  const filter = buildFilter(req.query);

  const [items, total] = await Promise.all([
    Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Contact.countDocuments(filter),
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

async function handleDelete(req, res) {
  await connectDB();

  const deleteAll = req.query.all === "1" || req.query.all === "true";
  const filter = deleteAll ? {} : buildFilter(req.query);

  const count = await Contact.countDocuments(filter);
  if (count === 0) {
    return sendJson(res, 200, {
      success: true,
      message: "No contacts to delete",
      data: { deleted: 0 },
    });
  }

  const result = await Contact.deleteMany(filter);

  return sendJson(res, 200, {
    success: true,
    message: `Deleted ${result.deletedCount} contact(s)`,
    data: { deleted: result.deletedCount },
  });
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "DELETE") return handleDelete(req, res);
  return methodNotAllowed(res, ["GET", "DELETE"]);
}
