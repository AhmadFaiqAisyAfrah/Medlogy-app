// src/lib/data/ihme/adapter.ts
import ihmeDengue from "./ihme_dengue_indonesia.json";
import { ChartSeries } from "@/lib/chart/contract";
import { indicatorRegistry } from "@/lib/chart/indicatorRegistry";

/* =========================================
   IHME ADAPTER (CLIENT-SAFE)
========================================= */
export function getIhmeDengueSeries(
    region: string
): ChartSeries | null {
    if (region !== "Indonesia") return null;

    const meta = indicatorRegistry["dengue_incidence"];
    if (!meta) return null;

    const data: ChartSeries["data"] = ihmeDengue.data.map(
        (d: any) => ({
            date: String(d.year),
            value: d.value,
        })
    );

    return {
        id: "dengue_incidence-Indonesia-IHME",
        indicator: meta.label,
        region,
        unit: meta.unit,
        source: "OWID", // ekosistem OWID, tapi sumber IHME
        data,
        meta: {
            ...meta,
            dataStatus: "modeled",
            source: ihmeDengue.source,
            isMock: false,
            hasGaps: false,
            coverageRatio: 1,
        },
    };
}
