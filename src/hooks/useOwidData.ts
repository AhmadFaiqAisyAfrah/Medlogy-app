import { useEffect, useRef, useState } from "react";
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
            const year = Number(p.date.slice(0, 4));
            return year >= start && year <= end;
        }),
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

        /* ---------- Guard awal ---------- */
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
                const indicator = primary.indicator;
                const region = primary.region;

                if (!indicator || !region) return;

                /* ---------- Primary ---------- */
                const primaryResult = await getOwidSeries(indicator, region);

                if (currentId !== requestIdRef.current) return;

                if (primaryResult.status === "error") {
                    setError(primaryResult.message);
                    return;
                }

                // 🔑 SAFE: ok & mock both have `series`
                const collected: ChartSeries[] = [];
                if ("series" in primaryResult) {
                    collected.push(primaryResult.series);
                }

                /* ---------- Comparisons ---------- */
                const comparisonPromises = comparisons
                    .filter(c => c.indicator && c.region)
                    .map(c =>
                        getOwidSeries(
                            c.indicator as string,
                            c.region as string
                        )
                    );

                const comparisonResults = await Promise.all(comparisonPromises);

                if (currentId !== requestIdRef.current) return;

                comparisonResults.forEach(res => {
                    // 🔑 CRITICAL FIX (TypeScript-safe)
                    if ("series" in res) {
                        collected.push(res.series);
                    }
                });

                /* ---------- Timeframe slicing ---------- */
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
