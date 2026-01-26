import { ChartSeries } from "@/lib/chart/contract";
import { OWID_SOURCES } from "./sources";
import { fetchOwidData } from "./client";
import { indicatorRegistry } from "@/lib/chart/indicatorRegistry";
import { generateMockSeries } from "@/lib/data/mock/mockSeriesGenerator";

// Output Contract
export type AdapterResult =
    | { status: "ok"; series: ChartSeries }
    | { status: "mock"; series: ChartSeries }
    | { status: "error"; message: string };

// Shared processed cache (Indicator+Region -> AdapterResult)
const SERIES_CACHE = new Map<string, AdapterResult>();

export async function getOwidSeries(
    indicatorId: string,
    region: string
): Promise<AdapterResult> {
    const cacheKey = `${indicatorId}-${region}`;

    // 0. Cache Hit
    if (SERIES_CACHE.has(cacheKey)) {
        return SERIES_CACHE.get(cacheKey)!;
    }

    // 1. Resolve Config
    const sourceConfig = OWID_SOURCES[indicatorId];
    const indicatorMeta = indicatorRegistry[indicatorId];

    if (!indicatorMeta) {
        return { status: "error", message: `Indicator ID '${indicatorId}' not registered` };
    }

    // A. Mock Fallback (Redistribution Restricted)
    if (sourceConfig?.redistributable === false) {
        const [minYear, maxYear] = indicatorMeta.availableYears;
        const mockSeries = generateMockSeries(indicatorMeta.id, region, minYear, maxYear);

        const result: AdapterResult = {
            status: "mock",
            series: {
                ...mockSeries,
                id: cacheKey,
                meta: indicatorMeta
            }
        };
        SERIES_CACHE.set(cacheKey, result);
        return result;
    }

    // B. Real Data Fetch
    if (!sourceConfig) {
        return { status: "error", message: "No source config found for real data" };
    }

    const { data, error } = await fetchOwidData(sourceConfig);

    // Error Handling
    if (error) {
        if (error.type === "LICENSING" || error.type === "BLOCKED") {
            // Fallback to mock on licensing error
            const [min, max] = indicatorMeta.availableYears;
            const mock = generateMockSeries(indicatorMeta.id, region, min, max);
            const result: AdapterResult = {
                status: "mock",
                series: { ...mock, id: cacheKey, meta: indicatorMeta }
            };
            SERIES_CACHE.set(cacheKey, result);
            return result;
        }

        return { status: "error", message: error.message };
    }

    if (!data || data.length === 0) {
        return { status: "error", message: "No data available" };
    }

    // Processing
    const cleanData = data
        .filter(row => row.Entity === region)
        .map(row => ({
            date: row[sourceConfig.columns.date],
            value: Number(row[sourceConfig.columns.value])
        }))
        .filter(p => !isNaN(p.value))
        .sort((a, b) => Number(a.date) - Number(b.date));

    if (cleanData.length === 0) {
        return { status: "error", message: `No data for region: ${region}` };
    }

    const result: AdapterResult = {
        status: "ok",
        series: {
            id: cacheKey,
            indicator: indicatorMeta.label,
            region,
            unit: indicatorMeta.unit,
            source: "OWID",
            data: cleanData,
            meta: indicatorMeta
        }
    };

    SERIES_CACHE.set(cacheKey, result);
    return result;
}
