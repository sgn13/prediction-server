const Gameweek = require("../models/GameweekModal");
const User = require("../models/UserModal");
// const GameweekMember = require("../models/GameweekMemberModal");
// const GameweekMember = require("../models/GameweekMemberModal");
/**
 * Create Private Gameweek
 */
exports.createGameweek = async (req, res) => {
  try {
    const { name, season } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Gameweek name is required" });
    }

    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const gameweek = await Gameweek.create({
      name,
      season,
      type: "PRIVATE",
      admin: req.user,
      inviteCode,
    });

    // Create membership for creator as ADMIN

    // await GameweekMember.create({
    //   userId: req.user,
    //   gameweekId: gameweek._id,
    //   role: "ADMIN",
    // });

    res.status(201).json({ data: gameweek });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get Global Gameweek
 */
exports.getGlobalGameweek = async (req, res) => {
  try {
    const gameweek = await Gameweek.findOne({ type: "GLOBAL" });

    if (!gameweek) {
      return res.status(404).json({ msg: "Global gameweek not found" });
    }

    res.status(200).json({ data: gameweek });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Join Private Gameweek using invite code
 */
exports.joinGameweek = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user; // from auth middleware
    if (!inviteCode) {
      return res.status(400).json({ msg: "Invite code is required" });
    }

    const gameweek = await Gameweek.findOne({ inviteCode });

    if (!gameweek) {
      return res.status(404).json({ msg: "Invalid invite code" });
    }
    // 2️⃣ Check if already joined
    // const existingMember = await GameweekMember.findOne({
    //   userId,
    //   gameweekId: gameweek._id,
    // });

    if (existingMember) {
      return res.status(400).json({ msg: "Already joined this gameweek" });
    }

    // 3️⃣ Create membership
    // await GameweekMember.create({
    //   userId,
    //   gameweekId: gameweek._id,
    //   role: "MEMBER",
    // });

    // 4️⃣ Increment members count
    await Gameweek.findByIdAndUpdate(gameweek._id, {
      $inc: { membersCount: 1 },
    });

    res.status(200).json({ msg: "Joined gameweek successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get gameweeks of logged-in user
 */
exports.getGameweeks = async (req, res) => {
  try {
    const userId = req.user; // from auth middleware
    const gameweeks = await Gameweek.find();

    // console.log({ gameweeks });
    const formatted = gameweeks?.filter((gameweek) => gameweek?.season === 2025);

    res.status(200).json({ data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch gameweeks" });
  }
};

/**
 * Get single gameweek details
 */
exports.getGameweek = async (req, res) => {
  try {
    const { id } = req.params;

    const gameweek = await Gameweek.findById(id).populate("admin", "username");

    if (!gameweek) {
      return res.status(404).json({ msg: "Gameweek not found" });
    }

    res.status(200).json({ data: gameweek });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete Private Gameweek (Admin only)
 */
exports.deleteGameweek = async (req, res) => {
  try {
    const { id } = req.params;

    const gameweek = await Gameweek.findById(id);

    if (!gameweek) {
      return res.status(404).json({ msg: "Gameweek not found" });
    }

    if (gameweek.type === "GLOBAL") {
      return res.status(403).json({ msg: "Global gameweek cannot be deleted" });
    }

    if (gameweek.admin.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await Gameweek.deleteOne({ _id: id });

    // Remove gameweek from users
    await User.updateMany({}, { $pull: { gameweeks: { gameweekId: id } } });

    res.status(200).json({ msg: "Gameweek deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGameweekMembers = async (req, res) => {
  try {
    const { id } = req.params; // gameweekId

    const users = await User.find({
      "gameweeks.gameweekId": id,
    }).select("username fullName avatar stats");

    res.status(200).json({ data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
