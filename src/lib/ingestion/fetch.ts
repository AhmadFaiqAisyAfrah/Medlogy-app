/**
 * Fetches content from a URL using the Firecrawl API.
 * Uses strict v1/scrape endpoint as requested.
 */
export async function fetchRawConnect(url: string, apiKey: string) {
    if (!apiKey) {
        throw new Error("FIRECRAWL_API_KEY is missing");
    }

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            url: url,
            formats: ["markdown"],
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Firecrawl API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
        throw new Error("Firecrawl API returned unsuccessful result");
    }

    return result.data;
}
