import { ChartPoint, OWIDResponse } from "@/lib/chart/contract";
import { OwidSourceConfig } from "./sources";

// Simple in-memory cache for the session (since we are client-side or server-side)
// If server-side, this persists for the lambda lifetime.
const CACHE = new Map<string, any[]>();

/**
 * Fetches and parses CSV data from OWID.
 * Returns raw array of objects.
 */
export async function fetchOwidData(config: OwidSourceConfig): Promise<any[]> {
    if (CACHE.has(config.url)) {
        return CACHE.get(config.url)!;
    }

    try {
        const res = await fetch(config.url, {
            next: { revalidate: 3600 } // Next.js specific: Cache for 1 hour
        });

        // 1. Strict Status Guard
        if (res.status === 403) {
            console.warn(`[OWID] Licensing Block (403): ${config.label}`);
            throw { type: "LICENSING_BLOCK", message: "Data restricted by OWID licensing" };
        }

        if (!res.ok) {
            throw { type: "HTTP_ERROR", status: res.status, message: res.statusText };
        }

        // 2. Only parse if OK
        const text = await res.text();
        const data = parseCSV(text);

        CACHE.set(config.url, data);
        return data;
    } catch (error: any) {
        if (error.type === "LICENSING_BLOCK") {
            throw error; // Re-throw to be handled by adapter
        }
        console.error(`[OWID] Error fetching ${config.label}:`, error);
        return [];
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
