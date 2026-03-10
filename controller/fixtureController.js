const Gameweek = require("../models/GameweekModal");
const Fixture = require("../models/FixtureModal");

/**
 * Store fixtures & create gameweeks automatically
 * @param {Array} apiResponse API response array from football API
 */
async function storeApiFixtures(apiResponse) {
  console.log({ apiResponse });
  for (const item of apiResponse) {
    const matchday = item.matchday;

    // Find or create Gameweek
    let gameweek = await Gameweek.findOne({
      api_league_id: item.competition.id,
      // season: item.season.id,
      round_number: matchday,
    });

    // if (!gameweek) {
    //   gameweek = await Gameweek.create({
    //     api_league_id: item.competition.id,
    //     season: item.season.id,
    //     matchday: matchday,
    //     round_name: `Matchday ${matchday}`,
    //   });
    // }

    await Fixture.updateOne(
      { api_fixture_id: item.id },
      {
        $set: {
          api_league_id: item.competition.id,
          season: item.season.id,
          matchday: matchday,
          gameweek_id: gameweek._id,

          home_team_id: item.homeTeam.id,
          away_team_id: item.awayTeam.id,

          home_team_name: item.homeTeam.shortName,
          away_team_name: item.awayTeam.shortName,

          kickoff_at: new Date(item.utcDate),

          status: item.status,

          home_score: item.score?.fullTime?.home ?? 0,
          away_score: item.score?.fullTime?.away ?? 0,

          isActive: true,
        },
      },
      { upsert: true },
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
