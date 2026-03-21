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
    const response = await axios.get("https://api.football-data.org/v4/matches", {
      params: {
        competitions: "2021",
        dateFrom: "2026-03-20",
        dateTo: "2026-03-30",
      },
      headers: { "X-Auth-Token": "8dc5c264c4fa44a4aecd28169e5f3605" },
    });

    // API response has the fixtures inside response.data.response
    return response;
  } catch (err) {
    console.error("Error fetching fixtures:", err.message);
    return [];
  }
};

module.exports = { fetchFixturesFromApi };
