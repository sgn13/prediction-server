const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createNurseProfile,
  getNurseProfiles,
  deleteNurseProfile,
  updateNurseProfile,
  getNurseProfile,
} = require("../controller/nurseProfileController");

const router = express.Router();

router.post("/", authMiddleware, createNurseProfile);

router.get("/", authMiddleware, getNurseProfiles);

router.get("/:id", authMiddleware, getNurseProfile);

router.patch("/:id", authMiddleware, updateNurseProfile);

router.delete("/:id", authMiddleware, deleteNurseProfile);

module.exports = router;
