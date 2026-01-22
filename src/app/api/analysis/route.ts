export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai/groq";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { type: "ERROR", content: "Invalid request body" },
                { status: 400 }
            );
        }

        const result = await generateAIResponse(messages);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("API /analysis error:", error);
        return NextResponse.json(
            { type: "ERROR", content: "AI service unavailable" },
            { status: 500 }
        );
    }
}
