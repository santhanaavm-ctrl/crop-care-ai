const express = require("express");
const router = express.Router();
const { getWeatherAdvisory } = require("../controllers/weatherController");

// GET /api/weather/advisory - Get agro-meteorological advisory
router.get("/advisory", getWeatherAdvisory);

module.exports = router;
