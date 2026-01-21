import { OutbreakRecord, CaseTimeSeriesRecord, NewsSignalRecord, ResearchSourceRecord, SignalMetricRecord } from "@/lib/data";
import { calculateCaseTrend, analyzeNewsSentiment, calculateConfidenceScore } from "./rules";

export interface GeneratedInsight {
    summary_points: string[];
    confidence_level: number;
    generated_at: string;
}

/**
 * Generates human-readable insight bullets based on deterministic rules.
 * Strictly avoids predictive or diagnostic language.
 */
export function generateInsightBullets(
    outbreak: OutbreakRecord,
    timeseries: CaseTimeSeriesRecord[],
    news: NewsSignalRecord[],
    research: ResearchSourceRecord[],
    metrics: SignalMetricRecord[] = []
): GeneratedInsight {
    const bullets: string[] = [];

    // 1. Analyze Core Data
    const trend = calculateCaseTrend(timeseries);
    const sentiment = analyzeNewsSentiment(news);
    const confidence = calculateConfidenceScore(timeseries, news, research.length);

    // 2. Generate Epidemiological Bullet
    if (trend.direction === 'increasing') {
        bullets.push(`Active cases have increased by ${Math.abs(Math.round(trend.percentageChange))}% over the last 7 days, indicating a widening spread.`);
    } else if (trend.direction === 'decreasing') {
        bullets.push(`Active cases have decreased by ${Math.abs(Math.round(trend.percentageChange))}% over the last 7 days, suggesting potential stabilization.`);
    } else if (trend.direction === 'stable') {
        bullets.push(`Case numbers remain stable with minor fluctuations (<5% change) over the past week.`);
    } else {
        bullets.push(`Insufficient time-series data to determine a conclusive 7-day trend.`);
    }

    // 3. Generate Intelligence/Context Bullet
    if (news.length > 0) {
        if (sentiment === 'negative') {
            bullets.push(`High-severity media signals detected, correlating with critical public health updates.`);
        } else if (sentiment === 'mixed') {
            bullets.push(`Mixed media reporting indicates varying levels of concern across sources.`);
        } else {
            bullets.push(`Media volume is present but shows no critical severity indicators at this time.`);
        }
    } else {
        bullets.push(`No significant media signals detected in the configured surveillance window.`);
    }

    // 3b. Generate Enrichment Bullet (Volume/Diversity)
    if (metrics.length > 0) {
        const totalVolume = metrics.reduce((acc, m) => acc + m.daily_news_count, 0);
        const dayCount = metrics.length;
        const avgDaily = Math.round(totalVolume / dayCount);
        bullets.push(`Enrichment data indicates an average of ${avgDaily} related news signals per day over the observed period.`);
    }

    // 4. Generate Research/Risk Bullet
    if (outbreak.risk_level === 'critical' || outbreak.risk_level === 'high') {
        bullets.push(`Current risk level is classified as ${outbreak.risk_level.toUpperCase()}, requiring active monitoring of transmission vectors.`);
    } else {
        bullets.push(`Risk level constitutes ${outbreak.risk_level} priority monitoring.`);
    }

    // 5. Corroboration Bullet (if research exists)
    if (research.length > 0) {
        bullets.push(`${research.length} relevant research article(s) identified, providing scientific context to the pathogen definition.`);
    }

    return {
        summary_points: bullets.slice(0, 5), // Cap at 5
        confidence_level: confidence,
        generated_at: new Date().toISOString()
    };
}
