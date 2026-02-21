const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getUsers, getUser } = require("../controller/userController");

const router = express.Router();

router.get("/", authMiddleware, getUsers);

router.get("/:id", authMiddleware, getUser);

module.exports = router;
