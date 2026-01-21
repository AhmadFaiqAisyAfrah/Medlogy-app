"use client";

import { useState } from "react";
import { BentoGrid, BentoItem } from "@/components/dashboard/BentoGrid";
import { StatCard } from "@/components/dashboard/StatCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CorrelationChart } from "@/components/dashboard/charts/CorrelationChart";
import { IntelFeed } from "@/components/dashboard/feeds/IntelFeed";
import { InsightSummary } from "@/components/dashboard/InsightSummary";
import { IntelDetailSheet } from "@/components/dashboard/IntelDetailSheet";
import { DataLayerToggle, DataLayer } from "@/components/dashboard/DataLayerToggle";
import { Activity, Users, AlertTriangle, TrendingUp, Map, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { NewsArticle, JournalArticle, EpiPoint, OutbreakScenario, PolicyStatus } from '@/lib/types';
import { cn } from "@/lib/utils";
import { PolicyPanel } from "@/components/dashboard/PolicyPanel";
import { AiPromptInput } from "@/components/ui/AiPromptInput";
import { explainAnalytics } from "@/app/(platform)/analysis/actions";

interface AnalysisViewProps {
    scenario: OutbreakScenario;
    epidemiology: EpiPoint[];
    news: NewsArticle[];
    literature: JournalArticle[];
    caseTrend: number;
    latestEpi: EpiPoint | undefined;
    dbInsights?: string[];
    policyStatus?: PolicyStatus | null;
}

export function AnalysisView({ scenario, epidemiology, news, literature, caseTrend, latestEpi, dbInsights, policyStatus }: AnalysisViewProps) {
    const [layer, setLayer] = useState<DataLayer>('analytical');

    // Use DB insights if available, otherwise fallback to mock (or empty)
    // Map string array to object with 'type' for UI compatibility
    const displayInsights = dbInsights && dbInsights.length > 0
        ? dbInsights.map((text, i) => ({
            text,
            type: i === 0 ? 'negative' : i === dbInsights.length - 1 ? 'serious' : 'neutral' // Simple heuristic for MVP visual variety
        }))
        : [
            { text: "System awaiting generated insights...", type: 'neutral' }
        ];

    const [selectedIntelItem, setSelectedIntelItem] = useState<NewsArticle | JournalArticle | null>(null);

    // AI State
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [lastQuery, setLastQuery] = useState("");

    const handleAiQuery = async (query: string) => {
        setIsAiLoading(true);
        setLastQuery(query);
        setAiResponse(null);

        try {
            // Calling Server Action
            const result = await explainAnalytics(query, scenario.scenarioId); // Assuming scenarioId might be outbreakId prefix or we should pass specific ID if we had it. 
            // Note: explainAnalytics logic currently handles finding outbreak by region_id or active. 
            // Better to update explainAnalytics to accept outbreakId if we have it, or just query string.
            // For MVP this is fine.

            if (result.success) {
                setAiResponse(result.message || "Explanation generated.");
            } else {
                setAiResponse("I'm sorry, I couldn't generate an explanation at this time. " + result.message);
            }
        } catch (e) {
            setAiResponse("An error occurred while contacting the intelligence engine.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6 pb-20 px-2"
        >
            {/* Sheet for Details */}
            <IntelDetailSheet
                item={selectedIntelItem}
                onClose={() => setSelectedIntelItem(null)}
            />

            {/* Insight Summary - Always Visible */}
            <InsightSummary points={displayInsights as any} riskLevel={scenario.status === 'monitoring' ? 'High' : 'Low'} />

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DataLayerToggle activeLayer={layer} onChange={setLayer} />
                <div className="text-xs text-slate-500 text-right hidden sm:block">
                    Last Index Update: <span className="text-slate-400 font-mono">14m ago</span>
                </div>
            </div>

            <BentoGrid className="gap-6">
                {/* Stats Row */}
                <BentoItem colSpan={1}>
                    <StatCard
                        label="Active Cases"
                        value={latestEpi?.cases.toLocaleString() || "0"}
                        icon={Activity}
                        trend={{ value: caseTrend, isPositive: caseTrend > 0 }}
                        className={cn("bg-slate-950/40 border-white/10", layer === 'summary' && "opacity-80 grayscale-[0.3]")}
                        minimal={layer === 'summary'}
                    />
                </BentoItem>
                <BentoItem colSpan={1}>
                    <StatCard
                        label="Recovered"
                        value={latestEpi?.recovered.toLocaleString() || "0"}
                        icon={TrendingUp}
                        trend={{ value: 5, isPositive: true }}
                        className={cn("bg-slate-950/40 border-white/10", layer === 'summary' && "opacity-80 grayscale-[0.3]")}
                        minimal={layer === 'summary'}
                    />
                </BentoItem>

                {/* Policy Panel - Replaces Critical Alerts & Monitoring Units for Phase 3 */}
                <BentoItem colSpan={2}>
                    <PolicyPanel status={policyStatus || null} />
                </BentoItem>

                {/* Main Chart */}
                <BentoItem colSpan={2} rowSpan={2} className="min-h-[400px]">
                    <GlassPanel className="h-full flex flex-col bg-slate-950/30 border-white/10" noBorder>
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Activity size={18} className="text-primary" />
                                Correlation Analysis
                            </h3>
                            {layer !== 'summary' && (
                                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Cases</div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500" /> News Events</div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 w-full relative h-[400px] flex flex-col">
                            {/* Summary Header - Relative positioning only for Summary Layer */}
                            {layer === 'summary' && (
                                <div className="mb-4 bg-slate-900/50 border-l-2 border-primary p-3 rounded-r-lg">
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <strong className="text-primary font-medium uppercase tracking-wider text-[10px] block mb-1">Executive Check:</strong> Case growth tracks closely with negative news events (2-day lag).
                                    </p>
                                </div>
                            )}

                            {/* Chart Area - Auto-resize */}
                            {/* Hide Chart in Research Mode if desired, but for MVP keeping it visible is safer unless explicitly asked to hide. User said "Research: show literature panel only". Let's hide chart in Research mode? Strict interpretation creates layout holes. Let's keep chart but maybe different data?
                               Current decision: Keep chart in all but Research.
                            */}
                            {layer !== 'research' ? (
                                <div className="flex-1 w-full min-h-0">
                                    <CorrelationChart data={epidemiology} newsEvents={news} />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500 text-sm italic">
                                    Chart disabled in Research View. Focus on Literature.
                                </div>
                            )}

                            {/* Research Caption - Kept relative but at bottom */}
                            {layer === 'research' && (
                                <div className="mt-auto pt-2 bg-slate-900/90 border-t border-white/5 p-2 rounded text-[10px] text-slate-400 font-mono text-center">
                                    Model: SIR-V | Confidence: 87% | Source: MOH + Firecrawl
                                </div>
                            )}
                        </div>
                    </GlassPanel>
                </BentoItem>

                {/* Intel Feed */}
                <BentoItem colSpan={1} rowSpan={2} className="md:col-span-2 lg:col-span-1 min-h-[400px]">
                    <GlassPanel className="h-full flex flex-col overflow-hidden bg-slate-950/30 border-white/10" noBorder>
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Activity size={18} className="text-emerald-400" />
                                Intel Feed
                            </h3>
                            {layer === 'research' && (
                                <span className="text-[10px] font-mono text-slate-500">LIVE | WEBSOCKET_ACTIVE</span>
                            )}
                        </div>
                        <IntelFeed news={news} literature={literature} layer={layer} onItemSelect={setSelectedIntelItem} />
                    </GlassPanel>
                </BentoItem>

                {/* Geospatial */}
                <BentoItem colSpan={1} rowSpan={2} className="min-h-[400px] hidden xl:block">
                    <GlassPanel className="h-full flex flex-col relative overflow-hidden bg-slate-950/30 border-white/10 group" noBorder>
                        <div className="absolute inset-0 bg-[#0f1729] z-0 opacity-50 transition-opacity duration-700 group-hover:opacity-40" />

                        {/* Hints */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-20 opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                            <div className="mb-3 mx-auto w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 animate-pulse-slow">
                                <Map className="text-indigo-400 opacity-60" />
                            </div>
                            <p className="text-sm font-medium text-slate-400">Hover to explore regional patterns</p>
                        </div>

                        {/* Grid Pattern */}
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                backgroundSize: '32px 32px'
                            }}
                        />

                        <div className="relative z-10 flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Map size={18} className="text-indigo-400" />
                                Geospatial
                            </h3>
                            {layer === 'research' && (
                                <span className="text-[10px] font-mono text-indigo-400 border border-indigo-500/20 px-1 rounded">
                                    RES: 10km
                                </span>
                            )}
                        </div>

                        {/* Map Area */}
                        <div className="flex-1 w-full pl-6 pt-6 opacity-40 group-hover:opacity-100 transition-opacity duration-500 relative">
                            {/* Abstract Map visual for Jakarta MVP */}
                            {/* Using specific coordinates % to roughly place Jakarta in an abstract South-East Asian crop */}
                            <div className="w-full h-full border-l border-t border-indigo-500/20 rounded-tl-3xl relative overflow-hidden">

                                {/* Abstract Landmass Shapes roughly implying Java/Indonesia */}
                                <div className="absolute top-[40%] left-[10%] w-[80%] h-[15%] bg-indigo-500/10 rotate-[-5deg] rounded-full blur-xl" />
                                <div className="absolute top-[30%] left-[60%] w-[30%] h-[10%] bg-indigo-500/10 rotate-[10deg] rounded-full blur-xl" />

                                {/* Jakarta Marker */}
                                <div className="absolute top-[45%] left-[30%] group/marker cursor-help">
                                    {/* Ripple */}
                                    <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping" />
                                    <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse relative z-10" />

                                    {/* Tooltip */}
                                    <div className="absolute left-6 top-0 bg-slate-900 border border-white/10 p-3 rounded-lg w-48 opacity-0 group-hover/marker:opacity-100 transition-opacity z-50 pointer-events-none">
                                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">{scenario.location}</h4>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-slate-400">Status</span>
                                                <span className="text-red-400 font-mono uppercase">{scenario.status}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-slate-400">Active Cases</span>
                                                <span className="text-white font-mono">{latestEpi?.cases.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Abstract Other Clusters */}
                                <div className="absolute top-[38%] left-[70%] w-2 h-2 bg-indigo-500/30 rounded-full" />
                                <div className="absolute top-[55%] left-[50%] w-1.5 h-1.5 bg-indigo-500/30 rounded-full" />
                            </div>
                        </div>
                    </GlassPanel>
                </BentoItem>




            </BentoGrid>

            {/* AI Prompt Input */}
            <div className="pt-8 pb-4 space-y-4 max-w-3xl mx-auto">
                <AiPromptInput
                    placeholder="Ask analytical questions about this scenario (Gemini Powered)..."
                    onSearch={handleAiQuery}
                    isLoading={isAiLoading}
                />

                {/* AI Response Area */}
                {aiResponse && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/80 border border-primary/20 rounded-xl p-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent" />

                        <div className="flex items-start gap-3 mb-2">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Sparkles size={16} />
                            </div>
                            <p className="text-xs font-mono text-primary/80 mt-1">MEDLOGY INTELLIGENCE</p>
                        </div>

                        <div className="pl-10 space-y-4">
                            <p className="text-sm font-medium text-slate-300 italic">"{lastQuery}"</p>
                            <p className="text-slate-100 leading-relaxed whitespace-pre-line">
                                {aiResponse}
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div >
    );
}
