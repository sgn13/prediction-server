const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const leagueRoutes = require("./routes/leagueRoutes");
const userRoutes = require("./routes/userRoutes");
const leagueMemberRoutes = require("./routes/leagueMemberRoutes");
const fixtureRoutes = require("./routes/fixtureRoutes");
const gameweekRoutes = require("./routes/gameweekRoutes");
const axios = require("axios");
const Gameweek = require("./models/GameweekModal");
const Fixture = require("./models/FixtureModal");
const { fetchFixturesFromApi } = require("./services/apiFootballServices");
const { storeApiFixtures } = require("./controller/fixtureController");

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());

const mongoURI = "mongodb://localhost:27017/prediction-db";

app.use("/api/v1", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/league", leagueRoutes);
app.use("/api/v1/league", leagueMemberRoutes);
app.use("/api/v1/fixture", fixtureRoutes);
app.use("/api/v1/gameweek", gameweekRoutes);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "Fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

const API_KEY = "7ace331b4f8fce01db479ea8d7eeec3e";
const API_BASE = "https://v3.football.api-sports.io";

// async function fetchGameweeks(leagueId, season) {
//   try {
//     const { data } = await axios.get(`${API_BASE}/fixtures/rounds`, {
//       params: { league: leagueId, season },
//       headers: { "x-apisports-key": API_KEY },
//     });

//     const rounds = data.response; // array of strings like "Regular Season - 25"

//     for (const roundName of rounds) {
//       // extract number from "Regular Season - 25"
//       const match = roundName.match(/\d+/);
//       const roundNumber = match ? Number(match[0]) : 1;

//       // upsert gameweek
//       await Gameweek.findOneAndUpdate(
//         { api_football_league_id: leagueId, season, round_number: roundNumber },
//         {
//           round_name: roundName,
//           api_football_league_id: leagueId,
//           season,
//           round_number: roundNumber,
//         },
//         { upsert: true, new: true },
//       );
//     }

//     console.log("Gameweeks synced ✅");
//   } catch (err) {
//     console.error("Error fetching gameweeks:", err.response?.data || err.message);
//   }
// }

// // Usage
// fetchGameweeks(39, 2024);

// async function fetchFixturesForGameweek(leagueId, season, roundName) {
//   try {
//     const { data } = await axios.get(`${API_BASE}/fixtures`, {
//       // params: { league: leagueId, season },
//       params: { date: "2026-02-23" },

//       headers: { "x-apisports-key": API_KEY },
//     });

//     const fixtures = data.response;

//     console.log({ data });

//     for (const f of fixtures) {
//       const gameweekNumberMatch = roundName.match(/\d+/);
//       const roundNumber = gameweekNumberMatch ? Number(gameweekNumberMatch[0]) : 1;

//       // get or create gameweek
//       const gameweek = await Gameweek.findOne({
//         api_football_league_id: leagueId,
//         season,
//         round_number: roundNumber,
//       });

//       if (!gameweek) continue;

//       const fixtureData = {
//         api_football_fixture_id: f.fixture.id,
//         api_football_league_id: leagueId,
//         season,
//         gameweek_id: gameweek._id,
//         home_team_name: f.teams.home.name,
//         away_team_name: f.teams.away.name,
//         kickoff_at: f.fixture.date,
//         status_short: f.fixture.status.short,
//         home_score: f.goals.home ?? 0,
//         away_score: f.goals.away ?? 0,
//       };

//       console.log({ fixtureData });

//       await Fixture.findOneAndUpdate({ api_football_fixture_id: f.fixture.id }, fixtureData, {
//         upsert: true,
//         new: true,
//       });
//     }

//     console.log(`Fixtures synced for ${roundName} ✅`);
//   } catch (err) {
//     console.error("Error fetching fixtures:", err.response?.data || err.message);
//   }
// }

const fetchAndStoreFixturesManually = async () => {
  try {
    // Example: leagues you want to fetch manually
    const leagues = [
      { id: 39, season: 2025 }, // Premier League
      // { id: 140, season: 2025 }, // La Liga
    ];

    for (const league of leagues) {
      console.log(`Fetching fixtures for league ${league.id} season ${league.season}`);
      const apiResponse = await fetchFixturesFromApi(league.id, league.season);
      console.log({ apiResponse }, "==========>>>>");
      if (apiResponse.length > 0) {
        await storeApiFixtures(apiResponse);
      }
    }

    console.log("Manual fixture fetch complete!");
  } catch (err) {
    console.error("Error fetching fixtures manually:", err.message);
  }
};

// fetchAndStoreFixturesManually();

// Usage
// fetchFixturesForGameweek(39, 2025, "Regular Season - 26");

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
