import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/admin';

export type PolicyStatusRecord = Database['public']['Tables']['policy_status']['Row'];

/**
 * Fetches the active operational status for an outbreak.
 */
export async function getPolicyStatus(outbreakId: string): Promise<PolicyStatusRecord | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('policy_status')
        .select('*')
        .eq('outbreak_id', outbreakId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No rows
        console.error(`Failed to fetch policy status for ${outbreakId}:`, error);
        return null;
    }

    return data;
}

/**
 * Saves or updates policy status (Server/Admin only).
 */
export async function savePolicyStatus(
    outbreakId: string,
    status: Omit<PolicyStatusRecord, 'id' | 'generated_at' | 'outbreak_id'>
) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('policy_status')
        .upsert({
            outbreak_id: outbreakId,
            ...status
        } as any, {
            onConflict: 'outbreak_id'
        });

    if (error) {
        console.error('Failed to save policy status:', error);
        throw error;
    }
}
