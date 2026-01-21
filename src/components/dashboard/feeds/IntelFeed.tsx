
"use client";

import { useState } from "react";
import { NewsArticle, JournalArticle } from "@/lib/types";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Newspaper, BookOpen, ExternalLink, AlertCircle, Signal } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataLayer } from "../DataLayerToggle";

interface IntelFeedProps {
    news: NewsArticle[];
    literature: JournalArticle[];
    layer?: DataLayer;
    onItemSelect?: (item: NewsArticle | JournalArticle) => void;
}

export function IntelFeed({ news, literature, layer = 'analytical', onItemSelect }: IntelFeedProps) {
    const [activeTab, setActiveTab] = useState<'news' | 'science'>('news');

    // Filter items based on layer for simplicity (Summary = High impact only)
    const filteredNews = layer === 'summary'
        ? news.filter(n => n.sentiment === 'negative').slice(0, 5)
        : news;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-2">
                <button
                    onClick={() => setActiveTab('news')}
                    className={cn(
                        "flex items-center gap-2 text-sm font-medium pb-2 transition-all relative",
                        activeTab === 'news' ? "text-white" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    <Newspaper size={14} />
                    News Signals
                    {activeTab === 'news' && <div className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-primary rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('science')}
                    className={cn(
                        "flex items-center gap-2 text-sm font-medium pb-2 transition-all relative",
                        activeTab === 'science' ? "text-white" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    <BookOpen size={14} />
                    Literature
                    {activeTab === 'science' && <div className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-emerald-500 rounded-full" />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {activeTab === 'news' ? (
                    filteredNews.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onItemSelect?.(item)}
                            className="group relative pl-4 border-l border-white/10 hover:border-primary transition-colors py-1 cursor-pointer"
                        >
                            {/* Signal Indicator */}
                            <div className={cn(
                                "absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-slate-950",
                                item.sentiment === 'negative' ? "bg-rose-500" : "bg-slate-600"
                            )} />

                            <div className="flex justify-between items-start mb-0.5">
                                <span className="flex items-center gap-1.5">
                                    <span className="text-[10px] px-1.5 rounded bg-white/5 border border-white/10 text-slate-400">MEDIA</span>
                                    <span className="text-[10px] text-slate-500">{item.date}</span>
                                </span>
                                {item.sentiment === 'negative' && (
                                    <span className="text-[9px] font-bold text-rose-400 flex items-center gap-1">
                                        <Signal size={8} /> HIGH
                                    </span>
                                )}
                            </div>

                            <h4 className="text-sm font-medium text-slate-200 mb-1 leading-snug group-hover:text-primary transition-colors">
                                {item.title}
                            </h4>

                            {/* "Why this matters" - usually generated, here implied from summary */}
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                {layer === 'summary' ? "Requires monitoring due to negative sentiment." : item.summary}
                            </p>
                        </div>
                    ))
                ) : (
                    literature.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onItemSelect?.(item)}
                            className="group relative pl-4 border-l border-white/10 hover:border-emerald-500 transition-colors py-1 cursor-pointer"
                        >
                            <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-slate-950 bg-emerald-500" />

                            <div className="flex justify-between items-start mb-0.5">
                                <span className="flex items-center gap-1.5">
                                    <span className="text-[10px] px-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">CLINICAL</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.journal}</span>
                                </span>
                            </div>

                            <h4 className="text-sm font-medium text-slate-200 mb-1 leading-snug group-hover:text-emerald-400 transition-colors">
                                {item.title}
                            </h4>

                            <div className="flex flex-wrap gap-1 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-slate-500">— {item.key_findings[0] || "See details"}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
