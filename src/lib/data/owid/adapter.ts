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
                meta: {
                    ...indicatorMeta,
                    isMock: true,
                    hasGaps: false,
                    coverageRatio: 1,
                    sourceAttribution: sourceConfig.attribution + " (Simulated for Demo)"
                }
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

    // Processing (C2: Quality & Gaps)
    const rawCleaned = data
        .filter((row: any) => row.Entity === region)
        .map((row: any) => ({
            date: row[sourceConfig.columns.date],
            value: Number(row[sourceConfig.columns.value])
        }))
        .filter((p: any) => !isNaN(p.value));

    if (rawCleaned.length === 0) {
        return { status: "error", message: `No data for region: ${region}` };
    }

    const { data: finalData, flags } = processDataQuality(rawCleaned, sourceConfig, indicatorMeta);

    const result: AdapterResult = {
        status: "ok",
        series: {
            id: cacheKey,
            indicator: indicatorMeta.label,
            region,
            unit: indicatorMeta.unit,
            source: "OWID",
            data: finalData,
            meta: {
                ...indicatorMeta,
                ...flags
            }
        }
    };

    SERIES_CACHE.set(cacheKey, result);
    return result;
}

/* ----------------------------------------------------
   C2.2, C2.5 HELPER: GAP FILLING & QUALITY SCORING
   ---------------------------------------------------- */
function processDataQuality(
    rawData: { date: string | number; value: number }[],
    sourceConfig: any,
    meta: any
) {
    if (!rawData.length) {
        return {
            data: [],
            flags: { hasGaps: false, coverageRatio: 0, isMock: false }
        };
    }

    // 1. Convert to standardized points
    // Ensure numeric years for sorting logic if needed, but keep string for ChartPoint
    const points = rawData.map(p => ({
        year: Number(p.date),
        date: String(p.date), // "2000"
        value: p.value
    })).sort((a, b) => a.year - b.year);

    const minYear = points[0].year;
    const maxYear = points[points.length - 1].year;
    const totalYears = maxYear - minYear + 1;

    // 2. Fill Gaps
    const yearMap = new Map(points.map(p => [p.year, p.value]));
    const data: import("@/lib/chart/contract").ChartPoint[] = [];
    let presentCount = 0;

    for (let year = minYear; year <= maxYear; year++) {
        if (yearMap.has(year)) {
            data.push({ date: String(year), value: yearMap.get(year)! });
            presentCount++;
        } else {
            // INSERT GAP
            data.push({ date: String(year), value: null });
        }
    }

    // 3. Compute Flags
    const coverageRatio = presentCount / totalYears;
    const hasGaps = coverageRatio < 1.0;

    // C2.6: Dev Diagnostics
    if (process.env.NODE_ENV === "development") {
        if (hasGaps) {
            console.debug(`[DataQuality] ${meta.label}: Coverage ${Math.round(coverageRatio * 100)}% (${presentCount}/${totalYears} years)`);
        }
    }

    return {
        data,
        flags: {
            hasGaps,
            coverageRatio,
            sourceAttribution: sourceConfig.attribution,
            isMock: false
        }
    };
}
