import { ParsedNewsItem } from "./parse";
import { Database } from "@/lib/types";

type NewsSignalInsert = Database['public']['Tables']['news_signals']['Insert'];

/**
 * Maps parsed news items to the database schema.
 * Applies heuristics for signal_level.
 */
export function mapToNewsSignal(items: ParsedNewsItem[], outbreakId: string): NewsSignalInsert[] {
    return items.map(item => {
        const signalLevel = determineSignalLevel(item.title, item.summary);

        return {
            outbreak_id: outbreakId,
            source: item.source,
            title: item.title,
            summary: item.summary || item.title,
            published_at: new Date(item.published_at).toISOString(),
            signal_level: signalLevel,
            created_at: new Date().toISOString()
        };
    });
}

/**
 * Heuristic for determining signal level/severity.
 */
function determineSignalLevel(title: string, summary: string): 'high' | 'medium' | 'low' {
    const text = `${title} ${summary}`.toLowerCase();

    // High Severity Keywords
    if (
        text.includes('death') ||
        text.includes('critical') ||
        text.includes('emergency') ||
        text.includes('severe') ||
        text.includes('fatal') ||
        text.includes('surge')
    ) {
        return 'high';
    }

    // Medium Severity Keywords
    if (
        text.includes('outbreak') ||
        text.includes('case') ||
        text.includes('increase') ||
        text.includes('spread') ||
        text.includes('detected') ||
        text.includes('new')
    ) {
        return 'medium';
    }

    return 'low';
}
