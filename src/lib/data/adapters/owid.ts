import { DataAdapter, IngestionContext, IngestionSourceType } from "../contract";
import { ChartSeries } from "@/lib/chart/contract";
import { OWID_SOURCES } from "@/lib/data/owid/sources";
import { dataCache } from "@/lib/data/cache";

export class OwidAdapter implements DataAdapter {
    id: IngestionSourceType = "owid_csv";

    async fetchData(context: IngestionContext): Promise<ChartSeries | null> {
        if (!context.param) return null;

        // 1. Get Config
        const config = OWID_SOURCES[context.param];
        if (!config) {
            console.warn(`[OwidAdapter] No config found for param: ${context.param}`);
            return null;
        }

        // 2. Check Cache
        const cacheKey = `owid:${context.param}:${context.regionCode}`;
        const cached = dataCache.get<ChartSeries>(cacheKey);
        if (cached) return cached;

        // 3. Fetch CSV
        try {
            const res = await fetch(config.url, { next: { revalidate: 3600 } }); // Next.js standard caching
            if (!res.ok) {
                console.error(`[OwidAdapter] HTTP Error ${res.status} fetching ${config.url}`);
                return null;
            }
            const csvText = await res.text();

            // 4. Parse CSV
            // Headers: Entity, Code, Year, <ValueColumn>
            const lines = csvText.trim().split("\n");
            const headers = lines[0].split(",");

            // Find indices
            const idxYear = headers.indexOf(config.columns.date);
            const idxEntity = headers.indexOf(config.columns.entity); // Usually 'Entity' (Country Name) or 'Code' (ISO)? 
            // OWID CSVs usually have "Entity", "Code", "Year". 
            // Medlogy maps region names or codes? 
            // In route.ts: idxCode = headers.indexOf("Code"). Filter cols[idxCode] === region.
            // So we assume context.regionCode corresponds to the "Code" column in OWID (e.g. "IDN").

            const idxCode = headers.indexOf("Code");
            // If Code column doesn't exist, we might fallback to Entity, but for now stick to previous route.ts logic

            // The value column name from config
            const idxValue = headers.indexOf(config.columns.value);

            if (idxYear === -1 || idxValue === -1) {
                console.error(`[OwidAdapter] Invalid schema. Missing Year or Value column.`);
                return null;
            }

            // 5. Transform
            const dataPoints = lines
                .slice(1)
                .map(line => {
                    // CSV splitting is naive here (doesn't handle quoted commas), but sufficient for standard OWID numbers
                    return line.split(",");
                })
                .filter(cols => {
                    // Filter by Region
                    // We assume context.regionCode matches the "Code" column (e.g. "IDN")
                    if (idxCode !== -1) {
                        return cols[idxCode] === context.regionCode;
                    }
                    // Fallback to Entity if Code not found? (Risk of mismatch)
                    return cols[idxEntity] === context.regionCode;
                })
                .map(cols => {
                    const year = cols[idxYear];
                    const val = cols[idxValue];
                    return {
                        date: `${year}-01-01`,
                        value: Number(val)
                    };
                })
                .filter(p => !Number.isNaN(p.value));

            if (dataPoints.length === 0) return null;

            const result: ChartSeries = {
                id: `${context.indicatorId}-${context.regionCode}`,
                indicator: config.label,
                region: context.regionCode,
                unit: "", // OWID config doesn't explicitly store unit in the object, maybe add it later?
                source: "OWID",
                data: dataPoints,
                meta: {
                    sourceAttribution: config.attribution,
                    dataStatus: "observed", // OWID is generally observed
                    redistributable: config.redistributable
                }
            };

            // 6. Save Cache
            dataCache.set(cacheKey, result);

            return result;

        } catch (error) {
            console.error(`[OwidAdapter] Fetch error`, error);
            return null;
        }
    }
}
