
import { createAdminClient } from '@/lib/supabase/admin';
import { PublicNewsItem } from '@/lib/types';

const ECDC_RSS = "https://www.ecdc.europa.eu/en/taxonomy/term/1505/feed";
const CDC_RSS = "https://tools.cdc.gov/api/v2/resources/media/132608.rss";
const WHO_INDEX = "https://www.who.int/emergencies/disease-outbreak-news";

// Simple XML Parser for RSS
function parseRSS(xml: string): { title: string; link: string; pubDate: string; description: string }[] {
    const items: { title: string; link: string; pubDate: string; description: string }[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemContent = match[1];
        const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemContent.match(/<title>(.*?)<\/title>/);
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
        const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
        const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || itemContent.match(/<description>(.*?)<\/description>/);

        if (titleMatch && linkMatch) {
            items.push({
                title: titleMatch[1].trim(),
                link: linkMatch[1].trim(),
                pubDate: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
                description: descMatch ? descMatch[1].trim() : ''
            });
        }
    }
    return items;
}

// Simple HTML Parser for WHO Index (Regex-based as fallback)
function parseWHOIndex(html: string): { title: string; link: string; date: string }[] {
    const items: { title: string; link: string; date: string }[] = [];
    // Looking for DON links: class="sf-list-vertical__item" or similar structure
    // <a href="/emergencies/disease-outbreak-news/item/..." ... > ... title ... </a>
    // This is brittle but sufficient for fallback trigger.

    // Pattern: <a class="sf-list-vertical__item" href="(...)" ... > ... <span class="sf-list-vertical__title">(...)</span> ... <span class="sf-list-vertical__date">(...)</span>
    // Simplified regex search for likely links
    const linkRegex = /href="(\/emergencies\/disease-outbreak-news\/item\/[^"]+)"[\s\S]*?<span class="sf-list-vertical__title">(.*?)<\/span>[\s\S]*?<span class="sf-list-vertical__date">(.*?)<\/span>/g;

    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        items.push({
            link: "https://www.who.int" + match[1],
            title: match[2].trim(),
            date: match[3].trim()
        });
    }
    return items;
}


async function fetchAndParseRSS(url: string, source: 'CDC' | 'ECDC'): Promise<Partial<PublicNewsItem>[]> {
    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error(`Failed to fetch ${source} RSS`);
        const xml = await res.text();
        const items = parseRSS(xml);

        return items.map(item => ({
            title: item.title.replace(/<!\[CDATA\[|\]\]>/g, ''), // Clean CDATA
            url: item.link,
            source: source,
            published_at: new Date(item.pubDate).toISOString(),
            original_snippet: item.description.replace(/<[^>]*>/g, '').substring(0, 500) // Strip HTML
        }));
    } catch (e) {
        console.error(`Error fetching ${source}:`, e);
        return [];
    }
}

async function scrapeWHO(): Promise<Partial<PublicNewsItem>[]> {
    try {
        const res = await fetch(WHO_INDEX, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error("Failed to fetch WHO Index");
        const html = await res.text();
        const items = parseWHOIndex(html);

        return items.map(item => ({
            title: item.title,
            url: item.link,
            source: 'WHO',
            published_at: new Date(item.date).toISOString(), // Need to ensure date parsing works
            original_snippet: "Scraping from WHO Disease Outbreak News index."
        }));
    } catch (e) {
        console.error("Error scraping WHO:", e);
        return [];
    }
}

export async function ingestGlobalHealthNews(): Promise<{ processed: number; errors: number }> {
    const supabase = createAdminClient();

    // 1. Fetch all Raw Items
    const [cdcItems, ecdcItems, whoItems] = await Promise.all([
        fetchAndParseRSS(CDC_RSS, 'CDC'),
        fetchAndParseRSS(ECDC_RSS, 'ECDC'),
        scrapeWHO()
    ]);

    const allItems = [...cdcItems, ...ecdcItems, ...whoItems];
    let processedCount = 0;

    // 2. Process & Insert
    for (const item of allItems) {
        if (!item.url || !item.title) continue;

        // Check deduplication via URL
        const { data: existing } = await supabase
            .from('public_news_feed')
            .select('id')
            .eq('url', item.url)
            .single();

        if (existing) continue;

        // Insert new item
        const { error } = await (supabase
            .from('public_news_feed' as any) as any)
            .insert({
                title: item.title,
                url: item.url,
                source: item.source,
                published_at: item.published_at || new Date().toISOString(),
                original_snippet: item.original_snippet,
                ai_headline: null,
                ai_summary: null,
                ai_why_this_matters: null,
                ai_processed: false
            });


        if (!error) {
            processedCount++;
            // Enrich immediately (could be async queue in prod)
            await enrichNewsItem(item.title, item.original_snippet || item.title, item.url);
        }
    }

    return { processed: processedCount, errors: 0 };
}

async function enrichNewsItem(title: string, snippet: string, url: string) {
    const supabase = createAdminClient();
    const AI_BASE = process.env.AI_BASE_URL;
    const AI_KEY = process.env.AI_API_KEY;
    const AI_MODEL = process.env.AI_MODEL || 'gpt-5.1';

    if (!AI_BASE || !AI_KEY) {
        console.warn("AI Credentials missing. Skipping enrichment.");
        return;
    }

    const prompt = `
You are a public health news editor.
Rewrite the following news item for a public audience.
Current Title: "${title}"
Snippet: "${snippet.substring(0, 1000)}"

Output strict JSON:
{
  "headline": "Neutral, journalistic headline (max 12 words)",
  "summary": "2-3 sentences summarizing the event comfortably.",
  "why_matches": "1 sentence explaining why this is important for global health."
}
No Markdown. No Preambles.
    `;

    try {
        const res = await fetch(`${AI_BASE}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_KEY}`
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            })
        });

        if (!res.ok) throw new Error("AI API Failed");
        const data = await res.json();
        const content = data.choices[0]?.message?.content;

        // Basic JSON extraction
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            await (supabase.from('public_news_feed' as any) as any).update({
                ai_headline: parsed.headline,
                ai_summary: parsed.summary,
                ai_why_this_matters: parsed.why_matches,
                ai_processed: true
            }).eq('url', url);
        }
    } catch (e) {
        console.error("AI Enrichment Failed:", e);
    }
}
