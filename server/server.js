const express = require("express");
const cors = require("cors");
const path = require("path");
// Explicitly load .env from the server directory, then project root fallback
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect Database
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/scan", require("./routes/scanRoutes"));
app.use("/api/weather", require("./routes/weatherRoutes"));

// Base Test Route
app.get("/", (req, res) => {
    res.send("Crop Disease Detection API is running!");
});

// Health-Check Endpoint
app.get(["/api/health", "/health"], (req, res) => {
    const mongoState = mongoose.connection.readyState;
    const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
    res.status(200).json({
        success: true,
        status: "ok",
        uptime: Math.floor(process.uptime()),
        database: states[mongoState] || "unknown",
        timestamp: new Date().toISOString()
    });
});

// Protected Test Route
app.get("/api/auth/protected", authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "You have accessed a protected route.",
        userId: req.userId
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format in request body."
        });
    }

    console.error("Unhandled error:", err.message);

    return res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});