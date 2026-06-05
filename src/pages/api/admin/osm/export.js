import connectDB from "@/lib/mongodb";
import OsmLead from "@/lib/models/OsmLead";
import { requireAdmin } from "@/lib/requireAdmin";
import { methodNotAllowed } from "@/lib/pagesApi";

function escapeCsv(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  await connectDB();

  const filter = { email: { $nin: [null, ""] } };
  if (req.query.status) filter.status = req.query.status;

  const leads = await OsmLead.find(filter).sort({ companyName: 1 }).limit(1000).lean();

  const headers = [
    "companyName",
    "city",
    "address",
    "postalCode",
    "description",
    "phone",
    "email",
    "website",
    "categoryLabel",
    "country",
    "status",
    "notes",
  ];

  const rows = leads.map((lead) =>
    headers.map((h) => escapeCsv(lead[h])).join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="osm-leads.csv"');
  res.status(200).send(csv);
}
