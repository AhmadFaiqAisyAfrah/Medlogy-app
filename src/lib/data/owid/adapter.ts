import { ChartSeries } from "@/lib/chart/contract";
import { OWID_SOURCES } from "./sources";
import { fetchOwidData } from "./client";
import { indicatorRegistry } from "@/lib/chart/indicatorRegistry";
import { generateMockSeries } from "@/lib/data/mock/mockSeriesGenerator";

export type AdapterResult =
    | { status: "ok"; series: ChartSeries }
    | { status: "mock"; series: ChartSeries }
    | { status: "error"; message: string };

const SERIES_CACHE = new Map<string, AdapterResult>();

// 🔑 Region → ISO mapping (OWID CSV uses Code)
const REGION_TO_ISO: Record<string, string> = {
    Global: "OWID_WRL",
    Indonesia: "IDN",
    Afghanistan: "AFG",
};

export async function getOwidSeries(
    indicatorId: string,
    region: string
): Promise<AdapterResult> {
    const cacheKey = `${indicatorId}-${region}`;
    const cached = SERIES_CACHE.get(cacheKey);
    if (cached) return cached;

    const indicatorMeta = indicatorRegistry[indicatorId];
    if (!indicatorMeta) {
        return { status: "error", message: `Indicator '${indicatorId}' not registered` };
    }

    const sourceConfig = OWID_SOURCES[indicatorId];

    /* ---------- MOCK FALLBACK ---------- */
    if (!sourceConfig || sourceConfig.redistributable === false) {
        const [min, max] = indicatorMeta.availableYears;
        const mock = generateMockSeries(indicatorMeta.id, region, min, max);

        const result: AdapterResult = {
            status: "mock",
            series: {
                ...mock,
                id: cacheKey,
                meta: {
                    ...indicatorMeta,
                    isMock: true,
                    hasGaps: false,
                    coverageRatio: 1,
                    sourceAttribution:
                        sourceConfig?.attribution ?? "Simulated (no real source)",
                },
            },
        };

        SERIES_CACHE.set(cacheKey, result);
        return result;
    }

    /* ---------- FETCH REAL OWID CSV ---------- */
    const { data, error } = await fetchOwidData(sourceConfig);
    if (error) return { status: "error", message: error.message };
    if (!data || data.length === 0) {
        return { status: "error", message: "No data returned from OWID" };
    }

    const dateCol = sourceConfig.columns.date;
    const valueCol = sourceConfig.columns.value;
    const targetCode = REGION_TO_ISO[region] ?? region;

    const cleaned = data
        .filter((row: any) => row.Code === targetCode)
        .map((row: any) => ({
            date: String(row[dateCol]),
            value: Number(row[valueCol]),
        }))
        .filter(p => !Number.isNaN(p.value));

    if (cleaned.length === 0) {
        return {
            status: "error",
            message: `No data for region '${region}'`,
        };
    }

    const points = cleaned
        .map(p => ({ year: Number(p.date), ...p }))
        .sort((a, b) => a.year - b.year);

    const minYear = points[0].year;
    const maxYear = points[points.length - 1].year;
    const yearMap = new Map(points.map(p => [p.year, p.value]));

    const seriesData: ChartSeries["data"] = [];
    let present = 0;

    for (let y = minYear; y <= maxYear; y++) {
        if (yearMap.has(y)) {
            seriesData.push({ date: String(y), value: yearMap.get(y)! });
            present++;
        } else {
            seriesData.push({ date: String(y), value: null });
        }
    }

    const coverageRatio = present / (maxYear - minYear + 1);

    const result: AdapterResult = {
        status: "ok",
        series: {
            id: cacheKey,
            indicator: indicatorMeta.label,
            region,
            unit: indicatorMeta.unit,
            source: "OWID",
            data: seriesData,
            meta: {
                ...indicatorMeta,
                hasGaps: coverageRatio < 1,
                coverageRatio,
                isMock: false,
                sourceAttribution: sourceConfig.attribution,
            },
        },
    };

    SERIES_CACHE.set(cacheKey, result);
    return result;
}
