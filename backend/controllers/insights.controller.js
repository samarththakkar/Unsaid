const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const Insight = require("../models/Insight");
const Site = require("../models/Site");

const getInsights = asyncHandler(async (req, res) => {
    const { siteId } = req.params;
    const { status = "open" } = req.query; // filter by status if provided

    // Verify user owns the site
    const site = await Site.findOne({ _id: siteId, owner: req.user._id });
    if (!site) {
        throw new ApiError(404, "Site not found or unauthorized");
    }

    const insights = await Insight.find({ siteId, status }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, insights, "Insights fetched successfully"));
});

const updateInsightStatus = asyncHandler(async (req, res) => {
    const { insightId } = req.params;
    const { status } = req.body;

    if (!["open", "dismissed", "resolved"].includes(status)) {
        throw new ApiError(400, "Invalid status provided");
    }

    const insight = await Insight.findById(insightId).populate("siteId");

    if (!insight) {
        throw new ApiError(404, "Insight not found");
    }

    // Verify user owns the site this insight belongs to
    if (insight.siteId.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this insight");
    }

    insight.status = status;
    await insight.save();

    return res.status(200).json(new ApiResponse(200, insight, "Insight status updated"));
});

module.exports = {
    getInsights,
    updateInsightStatus,
};
