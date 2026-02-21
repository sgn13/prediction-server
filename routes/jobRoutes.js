const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createJob,
  getJobs,
  deleteJob,
  updateJob,
  getJob,
  applyToJob,
} = require("../controller/jobController");

const router = express.Router();

router.post("/", authMiddleware, createJob);

router.get("/", authMiddleware, getJobs);

router.get("/:id", authMiddleware, getJob);

router.patch("/:id", authMiddleware, updateJob);

router.delete("/:id", authMiddleware, deleteJob);

router.post("/:jobId/apply", authMiddleware, applyToJob);

module.exports = router;
