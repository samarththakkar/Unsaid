const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");
const { GoogleGenAI } = require("@google/genai");

const generateInsights = async (prompt) => {
    const provider = process.env.ACTIVE_AI_PROVIDER || "anthropic";

    try {
        let jsonString = "";

        if (provider === "anthropic") {
            const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
            const response = await client.messages.create({
                model: "claude-3-haiku-20240307",
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }],
                system: "You are a senior QA engineer. You always respond in raw, valid JSON with no markdown formatting.",
            });
            jsonString = response.content[0].text;
            
        } else if (provider === "openai") {
            const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: "You are a senior QA engineer. You always respond in raw, valid JSON matching the exact schema." },
                    { role: "user", content: prompt }
                ]
            });
            jsonString = response.choices[0].message.content;
            
        } else if (provider === "grok") {
            // Grok uses the OpenAI SDK with a different base URL
            const client = new OpenAI({
                apiKey: process.env.GROK_API_KEY,
                baseURL: "https://api.x.ai/v1"
            });
            const response = await client.chat.completions.create({
                model: "grok-beta",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: "You are a senior QA engineer. You always respond in raw, valid JSON matching the exact schema." },
                    { role: "user", content: prompt }
                ]
            });
            jsonString = response.choices[0].message.content;
            
        } else if (provider === "gemini") {
            // @google/genai syntax
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: "You are a senior QA engineer. You always respond in raw, valid JSON with no markdown formatting.",
                    responseMimeType: "application/json"
                }
            });
            jsonString = response.text;
            
        } else {
            throw new Error(`Unsupported ACTIVE_AI_PROVIDER: ${provider}`);
        }

        // Clean up markdown wrapping if any model ignores the strict JSON instructions
        jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
        
        return JSON.parse(jsonString);
    } catch (error) {
        console.error(`AI Client Error (${provider}):`, error);
        throw error;
    }
};

module.exports = { generateInsights };
