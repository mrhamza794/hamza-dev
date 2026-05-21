import mongoose from "mongoose";

const GameScoreSchema = new mongoose.Schema(
  {
    playerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    bugsSquashed: {
      type: Number,
      required: true,
      min: 0,
    },
    timeSpent: {
      type: Number,
      default: 30,
    },
    rank: {
      type: String,
      enum: [
        "Just Getting Started",
        "Not Bad For a Human",
        "Bug Hunter",
        "Senior Debugger",
        "Legendary Developer",
        "Bug Terminator",
      ],
      default: "Just Getting Started",
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
    device: {
      type: String,
      default: null,
    },
    browser: {
      type: String,
      default: null,
    },
    os: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    location: {
      country: { type: String, default: null },
      city: { type: String, default: null },
      region: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

GameScoreSchema.index({ score: -1 });

export default mongoose.models.GameScore || mongoose.model("GameScore", GameScoreSchema);
