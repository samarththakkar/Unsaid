const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
const authRouter = require("./routes/auth.routes");
const sitesRouter = require("./routes/sites.routes");
const eventsRouter = require("./routes/events.routes");
const insightsRouter = require("./routes/insights.routes");

// routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/sites", sitesRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/insights", insightsRouter);

module.exports = app;
