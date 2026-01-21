
"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe, ShieldAlert, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface NewsItem {
    id: string;
    title: string;
    url: string;
    source: 'WHO' | 'CDC' | 'ECDC';
    published_at: string;
    ai_headline: string | null;
    ai_summary: string | null;
    ai_why_this_matters: string | null;
}

interface PROPS {
    news: NewsItem[];
}

export function GlobalNewsFeed({ news }: PROPS) {
    if (!news.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <Globe className="mb-4 opacity-50" size={48} />
                <p>No global health updates available.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item, idx) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                >
                    <GlassPanel className="h-full flex flex-col p-5 hover:border-primary/30 transition-colors group">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <Badge variant="outline" className={
                                item.source === 'WHO' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                                    item.source === 'CDC' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                                        'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                            }>
                                {item.source}
                            </Badge>
                            <span className="text-xs text-slate-500 font-mono">
                                {new Date(item.published_at).toISOString().split('T')[0]}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-3">
                            <h3 className="text-lg font-semibold text-white leading-tight group-hover:text-primary transition-colors">
                                {item.ai_headline || item.title}
                            </h3>

                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                                {item.ai_summary || "No summary available."}
                            </p>

                            {/* Context Box */}
                            {item.ai_why_this_matters && (
                                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300">
                                    <span className="text-primary font-bold mr-1">Why it matters:</span>
                                    {item.ai_why_this_matters}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-end">
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                Read Source <ExternalLink size={12} />
                            </a>
                        </div>
                    </GlassPanel>
                </motion.div>
            ))}
        </div>
    );
}
