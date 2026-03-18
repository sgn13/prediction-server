const Mongoose = require("mongoose");
const UserSchema = new Mongoose.Schema({
  full_name: {
    type: String,
    unique: false,
    required: false,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
});

const User = Mongoose.models.user || Mongoose.model("User", UserSchema);
module.exports = User;
