const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getFixturesByGameweek } = require("../controller/fixtureController");

const router = express.Router();

/**
 * Create Private League
 */
router.get("/gameweek", authMiddleware, getFixturesByGameweek);

// /**
//  * Get Global League
//  */
// router.get("/global", authMiddleware, getGlobalLeague);

// /**
//  * Join Private League using invite code
//  */
// router.post("/join", authMiddleware, joinLeague);

// /**
//  * Get logged-in user's leagues
//  */
// router.get("/", authMiddleware, getMyLeagues);
// // router.get("/:id/members", authMiddleware, getLeagueMembers);

// /**
//  * Get single league by id
//  */
// router.get("/:id", authMiddleware, getLeague);

// /**
//  * Delete Private League (Admin only)
//  */
// router.delete("/:id", authMiddleware, deleteLeague);

module.exports = router;
