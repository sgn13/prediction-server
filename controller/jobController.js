// const { default: mongoose } = require("mongoose");
const JobModal = require("../models/jobModal");
const UserModal = require("../models/userModal");
const APIFeatures = require("../utils/apiFeatures");

exports.aliasTopJobs = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price";
  req.query.fields = "name,price";
  next();
};

exports.createJob = async (req, res, next) => {
  try {
    const { title, description, location, status, pay_rate, requirements } = req.body;

    // const genre = await Genre.findById(genre_id);

    // if (!genre) {
    //   return res.status(404).json({ message: 'Genre not found' });
    // }

    // const genres = await GenreModal.find({ _id: { $in: genre_id } });
    // if (genres.length !== genre_id.length) {
    //   return res.status(404).json({ message: "One or more genres not found" });
    // }

    const user_id = req.user.id; // Extract user_id from decoded token

    const job = new JobModal({
      user_id,
      title,
      description,
      location,
      status,
      pay_rate,
      requirements,
    });

    const savedJob = await job.save();

    res.status(201).json({ data: savedJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const query = JobModal.find();

    // Apply genre filtering if a genre is provided
    // if (genre) {
    //   query.where("genre_id").in([genre]); // Filter by genre (array support)
    // }

    const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();

    const jobs = await features.query.populate("user_id");

    res.status(200).json({ data: jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await JobModal.find({ _id: id }).populate("applicants", "email");
    res.status(200).json({ data: job[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, job_url, color, users } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }
    // req.body.created_by = req.user

    const job = await JobModal.findOne({ _id: id });

    if (!job) {
      next(`No job found with this ID ${id}`);
    }

    // if(!req.user.user_id ===job.created_by.toString()){
    //   next(`You're not authorize to delete this job`)
    //   return
    // }

    // Perform the update
    const updateJob = await JobModal.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ total: updateJob?.length, data: updateJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await JobModal.findOne({ _id: id });

    if (!job) {
      next(`No job found with this ID ${id}`);
    }

    if (!req.user.user_id === job.created_by.toString()) {
      next(`You're not authorize to delete this job`);
      return;
    }

    await job.deleteOne();

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const nurseId = req.user; // assuming you're using auth middleware

    // Optional: check if the user is a nurse
    const user = await UserModal.findById(nurseId);
    if (!user || !user.is_nurse) {
      return res.status(403).json({ message: "Only nurses can apply to jobs" });
    }

    // Update job with the applicant
    const result = await JobModal.findByIdAndUpdate(jobId, {
      $addToSet: { applicants: nurseId }, // avoids duplicates
    });

    return res.status(200).json({ message: "Applied successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
