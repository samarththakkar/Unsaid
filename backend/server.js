require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");
const { startCronJobs } = require("./jobs/processSessions.cron");

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
        });
        startCronJobs();
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
