const mongoose = require("mongoose");
const Mongoose = require("mongoose");

const FixtureSchema = new Mongoose.Schema(
  {
    api_football_fixture_id: {
      type: Number,
      required: true,
      index: true,
      unique: true, // each API fixture ID is unique
    },

    api_football_league_id: {
      type: Number,
      required: true,
      index: true,
    },

    season: {
      type: Number,
      required: true,
    },

    gameweek_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gameweek",
      required: true,
    },

    home_team_name: {
      type: String,
      required: true,
      trim: true,
    },

    away_team_name: {
      type: String,
      required: true,
      trim: true,
    },

    kickoff_at: {
      type: Date,
      required: true,
    },

    status_short: {
      type: String, // e.g., "NS", "1H", "HT", "2H", "FT"
      required: true,
      trim: true,
    },

    home_score: {
      type: Number,
      default: 0,
    },

    away_score: {
      type: Number,
      default: 0,
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

// Optional compound index for faster queries by league + season + gameweek
FixtureSchema.index({ api_football_league_id: 1, season: 1, gameweek_id: 1 }, { unique: false });

const Fixture = Mongoose.models.Fixture || Mongoose.model("Fixture", FixtureSchema);

module.exports = Fixture;
