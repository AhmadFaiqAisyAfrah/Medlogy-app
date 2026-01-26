// src/components/chart/chart.types.ts

export type TimeRange = {
    startYear: number | null;
    endYear: number | null;
};

export interface Series {
    id: string;
    indicator: string; // ✅ INDICATOR ID (e.g. "tb_mortality")
    region: string | null;
}

export interface ChartState {
    primary: Series;
    comparisons: Series[];
    timeRange: TimeRange;
}
