import { NextRequest, NextResponse } from 'next/server';
import { runAnalysisPipeline } from '@/lib/analysis/pipeline';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds

export async function GET(req: NextRequest) {
    // 1. Validate Cron Secret (Guardrail)
    // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>"
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[CRON] Starting scheduled ingestion...');

        // 2. Run Pipeline (Idempotent)
        const result = await runAnalysisPipeline();

        console.log('[CRON] Ingestion complete:', result);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[CRON] Ingestion failed:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
