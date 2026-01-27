import { useEffect, useState, useRef } from "react";
import { ChartSeries } from "@/lib/chart/contract";
import { ChartState } from "@/components/chart/chart.types";
import { getOwidSeries } from "@/lib/data/owid/adapter";

/* -----------------------------------------
   Helper: Slice data by selected timeframe
------------------------------------------ */
function sliceByTimeframe(
    series: ChartSeries[],
    start: number | null,
    end: number | null
): ChartSeries[] {
    if (!start || !end) return series;

    return series.map(s => ({
        ...s,
        data: s.data.filter(p => {
            const year = Number(p.date);
            return year >= start && year <= end;
        })
    }));
}

/* -----------------------------------------
   Hook
------------------------------------------ */
export function useOwidData(state: ChartState) {
    const [data, setData] = useState<ChartSeries[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prevent race conditions on fast switching
    const requestIdRef = useRef(0);

    useEffect(() => {
        const { primary, comparisons, timeRange } = state;

        // Reset when no primary selected
        if (!primary.indicator || !primary.region) {
            setData([]);
            setError(null);
            setLoading(false);
            return;
        }

        const fetchAll = async () => {
            const currentId = ++requestIdRef.current;
            setLoading(true);
            setError(null);

            try {
                /* ---------- Primary ---------- */
                if (!primary.indicator || !primary.region) {
                    const primaryResult = await getOwidSeries(
                        primary.indicator,
                        primary.region
                    );

                    if (currentId !== requestIdRef.current) return;

                    if (primaryResult.status === "error") {
                        setError(primaryResult.message);
                        setLoading(false);
                        return;
                    }

                    const collected: ChartSeries[] = [
                        primaryResult.series
                    ];

                    /* ---------- Comparisons ---------- */
                    const comparisonPromises = comparisons
                        .filter(c => c.indicator && c.region)
                        .map(c => getOwidSeries(c.indicator!, c.region!));

                    const comparisonResults = await Promise.all(comparisonPromises);

                    if (currentId !== requestIdRef.current) return;

                    comparisonResults.forEach(res => {
                        if (res.status === "ok" || res.status === "mock") {
                            collected.push(res.series);
                        }
                    });

                    /* ---------- 🔥 TIMEFRAME SLICING ---------- */
                    const sliced = sliceByTimeframe(
                        collected,
                        timeRange.startYear,
                        timeRange.endYear
                    );

                    setData(sliced);

                } catch (err: any) {
                    if (currentId === requestIdRef.current) {
                        setError(err?.message || "Unknown error occurred");
                    }
                } finally {
                    if (currentId === requestIdRef.current) {
                        setLoading(false);
                    }
                }
            };

            fetchAll();
        }, [state]);

    return { data, loading, error };
}
