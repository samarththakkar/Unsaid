const crypto = require("crypto");

const generateApiKey = () => {
    return "sk_" + crypto.randomBytes(24).toString("hex");
};

module.exports = { generateApiKey };
