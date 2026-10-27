const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { predictDisease, getScanHistory, deleteScanHistory } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

// Configure disk storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },

    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        const ext = path.extname(file.originalname).toLowerCase();

        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;

    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, JPG, and PNG image files are allowed."));
    }
};

// Multer configuration
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter,
});


// ==========================================
// POST /api/scan/upload
// ==========================================
router.post("/upload", (req, res) => {

    upload.single("image")(req, res, (err) => {

        if (err) {

            if (err instanceof multer.MulterError) {

                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        message: "File size exceeds 5 MB limit.",
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }

            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }


        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "No image file provided. Please upload an image using the 'image' field.",
            });
        }


        return res.status(200).json({
            success: true,
            message: "Image uploaded successfully.",
            file: {
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype,
            },
        });

    });

});


// ==========================================
// POST /api/scan/predict
// ==========================================
router.post("/predict", (req, res) => {

    upload.single("image")(req, res, (err) => {

        if (err) {

            if (err instanceof multer.MulterError) {

                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        message: "File size exceeds 5 MB limit.",
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }

            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }


        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided.",
            });
        }


        // Send uploaded image to AI controller
        predictDisease(req, res);

    });

});
// ==========================================
// GET /api/scan/history
// ==========================================
router.get("/history", authMiddleware, getScanHistory);

// ==========================================
// DELETE /api/scan/history/:id
// ==========================================
router.delete("/history/:id", authMiddleware, deleteScanHistory);

module.exports = router;