const express = require("express");
const { batchEvents } = require("../controllers/events.controller");
const { authApiKey } = require("../middleware/authApiKey");

const router = express.Router();

// Widget endpoint - authenticated via API Key
router.route("/batch").post(authApiKey, batchEvents);

module.exports = router;
