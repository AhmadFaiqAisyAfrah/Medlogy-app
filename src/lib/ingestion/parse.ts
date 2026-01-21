export interface ParsedNewsItem {
    title: string;
    summary: string;
    published_at: string;
    source: string;
    url: string;
}

/**
 * Parses raw markdown from WHO Disease Outbreak News to extract items.
 * Assumes a pattern where items are listed with dates and titles.
 * Heuristic: Look for list items or headers that look like news entries.
 * 
 * Note: WHO DON page markdown structure typically varies, but often:
 * [Title](url)
 * Date
 * Abstract...
 * 
 * We will use a regex heuristic to find the first few detailed items.
 */
export function parseWHONews(markdown: string): ParsedNewsItem[] {
    const items: ParsedNewsItem[] = [];

    // Split by lines to process sequentially
    const lines = markdown.split('\n');

    let currentItem: Partial<ParsedNewsItem> | null = null;
    let captureSummary = false;
    let summaryBuffer: string[] = [];

    // Regex for WHO Date format (e.g., "15 January 2025" or "15 Jan 2025")
    const dateRegex = /(\d{1,2}\s+[A-Za-z]+\s+\d{4})/;

    // Basic state machine to find items
    // This is brittle but sufficient for MVP validation on a specific page structure
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Look for a link that acts as a title, usually followed by a date line
        // Markdown Link: [Title](url)
        const linkMatch = line.match(/^\[(.*?)\]\((.*?)\)$/);

        if (linkMatch) {
            // Potential Title
            // Check if next line is a date (skip blanks)
            let nextLineIndex = i + 1;
            while (nextLineIndex < lines.length && !lines[nextLineIndex].trim()) nextLineIndex++;

            if (nextLineIndex < lines.length) {
                const potentialDateRecord = lines[nextLineIndex].trim();
                const dateMatch = potentialDateRecord.match(dateRegex);

                if (dateMatch) {
                    // Found a new item!
                    // Save previous if exists
                    if (currentItem && currentItem.title) {
                        currentItem.summary = summaryBuffer.join(' ').substring(0, 500); // Limit summary length
                        items.push(currentItem as ParsedNewsItem);
                    }

                    // Reset
                    currentItem = {
                        title: linkMatch[1],
                        url: linkMatch[2].startsWith('http') ? linkMatch[2] : `https://www.who.int${linkMatch[2]}`,
                        published_at: dateMatch[1],
                        source: 'WHO Disease Outbreak News'
                    };
                    summaryBuffer = [];
                    captureSummary = true;
                    i = nextLineIndex; // Advance
                    continue;
                }
            }
        }

        if (captureSummary) {
            // Stop capturing if we hit what looks like nav text or new link
            if (line.match(/^\[.*\]\(.*\)$/) || line.includes("Read more") || line.includes("See all")) {
                captureSummary = false;
            } else {
                summaryBuffer.push(line);
            }
        }
    }

    // Push last item
    if (currentItem && currentItem.title) {
        currentItem.summary = summaryBuffer.join(' ').substring(0, 500);
        items.push(currentItem as ParsedNewsItem);
    }

    return items;
}
