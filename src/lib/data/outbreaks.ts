import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';

export type OutbreakRecord = Pick<
    Database['public']['Tables']['outbreaks']['Row'],
    'id' | 'region_id' | 'title' | 'status' | 'risk_level' | 'location_city' | 'location_country' | 'summary_text' | 'start_date' | 'pathogen' | 'created_at'
>;

/**
 * Fetches the active outbreak for the current scenario.
 * Optionally filters by Region ID.
 */
export async function getActiveOutbreak(regionId?: string): Promise<OutbreakRecord | null> {
    const supabase = await createClient();

    let query = supabase
        .from('outbreaks')
        .select('id, region_id, title, status, risk_level, location_city, location_country, summary_text, start_date, pathogen, created_at')
        .order('created_at', { ascending: false })
        .limit(1);

    if (regionId) {
        query = query.eq('region_id', regionId);
    }

    const { data, error } = await query.single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No rows
        throw new Error(`Failed to fetch active outbreak: ${error.message}`);
    }

    return data;
}

/**
 * Fetches a specific outbreak by ID.
 */
export async function getOutbreakById(id: string): Promise<OutbreakRecord | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('outbreaks')
        .select('id, region_id, title, status, risk_level, location_city, location_country, summary_text, start_date, pathogen, created_at')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Failed to fetch outbreak ${id}: ${error.message}`);
    }

    return data;
}
