const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const Site = require("../models/Site");

const createSite = asyncHandler(async (req, res) => {
    const { name, domain } = req.body;

    if ([name, domain].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Name and domain are required");
    }

    const site = await Site.create({
        name,
        domain,
        owner: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, site, "Site created successfully"));
});

const getSites = asyncHandler(async (req, res) => {
    const sites = await Site.find({ owner: req.user._id }).sort({ createdAt: -1 });
    
    return res.status(200).json(new ApiResponse(200, sites, "Sites fetched successfully"));
});

module.exports = {
    createSite,
    getSites,
};
