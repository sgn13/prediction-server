const LeagueMemberModal = require("../models/LeagueMemberModal");
const APIFeatures = require("../utils/apiFeatures");

// Get all members of a league
exports.getLeagueMembers = async (req, res, next) => {
  try {
    const { leagueId } = req.params;

    const query = LeagueMemberModal.find({ leagueId });

    const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();

    const leagueMembers = await features.query
      .populate("userId", "username full_name")
      .sort({ totalPoints: -1 }); // leaderboard sort

    //     const members = await LeagueMemberModal.find({ leagueId })
    // .populate("userId", "username full_name")
    // .sort({ totalPoints: -1 });
    // console.log({ leagueMembers });
    const formatted = leagueMembers.map((member) => ({
      id: member._id,
      username: member.userId.username,
      full_name: member.userId.full_name,
      totalPoints: member.totalPoints,
      role: member.role,
    }));
    // console.log({ formatted });

    res.status(200).json({
      total: leagueMembers.length,
      data: formatted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single member inside a league
exports.getLeagueMember = async (req, res, next) => {
  try {
    const { leagueId, userId } = req.params;

    const leagueMember = await LeagueMemberModal.findOne({
      leagueId,
      userId,
    }).populate("userId", "username email");

    if (!leagueMember) {
      return res.status(404).json({ message: "Member not found in this league" });
    }

    res.status(200).json({ data: leagueMember });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join league
exports.joinLeague = async (req, res, next) => {
  try {
    const { leagueId } = req.params;
    const userId = req.user;

    const existing = await LeagueMemberModal.findOne({ leagueId, userId });

    if (existing) {
      return res.status(400).json({ message: "Already joined this league" });
    }

    const leagueMember = await LeagueMemberModal.create({
      leagueId,
      userId,
      role: "MEMBER",
    });

    res.status(201).json({
      message: "Joined league successfully",
      data: leagueMember,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leave league
exports.leaveLeague = async (req, res, next) => {
  try {
    const { leagueId } = req.params;
    const userId = req.user;

    const member = await LeagueMemberModal.findOneAndDelete({
      leagueId,
      userId,
    });

    if (!member) {
      return res.status(404).json({ message: "You are not in this league" });
    }

    res.status(200).json({ message: "Left league successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
