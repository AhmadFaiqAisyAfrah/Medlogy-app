import { useMemo } from "react";
import { ChartSeries, ChartPoint } from "@/lib/chart/contract";
import { ChartState } from "@/components/chart/chart.types";
import { getIndicatorMeta } from "@/lib/chart/indicatorRegistry";

/**
 * MOCK DATA GENERATOR
 * 100% deterministic, no network, no async
 */
export function useMockData(state: ChartState) {
    const data = useMemo<ChartSeries[]>(() => {
        const { primary, comparisons, timeRange } = state;
        const all = [primary, ...comparisons];

        if (!timeRange.startYear || !timeRange.endYear) return [];

        return all
            .filter(s => s.indicator && s.region)
            .map((s, idx) => {
                const meta = getIndicatorMeta(s.indicator);
                if (!meta) return null;

                const points: ChartPoint[] = [];
                for (let y = timeRange.startYear!; y <= timeRange.endYear!; y++) {
                    const seed = (idx + 1) * 997 + y;
                    const val =
                        meta.mockRange[0] +
                        (seed % (meta.mockRange[1] - meta.mockRange[0]));

                    points.push({
                        date: `${y}-01-01`,
                        value: Number(val.toFixed(2))
                    });
                }

                return {
                    id: `${meta.id}-${s.region}-${idx}`,
                    indicator: meta.label,
                    region: s.region!,
                    unit: meta.unit,
                    source: "MOCK",
                    data: points,
                    meta
                };
            })
            .filter(Boolean) as ChartSeries[];
    }, [state]);

    return { data, loading: false };
}
