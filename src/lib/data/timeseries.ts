import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';

export type CaseTimeSeriesRecord = Pick<
    Database['public']['Tables']['case_timeseries']['Row'],
    'date' | 'active_cases' | 'recovered' | 'critical' | 'positivity_rate'
>;

/**
 * Fetches ordered time-series data for chart visualization.
 */
export async function getOutbreakTimeseries(outbreakId: string): Promise<CaseTimeSeriesRecord[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('case_timeseries')
        .select('date, active_cases, recovered, critical, positivity_rate')
        .eq('outbreak_id', outbreakId)
        .order('date', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch timeseries for outbreak ${outbreakId}: ${error.message}`);
    }

    return data;
}
