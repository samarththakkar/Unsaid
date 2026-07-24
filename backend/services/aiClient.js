const Anthropic = require("@anthropic-ai/sdk");

const aiClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const generateInsights = async (prompt) => {
    try {
        const response = await aiClient.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            system: "You are a senior QA engineer. You always respond in raw, valid JSON with no markdown formatting.",
        });

        const textResponse = response.content[0].text;
        
        // Ensure we handle markdown blocks if Claude accidentally wraps it
        const jsonString = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("AI Client Error:", error);
        throw error;
    }
};

module.exports = { generateInsights };
