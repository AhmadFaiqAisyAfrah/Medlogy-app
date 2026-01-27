import { ChartSeries } from "@/lib/chart/contract";

/**
 * Medlogy Chart Normalization (YEARLY-ONLY)
 *
 * Rules:
 * 1. ALL dates are coerced into YEAR string ("YYYY")
 * 2. X-axis uses INTERSECTION of years across all series
 * 3. Missing years are filled with null
 * 4. Output is SAFE for ECharts category axis
 */
export function normalizeSeries(seriesList: ChartSeries[]): ChartSeries[] {
    if (!seriesList || seriesList.length === 0) return [];

    /* ======================================================
       1. Convert ALL dates → YEAR ("YYYY")
    ====================================================== */
    const yearlySeries = seriesList.map(series => {
        const yearlyData = series.data
            .map(p => {
                if (!p.date) return null;

                // Handle "YYYY" or "YYYY-MM-DD"
                const year = p.date.length >= 4 ? p.date.slice(0, 4) : p.date;

                return {
                    date: year,
                    value: p.value
                };
            })
            .filter(Boolean) as { date: string; value: number | null }[];

        return {
            ...series,
            data: yearlyData
        };
    });

    /* ======================================================
       2. Collect YEAR SET per series
    ====================================================== */
    const yearSets = yearlySeries.map(series =>
        new Set(series.data.map(p => p.date))
    );

    /* ======================================================
       3. INTERSECTION of ALL years
       (critical for proper compare)
    ====================================================== */
    const commonYears = [...yearSets[0]].filter(year =>
        yearSets.every(set => set.has(year))
    );

    // Sort numerically
    commonYears.sort((a, b) => Number(a) - Number(b));

    if (commonYears.length === 0) return [];

    /* ======================================================
       4. Rebuild each series aligned to COMMON YEARS
    ====================================================== */
    return yearlySeries.map(series => {
        const valueMap = new Map(
            series.data.map(p => [p.date, p.value])
        );

        const normalizedData = commonYears.map(year => ({
            date: year,
            value: valueMap.has(year) ? valueMap.get(year)! : null
        }));

        return {
            ...series,
            data: normalizedData
        };
    });
}
