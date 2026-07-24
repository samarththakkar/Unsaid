const cron = require("node-cron");
const { processSessions } = require("../services/sessionProcessor");

const startCronJobs = () => {
    // Run every 5 minutes
    cron.schedule("*/5 * * * *", () => {
        processSessions();
    });
    
    console.log("Cron jobs scheduled.");
};

module.exports = { startCronJobs };
