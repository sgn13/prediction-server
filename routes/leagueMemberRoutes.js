const express = require("express");
const leagueMemberController = require("../controller/leagueMemberController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all members of a league
router.get("/:leagueId/members", authMiddleware, leagueMemberController.getLeagueMembers);
router.get("/:leagueId/leaderboard", authMiddleware, leagueMemberController.getLeagueLeaderboard);

// Get specific member inside league
router.get("/:leagueId/members/:userId", authMiddleware, leagueMemberController.getLeagueMember);

// Join league
router.post("/:leagueId/join", authMiddleware, leagueMemberController.joinLeague);

// Leave league
router.delete("/:leagueId/leave", authMiddleware, leagueMemberController.leaveLeague);

module.exports = router;
