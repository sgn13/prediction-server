const { default: mongoose } = require("mongoose");
const Mongoose = require("mongoose");

const LeagueMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "League",
      required: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "MEMBER"],
      default: "MEMBER",
    },

    silverPoints: { type: Number, default: 0 },
    goldPoints: { type: Number, default: 0 },
    premiumPoints: { type: Number, default: 0 },

    totalPoints: { type: Number, default: 0 },

    totalPredictions: { type: Number, default: 0 },
    correctPredictions: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Prevent duplicate membership
LeagueMemberSchema.index({ userId: 1, leagueId: 1 }, { unique: true });

module.exports = mongoose.model("LeagueMember", LeagueMemberSchema);
