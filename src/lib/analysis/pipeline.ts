import { getActiveOutbreak, getOutbreakTimeseries, getNewsSignals, getResearchSources, getSignalMetrics } from "@/lib/data";
import { generateInsightBullets } from "./engine";
import { saveInsightSummary } from "@/lib/mutations/insights";
import { calculatePolicyStatus } from "@/lib/policy/matrix";
import { savePolicyStatus } from "@/lib/data/policy";
import { calculateCaseTrend } from "./rules";

/**
 * Orchestrates the full Insight Automation flow.
 * 1. Fetches Read-Only Data
 * 2. Generates Deterministic Insights
 * 3. Calculates Policy Status
 * 4. Persists to Database
 */
export async function runAnalysisPipeline(outbreakId?: string) {
    console.log("Starting Analysis Pipeline...");

    // 1. Scope: Get target outbreak
    let targetId = outbreakId;
    let outbreak = null;

    if (targetId) {
        // Fetch specific outbreak
        const active = await getActiveOutbreak();
        if (active && active.id === targetId) {
            outbreak = active;
        } else {
            // Fallback/Re-use active for MVP simplicity
            outbreak = active;
        }
    } else {
        outbreak = await getActiveOutbreak();
        targetId = outbreak?.id;
    }

    if (!outbreak || !targetId) {
        throw new Error("No active outbreak found to analyze.");
    }

    console.log(`Analyzing Scenerio: ${outbreak.title} (${targetId})`);

    // 2. Fetch Context Data (Parallel)
    const [timeseries, news, research, metrics] = await Promise.all([
        getOutbreakTimeseries(targetId),
        getNewsSignals(targetId),
        getResearchSources(targetId),
        getSignalMetrics(targetId)
    ]);

    // 3. Generate Insights (Descriptive)
    const insight = generateInsightBullets(outbreak, timeseries, news, research, metrics);
    console.log("Generated Insights:", insight);

    // 4. Generate Policy Status (Operational)
    const trend = calculateCaseTrend(timeseries);
    const totalVolume = metrics.reduce((acc, m) => acc + m.daily_news_count, 0);
    const severityScore = metrics.reduce((acc, m) => acc + m.severity_score, 0); // Sum of severity scores

    const policy = calculatePolicyStatus({
        risk_level: outbreak.risk_level,
        case_trend: trend.direction as any,
        severity_score: severityScore
    });
    console.log("Generated Policy Status:", policy);

    // 5. Persist
    await Promise.all([
        saveInsightSummary(targetId, insight),
        savePolicyStatus(targetId, policy)
    ]);

    console.log("Analysis Pipeline completed successfully.");

    return { insight, policy };
}
