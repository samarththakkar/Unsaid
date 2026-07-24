const express = require("express");
const { getInsights, updateInsightStatus } = require("../controllers/insights.controller");
const { verifyJWT } = require("../middleware/authUser");

const router = express.Router();

router.use(verifyJWT);

router.route("/:siteId").get(getInsights);
router.route("/:insightId/status").patch(updateInsightStatus);

module.exports = router;
