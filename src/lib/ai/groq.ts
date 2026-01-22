import "server-only";

/* =========================
   Types
========================= */

interface GroqMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface GroqResponse {
    type: "ANSWER" | "CLARIFICATION" | "ERROR";
    content: string;
}

/* =========================
   Config
========================= */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

if (!GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY is missing");
}

/* =========================
   Helper: Safe JSON Extractor
========================= */

function extractJSON(text: string): GroqResponse | null {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) return null;

    try {
        const parsed = JSON.parse(match[0]);

        if (
            typeof parsed === "object" &&
            parsed !== null &&
            typeof parsed.type === "string" &&
            typeof parsed.content === "string"
        ) {
            return parsed as GroqResponse;
        }

        return null;
    } catch {
        return null;
    }
}

/* =========================
   Main AI Function
========================= */

export async function generateAIResponse(
    messages: GroqMessage[]
): Promise<GroqResponse> {
    if (!GROQ_API_KEY) {
        return {
            type: "ERROR",
            content: "AI service not configured (missing API key).",
        };
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                temperature: 1,
                max_tokens: 8192,
                top_p: 1,
                messages: [
                    {
                        role: "system",
                        content: `You are a public health AI assistant.

You MUST respond with VALID JSON ONLY.
NO markdown.
NO code blocks.
NO explanations.

JSON schema:
{
  "type": "ANSWER" | "CLARIFICATION" | "ERROR",
  "content": "string"
}`,
                    },
                    ...messages,
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Groq API Error:", response.status, errorText);

            return {
                type: "ERROR",
                content: `AI provider error (${response.status})`,
            };
        }

        const data = await response.json();
        const rawContent = data?.choices?.[0]?.message?.content;

        if (!rawContent || typeof rawContent !== "string") {
            return {
                type: "ERROR",
                content: "Empty response from AI provider.",
            };
        }

        // 🔑 Robust parsing (THIS IS THE FIX)
        const extracted = extractJSON(rawContent);

        if (!extracted) {
            console.error("⚠️ Failed to extract JSON from AI output:", rawContent);

            return {
                type: "ERROR",
                content: "AI response format invalid.",
            };
        }

        return extracted;
    } catch (error: any) {
        console.error("❌ Groq Network Error:", error);

        return {
            type: "ERROR",
            content: error?.message || "Network error while calling AI service.",
        };
    }
}
