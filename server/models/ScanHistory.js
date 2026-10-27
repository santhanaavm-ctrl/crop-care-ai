const mongoose = require("mongoose");

const scanHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            index: true
        },
        imagePath: {
            type: String,
            default: ""
        },
        imageUrl: {
            type: String,
            default: ""
        },
        crop: {
            type: String,
            default: "Unknown"
        },
        disease: {
            type: String,
            default: "Unknown"
        },
        prediction: {
            type: String,
            default: ""
        },
        confidence: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["HIGH CONFIDENCE", "UNCERTAIN", "UNSUPPORTED"],
            default: "HIGH CONFIDENCE"
        },
        statusMessage: {
            type: String,
            default: ""
        },
        speciesConfidence: {
            type: Number,
            default: 0
        },
        topCandidates: [
            {
                class: { type: String, default: "" },
                crop: { type: String, default: "" },
                disease: { type: String, default: "" },
                confidence: { type: Number, default: 0 }
            }
        ],
        recommendation: {
            action: { type: String, default: "" },
            prevention: { type: String, default: "" },
            care: { type: String, default: "" },
            symptoms: { type: String, default: "" },
            nextSteps: { type: String, default: "" }
        },
        treatment: {
            type: String,
            default: ""
        },
        prevention: {
            type: String,
            default: ""
        },
        symptoms: {
            type: String,
            default: ""
        },
        nextSteps: {
            type: String,
            default: ""
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual userId for frontend/API compatibility
scanHistorySchema.virtual("userId").get(function () {
    return this.user;
});

module.exports = mongoose.model("ScanHistory", scanHistorySchema);
