const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createLeagueMatch,
  getGlobalLeagueMatch,
  joinLeagueMatch,
  getMyLeagueMatchs,
  getLeagueMatch,
  deleteLeagueMatch,
  getLeagueMatchMembers,
  getLeagueMatchFixtures,
} = require("../controller/leagueMatchController");

const router = express.Router();

/**
 * Create Private LeagueMatch
 */
router.post("/", authMiddleware, createLeagueMatch);

/**
 * Get Global LeagueMatch
 */
router.get("/global", authMiddleware, getGlobalLeagueMatch);

/**
 * Join Private LeagueMatch using invite code
 */
router.post("/join", authMiddleware, joinLeagueMatch);

/**
 * Get logged-in user's leagueMatchs
 */
router.get("/", authMiddleware, getLeagueMatchFixtures);
// router.get("/:id/members", authMiddleware, getLeagueMatchMembers);

/**
 * Get single leagueMatch by id
 */
router.get("/:id", authMiddleware, getLeagueMatch);

/**
 * Delete Private LeagueMatch (Admin only)
 */
router.delete("/:id", authMiddleware, deleteLeagueMatch);

module.exports = router;
