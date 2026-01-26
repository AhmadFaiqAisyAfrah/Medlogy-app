import { ChartSeries, ChartPoint } from "@/lib/chart/contract";

/**
 * Deterministic pseudo-random generator (seeded)
 * So charts don't jump on every reload
 */
function seededRandom(seed: number) {
    let value = seed % 2147483647;
    return () => {
        value = (value * 16807) % 2147483647;
        return (value - 1) / 2147483646;
    };
}

/**
 * Generate realistic epidemiology-like time series
 */
export function generateMockSeries(
    indicator: string,
    region: string,
    startYear: number,
    endYear: number
): ChartSeries {
    const seed =
        indicator.length * 1000 +
        region.length * 100 +
        startYear +
        endYear;

    const rand = seededRandom(seed);

    let base = getBaseValue(indicator);
    let trend = getTrend(indicator);

    const data: ChartPoint[] = [];

    for (let year = startYear; year <= endYear; year++) {
        const noise = (rand() - 0.5) * base * 0.08; // ±8% noise
        base = base * (1 + trend) + noise;

        data.push({
            date: String(year),
            value: Math.max(0, Number(base.toFixed(2))),
        });
    }

    return {
        indicator,
        region,
        unit: getUnit(indicator),
        source: "MOCK",
        data,
    };
}

/* ---------------- helpers ---------------- */

function getBaseValue(indicator: string): number {
    switch (indicator) {
        case "HIV prevalence":
            return 1.2;
        case "TB mortality":
            return 45;
        case "Dengue incidence":
            return 800;
        case "Malaria cases":
            return 30000;
        default:
            return 100;
    }
}

function getTrend(indicator: string): number {
    switch (indicator) {
        case "HIV prevalence":
            return -0.015; // slow decline
        case "TB mortality":
            return -0.02;
        case "Dengue incidence":
            return 0.03; // increasing trend
        case "Malaria cases":
            return -0.01;
        default:
            return 0;
    }
}

function getUnit(indicator: string): string {
    switch (indicator) {
        case "HIV prevalence":
            return "%";
        case "TB mortality":
            return "deaths per 100k";
        case "Dengue incidence":
            return "cases per 100k";
        case "Malaria cases":
            return "cases";
        default:
            return "";
    }
}
