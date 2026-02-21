const { default: mongoose } = require("mongoose");
const SprintModal = require("../models/SprintModal");

const createSprint = async (req, res, next) => {
  try {
    const { name, workspace_id } = req.body;
    if (!workspace_id) {
      return res.status(400).json({ msg: "Id is missing" });
    }
    if (!name) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    const sprint = new SprintModal({ name, workspace_id });
    const savedSprint = await sprint.save();

    res.status(201).json({ data: savedSprint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSprints = async (req, res, next) => {
  try {
    const { status, priority, workspace_id, assignee } = req.query;

    const queryObject = {};
    if (status) {
      queryObject.status = { $in: status.split(",") };
    }
    if (priority) {
      queryObject.priority = { $in: priority.split(",") };
    }

    if (assignee) {
      queryObject.assignee = { $in: assignee.split(",") };
    }
    if (workspace_id) {
      queryObject.workspace_id = workspace_id;
    }

    let queryResult = SprintModal.find(queryObject);

    const page = Number(req.query.page) || 1;
    const size = Number(req.query.size) || 10;
    const skip = (page - 1) * size;

    const total = await SprintModal.countDocuments(queryResult);

    queryResult = queryResult.skip(skip).limit(size);

    const pageCount = Math.ceil(total / size);

    const sprints = await queryResult;

    res.status(200).json({ data: sprints, size, page, pages: pageCount, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSprint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sprint = await SprintModal.find({ _id: id }).populate("users");

    res.status(200).json({ data: sprint[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSprint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sprint_url, color, users } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }
    // req.body.created_by = req.user

    const sprint = await SprintModal.findOne({ _id: id });

    if (!sprint) {
      next(`No sprint found with this ID ${id}`);
    }

    // if(!req.user.userId ===sprint.created_by.toString()){
    //   next(`You're not authorize to delete this sprint`)
    //   return
    // }

    // Perform the update
    const updateSprint = await SprintModal.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ total: updateSprint?.length, data: updateSprint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteSprint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sprint = await SprintModal.findOne({ _id: id });

    if (!sprint) {
      next(`No sprint found with this ID ${id}`);
    }

    if (!req.user.userId === sprint.created_by.toString()) {
      next(`You're not authorize to delete this sprint`);
      return;
    }

    await sprint.deleteOne();

    res.status(200).json({ message: "Sprint deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSprintStats = async (req, res, next) => {
  try {
    const { workspace_id } = req.query;

    const stats = await SprintModal.aggregate([
      {
        $match: {
          workspace_id: new mongoose.Types.ObjectId(workspace_id),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const defaultStats = stats.reduce(
      (acc, stat) => {
        acc[stat._id] = stat.count; // Map each status to its count
        return acc;
      },
      { pending: 0, completed: 0, in_progress: 0 },
    );

    res.status(200).json({ statistics: defaultStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSprint,
  getSprints,
  getSprint,
  updateSprint,
  deleteSprint,
  getSprintStats,
};
