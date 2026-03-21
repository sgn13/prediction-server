const LeagueMatch = require("../models/LeagueMatchModal");
const User = require("../models/UserModal");
const LeagueMemberModal = require("../models/LeagueMemberModal");
const LeagueMatchModal = require("../models/LeagueMatchModal");
/**
 * Create Private LeagueMatch
 */
exports.createLeagueMatch = async (req, res) => {
  try {
    const { name, season } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "LeagueMatch name is required" });
    }

    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const leagueMatch = await LeagueMatch.create({
      name,
      season,
      type: "PRIVATE",
      admin: req.user,
      inviteCode,
    });

    // Create membership for creator as ADMIN

    // await LeagueMatchMember.create({
    //   userId: req.user,
    //   leagueMatchId: leagueMatch._id,
    //   role: "ADMIN",
    // });

    res.status(201).json({ data: leagueMatch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get Global LeagueMatch
 */
exports.getGlobalLeagueMatch = async (req, res) => {
  try {
    const leagueMatch = await LeagueMatch.findOne({ type: "GLOBAL" });

    if (!leagueMatch) {
      return res.status(404).json({ msg: "Global leagueMatch not found" });
    }

    res.status(200).json({ data: leagueMatch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Join Private LeagueMatch using invite code
 */
exports.joinLeagueMatch = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user; // from auth middleware
    if (!inviteCode) {
      return res.status(400).json({ msg: "Invite code is required" });
    }

    const leagueMatch = await LeagueMatch.findOne({ inviteCode });

    if (!leagueMatch) {
      return res.status(404).json({ msg: "Invalid invite code" });
    }
    // 2️⃣ Check if already joined
    const existingMember = await LeagueMatchMember.findOne({
      userId,
      leagueMatchId: leagueMatch._id,
    });

    if (existingMember) {
      return res.status(400).json({ msg: "Already joined this leagueMatch" });
    }

    // 3️⃣ Create membership
    await LeagueMatchMember.create({
      userId,
      leagueMatchId: leagueMatch._id,
      role: "MEMBER",
    });

    // 4️⃣ Increment members count
    await LeagueMatch.findByIdAndUpdate(leagueMatch._id, {
      $inc: { membersCount: 1 },
    });

    res.status(200).json({ msg: "Joined leagueMatch successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get leagueMatchs of logged-in user
 */
exports.getMyLeagueMatchs = async (req, res) => {
  try {
    const userId = req.user; // from auth middleware
    const leagueMatchs = await LeagueMatchMember.find({ userId })
      .populate({
        path: "leagueMatchId",
        select: "name type inviteCode isActive season",
      })
      .sort({ createdAt: -1 });

    // Optional: clean response
    const formatted = leagueMatchs.map((member) => ({
      leagueMatchId: member.leagueMatchId._id,
      name: member.leagueMatchId.name,
      type: member.leagueMatchId.type,
      season: member.leagueMatchId.season,
      role: member.role,
      totalPoints: member.totalPoints,
      silverPoints: member.silverPoints,
      goldPoints: member.goldPoints,
      premiumPoints: member.premiumPoints,
    }));

    res.status(200).json({ data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leagueMatchs" });
  }
};

/**
 * Get single leagueMatch details
 */
exports.getLeagueMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const leagueMatch = await LeagueMatch.findById(id).populate("admin", "username");

    if (!leagueMatch) {
      return res.status(404).json({ msg: "LeagueMatch not found" });
    }

    res.status(200).json({ data: leagueMatch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete Private LeagueMatch (Admin only)
 */
exports.deleteLeagueMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const leagueMatch = await LeagueMatch.findById(id);

    if (!leagueMatch) {
      return res.status(404).json({ msg: "LeagueMatch not found" });
    }

    if (leagueMatch.type === "GLOBAL") {
      return res.status(403).json({ msg: "Global leagueMatch cannot be deleted" });
    }

    if (leagueMatch.admin.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await LeagueMatch.deleteOne({ _id: id });

    // Remove leagueMatch from users
    await User.updateMany({}, { $pull: { leagueMatchs: { leagueMatchId: id } } });

    res.status(200).json({ msg: "LeagueMatch deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeagueMatchMembers = async (req, res) => {
  try {
    const { id } = req.params; // leagueMatchId

    const users = await User.find({
      "leagueMatchs.leagueMatchId": id,
    }).select("username fullName avatar stats");

    res.status(200).json({ data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get matches of a league for a gameweek
 */

exports.getLeagueMatchFixtures = async (req, res) => {
  try {
    const { leagueId, gameweekId } = req.query;

    if (!leagueId || !gameweekId) {
      return res.status(400).json({
        msg: "leagueId and gameweekId are required",
      });
    }
    // 1️⃣ Check if user belongs to this league
    const isMember = await LeagueMemberModal.findOne({
      // leagueMatchId: leagueId,
      userId: req.user,
    });

    if (!isMember) {
      return res.status(403).json({
        msg: "You are not a member of this league",
      });
    }

    // 2️⃣ Get assigned matches
    const matches = await LeagueMatchModal.find({
      fantasy_league_id: leagueId,
      gameweek_id: gameweekId,
    }).populate("match_id");

    res.status(200).json({ data: matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
