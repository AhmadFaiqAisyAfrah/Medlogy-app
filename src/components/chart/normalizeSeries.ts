import { IndicatorMeta } from "@/lib/chart/indicatorRegistry";

// MOCK DATA GENERATOR
// Simulates realistic epidemiological curves
export function generateMockSeriesData(meta: IndicatorMeta, days = 365) {
    const [min, max] = meta.mockRange;
    const data: [string, number][] = [];

    // Random starting point within range
    let currentValue = min + Math.random() * (max - min);

    const now = new Date();

    // Generate backwards from today
    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Random Walk with drift
        const change = (Math.random() - 0.5) * ((max - min) * 0.05);
        currentValue += change;

        // Keep bounds
        if (currentValue < 0) currentValue = 0;
        // Don't strict cap max to allow some spikes

        data.push([
            date.toISOString().split("T")[0], // YYYY-MM-DD
            Number(currentValue.toFixed(2))
        ]);
    }
    return data;
}

// NORMALIZATION & FORMATTING
// In a real app, this might transform units (e.g. absolute -> per 100k)
// For now, since we generate data *already in the target unit* (via mockRange),
// this function primarily serves as a pass-through or formatter.
export function normalizeSeries(data: [string, number][], meta: IndicatorMeta) {
    // If we needed to normalize raw counts to per_100k, we would need population data here.
    // Since our mock data is already "Cases per 100k" or "%", we pass through.
    return data;
}

export function formatValue(value: number, meta: IndicatorMeta): string {
    const num = Number(value);
    if (meta.unit === "%") return `${num.toFixed(1)}%`;
    if (meta.unit === "cases per 100k") return num.toFixed(1);

    if (num > 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toFixed(0);
}
