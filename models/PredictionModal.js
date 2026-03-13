const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fantasy_league_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FantasyLeague",
      required: true,
      index: true,
    },

    fixture_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fixture",
      required: true,
    },

    predicted_home_score: Number,
    predicted_away_score: Number,

    // ⭐ points for this match
    points_awarded: {
      type: Number,
      default: 0,
    },

    prediction_type: {
      type: String,
      enum: ["gold", "silver", "none"],
      default: "none",
    },

    is_processed: {
      type: Boolean,
      default: false,
    },
    is_locked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// prevent duplicate prediction
PredictionSchema.index({ user_id: 1, fantasy_league_id: 1, fixture_id: 1 }, { unique: true });

module.exports = mongoose.model("Prediction", PredictionSchema);
