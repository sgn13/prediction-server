const LeagueMemberModal = require("../models/LeagueMemberModal");
const APIFeatures = require("../utils/apiFeatures");
const PredictionModal = require("../models/PredictionModal");
const FixtureModal = require("../models/FixtureModal");
const mongoose = require("mongoose");

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

exports.getLeagueLeaderboard = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { gameweek_id } = req.query;

    // get all league members
    const members = await LeagueMemberModal.find({ leagueId }).populate(
      "userId",
      "username full_name",
    );
    // if no gameweek → return overall table
    if (!gameweek_id) {
      const sorted = members.sort((a, b) => b.totalPoints - a.totalPoints);
      const formatted = sorted.map((member) => ({
        ...member,
        id: member._id,
        username: member.userId.username,
        full_name: member.userId.full_name,
        totalPoints: member.totalPoints,
        role: member.role,
      }));

      return res.status(200).json({
        data: formatted,
      });
    }

    // get fixtures for that gameweek
    const fixtures = await FixtureModal.find({
      gameweek_id: gameweek_id,
    });
    const fixtureIds = fixtures.map((f) => f._id);

    // get predictions for that gameweek
    const predictions = await PredictionModal.find({
      fantasy_league_id: leagueId,
      fixture_id: { $in: fixtureIds },
    });

    // calculate user points map
    const userPoints = {};

    for (const p of predictions) {
      const userId = p.user_id.toString();

      if (!userPoints[userId]) {
        userPoints[userId] = 0;
      }

      userPoints[userId] += p.points || 0;
    }
    // attach points to every league member

    const leaderboard = members.map((m) => ({
      user: m.userId.name,
      userId: m.userId._id,
      points: userPoints[m.userId._id.toString()] || 0,
      id: m._id,
      username: m.userId.username,
      full_name: m.userId.full_name,
      totalPoints: m.totalPoints,
      role: m.role,
    }));

    // sort leaderboard
    leaderboard.sort((a, b) => b.points - a.points);

    res.status(200).json({
      // total: leagueMembers.length,
      data: leaderboard,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching leaderboard",
    });
  }
};
