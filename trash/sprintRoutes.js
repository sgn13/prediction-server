const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createSprint,
  getSprints,
  deleteSprint,
  updateSprint,
  getSprint,
} = require("../controller/sprintController");

const router = express.Router();

router.post("/", authMiddleware, createSprint);

router.get("/", authMiddleware, getSprints);

router.get("/:id", authMiddleware, getSprint);

router.patch("/:id", authMiddleware, updateSprint);

router.delete("/:id", authMiddleware, deleteSprint);

// router.get('/team-members',authMiddleware,getSprints)

module.exports = router;
