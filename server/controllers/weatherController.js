// Weather controller for Agro-Meteorological Advisories
// Interacts with OpenWeatherMap via weatherService, keeping credentials secure on the backend.
const { fetchWeatherData } = require("../services/weatherService");

/**
 * Generate targeted agronomic advisory based on environmental metrics and optional crop/disease context.
 */
const generateAgroAdvisories = (current, forecast, dailySummary, crop, disease) => {
    const advisories = [];
    const diseaseAlerts = [];

    const humidity = current.humidity;
    const temp = current.temperature;
    const windSpeed = current.windSpeedKmh;
    const condition = current.mainCondition.toLowerCase();
    const isRainingNow = condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm");

    // Inspect next 24 hours in forecast for rain and prolonged humidity
    const next24h = (forecast || []).slice(0, 8); // 8 slices * 3h = 24h
    const rainExpectedNext24h = next24h.some((f) => (f.pop > 40) || f.mainCondition.toLowerCase().includes("rain"));
    const maxUpcomingRainPop = next24h.length > 0 ? Math.max(...next24h.map((f) => f.pop)) : 0;
    const avgUpcomingHumidity = next24h.length > 0 
        ? Math.round(next24h.reduce((acc, f) => acc + f.humidity, 0) / next24h.length)
        : humidity;

    // 1. Spraying Safety Window Analysis
    let sprayStatus = "OPTIMAL";
    let sprayMessage = "";

    if (isRainingNow) {
        sprayStatus = "UNFAVORABLE";
        sprayMessage = `Active rainfall detected. Avoid all foliar spraying as pesticides and fertilizers will wash off immediately, wasting inputs and contaminating groundwater.`;
    } else if (rainExpectedNext24h && maxUpcomingRainPop >= 60) {
        sprayStatus = "CAUTION";
        sprayMessage = `Precipitation is forecasted within 24 hours (${maxUpcomingRainPop}% probability). Only apply quick-absorbing systemic fungicides or use a non-ionic adjuvant/rain-fast sticker.`;
    } else if (windSpeed > 20) {
        sprayStatus = "UNFAVORABLE";
        sprayMessage = `Wind speed is high at ${windSpeed} km/h (exceeds recommended 15 km/h threshold). Chemical droplet drift risk is elevated. Postpone spraying until early morning or dusk calm.`;
    } else if (windSpeed >= 5 && windSpeed <= 15) {
        sprayStatus = "OPTIMAL";
        sprayMessage = `Calm to moderate breeze (${windSpeed} km/h) with no immediate rainfall. Ideal conditions for uniform foliage coverage and droplet deposition.`;
    } else {
        sprayStatus = "ACCEPTABLE";
        sprayMessage = `Light breeze (${windSpeed} km/h). Suitable for foliar treatments; spray early to avoid rapid droplet evaporation during midday sun.`;
    }

    const sprayWindow = {
        status: sprayStatus,
        windSpeedKmh: windSpeed,
        rainRiskPercent: maxUpcomingRainPop,
        recommendation: sprayMessage
    };

    // 2. Fungal Pathogen Environmental Risk
    if (humidity >= 80 || (humidity >= 70 && rainExpectedNext24h)) {
        advisories.push({
            type: "warning",
            category: "Fungal Disease Outbreak Risk: HIGH",
            details: `Relative humidity is elevated (${humidity}%) with sustained moisture expected (avg ${avgUpcomingHumidity}%). Pathogen spores (Blight, Mildew, Rust, Scab) germinate within 4-8 hours of continuous leaf wetness. Increase spacing, prune dense suckers, and avoid overhead sprinkler irrigation.`
        });
    } else if (humidity >= 60) {
        advisories.push({
            type: "info",
            category: "Fungal Disease Outbreak Risk: MODERATE",
            details: `Humidity is moderate (${humidity}%). Standard growing conditions. Continue scouting lower canopy leaves for initial chlorotic spots or mycelial growth.`
        });
    } else {
        advisories.push({
            type: "success",
            category: "Fungal Disease Outbreak Risk: LOW",
            details: `Dry atmospheric conditions (${humidity}% humidity) inhibit foliar fungal spore germination. Ensure regular root-zone drip irrigation to prevent moisture stress.`
        });
    }

    // 3. Irrigation & Heat Stress Analysis
    if (temp >= 35) {
        advisories.push({
            type: "warning",
            category: "Heat Stress & Evapotranspiration: HIGH",
            details: `Ambient temperature is high (${temp}°C). Soil moisture depletes rapidly. Irrigate during dawn or twilight to minimize evaporative loss and prevent blossom-end rot or flower abortion.`
        });
    } else if (temp <= 10) {
        advisories.push({
            type: "info",
            category: "Low Temperature Alert",
            details: `Temperature is low (${temp}°C). Plant metabolism and transpiration are slow. Reduce irrigation frequency to prevent cold waterlogging and root rot.`
        });
    }

    // 4. Crop & Disease-Specific Agro-Meteorological Correlation
    if (crop && crop !== "Unknown") {
        const cropLower = crop.toLowerCase();
        const diseaseLower = (disease || "").toLowerCase();

        let cropGuidance = null;

        if (diseaseLower.includes("healthy")) {
            cropGuidance = {
                target: `${crop} (Healthy Status)`,
                riskLevel: humidity > 75 ? "MODERATE RISK OF INFECTION" : "LOW RISK",
                action: humidity > 75
                    ? `Current weather conditions (${humidity}% humidity) elevate risk of latent spores developing on ${crop}. Apply preventative bio-fungicide (Trichoderma or copper-based) and ensure proper row aeration.`
                    : `Current weather supports healthy vegetative growth for ${crop}. Maintain balanced N-P-K fertilization and regular soil moisture monitoring.`
            };
        } else if (diseaseLower.includes("scab") || diseaseLower.includes("blight") || diseaseLower.includes("rot") || diseaseLower.includes("rust") || diseaseLower.includes("mildew") || diseaseLower.includes("scorch") || diseaseLower.includes("spot")) {
            const isFungal = !diseaseLower.includes("bacterial");
            const highMoisture = humidity >= 70 || isRainingNow || rainExpectedNext24h;

            cropGuidance = {
                target: `${crop} — ${disease}`,
                riskLevel: highMoisture ? "CRITICAL ENVIRONMENTAL PRESSURE" : "MODERATE PRESSURE",
                action: highMoisture
                    ? `High humidity (${humidity}%) and moisture accelerate the progression of ${disease} in ${crop}. Immediately remove infected foliage. Apply targeted ${isFungal ? "fungicide" : "bactericide"} during the next dry window (${sprayStatus === "OPTIMAL" ? "Now is optimal" : "Wait for favorable spray window"}). Avoid touching plants while wet to prevent spreading spores.`
                    : `Low to moderate humidity (${humidity}%) limits new spore germination for ${disease}. Prune dead tissue and sanitize pruning shears with 70% isopropyl alcohol between cuts.`
            };
        } else if (diseaseLower.includes("mite") || diseaseLower.includes("spider")) {
            const hotDry = temp > 28 && humidity < 50;
            cropGuidance = {
                target: `${crop} — Two-Spotted Spider Mites`,
                riskLevel: hotDry ? "FAVORABLE FOR PEST MULTIPLICATION" : "LOW PEST PRESSURE",
                action: hotDry
                    ? `Hot, dry conditions (${temp}°C, ${humidity}% humidity) trigger rapid mite reproduction. Apply insecticidal soap or neem oil emulsion to the underside of ${crop} leaves, preferably in the late evening.`
                    : `Current conditions do not favor explosive spider mite outbreaks. Continue routine scouting on lower leaf surfaces.`
            };
        } else {
            cropGuidance = {
                target: `${crop} — General Weather Advisory`,
                riskLevel: "GENERAL GUIDANCE",
                action: `Maintain sanitation practices for ${crop}. Monitor weather forecast changes and ensure adequate root zone moisture.`
            };
        }

        if (cropGuidance) {
            diseaseAlerts.push(cropGuidance);
        }
    }

    return {
        advisories,
        sprayWindow,
        diseaseAlerts
    };
};

// GET /api/weather/advisory - Retrieve live weather and agro-meteorological advisory
const getWeatherAdvisory = async (req, res) => {
    try {
        const { city, lat, lon, crop, disease, confidence } = req.query;

        const weatherResult = await fetchWeatherData({ city, lat, lon });

        // Unconfigured fallback
        if (!weatherResult.configured) {
            return res.status(200).json({
                success: true,
                configured: false,
                message: weatherResult.message,
                guidance: {
                    title: "Agro-Meteorological Advisory Principles",
                    metrics: [
                        {
                            parameter: "Relative Humidity (> 80%)",
                            impact: "Prolonged leaf wetness accelerates fungal spore germination (e.g., Late Blight, Downy Mildew, Rust).",
                            recommendation: "Ensure canopy aeration, prune dense lower foliage, and avoid overhead sprinkler watering in late afternoon."
                        },
                        {
                            parameter: "Spraying Window (Wind 5–15 km/h)",
                            impact: "High winds (> 20 km/h) cause chemical spray drift and poor droplet adhesion on crop foliage.",
                            recommendation: "Schedule protective foliar sprays during calm early morning or twilight hours."
                        },
                        {
                            parameter: "Precipitation & Rain Wash-Off",
                            impact: "Rainfall within 2-4 hours of pesticide/fungicide application washes chemicals off into the soil.",
                            recommendation: "Postpone protective spraying until weather is dry or use an appropriate adjuvant sticker."
                        }
                    ]
                }
            });
        }

        const { current, forecast, dailySummary, cached, cacheAgeSeconds, lastUpdated } = weatherResult;

        // Generate tailored agro-meteorological advisories
        const { advisories, sprayWindow, diseaseAlerts } = generateAgroAdvisories(
            current,
            forecast,
            dailySummary,
            crop,
            disease
        );

        return res.status(200).json({
            success: true,
            configured: true,
            cached: !!cached,
            cacheAgeSeconds: cacheAgeSeconds || 0,
            lastUpdated,
            location: `${current.city}, ${current.country}`,
            metrics: {
                temperature: current.temperature,
                feelsLike: current.feelsLike,
                humidity: current.humidity,
                windSpeed: current.windSpeedKmh,
                windDirection: current.windDirectionCardinal,
                pressure: current.pressure,
                condition: current.condition,
                mainCondition: current.mainCondition,
                icon: current.icon,
                sunrise: current.sunrise,
                sunset: current.sunset,
                localTime: current.localTime
            },
            advisories,
            sprayWindow,
            diseaseAlerts,
            forecast: forecast || [],
            dailySummary: dailySummary || [],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Weather advisory error:", error.message);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            configured: true,
            message: error.message || "Unable to retrieve weather data from provider.",
            error: error.message
        });
    }
};

module.exports = {
    getWeatherAdvisory
};
