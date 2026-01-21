
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    // 1. Fetch Outbreak
    const { data: outbreak, error: outbreakError } = await supabase
        .from('outbreaks')
        .select('*')
        .eq('id', params.id)
        .single();

    if (outbreakError) {
        return NextResponse.json({ error: outbreakError.message }, { status: 404 });
    }

    // 2. Fetch Latest Metrics
    const { data: metrics } = await supabase
        .from('outbreak_metrics')
        .select('*')
        .eq('outbreak_id', params.id)
        .order('date', { ascending: true }); // Time series

    return NextResponse.json({
        ...outbreak,
        metrics: metrics || []
    });
}
