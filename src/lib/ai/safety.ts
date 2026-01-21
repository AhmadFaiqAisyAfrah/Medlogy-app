
/**
 * Safety utilities for AI text generation.
 * Enforces strict guardrails against medical advice, diagnosis, and prediction.
 */

const PROHIBITED_PHRASES = [
    "diagnose",
    "treatment",
    "recommend taking",
    "you should",
    "consult your doctor", // valid advice but we want to avoid being the trigger for it in a way that implies we gave medical info
    "cure",
    "therapy",
    "prescription",
    "i predict",
    "forecast suggests", // Be careful with this, we want observational
];

export function validateAiOutput(text: string): { valid: boolean; reason?: string } {
    const lowerText = text.toLowerCase();

    for (const phrase of PROHIBITED_PHRASES) {
        if (lowerText.includes(phrase)) {
            return {
                valid: false,
                reason: `Contains prohibited phrase: "${phrase}". AI is restricted to observational language only.`
            };
        }
    }

    return { valid: true };
}

export function sanitizeResponse(text: string): string {
    // Basic cleanup if needed, e.g. removing markdown that might break UI
    return text.trim();
}
