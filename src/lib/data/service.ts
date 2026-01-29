import { ChartSeries } from "@/lib/chart/contract";
import { getIndicatorMeta } from "@/lib/chart/indicatorRegistry";
import { DataAdapter, IngestionContext } from "./contract";
import { IhmeJsonAdapter } from "./adapters/ihme";
import { OwidAdapter } from "./adapters/owid";
import { SimulationAdapter } from "./adapters/simulation";

const adapters: Record<string, DataAdapter> = {
    local_ihme: new IhmeJsonAdapter(),
    owid_csv: new OwidAdapter(),
    simulation: new SimulationAdapter()
};

/**
 * The Unified Data Access Layer.
 * Call this from Server Actions or API Routes.
 */
import { resolveRegionCode } from "./regions";

export async function getIndicatorData(
    indicatorId: string,
    rawRegion: string,
    yearRange?: [number, number]
): Promise<ChartSeries | null> {

    // 0. Normalize Region (Indonesia -> IDN)
    const regionCode = resolveRegionCode(rawRegion);

    // 1. Resolve Metadata
    const meta = getIndicatorMeta(indicatorId);
    if (!meta) {
        console.warn(`[DataService] Unknown indicator: ${indicatorId}`);
        return null;
    }

    // 2. Identify Strategy
    const ingestion = meta.ingestion;
    if (!ingestion) {
        console.warn(`[DataService] No ingestion configured for ${indicatorId}`);
        return null;
    }

    // 3. Select Adapter
    const adapter = adapters[ingestion.type];
    if (!adapter) {
        console.warn(`[DataService] No adapter for type: ${ingestion.type}`);
        return null;
    }

    // 4. Execute
    const context: IngestionContext = {
        indicatorId,
        regionCode,
        param: ingestion.param,
        yearRange
    };

    return await adapter.fetchData(context);
}
