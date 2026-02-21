const League = require("../models/LeagueModal");
const User = require("../models/UserModal");
const LeagueMember = require("../models/LeagueMemberModal");
/**
 * Create Private League
 */
exports.createLeague = async (req, res) => {
  try {
    const { name, season } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "League name is required" });
    }

    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const league = await League.create({
      name,
      season,
      type: "PRIVATE",
      admin: req.user,
      inviteCode,
    });

    // Create membership for creator as ADMIN

    await LeagueMember.create({
      userId: req.user,
      leagueId: league._id,
      role: "ADMIN",
    });

    res.status(201).json({ data: league });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get Global League
 */
exports.getGlobalLeague = async (req, res) => {
  try {
    const league = await League.findOne({ type: "GLOBAL" });

    if (!league) {
      return res.status(404).json({ msg: "Global league not found" });
    }

    res.status(200).json({ data: league });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Join Private League using invite code
 */
exports.joinLeague = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user; // from auth middleware
    if (!inviteCode) {
      return res.status(400).json({ msg: "Invite code is required" });
    }

    const league = await League.findOne({ inviteCode });

    if (!league) {
      return res.status(404).json({ msg: "Invalid invite code" });
    }
    // 2️⃣ Check if already joined
    const existingMember = await LeagueMember.findOne({
      userId,
      leagueId: league._id,
    });

    if (existingMember) {
      return res.status(400).json({ msg: "Already joined this league" });
    }

    // 3️⃣ Create membership
    await LeagueMember.create({
      userId,
      leagueId: league._id,
      role: "MEMBER",
    });

    // 4️⃣ Increment members count
    await League.findByIdAndUpdate(league._id, {
      $inc: { membersCount: 1 },
    });

    res.status(200).json({ msg: "Joined league successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get leagues of logged-in user
 */
exports.getMyLeagues = async (req, res) => {
  try {
    const userId = req.user; // from auth middleware
    const leagues = await LeagueMember.find({ userId })
      .populate({
        path: "leagueId",
        select: "name type inviteCode isActive season",
      })
      .sort({ createdAt: -1 });

    // Optional: clean response
    const formatted = leagues.map((member) => ({
      leagueId: member.leagueId._id,
      name: member.leagueId.name,
      type: member.leagueId.type,
      season: member.leagueId.season,
      role: member.role,
      totalPoints: member.totalPoints,
      silverPoints: member.silverPoints,
      goldPoints: member.goldPoints,
      premiumPoints: member.premiumPoints,
    }));

    res.status(200).json({ data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leagues" });
  }
};

/**
 * Get single league details
 */
exports.getLeague = async (req, res) => {
  try {
    const { id } = req.params;

    const league = await League.findById(id).populate("admin", "username");

    if (!league) {
      return res.status(404).json({ msg: "League not found" });
    }

    res.status(200).json({ data: league });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete Private League (Admin only)
 */
exports.deleteLeague = async (req, res) => {
  try {
    const { id } = req.params;

    const league = await League.findById(id);

    if (!league) {
      return res.status(404).json({ msg: "League not found" });
    }

    if (league.type === "GLOBAL") {
      return res.status(403).json({ msg: "Global league cannot be deleted" });
    }

    if (league.admin.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await League.deleteOne({ _id: id });

    // Remove league from users
    await User.updateMany({}, { $pull: { leagues: { leagueId: id } } });

    res.status(200).json({ msg: "League deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeagueMembers = async (req, res) => {
  try {
    const { id } = req.params; // leagueId

    const users = await User.find({
      "leagues.leagueId": id,
    }).select("username fullName avatar stats");

    res.status(200).json({ data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
