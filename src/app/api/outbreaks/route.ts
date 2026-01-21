
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Mocking this import - usually use utils/supabase/server for auth
// But for MVP data fetching, let's use a direct client or standard pool
import { createClient as createClientJS } from '@supabase/supabase-js';

// Initialize Client (Public/Anon Key for Read)
// Ensure these env vars are available
const supabase = createClientJS(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET() {
    const { data, error } = await supabase
        .from('outbreaks')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
