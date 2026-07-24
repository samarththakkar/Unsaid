const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const Event = require("../models/Event");

const batchEvents = asyncHandler(async (req, res) => {
    const { events } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
        throw new ApiError(400, "Events payload is required and must be a non-empty array");
    }

    // Assign the siteId to each event from the authenticated site (req.site)
    const processedEvents = events.map((event) => ({
        ...event,
        siteId: req.site._id,
        timestamp: event.timestamp || Date.now(),
        processed: false,
    }));

    await Event.insertMany(processedEvents);

    return res.status(201).json(new ApiResponse(201, null, "Events successfully ingested"));
});

module.exports = {
    batchEvents,
};
