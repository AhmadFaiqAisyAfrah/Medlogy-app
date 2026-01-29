import { DataAdapter, IngestionContext, IngestionSourceType } from "../contract";
import { ChartSeries } from "@/lib/chart/contract";
import fs from "fs";
import path from "path";

interface IhmeJsonSchema {
    indicator: string;
    region: string;
    dataStatus: string;
    source: string;
    unit: string;
    data: { year: number; value: number }[];
}

export class IhmeJsonAdapter implements DataAdapter {
    id: IngestionSourceType = "local_ihme";

    async fetchData(context: IngestionContext): Promise<ChartSeries | null> {
        // We expect param to be the filename pattern (e.g. "dengue_incidence_{REGION}.json")
        if (!context.param) return null;

        // Resolve params
        const finalFilename = context.param.replace("{REGION}", context.regionCode);

        // Security: Prevent directory traversal
        const filename = path.basename(finalFilename);
        const filePath = path.join(process.cwd(), "src/lib/data/ihme/processed", filename);

        // Synchronous check is fine server-side for local files
        if (!fs.existsSync(filePath)) {
            console.warn(`[IhmeAdapter] File not found: ${filePath}`);
            return null;
        }

        try {
            const raw = fs.readFileSync(filePath, "utf-8");
            const json = JSON.parse(raw);

            // 🌟 SUPPORT MULTI-REGION FILES (User Request)
            // If the JSON has a "regions" key, we look up the specific region inside it.
            if ("regions" in json) {
                const regionData = json.regions[context.regionCode]; // e.g. "IDN"

                if (!regionData) {
                    console.warn(`[IhmeAdapter] Multi-region file found, but region "${context.regionCode}" is missing.`);
                    return null;
                }

                return {
                    id: `${context.indicatorId}-${context.regionCode}`,
                    indicator: json.indicator,
                    region: context.regionCode, // "IDN" or "Global"
                    unit: json.unit || regionData.unit,
                    source: "IHME",
                    data: regionData.data
                        .filter((d: any) => {
                            if (!context.yearRange) return true;
                            return d.year >= context.yearRange[0] && d.year <= context.yearRange[1];
                        })
                        .map((d: any) => ({
                            date: `${d.year}-01-01`,
                            value: d.value,
                            upper: d.upper,
                            lower: d.lower
                        })),
                    meta: {
                        dataStatus: json.dataStatus,
                        sourceAttribution: json.source,
                        availableYears: [regionData.data[0]?.year, regionData.data[regionData.data.length - 1]?.year]
                    }
                };
            }

            // 🏠 LEGACY SINGLE-REGION SUPPORT
            // This handles the existing split files (dengue_incidence_IDN.json, etc.)
            return {
                id: `${context.indicatorId}-${context.regionCode}`,
                indicator: json.indicator,
                region: json.region,
                unit: json.unit,
                source: "IHME",
                data: json.data
                    .filter((d: any) => {
                        if (!context.yearRange) return true;
                        return d.year >= context.yearRange[0] && d.year <= context.yearRange[1];
                    })
                    .map((d: any) => ({
                        date: `${d.year}-01-01`,
                        value: d.value,
                        upper: d.upper, // Persist detailed bounds if available
                        lower: d.lower
                    })),
                meta: {
                    dataStatus: json.dataStatus,
                    sourceAttribution: json.source,
                    availableYears: [json.data[0]?.year, json.data[json.data.length - 1]?.year]
                }
            };
        } catch (error) {
            console.error(`[IhmeAdapter] Error parsing ${filename}`, error);
            return null;
        }
    }
}
