import mongoose from "mongoose";

const OsmSearchResultSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OsmSearchJob",
      required: true,
      index: true,
    },
    osmType: { type: String, required: true },
    osmId: { type: Number, required: true },
    companyName: { type: String, required: true },
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
    leadType: { type: String, default: "no_website" },
  },
  { timestamps: true }
);

OsmSearchResultSchema.index({ jobId: 1, osmType: 1, osmId: 1 }, { unique: true });

export default mongoose.models.OsmSearchResult ||
  mongoose.model("OsmSearchResult", OsmSearchResultSchema);
