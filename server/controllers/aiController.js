const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const ScanHistory = require("../models/ScanHistory");

// Extract user ID from the request or JWT token
const extractUserId = (req) => {
    if (req.userId) {
        return req.userId;
    }

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            return decoded.userId || decoded.id || decoded._id || null;
        } catch (error) {
            console.error("Unable to extract user ID from token:", error.message);
            return null;
        }
    }

    return null;
};

// Predict crop disease using the Python AI model
const predictDisease = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No image uploaded. Please upload a crop leaf image."
        });
    }

    const projectRoot = path.join(__dirname, "../..");

    const pythonPath = path.join(
        projectRoot,
        "ai",
        ".venv",
        "Scripts",
        "python.exe"
    );

    const predictScript = path.join(
        projectRoot,
        "ai",
        "predict.py"
    );

    const imagePath = req.file.path;

    if (!fs.existsSync(pythonPath)) {
        return res.status(500).json({
            success: false,
            message: `Python executable not found at: ${pythonPath}. Please verify the virtual environment.`
        });
    }

    if (!fs.existsSync(predictScript)) {
        return res.status(500).json({
            success: false,
            message: `Prediction script not found at: ${predictScript}.`
        });
    }

    const pythonProcess = spawn(
        pythonPath,
        [predictScript, imagePath],
        {
            cwd: projectRoot
        }
    );

    let output = "";
    let errorOutput = "";
    let isTerminated = false;

    // Timeout safety guard (25 seconds) to prevent hanging on OS policy checks
    const timeout = setTimeout(() => {
        isTerminated = true;
        try {
            pythonProcess.kill("SIGKILL");
        } catch (e) {
            // Ignore kill error
        }

        if (!res.headersSent) {
            return res.status(504).json({
                success: false,
                message: "AI prediction process timed out. On Windows systems with Smart App Control enabled, unsigned TensorFlow binary files may be blocked or delayed."
            });
        }
    }, 120000);

    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on("error", (error) => {
        clearTimeout(timeout);
        if (isTerminated) return;

        console.error("Failed to start Python process:", error.message);

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: `Could not start the AI prediction process: ${error.message}`
            });
        }
    });

    pythonProcess.on("close", async (code) => {
        clearTimeout(timeout);
        if (isTerminated) return;

        if (code !== 0) {
            console.error("AI prediction error (code " + code + "):", errorOutput);

            let friendlyMessage = "AI prediction failed. Check the Python environment and model.";

            if (errorOutput.includes("Application Control policy has blocked this file") ||
                errorOutput.includes("WinError 4551") ||
                errorOutput.includes("_pywrap_tensorflow_internal.pyd")) {
                friendlyMessage = "TensorFlow binary was blocked by Windows Application Control / Smart App Control policy (WinError 4551: unsigned file _pywrap_tensorflow_internal.pyd).";
            } else if (errorOutput.trim().length > 0) {
                // Return clean diagnostic snippet without crashing server
                const firstErrorLine = errorOutput.trim().split("\n").pop();
                friendlyMessage = `AI prediction script error: ${firstErrorLine}`;
            }

            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: friendlyMessage,
                    diagnostic: errorOutput.trim() || undefined
                });
            }

            return;
        }

        try {
            const result = JSON.parse(output.trim());

            // Relative URL for displaying the uploaded image
            const relativeImageUrl = `/uploads/${path.basename(req.file.path)}`;
            result.imagePath = relativeImageUrl;
            result.imageUrl = relativeImageUrl;

            // Save scan history for authenticated users (only for valid predictions)
            const userId = extractUserId(req);

            if (userId && result.success && result.status !== "UNSUPPORTED") {
                try {
                    const savedRecord = await ScanHistory.create({
                        user: userId,
                        imagePath: relativeImageUrl,
                        imageUrl: relativeImageUrl,
                        prediction: result.prediction || "Unknown",
                        crop: result.crop || "Unknown",
                        disease: result.disease || "Unknown",
                        confidence: result.confidence || 0,
                        status: result.status || "HIGH CONFIDENCE",
                        statusMessage: result.statusMessage || "",
                        speciesConfidence: result.speciesConfidence || 0,
                        topCandidates: result.topCandidates || [],
                        recommendation: result.recommendation || {},
                        treatment: result.recommendation?.action || "",
                        prevention: result.recommendation?.prevention || "",
                        symptoms: result.symptoms || result.recommendation?.symptoms || "",
                        nextSteps: result.nextSteps || result.recommendation?.nextSteps || ""
                    });

                    result.historyId = savedRecord._id;
                } catch (dbError) {
                    console.error("Error saving scan history to MongoDB:", dbError.message);
                }
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error("Invalid AI response JSON:", output, error.message);

            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: "Invalid response from the AI model.",
                    rawOutput: output.trim() || undefined
                });
            }
        }
    });
};

// Retrieve the logged-in user's previous disease scans
const getScanHistory = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not identified. Authentication required."
            });
        }

        // Search by user field (or legacy userId field)
        const history = await ScanHistory.find({
            $or: [{ user: userId }, { userId }]
        })
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json({
            success: true,
            count: history.length,
            history
        });

    } catch (error) {
        console.error("Error fetching scan history:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve scan history."
        });
    }
};

// Delete a single scan history item belonging to the authenticated user
const deleteScanHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const scanId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (!scanId) {
            return res.status(400).json({
                success: false,
                message: "Scan ID is required."
            });
        }

        const deletedScan = await ScanHistory.findOneAndDelete({
            _id: scanId,
            $or: [{ user: userId }, { userId }]
        });

        if (!deletedScan) {
            return res.status(404).json({
                success: false,
                message: "Scan record not found or you do not have permission to delete it."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Scan history entry deleted successfully.",
            id: scanId
        });

    } catch (error) {
        console.error("Error deleting scan history entry:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete scan history entry."
        });
    }
};

// Export controller functions
module.exports = {
    predictDisease,
    getScanHistory,
    deleteScanHistory
};