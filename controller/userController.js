const UserModal = require("../models/UserModal");
const League = require("../models/LeagueModal");

const createUser = async (req, res, next) => {
  try {
    const { name, user_url, color } = req.body;
    if (!name) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }
    req.body.created_by = req.user;

    const user = await UserModal.create(req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await UserModal.find();

    res.status(200).json({ total: users?.length, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await UserModal.find({ _id: id });

    res.status(200).json({ data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, user_url, color } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    req.body.created_by = req.user;

    const user = await UserModal.findOne({ _id: id });

    if (!user) {
      next(`No user found with this ID ${id}`);
    }

    if (!req.user.userId === user.created_by.toString()) {
      next(`You're not authorize to delete this user`);
      return;
    }

    const updateUser = await UserModal.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ total: updateUser?.length, data: updateUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await UserModal.findOne({ _id: id });

    if (!user) {
      next(`No user found with this ID ${id}`);
    }

    if (!req.user.userId === user.created_by.toString()) {
      next(`You're not authorize to delete this user`);
      return;
    }

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createUser, getUsers, deleteUser, updateUser, getUser };
