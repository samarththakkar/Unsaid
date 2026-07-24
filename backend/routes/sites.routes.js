const express = require("express");
const { createSite, getSites } = require("../controllers/sites.controller");
const { verifyJWT } = require("../middleware/authUser");

const router = express.Router();

router.use(verifyJWT);

router.route("/").post(createSite).get(getSites);

module.exports = router;
