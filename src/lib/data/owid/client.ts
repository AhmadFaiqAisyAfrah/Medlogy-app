import { ChartPoint, OWIDResponse } from "@/lib/chart/contract";
import { OwidSourceConfig } from "./sources";

// Simple in-memory cache for the session (since we are client-side or server-side)
// If server-side, this persists for the lambda lifetime.
const CACHE = new Map<string, any[]>();

/**
 * Fetches and parses CSV data from OWID.
 * Returns raw array of objects.
 */
interface OwidResult {
    data?: any[];
    error?: {
        type: "LICENSING" | "NETWORK" | "PARSING" | "BLOCKED";
        message: string;
    };
}

export async function fetchOwidData(config: OwidSourceConfig): Promise<OwidResult> {
    if (CACHE.has(config.url)) {
        return { data: CACHE.get(config.url)! };
    }

    try {
        const res = await fetch(config.url, {
            next: { revalidate: 3600 }
        });

        // 1. Strict Status Handling
        if (res.status === 403) {
            return {
                error: { type: "LICENSING", message: "Data restricted by OWID licensing" }
            };
        }

        if (res.status !== 200) {
            return {
                error: { type: "NETWORK", message: `HTTP ${res.status}: ${res.statusText}` }
            };
        }

        const text = await res.text();

        // 2. Safe Parsing
        if (!text || text.trim().length === 0) {
            return {
                error: { type: "PARSING", message: "Empty response" }
            };
        }

        const data = parseCSV(text);
        if (data.length === 0) {
            return {
                error: { type: "PARSING", message: "Invalid or empty CSV" }
            };
        }

        CACHE.set(config.url, data);
        return { data };

    } catch (err: any) {
        return {
            error: { type: "NETWORK", message: err.message || "Network request failed" }
        };
    }
}

/**
 * Simple CSV Parser
 * Handles basics, assumes headers in first row.
 */
function parseCSV(text: string): any[] {
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, '')); // Remove quotes
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const currentline = lines[i].split(",");

        // Basic split doesn't handle commas inside quotes, but OWID usually is clean or uses quotes.
        // For a robust implementation we might need a library, but for E2.1 simple split is often enough 
        // if we assume standard numeric data. 
        // WARNING: If OWID uses complex quoted strings, this will break. 
        // We'll stick to simple for now as requested "No external heavy libs if possible".

        if (currentline.length === headers.length) {
            const obj: any = {};
            for (let j = 0; j < headers.length; j++) {
                let val = currentline[j].trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                obj[headers[j]] = val;
            }
            result.push(obj);
        }
    }
    return result;
}
