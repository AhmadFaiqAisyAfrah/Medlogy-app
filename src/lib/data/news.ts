import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';

export type NewsSignalRecord = Pick<
    Database['public']['Tables']['news_signals']['Row'],
    'id' | 'source' | 'title' | 'summary' | 'signal_level' | 'published_at'
>;

/**
 * Fetches relevant news signals for an outbreak.
 */
export async function getNewsSignals(outbreakId: string): Promise<NewsSignalRecord[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('news_signals')
        .select('id, source, title, summary, signal_level, published_at')
        .eq('outbreak_id', outbreakId)
        .order('published_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch news signals for outbreak ${outbreakId}: ${error.message}`);
    }

    return data;
}

export type SignalMetricRecord = Database['public']['Views']['signal_metrics']['Row'];

/**
 * Fetches signal metrics for an outbreak.
 */
export async function getSignalMetrics(outbreakId: string): Promise<SignalMetricRecord[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('signal_metrics')
        .select('*')
        .eq('outbreak_id', outbreakId)
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching signal metrics:', error);
        return [];
    }

    return data;
}
