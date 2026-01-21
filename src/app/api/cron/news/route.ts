
import { NextRequest, NextResponse } from 'next/server';
import { ingestGlobalHealthNews } from '@/lib/data/public_news';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const result = await ingestGlobalHealthNews();
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('Public News Ingestion Failed:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
