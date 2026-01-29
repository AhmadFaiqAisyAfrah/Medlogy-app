import { DataAdapter, IngestionContext, IngestionSourceType } from "../contract";
import { ChartSeries } from "@/lib/chart/contract";
import { getIndicatorMeta } from "@/lib/chart/indicatorRegistry";

export class SimulationAdapter implements DataAdapter {
    id: IngestionSourceType = "simulation";

    async fetchData(context: IngestionContext): Promise<ChartSeries | null> {
        const meta = getIndicatorMeta(context.indicatorId);
        if (!meta) return null;

        const startYear = meta.availableYears[0] || 1990;
        const endYear = meta.availableYears[1] || 2023;

        // Use provided filter if tighter than meta
        const finalStart = context.yearRange ? Math.max(context.yearRange[0], startYear) : startYear;
        const finalEnd = context.yearRange ? Math.min(context.yearRange[1], endYear) : endYear;

        const dataPoints = [];

        // Deterministic Seed based on Indicator + Region chars
        // simpler than the hook version but consistent enough
        const seedBase = context.indicatorId.length + context.regionCode.length;

        for (let y = finalStart; y <= finalEnd; y++) {
            const seed = seedBase * 997 + y;
            const range = meta.mockRange;
            const val = range[0] + (seed % (range[1] - range[0]));

            dataPoints.push({
                date: `${y}-01-01`,
                value: Number(val.toFixed(2))
            });
        }

        return {
            id: `${context.indicatorId}-${context.regionCode}-sim`,
            indicator: meta.label,
            region: context.regionCode,
            unit: meta.unit,
            source: "SIMULATION",
            data: dataPoints,
            meta: {
                dataStatus: "simulated",
                sourceAttribution: "Internal Model (Simulation)",
                isMock: true
            }
        };
    }
}
