import { createAdminClient } from '@/lib/supabase/admin';
import { GeneratedInsight } from '@/lib/analysis/engine';

/**
 * PERSISTS the generated insight to the database.
 * This is a WRITE operation and must be isolated from the read-only data layer.
 */
export async function saveInsightSummary(outbreakId: string, insight: GeneratedInsight): Promise<void> {
    const supabase = createAdminClient();

    // Upsert logic: We only want one active summary per outbreak for MVP.
    // However, the table structure might be append-only logs or single-state.
    // Based on `insight_summaries` table usually having an ID. 
    // We will attempt to INSERT a new record mostly, but strictly we should check if we want history.
    // User requirement: "Updates should overwrite the existing entry, not append indefinitely."

    // Strategy: Delete old summary for this outbreak, then Insert new one. 
    // OR Upsert if we have a stable ID (we don't, usually).
    // Safest for MVP Overwrite: Delete active -> Insert new.

    // 1. Clear previous summaries (or we could just keep the latest and query limit 1, but "overwrite" implies cleanup).
    const { error: deleteError } = await supabase
        .from('insight_summaries')
        .delete()
        .eq('outbreak_id', outbreakId);

    if (deleteError) {
        console.error("Failed to clear old insights", deleteError);
        throw new Error("Database Write Failed: Clear old insights");
    }

    // 2. Insert new summary
    const { error: insertError } = await supabase
        .from('insight_summaries')
        .upsert({
            outbreak_id: outbreakId,
            summary_points: insight.summary_points,
            confidence_level: insight.confidence_level,
            generated_at: insight.generated_at
        } as any);

    if (insertError) {
        console.error("Failed to insert new insight", insertError);
        throw new Error("Database Write Failed: Insert insight");
    }
}
