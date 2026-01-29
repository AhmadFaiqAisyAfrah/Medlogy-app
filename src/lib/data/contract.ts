import { ChartSeries } from "@/lib/chart/contract";

export type IngestionSourceType =
    | "local_ihme"    // Processed JSON files from IHME/GBD
    | "owid_csv"      // OWID Grapher CSV (Proxied)
    | "world_bank"    // World Bank API
    | "simulation"    // Internal mock/algorithm
    | "static_csv";   // Generic static CSV in repo

export interface IngestionContext {
    indicatorId: string;
    regionCode: string; // ISO-3 or mapped slug (e.g. "IDN", "global")

    // Ingestion params from registry (e.g. filename, slug, api_code)
    param?: string;

    // Time filtering preference (optional, adapter can ignore)
    yearRange?: [number, number];
}

export interface DataAdapter {
    id: IngestionSourceType;

    /**
     * Standardized fetch method.
     * Must always return a ChartSeries or null (never throw if possible, just return null/error meta).
     */
    fetchData(context: IngestionContext): Promise<ChartSeries | null>;
}

export interface DataServiceResponse {
    data: ChartSeries | null;
    status: "success" | "error" | "loading";
    error?: string;
    description?: string;
}
