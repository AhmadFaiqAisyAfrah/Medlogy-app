import "server-only";

interface GroqMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface GroqResponse {
    type: "ANSWER" | "CLARIFICATION" | "ERROR";
    content: string;
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
}

export async function generateAIResponse(
    messages: GroqMessage[]
): Promise<GroqResponse> {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "system",
                        content: `You are a public health AI assistant.

You MUST respond with VALID JSON ONLY.
NO markdown.
NO code blocks.
NO extra text.

The JSON MUST strictly follow this schema:
{
  "type": "ANSWER" | "CLARIFICATION" | "ERROR",
  "content": "string"
}
`,
                    },
                    ...messages,
                ],
                temperature: 1,
                max_tokens: 8192,
                top_p: 1,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API Error:", response.status, errorText);
            return {
                type: "ERROR",
                content: `AI Provider Error: ${response.status}`,
            };
        }

        const data = await response.json();
        const contentString = data?.choices?.[0]?.message?.content;

        if (!contentString) {
            return { type: "ERROR", content: "Empty response from AI" };
        }

        try {
            const parsed = JSON.parse(contentString);

            if (
                !parsed ||
                typeof parsed !== "object" ||
                !parsed.type ||
                !parsed.content
            ) {
                return {
                    type: "ERROR",
                    content: "Invalid JSON structure from AI",
                };
            }

            return parsed as GroqResponse;
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, contentString);
            return {
                type: "ERROR",
                content: "Failed to parse AI JSON response",
            };
        }
    } catch (error: any) {
        console.error("Groq Network Error:", error);
        return {
            type: "ERROR",
            content: error?.message || "Network error",
        };
    }
}
