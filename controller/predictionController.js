const Prediction = require("../models/PredictionModal");
const Fixture = require("../models/FixtureModal");

exports.createOrUpdatePrediction = async (req, res) => {
  try {
    const user_id = req.user; // from auth middleware

    const { fixture_id, fantasy_league_id, predicted_home_score, predicted_away_score } = req.body;

    // Check fixture
    const fixture = await Fixture.findById(fixture_id);
    console.log({ fixture, fixture_id });

    if (!fixture) {
      return res.status(404).json({
        message: "Fixture not found",
      });
    }

    // Lock prediction after kickoff
    if (new Date() > fixture.kickoff_at) {
      return res.status(400).json({
        message: "Prediction locked. Match already started.",
      });
    }

    const prediction = await Prediction.updateOne(
      {
        user_id,
        fantasy_league_id,
        fixture_id,
      },
      {
        $set: {
          predicted_home_score,
          predicted_away_score,
        },
      },
      { upsert: true },
    );

    return res.status(200).json({
      message: "Prediction saved successfully",
      data: prediction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error saving prediction",
    });
  }
};

exports.getPredictions = async (req, res) => {
  try {
    const user_id = req.user;
    const { fantasy_league_id, gameweek_id } = req.query;
    console.log({ user_id, fantasy_league_id, gameweek_id });

    const predictions = await Prediction.find({
      user_id,
      fantasy_league_id,
    });

    console.log({ predictions });
    const filtered = predictions.filter((p) => p.fixture_id !== null);

    return res.status(200).json({
      message: "Prediction saved successfully",
      data: filtered,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching predictions",
    });
  }
};
