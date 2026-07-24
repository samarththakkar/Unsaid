const Event = require("../models/Event");
const Insight = require("../models/Insight");
const { buildPrompt } = require("./promptBuilder");
const { generateInsights } = require("./aiClient");

const processSessions = async () => {
    try {
        console.log("Running session processor...");
        // Get all unprocessed events
        const unprocessedEvents = await Event.find({ processed: false }).sort({ timestamp: 1 });

        if (unprocessedEvents.length === 0) {
            console.log("No unprocessed events found.");
            return;
        }

        // Group by sessionId
        const sessions = unprocessedEvents.reduce((acc, event) => {
            if (!acc[event.sessionId]) {
                acc[event.sessionId] = [];
            }
            acc[event.sessionId].push(event);
            return acc;
        }, {});

        for (const [sessionId, events] of Object.entries(sessions)) {
            // Usually, wait for session to be inactive, but for v1 we'll process what we have
            const prompt = buildPrompt(events);
            
            try {
                const aiResult = await generateInsights(prompt);
                
                if (aiResult.insights && Array.isArray(aiResult.insights)) {
                    const siteId = events[0].siteId;
                    const eventIds = events.map(e => e._id);

                    // Insert insights
                    for (const insightData of aiResult.insights) {
                        await Insight.create({
                            siteId,
                            sessionId,
                            title: insightData.title,
                            location: insightData.location,
                            type: insightData.type,
                            whatHappened: insightData.whatHappened,
                            likelyCause: insightData.likelyCause,
                            suggestedFix: insightData.suggestedFix,
                            severity: insightData.severity,
                            eventIds,
                        });
                    }

                    // Mark events as processed
                    await Event.updateMany(
                        { _id: { $in: eventIds } },
                        { $set: { processed: true } }
                    );
                    
                    console.log(`Processed session: ${sessionId} successfully.`);
                }
            } catch (err) {
                console.error(`Failed to process session ${sessionId}:`, err);
                // We don't mark as processed so it retries next time
            }
        }
    } catch (error) {
        console.error("Session processor failed:", error);
    }
};

module.exports = { processSessions };
