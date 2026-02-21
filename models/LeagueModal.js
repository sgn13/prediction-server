const { default: mongoose } = require("mongoose");
const Mongoose = require("mongoose");

const LeagueSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["GLOBAL", "PRIVATE"],
      required: true,
    },

    // admin: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: function () {
    //     return this.type === "PRIVATE";
    //   },
    // },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (value) {
          if (this.type === "GLOBAL") return value == null;
          return true;
        },
        message: "Global leagues cannot have an admin",
      },
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true, // allows null for GLOBAL league
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    season: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const League = Mongoose.models.League || Mongoose.model("League", LeagueSchema);
module.exports = League;

// [
//   {
//     _id: "65f1a8c0e7a1a1a111111111",
//     name: "Global League",
//     type: "GLOBAL",
//     admin: null,
//     inviteCode: null,
//     membersCount: 12840,
//     isActive: true,
//     createdAt: "2025-01-01T00:00:00.000Z",
//     updatedAt: "2025-01-01T00:00:00.000Z",
//   },
//   {
//     _id: "65f1a9b3e7a1a1a222222222",
//     name: "Friends Premier League",
//     type: "PRIVATE",
//     admin: "65f19f9ae7a1a1a999999999",
//     inviteCode: "PLF2025",
//     membersCount: 6,
//     isActive: true,
//     createdAt: "2025-02-01T10:30:00.000Z",
//     updatedAt: "2025-02-01T10:30:00.000Z",
//   },
// ];
