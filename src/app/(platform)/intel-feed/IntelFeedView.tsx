"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { IntelDetailSheet } from "@/components/dashboard/IntelDetailSheet";
import { NewsArticle } from "@/lib/types";

// Adapt types if necessary, map to NewsArticle internally or use database type
import { Database } from "@/lib/types";
type NewsSignal = Database['public']['Tables']['news_signals']['Row'];
type Outbreak = Database['public']['Tables']['outbreaks']['Row'];

interface IntelFeedViewProps {
    outbreak: Outbreak;
    news: NewsSignal[];
}

export function IntelFeedView({ outbreak, news }: IntelFeedViewProps) {
    const [selectedItem, setSelectedItem] = useState<NewsArticle | null>(null);

    // Adapt DB signal to NewsArticle for the Sheet
    const handleSelect = (signal: NewsSignal) => {
        setSelectedItem({
            id: signal.id,
            title: signal.title,
            date: new Date(signal.published_at).toLocaleDateString(),
            source: signal.source,
            summary: signal.summary || "",
            sentiment: signal.signal_level === 'high' ? 'serious' : signal.signal_level === 'medium' ? 'negative' : 'neutral', // Map
            relevance_score: 1.0
        });
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-white mb-4">Intel Feed: {outbreak.title}</h1>

            <IntelDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />

            <div className="grid gap-4">
                {news.length === 0 ? (
                    <div className="text-slate-400 italic">No intelligence signals detected yet.</div>
                ) : (
                    news.map((item) => (
                        <GlassPanel
                            key={item.id}
                            className="p-4 border-white/5 bg-slate-950/30 hover:bg-slate-900/50 transition-colors cursor-pointer group"
                            onClick={() => handleSelect(item)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded border ${item.signal_level === 'high' ? 'border-red-500 text-red-400 bg-red-950/30' :
                                    item.signal_level === 'medium' ? 'border-amber-500 text-amber-400 bg-amber-950/30' :
                                        'border-slate-500 text-slate-400'
                                    }`}>
                                    {item.signal_level.toUpperCase()}
                                </span>
                                <span className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                    {new Date(item.published_at).toLocaleDateString()}
                                    <span className="opacity-0 group-hover:opacity-100 text-primary transition-opacity text-[10px] uppercase font-bold">View Details →</span>
                                </span>
                            </div>
                            <h3 className="text-lg font-medium text-slate-200 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl line-clamp-2">
                                {item.summary}
                            </p>
                            <div className="mt-3 text-xs text-slate-600 uppercase tracking-widest">
                                Source: {item.source}
                            </div>
                        </GlassPanel>
                    ))
                )}
            </div>
        </div>
    );
}
