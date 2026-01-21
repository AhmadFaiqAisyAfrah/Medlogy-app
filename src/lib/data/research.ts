import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';

export type ResearchSourceRecord = Pick<
    Database['public']['Tables']['research_sources']['Row'],
    'id' | 'title' | 'authors' | 'journal' | 'year' | 'url' | 'relevance_note'
>;

/**
 * Fetches research literature for an outbreak.
 */
export async function getResearchSources(outbreakId: string): Promise<ResearchSourceRecord[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('research_sources')
        .select('id, title, authors, journal, year, url, relevance_note')
        .eq('outbreak_id', outbreakId)
        .order('year', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch research sources for outbreak ${outbreakId}: ${error.message}`);
    }

    return data;
}
