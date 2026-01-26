import { ChartSeries } from "@/lib/chart/contract";
import { OWID_SOURCES } from "./sources";
import { fetchOwidData } from "./client";
import { indicatorRegistry } from "@/lib/chart/indicatorRegistry";
import { generateMockSeries } from "@/lib/data/mock/mockSeriesGenerator";

export async function getOwidSeries(
    indicatorId: string,
    region: string
): Promise<ChartSeries | null> {

    // 1. Resolve Config & Meta (STRICT)
    const sourceConfig = OWID_SOURCES[indicatorId];
    if (!sourceConfig) {
        console.warn(`[OWID] No source config for ID: ${indicatorId}`);
        // Cannot fetch without URL, returning null is safe (or throw if strict)
        return null;
    }

    // Direct Lookup - Single Source of Truth
    const indicatorMeta = indicatorRegistry[indicatorId];

    // HARD ASSERTION
    if (!indicatorMeta) {
        throw new Error(`[Adapter] CRITICAL: Registry mismatch. ID '${indicatorId}' not found in indicatorRegistry.`);
    }

    // 🔒 Hybrid handling
    if (sourceConfig.redistributable === false) {
        // Use SHARED Deterministic Mock Generator
        const [minYear, maxYear] = indicatorMeta.availableYears;
        const mockSeries = generateMockSeries(
            indicatorMeta.id, // Ensure we pass the ID
            region,
            minYear,
            maxYear
        );

        return {
            ...mockSeries,
            id: `${indicatorId}-${region}`,
            meta: indicatorMeta
        };
    }

    const rawData = await fetchOwidData(sourceConfig);
    if (!rawData?.length) return null;

    const cleanData = rawData
        .filter(row => row.Entity === region)
        .map(row => ({
            date: row[sourceConfig.columns.date],
            value: Number(row[sourceConfig.columns.value])
        }))
        .filter(p => !isNaN(p.value))
        .sort((a, b) => Number(a.date) - Number(b.date));

    return {
        id: `${indicatorId}-${region}`,
        indicator: indicatorMeta.label,
        region,
        unit: indicatorMeta.unit,
        source: "OWID",
        data: cleanData,
        meta: indicatorMeta
    };
}
