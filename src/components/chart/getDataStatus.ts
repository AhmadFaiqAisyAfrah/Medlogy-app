// src/components/chart/getDataStatus.ts
import { ChartSeries } from "@/lib/chart/contract";

export type DataStatus = "LIVE" | "MOCK" | "MIXED";

export function getDataStatus(data: ChartSeries[]): DataStatus {
    if (!data || data.length === 0) return "MOCK";

    const hasMock = data.some(s => s.meta?.isMock === true);
    const hasLive = data.some(s => s.meta?.isMock === false);

    if (hasLive && hasMock) return "MIXED";
    if (hasLive) return "LIVE";
    return "MOCK";
}
