import { CaseTimeSeriesRecord, NewsSignalRecord, OutbreakRecord } from "@/lib/data";

export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
export type SentimentAggregate = 'negative' | 'neutral' | 'positive' | 'mixed';

/**
 * Calculates the 7-day trend direction of active cases.
 */
export function calculateCaseTrend(timeseries: CaseTimeSeriesRecord[]): { direction: TrendDirection; percentageChange: number } {
    if (!timeseries || timeseries.length < 7) {
        return { direction: 'insufficient_data', percentageChange: 0 };
    }

    // Sort by date ascending to be sure
    const sorted = [...timeseries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const latest = sorted[sorted.length - 1];
    const sevenDaysAgo = sorted[sorted.length - 7]; // Approximate 7-day lookback

    if (!latest || !sevenDaysAgo || sevenDaysAgo.active_cases === 0) {
        // Avoid division by zero
        return { direction: 'insufficient_data', percentageChange: 0 };
    }

    const change = latest.active_cases - sevenDaysAgo.active_cases;
    const percentage = (change / sevenDaysAgo.active_cases) * 100;

    let direction: TrendDirection = 'stable';
    if (percentage > 5) direction = 'increasing';
    else if (percentage < -5) direction = 'decreasing';

    return { direction, percentageChange: percentage };
}

/**
 * Aggregates news sentiment signals.
 */
export function analyzeNewsSentiment(signals: NewsSignalRecord[]): SentimentAggregate {
    if (!signals || signals.length === 0) return 'neutral';

    let highSeverityCount = 0;
    let mediumSeverityCount = 0;

    signals.forEach(s => {
        if (s.signal_level === 'high') highSeverityCount++;
        else if (s.signal_level === 'medium') mediumSeverityCount++;
    });

    if (highSeverityCount > 0) return 'negative'; // High signal level in outbreaks usually means bad news vs 'positive' sentiment
    if (mediumSeverityCount > 2) return 'mixed';

    return 'neutral';
}

/**
 * Derives a confidence score based on data availability and consistency.
 * Range: 0.0 to 1.0
 */
export function calculateConfidenceScore(
    timeseries: CaseTimeSeriesRecord[],
    news: NewsSignalRecord[],
    researchCount: number
): number {
    let score = 0.5; // Base confidence

    // 1. Data Completeness
    if (timeseries.length >= 14) score += 0.2;
    else if (timeseries.length >= 7) score += 0.1;

    // 2. Corroboration (News + Signals)
    if (news.length > 0) score += 0.1;

    // 3. Research backing
    if (researchCount > 0) score += 0.1;

    // Cap at 0.95 for MVP (never 100% certain)
    return Math.min(score, 0.95);
}
