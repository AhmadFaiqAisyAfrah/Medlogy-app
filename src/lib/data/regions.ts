import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';

export type RegionRecord = Database['public']['Tables']['regions']['Row'];

/**
 * Fetches all active regions.
 */
export async function getActiveRegions(): Promise<RegionRecord[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('active', true)
        .order('name');

    if (error) {
        console.error('Error fetching regions:', error);
        return [];
    }

    return data;
}

export async function getRegionById(id: string): Promise<RegionRecord | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return null;
    }

    return data;
}
