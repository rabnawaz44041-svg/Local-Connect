const URGENCY = new Set(["low", "medium", "high"]);

const cleanText = (value, max) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
};

function validateAnalysis(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const category = cleanText(value.category, 60);
  const requiredService = cleanText(value.requiredService, 120);
  const urgency = URGENCY.has(value.urgency) ? value.urgency : null;
  const clarifyingQuestions = Array.isArray(value.clarifyingQuestions)
    ? value.clarifyingQuestions
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 3)
    : null;
  const keywords = Array.isArray(value.keywords)
    ? value.keywords
        .filter((item) => typeof item === "string")
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.length > 1 && item.length <= 40)
        .slice(0, 6)
    : null;

  if (!category || !requiredService || !urgency || !clarifyingQuestions || !keywords) {
    return null;
  }

  return { category, urgency, requiredService, clarifyingQuestions, keywords };
}

function parseModelJson(content) {
  if (typeof content !== "string" || !content.trim()) return null;
  const withoutFences = content.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(withoutFences);
  } catch {
    return null;
  }
}

async function analyzeProblem(problem) {
  const baseUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL || "mistral";

  let response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        options: { temperature: 0.1 },
        messages: [
          {
            role: "system",
            content:
              "You classify a local-service problem for a global marketplace. Reply with JSON only. Do not invent a provider name, price, or address.",
          },
          {
            role: "user",
            content: `Return this JSON shape:
{"category":"short service category","urgency":"low|medium|high","requiredService":"specific service a provider would offer","clarifyingQuestions":["up to 3 short questions"],"keywords":["3 to 6 lowercase search words"]}
Problem: ${problem}`,
          },
        ],
      }),
    });
  } catch {
    const error = new Error("The local model is not running.");
    error.status = 503;
    throw error;
  }

  if (!response.ok) {
    const error = new Error("The local model could not classify this problem.");
    error.status = 503;
    throw error;
  }

  const payload = await response.json();
  const parsed = parseModelJson(payload?.message?.content);
  const analysis = validateAnalysis(parsed);

  if (!analysis) {
    const error = new Error("The model response was not valid and was discarded.");
    error.status = 502;
    throw error;
  }

  return analysis;
}

module.exports = {
  analyzeProblem,
};
