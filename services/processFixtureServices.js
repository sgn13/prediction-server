const Prediction = require("../models/PredictionModal");
const LeagueMember = require("../models/LeagueMemberModal");
const Fixture = require("../models/FixtureModal");
const { calculatePrediction } = require("../functions/calculatePrediction");

async function processFixturePredictions(fixtureId) {
  try {
    // 1. get match result
    const fixture = await Fixture.findById(fixtureId);

    const realHome = fixture.home_score;
    const realAway = fixture.away_score;

    // 2. find predictions for that fixture
    const predictions = await Prediction.find({
      fixture_id: fixtureId,
      is_processed: false,
    });

    for (const prediction of predictions) {
      const result = calculatePrediction(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
        realHome,
        realAway,
      );

      // 3️⃣ update prediction document
      await Prediction.updateOne(
        { _id: prediction._id },
        {
          $set: {
            points_awarded: result.points,
            prediction_type: result.type,
            is_processed: true,
          },
        },
      );

      // 4️⃣ update league member totals
      const update = {
        totalPoints: result.points,
        totalPredictions: 1,
      };

      if (result.type === "gold") update.goldPoints = 1;
      if (result.type === "silver") update.silverPoints = 1;

      if (result.type !== "none") update.correctPredictions = 1;

      await LeagueMember.updateOne(
        {
          userId: prediction.user_id,
          leagueId: prediction.fantasy_league_id,
        },
        { $inc: update },
      );
    }

    console.log("Predictions processed for fixture:", fixtureId);
  } catch (error) {
    console.error(error);
  }
}

module.exports = processFixturePredictions;
