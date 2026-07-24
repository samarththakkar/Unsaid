const buildPrompt = (events) => {
    let eventsList = events
        .map((e, index) => {
            const time = new Date(e.timestamp).toLocaleTimeString();
            return `${index + 1}. ${e.type} on ${e.selector || "unknown"} at ${time}, page ${e.page}`;
        })
        .join("\n");

    return `You are a QA engineer reviewing frontend interaction logs. For each issue below,
output a structured bug report as JSON matching this exact schema:

{
  "insights": [
    {
      "title": "string",
      "location": "string",
      "type": "layout" | "interaction" | "validation" | "performance",
      "whatHappened": "string",
      "likelyCause": "string",
      "suggestedFix": "string",
      "severity": "low" | "medium" | "high"
    }
  ]
}

Session events:
${eventsList}

Return only the valid JSON object containing the array of bug reports, one per distinct issue found. Do not invent issues not supported by the events.`;
};

module.exports = { buildPrompt };
