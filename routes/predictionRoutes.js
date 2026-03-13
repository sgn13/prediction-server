const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getPredictions, createOrUpdatePrediction } = require("../controller/predictionController");

const router = express.Router();

/**
 * Create Private Prediction
 */
router.post("/", authMiddleware, createOrUpdatePrediction);

router.get("/", authMiddleware, getPredictions);

module.exports = router;
