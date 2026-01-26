import { useEffect, useState } from "react";
import { ChartSeries } from "@/lib/chart/contract";
import { ChartState } from "@/components/chart/chart.types";
import { generateMockSeries } from "@/lib/data/mock/mockSeriesGenerator";

export function useOwidData(state: ChartState) {
    const [data, setData] = useState<ChartSeries[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const { primary, comparisons, timeRange } = state;
        if (!primary.indicator || !primary.region) return;

        setLoading(true);

        const startYear = timeRange.startYear ?? 2010;
        const endYear = timeRange.endYear ?? 2020;

        const series: ChartSeries[] = [];

        series.push(
            generateMockSeries(
                primary.indicator,
                primary.region,
                startYear,
                endYear
            )
        );

        for (const c of comparisons) {
            if (!c.indicator || !c.region) continue;
            series.push(
                generateMockSeries(
                    c.indicator,
                    c.region,
                    startYear,
                    endYear
                )
            );
        }

        setData(series);
        setLoading(false);
    }, [state]);

    return { data, loading };
}
