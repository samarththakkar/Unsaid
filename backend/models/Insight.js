const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema(
    {
        siteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Site",
            required: true,
            index: true,
        },
        sessionId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["layout", "interaction", "validation", "performance"],
            required: true,
        },
        whatHappened: {
            type: String,
            required: true,
        },
        likelyCause: {
            type: String,
            required: true,
        },
        suggestedFix: {
            type: String,
            required: true,
        },
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true,
        },
        status: {
            type: String,
            enum: ["open", "dismissed", "resolved"],
            default: "open",
        },
        eventIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Insight", insightSchema);
