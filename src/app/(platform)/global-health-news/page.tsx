
import { createAdminClient } from "@/lib/supabase/admin";
import { GlobalNewsFeed } from "@/components/news/GlobalNewsFeed";
import { NewsSearch } from "@/components/news/NewsSearch";
import { Globe, Sparkles } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface PageProps {
    searchParams: { q?: string };
}

// Simple heuristic for region detection
// Simple heuristic for region detection
const REGIONS = ['indonesia', 'jakarta', 'java', 'bali', 'asia', 'europe', 'africa', 'america', 'usa', 'global', 'world'];

interface PublicNewsItem {
    id: string;
    title: string;
    url: string;
    source: 'WHO' | 'CDC' | 'ECDC';
    published_at: string;
    ai_headline: string | null;
    ai_summary: string | null;
    ai_why_this_matters: string | null;
}

async function getNews(query: string) {
    try {
        const supabase = createAdminClient();

        let dbQuery = supabase
            .from('public_news_feed')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(50); // Fetch mostly recent

        const { data, error } = await dbQuery;

        if (error) throw error;

        // MVP: Filter in-memory for simpler "AI-like" matching without full vector search setup
        if (!data) return [];

        const newsItems = data as unknown as PublicNewsItem[];

        const lowerQ = query.toLowerCase();

        // 1. Detect if specific region mentioned
        const hasRegion = REGIONS.some(r => lowerQ.includes(r));

        // 2. Defaulting Logic
        const targetQ = hasRegion ? lowerQ : `${lowerQ}`; // Keep raw if region exists
        const defaultFilter = !hasRegion; // If no region, we prefer Indonesia context

        return newsItems.filter(item => {
            const content = `${item.title} ${item.ai_summary || ''} ${item.ai_headline || ''}`.toLowerCase();

            // Basic Keyword Match
            const matchQuery = content.includes(lowerQ);

            // Default Region Filter (Indonesia/Jakarta) if strict defaulting required
            // Requirement: "If no country or region is mentioned, default to: Country: Indonesia, Region: Jakarta"
            // This implies: Show ONLY Indonesia/Jakarta news? Or prioritizes? 
            // "Mpox update" -> "Mpox" in Indonesia. 
            // So we check if content matches "Indonesia" or "Jakarta" IF no region was in query.

            if (defaultFilter) {
                const isIndonesiaContext = content.includes('indonesia') || content.includes('jakarta');
                return matchQuery && isIndonesiaContext;
            }

            return matchQuery;
        });

    } catch (e) {
        console.error("Failed to fetch news:", e);
        return [];
    }
}

export default async function GlobalHealthNewsPage({ searchParams }: PageProps) {
    const query = searchParams.q;

    // STATE 1: ENTRY (No Query)
    if (!query) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[80vh]">
                <div className="max-w-2xl w-full space-y-12">

                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                            <Sparkles className="text-emerald-400" size={40} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            Global Health Intelligence
                        </h1>
                        <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
                            What global health update are you looking for today?
                        </p>
                    </div>

                    <NewsSearch
                        className="w-full max-w-xl mx-auto"
                        centered
                        placeholder="Ask about outbreaks, diseases, or regions..."
                    />

                    <div className="flex flex-wrap gap-3 justify-center text-sm text-slate-500">
                        <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">Try: "Mpox in Jakarta"</span>
                        <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">Try: "Avian Flu detected"</span>
                        <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5">Try: "WHO Alerts"</span>
                    </div>
                </div>
            </div>
        );
    }

    // STATE 2: RESULTS (Query Exists)
    const news = await getNews(query);

    return (
        <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto custom-scroll">
            <div className="max-w-7xl mx-auto w-full space-y-8 pb-12">

                {/* Header Context */}
                <div className="max-w-3xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                        <Globe size={16} />
                        <span>Visualizing intelligence for: <span className="text-emerald-400 font-bold">"{query}"</span></span>
                    </div>
                    <h2 className="text-2xl font-light text-white">
                        Latest Reports & Signals
                    </h2>
                </div>

                <GlobalNewsFeed news={news as any} />

                {/* Persistent Input at Bottom */}
                <div className="pt-12 pb-8 max-w-3xl mx-auto w-full">
                    <NewsSearch
                        initialQuery={query}
                        placeholder="Refine your search..."
                    />
                </div>
            </div>
        </div>
    );
}
