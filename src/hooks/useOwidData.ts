import { useEffect, useRef, useState } from "react";
import { ChartSeries } from "@/lib/chart/contract";
import { ChartState } from "@/components/chart/chart.types";

export function useOwidData(state: ChartState) {
    const [data, setData] = useState<ChartSeries[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestIdRef = useRef(0);

    useEffect(() => {
        const { primary, comparisons, timeRange } = state;

        if (!primary.indicator || !primary.region) {
            setData([]);
            setError(null);
            setLoading(false);
            return;
        }

        const fetchSeries = async (indicator: string, region: string) => {
            const params = new URLSearchParams({
                indicator,
                region,
            });

            if (timeRange.startYear) params.append("start", timeRange.startYear.toString());
            if (timeRange.endYear) params.append("end", timeRange.endYear.toString());

            const res = await fetch(`/api/chart/data?${params.toString()}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Failed to fetch ${indicator}`);
            }
            return await res.json() as ChartSeries;
        };

        const fetchAll = async () => {
            const currentId = ++requestIdRef.current;
            setLoading(true);
            setError(null);

            try {
                // 1. Fetch Primary
                const primarySeries = await fetchSeries(primary.indicator!, primary.region!);

                if (currentId !== requestIdRef.current) return;

                // 2. Fetch Comparisons
                const validComparisons = comparisons.filter(c => c.indicator && c.region);
                const comparisonPromises = validComparisons.map(c =>
                    fetchSeries(c.indicator!, c.region!)
                );

                const comparisonResults = await Promise.all(comparisonPromises);

                if (currentId !== requestIdRef.current) return;

                setData([primarySeries, ...comparisonResults]);

            } catch (err: any) {
                if (currentId === requestIdRef.current) {
                    console.error("API Fetch Error:", err);
                    setError(err.message || "Failed to load data");
                    // On error, we might want to clear data or show empty state
                    setData([]);
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
