import 'server-only';

interface GroqMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface GroqResponse {
    type: "ANSWER" | "CLARIFICATION" | "ERROR";
    content: string;
}

<<<<<<< HEAD
<<<<<<< HEAD
const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateAIResponse(messages: GroqMessage[]): Promise<GroqResponse> {
    if (!GROQ_API_KEY) {
        return { type: "ERROR", content: "Missing Groq API Key" };
    }
=======
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateAIResponse(messages: GroqMessage[]): Promise<GroqResponse> {
>>>>>>> a79cbaa (feat: persist AI conversations with history sidebar)
=======
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
// Using a stable, widely available model on Groq
const DEFAULT_MODEL = "llama3-70b-8192";

export async function generateAIResponse(messages: GroqMessage[]): Promise<GroqResponse> {
    // Runtime check guarantees process.env is evaluated when function is CALLED, not built.
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.error("GROQ_API_KEY is not defined in the environment.");
        return {
            type: "ERROR",
            content: "AI configuration error: Missing API Key."
        };
    }

<<<<<<< HEAD
>>>>>>> c667acd (fix: make Groq API runtime-safe and env-based)

=======
>>>>>>> b7e80f3 (remove vercel cron to unblock hobby deployment)
    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful AI assistant for public health insights.
Response Format:
You MUST respond with a valid JSON object strictly matching this schema:
{
  "type": "ANSWER" | "CLARIFICATION" | "ERROR",
  "content": "Your actual response text here"
}
Do not use Markdown code blocks. Just the raw JSON object.`
                    },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 4096, // Safe limit
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Groq API returned ${response.status}: ${errorText}`);
            return {
                type: "ERROR",
                content: `AI Service unavailable (Status ${response.status})`
            };
        }

        const data = await response.json();
        const contentString = data.choices?.[0]?.message?.content;

        if (!contentString) {
            return { type: "ERROR", content: "AI returned an empty response." };
        }

        try {
            const parsed = JSON.parse(contentString);
            if (typeof parsed.type === 'string' && typeof parsed.content === 'string') {
                return parsed as GroqResponse;
            }
            return {
                type: "ERROR",
                content: "AI response structure was invalid."
            };
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:", contentString);
            return { type: "ERROR", content: "Failed to process AI response." };
        }

    } catch (error) {
        console.error("Groq Network/System Error:", error);
        return {
            type: "ERROR",
            content: "Internal system error during AI request."
        };
    }
}
