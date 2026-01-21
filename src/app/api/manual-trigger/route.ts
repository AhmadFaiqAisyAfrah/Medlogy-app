import { NextResponse } from 'next/server';
import { runAnalysisPipeline } from '@/lib/analysis/pipeline';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    console.log("[API] Insight Manual Trigger Started");

    try {
        // 1. Execution
        const result = await runAnalysisPipeline();

        // 2. Cache Clearing
        revalidatePath('/analysis');

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("[API] Insight Generation Failed:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Insight Generation Failed",
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
