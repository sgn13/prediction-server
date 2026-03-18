const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  loginController,
  registerController,
  userController,
  verifyEmail,
  userProfileController,
  verifyOTPController,
} = require("../controller/authController");

const router = express.Router();

router.post("/register", registerController);
router.get("/verify/:token", verifyEmail);
router.post("/otp", verifyOTPController);
router.post("/login", loginController);
router.get("/", userController);
router.get("/profile/", authMiddleware, userProfileController);

module.exports = router;
