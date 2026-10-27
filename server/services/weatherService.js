// Weather Service for OpenWeatherMap integration with in-memory caching,
// input validation, request timeout, and forecast retrieval.

const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Convert degrees to cardinal compass direction
const getCardinalDirection = (deg) => {
    if (deg == null) return "N/A";
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round((deg % 360) / 22.5) % 16;
    return directions[index];
};

// Format seconds offset into a readable local time string
const formatLocalTime = (utcSeconds, timezoneOffsetSeconds) => {
    const date = new Date((utcSeconds + timezoneOffsetSeconds) * 1000);
    return date.toUTCString().replace("GMT", "");
};

// Fetch current weather and 5-day / 3-hour forecast from OpenWeatherMap
const fetchWeatherData = async ({ city, lat, lon }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_openweather_api_key_here") {
        return {
            configured: false,
            message: "OpenWeatherMap API key is not configured. Add OPENWEATHER_API_KEY to server/.env to enable live agro-meteorological updates."
        };
    }

    // Input validation
    let queryParam = "";
    let cacheKey = "";

    if (lat != null && lon != null) {
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);
        if (isNaN(parsedLat) || isNaN(parsedLon) || parsedLat < -90 || parsedLat > 90 || parsedLon < -180 || parsedLon > 180) {
            throw new Error("Invalid latitude or longitude coordinates provided.");
        }
        queryParam = `lat=${parsedLat}&lon=${parsedLon}`;
        cacheKey = `coord:${parsedLat.toFixed(2)},${parsedLon.toFixed(2)}`;
    } else if (city) {
        const cleanCity = city.trim();
        if (!/^[a-zA-Z\s,.-]{2,60}$/.test(cleanCity)) {
            throw new Error("Invalid city name format. Please enter a valid location name.");
        }
        queryParam = `q=${encodeURIComponent(cleanCity)}`;
        cacheKey = `city:${cleanCity.toLowerCase()}`;
    } else {
        queryParam = "q=Salem";
        cacheKey = "city:salem";
    }

    // Check in-memory cache
    const now = Date.now();
    const cachedItem = cache.get(cacheKey);
    if (cachedItem && (now - cachedItem.timestamp) < CACHE_TTL_MS) {
        return {
            ...cachedItem.data,
            cached: true,
            cacheAgeSeconds: Math.floor((now - cachedItem.timestamp) / 1000),
            lastUpdated: new Date(cachedItem.timestamp).toISOString()
        };
    }

    // Fetch current weather and forecast in parallel with 8s timeout
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?${queryParam}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${queryParam}&units=metric&appid=${apiKey}`;

    const fetchWithTimeout = async (url) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
            const resp = await fetch(url, { signal: controller.signal });
            const data = await resp.json();
            if (!resp.ok) {
                const err = new Error(data.message || `Weather service responded with status ${resp.status}`);
                err.statusCode = resp.status;
                throw err;
            }
            return data;
        } finally {
            clearTimeout(timeout);
        }
    };

    const [currentData, forecastData] = await Promise.all([
        fetchWithTimeout(currentUrl),
        fetchWithTimeout(forecastUrl)
    ]);

    // Parse Current Weather
    const tzOffset = currentData.timezone || 0;
    const currentMetrics = {
        city: currentData.name,
        country: currentData.sys?.country || "",
        coordinates: {
            lat: currentData.coord?.lat,
            lon: currentData.coord?.lon
        },
        temperature: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        tempMin: Math.round(currentData.main.temp_min),
        tempMax: Math.round(currentData.main.temp_max),
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        windSpeedKmh: Math.round((currentData.wind.speed || 0) * 3.6),
        windSpeedMs: Number((currentData.wind.speed || 0).toFixed(1)),
        windDirectionDeg: currentData.wind.deg,
        windDirectionCardinal: getCardinalDirection(currentData.wind.deg),
        rainLast1hMm: currentData.rain?.["1h"] || 0,
        rainLast3hMm: currentData.rain?.["3h"] || 0,
        condition: currentData.weather?.[0]?.description || "Clear",
        mainCondition: currentData.weather?.[0]?.main || "Clear",
        icon: currentData.weather?.[0]?.icon || "01d",
        sunrise: new Date(currentData.sys.sunrise * 1000).toISOString(),
        sunset: new Date(currentData.sys.sunset * 1000).toISOString(),
        localTime: formatLocalTime(currentData.dt, tzOffset),
        timezoneOffsetSeconds: tzOffset
    };

    // Parse Forecast items (next 5 days, 3-hour slices)
    const forecastItems = (forecastData.list || []).map((item) => ({
        timestamp: new Date(item.dt * 1000).toISOString(),
        dtTxt: item.dt_txt,
        localTime: formatLocalTime(item.dt, tzOffset),
        temp: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        humidity: item.main.humidity,
        windSpeedKmh: Math.round((item.wind?.speed || 0) * 3.6),
        pop: Math.round((item.pop || 0) * 100), // Probability of precipitation %
        rainMm: item.rain?.["3h"] || 0,
        condition: item.weather?.[0]?.description || "Clear",
        mainCondition: item.weather?.[0]?.main || "Clear",
        icon: item.weather?.[0]?.icon || "01d"
    }));

    // Group daily summaries
    const dailyMap = new Map();
    for (const item of forecastItems) {
        const dateKey = item.dtTxt.split(" ")[0];
        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, {
                date: dateKey,
                temps: [],
                humidities: [],
                pops: [],
                rains: [],
                conditions: []
            });
        }
        const day = dailyMap.get(dateKey);
        day.temps.push(item.temp);
        day.humidities.push(item.humidity);
        day.pops.push(item.pop);
        day.rains.push(item.rainMm);
        day.conditions.push(item.condition);
    }

    const dailySummary = Array.from(dailyMap.values()).slice(0, 5).map((d) => ({
        date: d.date,
        tempMin: Math.min(...d.temps),
        tempMax: Math.max(...d.temps),
        avgHumidity: Math.round(d.humidities.reduce((a, b) => a + b, 0) / d.humidities.length),
        maxRainPop: Math.max(...d.pops),
        totalRainMm: Number(d.rains.reduce((a, b) => a + b, 0).toFixed(1)),
        dominantCondition: d.conditions[Math.floor(d.conditions.length / 2)] || "Variable"
    }));

    const result = {
        configured: true,
        cached: false,
        lastUpdated: new Date().toISOString(),
        current: currentMetrics,
        forecast: forecastItems.slice(0, 12), // Next 36 hours in 3h slices
        dailySummary
    };

    // Store in cache
    cache.set(cacheKey, { timestamp: now, data: result });

    return result;
};

module.exports = {
    fetchWeatherData,
    getCardinalDirection
};
