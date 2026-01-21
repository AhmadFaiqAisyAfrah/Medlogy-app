"use client";

import { DetailSheet } from "@/components/ui/DetailSheet";
import { NewsArticle, JournalArticle } from "@/lib/types";
import { FileText, Newspaper, Calendar, Globe, ExternalLink, Bookmark } from "lucide-react";

interface IntelDetailSheetProps {
    item: NewsArticle | JournalArticle | null;
    onClose: () => void;
}

export function IntelDetailSheet({ item, onClose }: IntelDetailSheetProps) {
    if (!item) return null;

    const isNews = 'source' in item;
    const isJournal = 'authors' in item;

    return (
        <DetailSheet isOpen={!!item} onClose={onClose} title={isNews ? "News Intelligence" : "Research Source"}>
            <div className="space-y-6">

                {/* Meta Badge */}
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${isNews
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        }`}>
                        {isNews ? "Media Signal" : "Academic Source"}
                    </span>
                    {isNews && 'sentiment' in item && (
                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${item.sentiment === 'serious' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                            item.sentiment === 'negative' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                                "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            }`}>
                            {item.sentiment}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-white leading-tight">
                    {item.title}
                </h1>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div className="space-y-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Calendar size={12} /> Published
                        </span>
                        <p className="text-sm text-slate-200 font-mono">
                            {item.date}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            {isNews ? <Globe size={12} /> : <Bookmark size={12} />}
                            {isNews ? "Source" : "Journal"}
                        </span>
                        <p className="text-sm text-slate-200 font-medium truncate">
                            {isNews ? (item as NewsArticle).source : (item as JournalArticle).journal}
                        </p>
                    </div>
                    {isJournal && (
                        <div className="col-span-2 space-y-1">
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                <FileText size={12} /> Authors
                            </span>
                            <p className="text-sm text-slate-200">
                                {(item as JournalArticle).authors.join(", ")}
                            </p>
                        </div>
                    )}
                </div>

                {/* Content / Abstract */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                        {isNews ? "Summary" : "Abstract / Relevance"}
                    </h3>
                    <div className="text-base text-slate-300 leading-relaxed space-y-4">
                        <p>
                            {isNews ? (item as NewsArticle).summary : (item as JournalArticle).abstract}
                        </p>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-6">
                    <div className="pt-6">
                        {/* Link Logic: If URL exists, show button. If not, show disabled state with tooltip */}
                        {(item as any).url ? (
                            <a
                                href={(item as any).url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors w-full justify-center group"
                            >
                                Read Original Context <ExternalLink size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ) : (
                            <div className="relative group/tooltip w-full">
                                <button
                                    disabled
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed w-full justify-center"
                                >
                                    Read Original Context <ExternalLink size={14} className="opacity-30" />
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                                    Source link unavailable
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DetailSheet>
    );
}
