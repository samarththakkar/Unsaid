const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const Site = require("../models/Site");

const authApiKey = asyncHandler(async (req, res, next) => {
    try {
        const apiKey = req.header("x-api-key");

        if (!apiKey) {
            throw new ApiError(401, "API Key is required");
        }

        const site = await Site.findOne({ apiKey });

        if (!site) {
            throw new ApiError(401, "Invalid API Key");
        }

        req.site = site;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid API Key");
    }
});

module.exports = { authApiKey };
