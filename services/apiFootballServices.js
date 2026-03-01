const axios = require("axios");
// require("dotenv").config();

/**
 * Fetch fixtures from API-Football
 * @param {Number} leagueId - API league ID
 * @param {Number} season - Season year, e.g., 2025
 * @returns {Array} Array of fixtures
 */
const fetchFixturesFromApi = async (leagueId, season) => {
  try {
    const response = await axios.get("https://v3.football.api-sports.io/fixtures", {
      params: { date: "2026-02-28" },
      headers: { "x-apisports-key": "7ace331b4f8fce01db479ea8d7eeec3e" },
    });
    console.log({ response });

    // API response has the fixtures inside response.data.response
    return response.data.response;
  } catch (err) {
    console.error("Error fetching fixtures:", err.message);
    return [];
  }
};

module.exports = { fetchFixturesFromApi };
