const { default: mongoose } = require("mongoose");
const Mongoose = require("mongoose");

const GameweekSchema = new Mongoose.Schema(
  {
    api_football_league_id: {
      type: Number,
      required: true,
      index: true,
    },

    season: {
      type: Number,
      required: true,
    },

    round_number: {
      type: Number,
      required: true,
      min: 1,
    },

    // Optional: Full round string from API
    round_name: {
      type: String, // Example: "Regular Season - 25"
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Prevent duplicate gameweek for same league + season + round
GameweekSchema.index({ api_football_league_id: 1, season: 1, round_number: 1 }, { unique: true });

const Gameweek = Mongoose.models.Gameweek || Mongoose.model("Gameweek", GameweekSchema);

module.exports = Gameweek;
