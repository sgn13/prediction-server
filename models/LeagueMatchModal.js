const mongoose = require("mongoose");

const LeagueGameweekMatchSchema = new mongoose.Schema(
  {
    fantasy_league_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FantasyLeague",
      required: true,
      index: true,
    },

    gameweek_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gameweek",
      required: true,
      index: true,
    },

    match_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fixture", // your matches model
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate match inside same fantasy league gameweek
LeagueGameweekMatchSchema.index(
  { fantasy_league_id: 1, gameweek_id: 1, match_id: 1 },
  { unique: true },
);

const LeagueGameweekMatch =
  mongoose.models.LeagueGameweekMatch ||
  mongoose.model("LeagueGameweekMatch", LeagueGameweekMatchSchema);

module.exports = LeagueGameweekMatch;
