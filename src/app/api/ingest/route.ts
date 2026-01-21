import { NextResponse } from 'next/server';
import { runIngestionPipeline } from '@/lib/ingestion/pipeline';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    console.log("[API] Ingestion Triggered");

    try {
        // 1. Environment Validation
        const apiKey = process.env.FIRECRAWL_API_KEY;
        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        console.log("[API] Env Check:", {
            hasFirecrawlKey: !!apiKey,
            hasSupabaseUrl: !!sbUrl
        });

        if (!apiKey) {
            console.error("[API] Missing FIRECRAWL_API_KEY");
            return NextResponse.json(
                { success: false, error: "Configuration Error: Missing FIRECRAWL_API_KEY" },
                { status: 500 }
            );
        }

        // 2. Execution
        // Security: In real production this needs Admin Auth.
        // For MVP Validation per instructions: Protected manually triggered route.
        // We assume the user triggering this has access.

        const result = await runIngestionPipeline();

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[API] Ingestion Failed - Details:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Unknown Ingestion Error",
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
