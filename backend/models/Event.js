const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        siteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Site",
            required: true,
        },
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["rage_click", "dead_click", "form_abandon", "layout_shift", "overflow", "js_error", "contrast"],
            required: true,
        },
        page: {
            type: String,
            required: true,
        },
        selector: {
            type: String,
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now,
        },
        processed: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
