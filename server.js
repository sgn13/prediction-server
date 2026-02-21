const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const leagueRoutes = require("./routes/leagueRoutes");
const userRoutes = require("./routes/userRoutes");
const leagueMemberRoutes = require("./routes/leagueMemberRoutes");

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());

const mongoURI = "mongodb://localhost:27017/prediction-db";

app.use("/api/v1", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/league", leagueRoutes);
app.use("/api/v1/league", leagueMemberRoutes);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "Fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

async function connectMongoDB() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to local MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectMongoDB();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
