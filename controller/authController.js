const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModal");
const League = require("../models/LeagueModal");
const LeagueMember = require("../models/LeagueMemberModal");
const crypto = require("crypto");

const nodemailer = require("nodemailer");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const addUserToGlobalLeague = async (userId) => {
  const globalLeague = await League.findOne({ type: "GLOBAL" });

  if (!globalLeague) {
    throw new Error("Global league not found");
  }

  // Prevent duplicate entry
  const existing = await LeagueMember.findOne({
    userId,
    leagueId: globalLeague._id,
  });

  if (!existing) {
    await LeagueMember.create({
      userId,
      leagueId: globalLeague._id,
      role: "MEMBER",
    });
  }
};

async function sendVerificationEmail(email, verificationToken, otp) {
  // const transporter = nodemailer.createTransport({
  //   service: "Gmail", // or your preferred email service
  //   auth: {
  //     user: "your-email@gmail.com",
  //     pass: "your-email-password",
  //   },
  // });

  // Looking to send emails in production? Check out our Email API/SMTP product!
  var transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "4fcc385c0570ee",
      pass: "46764876832bd2",
    },
  });

  const url = `http://localhost:5173/verify/${verificationToken}`;
  const mailOptions = {
    from: "crazyprediction@gmail.com",
    to: email,
    subject: "Verify your account",
    html: `
  <h1>Welcome!</h1>
  <p>We're excited to have you on board.</p>
  <p>Please click <a href="${url}">here</a> to verify your account.</p>
  <p>Or use the verification code below:</p>
  <h2>${otp}</h2>
  <p>This code will expire in 10 minutes.</p>
  <p>If you didn’t create this account, you can safely ignore this email.</p>
`,
  };

  await transporter.sendMail(mailOptions);
}

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, "CRazyPred102");

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).send("Invalid link");

    user.isVerified = true;
    user.verificationToken = null; // Clear the token after verification
    await user.save();
    await addUserToGlobalLeague(user._id);

    res.status(200).send("Email verified. You can now log in.");
  } catch (err) {
    res.status(400).json({ msg: "Invalid or expired link" });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send("User not found");
    if (user.isVerified) return res.status(400).send("Account is already verified");

    // Generate a new verification token
    const newToken = jwt.sign({ email: user.email }, "CRazyPred102", { expiresIn: "1h" });

    // Update the user's verificationToken in the database
    user.verificationToken = newToken;
    await user.save();

    // Send the new token via email
    await sendVerificationEmail(user.email, newToken);

    res.status(200).send("Verification email sent again. Please check your inbox.");
  } catch (err) {
    res.status(500).send("An error occurred while resending verification email.");
  }
};

const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: "Already verified" });
    }

    if (user.verificationCode !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    res.json({ msg: "Email verified successfully (OTP)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resendOTPController = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ msg: "User not found" });

  const otp = generateOTP();

  user.verificationCode = otp;
  user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  const token = generateVerificationToken(email);
  const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  await sendVerificationEmail(email, otp, verificationLink);

  res.json({ msg: "OTP resent successfully" });
};

const registerController = async (req, res) => {
  try {
    const { email, password, confirm_password, full_name, username } = req.body;
    if (!email || !password || !username || !confirm_password) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password should be at least 6 characters" });
    }
    if (confirm_password !== password) {
      return res.status(400).json({ msg: "Both the passwords don't match" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with the same email already exists" });
    }
    const hashedPassword = await bcryptjs.hash(password, 8);

    // 🔥 Generate OTP
    const otp = generateOTP();
    // const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationToken = jwt.sign({ email }, "CRazyPred102", { expiresIn: "10m" });

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      full_name,
      verificationCode: otp,
      verificationCodeExpires: Date.now() + 10 * 60 * 1000, // 10 min
    });
    const savedUser = await newUser.save();

    sendVerificationEmail(email, verificationToken, otp); // Define this function

    res.status(200).json({ msg: "Please check your email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ msg: "User with this email does not exist" });
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ msg: "Incorrect password." });
    }
    if (!user.isVerified)
      return res.status(400).send({ msg: "User with this email is not verified" });

    const token = jwt.sign({ id: user._id }, "passwordKey");

    res.json({
      success: true,
      message: "Logged in successfully",
      data: {
        access: token,
        user: { id: user._id, username: user.username },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const userController = async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    username: user.username,
    id: user._id,
  });
};

const userProfileController = async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    success: true,
    message: "",
    data: {
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user?.is_nurse ? "nurse" : "client",
      id: user._id,
    },
  });
};

module.exports = {
  registerController,
  loginController,
  userController,
  verifyEmail,
  resendVerification,
  userProfileController,
  verifyOTPController,
  resendOTPController,
};
