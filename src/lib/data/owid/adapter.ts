// src/lib/data/owid/adapter.ts
import { ChartSeries } from "@/lib/chart/contract";
import { OWID_SOURCES } from "./sources";
import { fetchOwidData } from "./client";
import { indicatorRegistry } from "@/lib/chart/indicatorRegistry";
import { generateMockSeries } from "@/lib/data/mock/mockSeriesGenerator";
import { getIhmeDengueSeries } from "@/lib/data/ihme/adapter";

export type AdapterResult =
    | { status: "ok"; series: ChartSeries }
    | { status: "error"; message: string };

const SERIES_CACHE = new Map<string, AdapterResult>();

// Region normalization (OWID CSV uses ISO codes)
const REGION_TO_CODE: Record<string, string> = {
    Global: "OWID_WRL",
    Indonesia: "IDN",
};

/* ======================================================
   MAIN ADAPTER
====================================================== */
export async function getOwidSeries(
    indicatorId: string,
    region: string
): Promise<AdapterResult> {
    const cacheKey = `${indicatorId}-${region}`;
    const cached = SERIES_CACHE.get(cacheKey);
    if (cached) return cached;

    /* =========================================
   🔥 IHME PRIORITY (MODELED DATA)
========================================= */
    if (indicatorId === "dengue_incidence") {
        const ihmeSeries = getIhmeDengueSeries(region);

        if (ihmeSeries) {
            const result: AdapterResult = {
                status: "ok",
                series: ihmeSeries,
            };

            SERIES_CACHE.set(cacheKey, result);
            return result;
        }
    }


    const meta = indicatorRegistry[indicatorId];
    if (!meta) {
        return {
            status: "error",
            message: `Indicator '${indicatorId}' not registered`,
        };
    }

    const sourceConfig = OWID_SOURCES[indicatorId];
    const regionCode = REGION_TO_CODE[region] ?? region;

    /* ======================================================
       1. OWID SOURCE EXISTS → OBSERVED or MODELED
    ====================================================== */
    if (sourceConfig) {
        const { data, error } = await fetchOwidData(sourceConfig);

        if (!error && data && data.length > 0) {
            const { date, value, entity } = sourceConfig.columns;

            const cleaned = data
                .filter(
                    (row: any) =>
                        row.Code === regionCode || row[entity] === region
                )
                .map((row: any) => ({
                    date: String(row[date]),
                    value: Number(row[value]),
                }))
                .filter(p => !Number.isNaN(p.value));

            if (cleaned.length > 0) {
                const years = cleaned.map(p => Number(p.date));
                const minYear = Math.min(...years);
                const maxYear = Math.max(...years);

                const yearMap = new Map(cleaned.map(p => [p.date, p.value]));
                const seriesData: ChartSeries["data"] = [];

                for (let y = minYear; y <= maxYear; y++) {
                    seriesData.push({
                        date: String(y),
                        value: yearMap.get(String(y)) ?? null,
                    });
                }

                const coverageRatio =
                    cleaned.length / (maxYear - minYear + 1);

                const dataStatus = sourceConfig.redistributable
                    ? "observed"
                    : "modeled";

                const result: AdapterResult = {
                    status: "ok",
                    series: {
                        id: cacheKey,
                        indicator: meta.label,
                        region,
                        unit: meta.unit,
                        source: "OWID", // ✅ enum, type-safe
                        data: seriesData,
                        meta: {
                            ...meta,
                            isMock: false,
                            hasGaps: seriesData.some(d => d.value === null),
                            coverageRatio,
                            dataStatus,
                            source: sourceConfig.attribution, // 👈 human-readable
                        },
                    },
                };

                SERIES_CACHE.set(cacheKey, result);
                return result;
            }
        }
    }

    /* ======================================================
       2. NO OWID SOURCE → SIMULATED ONLY
    ====================================================== */
    const [minYear, maxYear] = meta.availableYears;
    const mock = generateMockSeries(meta.id, region, minYear, maxYear);

    const result: AdapterResult = {
        status: "ok",
        series: {
            ...mock,
            id: cacheKey,
            source: "MOCK", // ✅ enum
            meta: {
                ...meta,
                dataStatus: "simulated",
                source: "Internal simulation",
                isMock: true,
                hasGaps: false,
                coverageRatio: 1,
            },
        },
    };

    SERIES_CACHE.set(cacheKey, result);
    return result;
}
