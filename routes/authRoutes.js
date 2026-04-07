const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  loginController,
  registerController,
  userController,
  verifyEmail,
  userProfileController,
  verifyOTPController,
  resendOTPController,
  forgotPasswordController,
  resetPasswordController,
} = require("../controller/authController");

const router = express.Router();

router.post("/register", registerController);
router.get("/verify/:token", verifyEmail);
router.post("/otp", verifyOTPController);
router.post("/resend-otp", resendOTPController);
router.post("/login", loginController);
router.get("/", userController);
router.get("/profile/", authMiddleware, userProfileController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);

module.exports = router;
