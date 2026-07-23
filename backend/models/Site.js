const mongoose = require("mongoose");
const { generateApiKey } = require("../utils/generateApiKey");

const siteSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        domain: {
            type: String,
            required: true,
            trim: true,
        },
        apiKey: {
            type: String,
            required: true,
            unique: true,
            default: () => generateApiKey(),
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Site", siteSchema);
