import { useEffect, useState, useRef } from "react";
import { ChartSeries } from "@/lib/chart/contract";
import { ChartState } from "@/components/chart/chart.types";
import { getOwidSeries } from "@/lib/data/owid/adapter";

export function useOwidData(state: ChartState) {
    const [data, setData] = useState<ChartSeries[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track latest request to avoid race conditions
    const requestIdRef = useRef(0);

    useEffect(() => {
        const { primary, comparisons } = state;

        // Reset if no primary
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
                // 1. Fetch Primary
                const primaryResult = await getOwidSeries(primary.indicator!, primary.region!);

                // If outdated request, ignore
                if (currentId !== requestIdRef.current) return;

                if (primaryResult.status === "error") {
                    setError(primaryResult.message);
                    setLoading(false);
                    return;
                }

                // 2. Fetch Comparisons (Parallel)
                const comparisonPromises = comparisons
                    .filter(c => c.indicator && c.region)
                    .map(c => getOwidSeries(c.indicator!, c.region!));

                const comparisonResults = await Promise.all(comparisonPromises);

                // If outdated request, ignore
                if (currentId !== requestIdRef.current) return;

                const validSeries = [primaryResult.series];

                comparisonResults.forEach(res => {
                    if (res.status === "ok" || res.status === "mock") {
                        validSeries.push(res.series);
                    } else {
                        // Silent fail for individual comparison errors, but maybe warn?
                        // For now we just omit them to prevent breaking the whole chart
                    }
                });

                setData(validSeries);
            } catch (err: any) {
                if (currentId === requestIdRef.current) {
                    setError(err.message || "Unknown error occurred");
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
