// services/gameweekAssignment.service.js

const Fixture = require("../models/FixtureModal");
const LeagueModal = require("../models/LeagueModal");
const LeagueMatch = require("../models/LeagueMatchModal");

async function assignOneMatchPerLeague(gameweekId = "") {
  console.log(gameweekId, "ksskksk");
  const fixtures = await Fixture.find({
    gameweek_id: gameweekId,
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
