import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },

    ipAddress: {
      type: String,
      default: null,
    },
    location: {
      country: { type: String, default: null },
      countryCode: { type: String, default: null },
      city: { type: String, default: null },
      region: { type: String, default: null },
      regionCode: { type: String, default: null },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      timezone: { type: String, default: null },
      isp: { type: String, default: null },
      org: { type: String, default: null },
    },

    device: {
      type: { type: String, default: null },
      brand: { type: String, default: null },
      model: { type: String, default: null },
    },

    browser: {
      name: { type: String, default: null },
      version: { type: String, default: null },
      engine: { type: String, default: null },
    },

    os: {
      name: { type: String, default: null },
      version: { type: String, default: null },
    },

    source: {
      referrer: { type: String, default: null },
      utm_source: { type: String, default: null },
      utm_medium: { type: String, default: null },
      utm_campaign: { type: String, default: null },
    },

    screen: {
      width: { type: Number, default: null },
      height: { type: Number, default: null },
      colorDepth: { type: Number, default: null },
    },

    behavior: {
      pagesViewed: { type: Number, default: 1 },
      timeOnSite: { type: Number, default: 0 },
      scrollDepth: { type: Number, default: 0 },
      sectionsVisited: { type: [String], default: [] },
      clickedContact: { type: Boolean, default: false },
      playedGame: { type: Boolean, default: false },
      downloadedResume: { type: Boolean, default: false },
    },

    userAgent: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: null,
    },
    isBot: {
      type: Boolean,
      default: false,
    },
    connectionType: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

VisitorSchema.index({ visitedAt: -1 });
VisitorSchema.index({ "location.country": 1 });

export default mongoose.models.Visitor || mongoose.model("Visitor", VisitorSchema);
