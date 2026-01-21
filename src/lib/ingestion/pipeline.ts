import { fetchRawConnect } from "./fetch";
import { parseWHONews } from "./parse";
import { mapToNewsSignal } from "./mapper";
import { saveNewsSignals } from "@/lib/mutations/ingest";
import { getActiveOutbreak } from "@/lib/data";

/**
 * Orchestrates the Ingestion Pipeline.
 */
export async function runIngestionPipeline() {
    console.log("Starting Ingestion Pipeline...");

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("Missing FIRECRAWL_API_KEY");

    // 1. Target
    const TARGET_URL = "https://www.who.int/emergencies/disease-outbreak-news";
    const activeOutbreak = await getActiveOutbreak();

    if (!activeOutbreak) {
        throw new Error("No active outbreak found to link news to.");
    }
    const outbreakId = activeOutbreak.id; // Link all general news to the active outbreak for MVP context

    // 2. Fetch
    console.log(`Fetching from ${TARGET_URL}...`);
    const rawData = await fetchRawConnect(TARGET_URL, apiKey);

    if (!rawData || !rawData.markdown) {
        throw new Error("No markdown data received from Firecrawl.");
    }

    // 3. Parse
    console.log("Parsing markdown...");
    const parsedItems = parseWHONews(rawData.markdown);
    console.log(`Found ${parsedItems.length} potential items.`);

    // 4. Map
    const signals = mapToNewsSignal(parsedItems, outbreakId);

    // 5. Save
    console.log("Saving inputs...");
    const stats = await saveNewsSignals(signals);

    console.log(`Ingestion Complete. Inserted: ${stats.inserted}, Skipped: ${stats.skipped}`);
    return {
        success: true,
        itemsFound: parsedItems.length,
        inserted: stats.inserted,
        skipped: stats.skipped,
        sample: signals.slice(0, 2)
    };
}
