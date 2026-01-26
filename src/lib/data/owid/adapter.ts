import { ChartSeries } from "@/lib/chart/contract";
import { OWID_SOURCES } from "./sources";
import { fetchOwidData } from "./client";
import { indicatorRegistry } from "@/lib/chart/indicatorRegistry";

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
        return {
            id: `${indicatorId}-${region}`,
            indicator: indicatorMeta.label,
            region,
            unit: indicatorMeta.unit,
            source: "MOCK",
            data: generateMockSeries(indicatorMeta),
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

/** Simple deterministic mock */
function generateMockSeries(meta: any) {
    const [min, max] = meta.availableYears;
    return Array.from({ length: max - min + 1 }, (_, i) => ({
        date: String(min + i),
        value: Math.round(
            meta.mockRange[0] +
            Math.random() * (meta.mockRange[1] - meta.mockRange[0])
        )
    }));
}
