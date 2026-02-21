const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModal");
const League = require("../models/LeagueModal");
const LeagueMember = require("../models/LeagueMemberModal");
const crypto = require("crypto");

const nodemailer = require("nodemailer");

async function sendVerificationEmail(email, token) {
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

  const url = `http://localhost:5173/verify/${token}`;
  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Verify your account",
    html: `<h1>Welcome!</h1><p>Click <a href="${url}">here</a> to verify your account.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, "yourSecretKey");

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).send("Invalid link");

    user.isVerified = true;
    user.verificationToken = null; // Clear the token after verification
    await user.save();

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
    const newToken = jwt.sign({ email: user.email }, "yourSecretKey", { expiresIn: "1h" });

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
    // const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationToken = jwt.sign({ email }, "yourSecretKey", { expiresIn: "1h" });

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      full_name,
    });
    const savedUser = await newUser.save();

    // 2️⃣ Attach GLOBAL league
    const globalLeague = await League.findOne({ type: "GLOBAL" });

    if (!globalLeague) {
      return res.status(500).json({ msg: "Global league not found" });
    }

    // 3️⃣ Create LeagueMember entry
    await LeagueMember.create({
      userId: savedUser._id,
      leagueId: globalLeague._id,
      role: "MEMBER",
    });

    sendVerificationEmail(email, verificationToken); // Define this function

    res.json(savedUser);
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
};
