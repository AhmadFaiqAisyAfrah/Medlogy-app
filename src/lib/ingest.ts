
import { createClient } from '@supabase/supabase-js';
import { storeEmbeddings } from './knowledge';

// Initialize Supabase Client (Service Role for Ingestion)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Firecrawl API (Using raw fetch for simplicity if SDK not present)
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v0';
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';

interface CrawlResult {
    title: string;
    url: string;
    markdown: string;
    metadata?: any;
}

export async function crawlNews(query: string): Promise<CrawlResult[]> {
    // Use Firecrawl 'search' to find relevant pages
    const response = await fetch(`${FIRECRAWL_API_URL}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
        },
        body: JSON.stringify({
            query: query,
            pageOptions: {
                fetchPageContent: true // Get content immediately
            }
        })
    });

    if (!response.ok) {
        console.error("Firecrawl search failed", await response.text());
        return [];
    }

    const data = await response.json();
    // Map Firecrawl response to our generic result
    return data.data.map((item: any) => ({
        title: item.title || 'No Title',
        url: item.url,
        markdown: item.markdown || item.content || '',
        metadata: item.metadata
    }));
}

export async function ingestOutbreakData(outbreakId: string, diseaseName: string) {
    console.log(`Starting ingestion for ${diseaseName}...`);

    // 1. Crawl generic news/reports
    const newsResults = await crawlNews(`${diseaseName} outbreak health reports recent`);

    for (const item of newsResults) {
        // 2. Store in Database
        const { data: newsRecord, error } = await supabase
            .from('news_sources')
            .insert({
                outbreak_id: outbreakId,
                title: item.title,
                source: new URL(item.url).hostname,
                url: item.url,
                published_at: new Date().toISOString() // Approximate if not provided
            })
            .select('id')
            .single();

        if (error) {
            console.error(`DB Insert Error for ${item.url}:`, error);
            continue;
        }

        if (newsRecord) {
            // 3. Store in Pinecone (Embeddings)
            await storeEmbeddings({
                id: newsRecord.id,
                text: `${item.title}\n\n${item.markdown.substring(0, 1000)}`, // Truncate content for embedding
                metadata: {
                    type: 'news',
                    disease: diseaseName,
                    url: item.url
                }
            });
        }
    }

    console.log(`Ingestion complete for ${diseaseName}. Processed ${newsResults.length} items.`);
}
