const Gameweek = require("../models/GameweekModal");
const Fixture = require("../models/FixtureModal");

/**
 * Store fixtures & create gameweeks automatically
 * @param {Array} apiResponse API response array from football API
 */
async function storeApiFixtures(apiResponse) {
  for (const item of apiResponse) {
    const { fixture, league, teams, goals } = item;

    // --- 1️⃣ Handle Gameweek ---
    const roundNumberMatch = league.round?.match(/\d+$/);
    const roundNumber = roundNumberMatch ? parseInt(roundNumberMatch[0]) : 1;

    let gameweek = await Gameweek.findOne({
      api_football_league_id: league.id,
      season: league.season,
      round_number: roundNumber,
    });

    if (!gameweek) {
      gameweek = await Gameweek.create({
        api_football_league_id: league.id,
        season: league.season,
        round_number: roundNumber,
        round_name: league.round,
      });
    }

    // --- 2️⃣ Handle Fixture ---
    await Fixture.updateOne(
      { api_football_fixture_id: fixture.id },
      {
        $set: {
          api_football_league_id: league.id,
          season: league.season,
          gameweek_id: gameweek._id,
          home_team_name: teams.home.name,
          away_team_name: teams.away.name,
          kickoff_at: fixture.date,
          status_short: fixture.status.short,
          home_score: goals.home,
          away_score: goals.away,
          isActive: true,
        },
      },
      { upsert: true }, // create if doesn't exist
    );
  }

  console.log("Fixtures imported successfully!");
}

async function getFixturesByGameweek(req, res) {
  try {
    const { gameweekId } = req.query;
    console.log({ gameweekId, req: req.query });
    const fixtures = await Fixture.find({
      gameweek_id: gameweekId,
    }).sort({ kickoff_at: 1 });
    res.status(200).json({ data: fixtures });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { storeApiFixtures, getFixturesByGameweek };
