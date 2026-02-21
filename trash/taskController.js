const { default: mongoose } = require("mongoose");
const TaskModal = require("../models/taskModal");
const APIFeatures = require("../utils/apiFeatures");

exports.aliasTopTasks = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price";
  req.query.fields = "name,price";
  next();
};

exports.createTask = async (req, res, next) => {
  try {
    const {
      name,
      workspace_id,
      sprint,
      description,
      color,
      status,
      priority,
      assignee,
      assignor,
      start_date,
      end_date,
    } = req.body;
    if (!workspace_id) {
      return res.status(400).json({ msg: "Id is missing" });
    }

    if (!name) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    if (req.user) {
      req.body.created_by = req.user;
      req.body.assignor = req.user;
    } else {
      return res.status(400).json({ msg: "Assignor is missing" });
    }

    const task = new TaskModal({
      name,
      description,
      color,
      workspace_id,
      sprint,
      status,
      priority,
      assignee,
      assignor: req.body.assignor,
      created_by: req.body.created_by,
      start_date,
      end_date,
    });
    const savedTask = await task.save();

    res.status(201).json({ data: savedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    // const queryObj = { ...req.query };
    // const excludedFields = ["page", "sort", "limit", "fields"];

    // excludedFields.forEach((el) => delete queryObj[el]);

    // // const queryObject = {};
    // // if (status) {
    // //   queryObject.status = { $in: status.split(",") };
    // // }
    // // if (priority) {
    // //   queryObject.priority = { $in: priority.split(",") };
    // // }

    // // if (assignee) {
    // //   queryObject.assignee = { $in: assignee.split(",") };
    // // }
    // // if (sprint) {
    // //   queryObject.sprint = { $in: sprint.split(",") };
    // // }
    // // if (workspace_id) {
    // //   queryObject.workspace_id = workspace_id;
    // // }

    // let queryResult = TaskModal.find(queryObj).populate("assignee");

    // 2) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(",").join(" ");
    //   queryResult = queryResult.sort(sortBy);
    // } else {
    //   queryResult = queryResult.sort("-createdAt");
    // }

    // 3) Field Limiting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(",").join(" ");
    //   queryResult = queryResult.select(fields);
    // } else {
    //   queryResult = queryResult.select("-__v");
    // }

    // 3) Pagination

    // const page = Number(req.query.page) || 1;
    // const limit = Number(req.query.limit) || 10;
    // const skip = (page - 1) * limit;

    // queryResult = queryResult.skip(skip).limit(limit);

    // const pageCount = Math.ceil(total / limit);

    // if (req.query.page) {
    //   var total = await TaskModal.countDocuments(queryResult);
    //   if (skip > total) throw new Error("This page doesnot exist");
    // }

    // 1) Filtering

    const features = new APIFeatures(TaskModal.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tasks = await features.query;

    res.status(200).json({ data: tasks, limit, page, pages: pageCount, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await TaskModal.find({ _id: id }).populate("users");

    res.status(200).json({ data: task[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, task_url, color, users } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }
    // req.body.created_by = req.user

    const task = await TaskModal.findOne({ _id: id });

    if (!task) {
      next(`No task found with this ID ${id}`);
    }

    // if(!req.user.userId ===task.created_by.toString()){
    //   next(`You're not authorize to delete this task`)
    //   return
    // }

    // Perform the update
    const updateTask = await TaskModal.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ total: updateTask?.length, data: updateTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await TaskModal.findOne({ _id: id });

    if (!task) {
      next(`No task found with this ID ${id}`);
    }

    if (!req.user.userId === task.created_by.toString()) {
      next(`You're not authorize to delete this task`);
      return;
    }

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
