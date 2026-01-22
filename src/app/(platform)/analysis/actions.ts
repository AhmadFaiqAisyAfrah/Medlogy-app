"use server";

import { generateAIResponse } from "@/lib/ai/groq";

// Re-export explainAnalytics to satisfy build requirements (legacy dashboard support)
export async function explainAnalytics(query: string, regionId?: string) {
    if (!query) return { success: false, message: "Query cannot be empty." };

    try {
        const result = await generateAIResponse([
            { role: "system", content: "You are an analytics assistant. Provide a brief summary." },
            { role: "user", content: `Explain analytics for: ${query}` }
        ]);

        if (result.type === "ERROR") {
            return { success: false, message: result.content };
        }
        return { success: true, message: result.content };
    } catch {
        return { success: false, message: "Service unavailable" };
    }
}

export async function processAnalysisQuery(input: string) {
    if (!input) return { type: "ERROR", content: "Query cannot be empty" };

    try {
        return await generateAIResponse([{ role: "user", content: input }]);
    } catch (error: any) {
        console.error("Action Error:", error);
        return {
            type: "ERROR",
            content: error.message || "Server Action Failed"
        };
    }
}
