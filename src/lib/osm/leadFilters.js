function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildLeadListFilter(query) {
  const filter = { email: { $nin: [null, ""] } };
  const and = [];

  if (query.city) filter.city = query.city;
  if (query.countryCode) filter.countryCode = query.countryCode.toUpperCase();
  if (query.category) filter.category = query.category;
  if (query.status) {
    filter.status =
      query.status === "emailed" ? { $in: ["emailed", "contacted"] } : query.status;
  }

  const q = query.q?.trim();
  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    and.push({
      $or: [
        { companyName: regex },
        { email: regex },
        { city: regex },
        { address: regex },
        { phone: regex },
        { website: regex },
        { category: regex },
        { categoryLabel: regex },
        { country: regex },
        { region: regex },
        { description: regex },
      ],
    });
  }

  if (query.hasWebsite === "yes") {
    filter.website = { $exists: true, $nin: [null, ""] };
  } else if (query.hasWebsite === "no") {
    and.push({ $or: [{ website: null }, { website: "" }, { website: { $exists: false } }] });
  }

  if (and.length) filter.$and = and;

  return filter;
}
