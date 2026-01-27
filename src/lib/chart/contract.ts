// CHART DATA CONTRACT
// Single Source of Truth for Visualization and Analysis Engines

export interface ChartPoint {
    /** 
     * Date in ISO format (YYYY-MM-DD) or Year string (YYYY) 
     * ECharts can parse both, but ISO is preferred for precision.
     */
    date: string;

    /** 
     * Numeric value of the indicator.
     * Should be null if data is missing for this timestamp (gaps).
     */
    value: number | null;
}

export interface ChartSeries {
    /** Unique identifier for the series instance (e.g. "dengue-indonesia-primary") */
    id: string;

    /** Human-readable name of the indicator */
    indicator: string;

    /** Geographic region name */
    region: string;

    /** 
     * Unit of measurement (e.g. "cases", "%", "per 100k").
     * Crucial for normalization logic.
     */
    unit?: string;

    /** Origin of the data */
    source: "OWID" | "MOCK";

    /** 
     * The actual time-series data. 
     * MUST be sorted by date ascending.
     */
    data: ChartPoint[];

    /** 
     * Metadata from registry and analysis (Data Quality, Attribution) 
     */
    meta?: ChartSeriesMeta;
}

export interface ChartSeriesMeta {
    availableYears?: [number, number]; // From registry
    isMock?: boolean;
    hasGaps?: boolean;
    coverageRatio?: number; // 0-1
    sourceAttribution?: string;
    description?: string;
    unit?: string;
    [key: string]: any;
}

// CACHE / RESPONSE WRAPPER
export interface OWIDResponse {
    entity: string;
    code: string;
    data: ChartPoint[];
}
