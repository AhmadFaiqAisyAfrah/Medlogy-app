import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';
import { generateAIResponse } from '@/lib/ai/groq';
import { INSIGHT_EXPLANATION_PROMPT } from '@/lib/ai/prompts';
import { validateAiOutput } from '@/lib/ai/safety';

export type InsightSummaryRecord = Pick<
    Database['public']['Tables']['insight_summaries']['Row'],
    'summary_points' | 'confidence_level' | 'generated_at'
>;

/**
 * Fetches the latest AI-generated insight summary.
 * If no recent summary exists (older than 24h), it generates a new one.
 */
export async function getInsightSummary(outbreakId: string): Promise<InsightSummaryRecord | null> {
    const supabase = await createClient();

    // 1. Try to get recent summary
    const { data: existing } = await supabase
        .from('insight_summaries')
        .select('summary_points, confidence_level, generated_at')
        .eq('outbreak_id', outbreakId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

    // Check if stale (older than 24h) or missing
    const isStale = !existing || (Date.now() - new Date(existing.generated_at).getTime() > 24 * 60 * 60 * 1000);

    if (!isStale && existing) {
        return existing;
    }

    // 2. Generate New Insight if stale
    /**
     * ⚠️ IMPORTANT:
     * This function MUST NOT auto-trigger AI retries.
     * Any AI failure MUST be persisted to prevent regeneration loops.
     */
    console.log(`Generating new insight for ${outbreakId}...`);

    // Hard Guard: Check API Key first
    if (!process.env.GROQ_API_KEY) {
        console.warn("GROQ_API_KEY missing. Persisting fallback insight to prevent loop.");
        return await persistFallbackInsight(supabase, outbreakId, "Automated analysis is temporarily unavailable due to system configuration. Please check back later.");
    }

    try {
        // Fetch context data (Rule Engine Inputs)
        // For MVP we fetch a small summary of cases and signals
        const [timeseriesRes, signalsRes] = await Promise.all([
            supabase.from('case_timeseries')
                .select('date, active_cases, critical')
                .eq('outbreak_id', outbreakId)
                .order('date', { ascending: false })
                .limit(7),
            supabase.from('news_signals')
                .select('title, signal_level')
                .eq('outbreak_id', outbreakId)
                .order('published_at', { ascending: false })
                .limit(5)
        ]);

        const context = {
            recent_cases: timeseriesRes.data || [],
            recent_signals: signalsRes.data || []
        };

        const prompt = INSIGHT_EXPLANATION_PROMPT(context);

        // Pass to Groq (which expects conversation history)
        // We wrap the prompt as a user message.
        const result = await generateAIResponse([
            { role: "system", content: "You are an expert epidemiologist. Summarize insights in bullet points." },
            { role: "user", content: prompt }
        ]);

        const rawText = result.content;

        // Parse bullets (assuming AI returns text with newlines or bullets)
        const summaryPoints = rawText
            .split('\n')
            .map(line => line.replace(/^-\s*/, '').replace(/^\*\s*/, '').trim())
            .filter(line => line.length > 10);

        // Safety Filter
        const validPoints = summaryPoints.filter(p => validateAiOutput(p).valid);

        if (validPoints.length === 0) {
            // If parsing failed (maybe strict JSON returned just a paragraph), just use the whole text as one point if valid
            if (validateAiOutput(rawText).valid) {
                validPoints.push(rawText);
            } else {
                // If totally invalid/unsafe, trigger fallback
                throw new Error("No safe insight points generated.");
            }
        }

        // Save to DB
        const { data: newRecord, error: insertError } = await supabase
            .from('insight_summaries')
            .insert({
                outbreak_id: outbreakId,
                summary_points: validPoints,
                confidence_level: 0.9,
                generated_at: new Date().toISOString()
            })
            .select('summary_points, confidence_level, generated_at')
            .single();

        if (insertError) throw insertError;

        return newRecord;

    } catch (e) {
        console.error("Failed to generate insights:", e);
        // Persist failure to prevent loop
        return await persistFallbackInsight(supabase, outbreakId, "Automated analysis is temporarily unavailable due to system limitations. Please check back later.");
    }
}

/**
 * Helper to persist a fallback record so `isStale` becomes false.
 */
async function persistFallbackInsight(supabase: any, outbreakId: string, message: string): Promise<InsightSummaryRecord | null> {
    try {
        const { data: fallbackRecord, error } = await supabase
            .from('insight_summaries')
            .insert({
                outbreak_id: outbreakId,
                summary_points: [message],
                confidence_level: 0, // 0 indicates system/fallback message
                generated_at: new Date().toISOString()
            })
            .select('summary_points, confidence_level, generated_at')
            .single();

        if (error) {
            console.error("Failed to persist fallback insight:", error);
            return null;
        }
        return fallbackRecord;
    } catch (err) {
        console.error("Critical: Failed to save fallback insight.", err);
        return null; // Last resort, but loop might continue if DB is down.
    }
}


