// services/gameweekAssignment.service.js

const Fixture = require("../models/FixtureModal");
const LeagueModal = require("../models/LeagueModal");
const LeagueMatch = require("../models/LeagueMatchModal");

async function assignOneMatchPerLeague(gameweekId = "69ad30937e9ad400f018830e") {
  const fixtures = await Fixture.find({
    gameweek_id: "69ad30937e9ad400f018830e",
  }).sort({ kickoff_at: 1 });

  if (!fixtures.length) return;

  const leagues = await LeagueModal.find({}).sort({ createdAt: 1 });

  for (let i = 0; i < leagues.length; i++) {
    const league = leagues[i];
    const fixture = fixtures[i % fixtures.length];

    await LeagueMatch.updateOne(
      {
        fantasy_league_id: league._id,
        gameweek_id: gameweekId,
      },
      {
        fantasy_league_id: league._id,
        gameweek_id: gameweekId,
        match_id: fixture._id,
      },
      { upsert: true },
    );
  }

  console.log("Match assignment complete");
}

module.exports = { assignOneMatchPerLeague };
