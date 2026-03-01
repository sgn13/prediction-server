const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createGameweek,
  getGlobalGameweek,
  joinGameweek,
  getGameweeks,
  getGameweek,
  deleteGameweek,
} = require("../controller/gameweekController");

const router = express.Router();

/**
 * Create Private Gameweek
 */
router.post("/", authMiddleware, createGameweek);

/**
 * Get Global Gameweek
 */
router.get("/global", authMiddleware, getGlobalGameweek);

/**
 * Join Private Gameweek using invite code
 */
router.post("/join", authMiddleware, joinGameweek);

/**
 * Get logged-in user's gameweeks
 */
router.get("/", authMiddleware, getGameweeks);
// router.get("/:id/members", authMiddleware, getGameweekMembers);

/**
 * Get single gameweek by id
 */
router.get("/:id", authMiddleware, getGameweek);

/**
 * Delete Private Gameweek (Admin only)
 */
router.delete("/:id", authMiddleware, deleteGameweek);

module.exports = router;
