import mongoose from "mongoose";

const OsmSearchJobSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["running", "complete", "failed", "cancelled"],
      default: "running",
    },
    placeName: { type: String, default: null },
    city: { type: String, default: null },
    region: { type: String, default: null },
    country: { type: String, default: null },
    countryCode: { type: String, default: null },
    businessTypeId: { type: String, required: true },
    businessTypeLabel: { type: String, default: null },
    bbox: {
      south: Number,
      west: Number,
      north: Number,
      east: Number,
    },
    tiles: [
      {
        south: Number,
        west: Number,
        north: Number,
        east: Number,
      },
    ],
    filterSets: { type: Array, default: [] },
    tileIndex: { type: Number, default: 0 },
    filterIndex: { type: Number, default: 0 },
    chunkSize: { type: Number, default: 2 },
    totalSteps: { type: Number, default: 0 },
    completedSteps: { type: Number, default: 0 },
    rawCount: { type: Number, default: 0 },
    results: { type: Array, default: [] },
    seenKeys: { type: [String], default: [] },
    error: { type: String, default: null },
    searchArea: {
      kmLat: Number,
      kmLon: Number,
      tileCount: Number,
      expandedFromPoint: Boolean,
    },
  },
  { timestamps: true }
);

OsmSearchJobSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.OsmSearchJob ||
  mongoose.model("OsmSearchJob", OsmSearchJobSchema);
