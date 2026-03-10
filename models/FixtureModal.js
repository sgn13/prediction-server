const mongoose = require("mongoose");
const Mongoose = require("mongoose");

const FixtureSchema = new mongoose.Schema(
  {
    api_fixture_id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    api_league_id: {
      type: Number,
      required: true,
      index: true,
    },

    season: {
      type: Number,
      required: true,
    },

    matchday: {
      type: Number,
      required: true,
      index: true,
    },

    gameweek_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gameweek",
      required: true,
    },

    home_team_id: {
      type: Number,
      required: true,
    },

    away_team_id: {
      type: Number,
      required: true,
    },

    home_team_name: String,
    away_team_name: String,

    kickoff_at: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      default: "TIMED",
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
  },
  { timestamps: true },
);

// Optional compound index for faster queries by league + season + gameweek
FixtureSchema.index({ api_league_id: 1, season: 1, gameweek_id: 1 }, { unique: false });

const Fixture = Mongoose.models.Fixture || Mongoose.model("Fixture", FixtureSchema);

module.exports = Fixture;
