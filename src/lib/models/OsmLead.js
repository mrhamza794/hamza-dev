import mongoose from "mongoose";

const OsmLeadSchema = new mongoose.Schema(
  {
    osmType: { type: String, required: true, enum: ["node", "way", "relation"] },
    osmId: { type: Number, required: true },
    companyName: { type: String, required: true, trim: true },
    city: { type: String, default: null },
    address: { type: String, default: null },
    postalCode: { type: String, default: null },
    description: { type: String, default: null },
    phone: { type: String, default: null },
    website: { type: String, default: null },
    email: { type: String, default: null },
    category: { type: String, default: null },
    categoryLabel: { type: String, default: null },
    country: { type: String, default: null },
    countryCode: { type: String, default: null },
    region: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    leadType: {
      type: String,
      enum: ["no_website", "has_website", "old_website"],
      default: "no_website",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "skipped"],
      default: "new",
    },
    notes: { type: String, default: "" },
    searchMeta: {
      queryPlace: { type: String, default: null },
      businessTypeId: { type: String, default: null },
      radiusKm: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

OsmLeadSchema.index({ osmType: 1, osmId: 1 }, { unique: true });
OsmLeadSchema.index({ city: 1, status: 1, createdAt: -1 });
OsmLeadSchema.index({ countryCode: 1, category: 1 });

export default mongoose.models.OsmLead || mongoose.model("OsmLead", OsmLeadSchema);
