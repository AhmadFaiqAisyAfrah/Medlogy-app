import { AnalysisChat } from "@/components/analysis/AnalysisChat";
import { AnalysisView } from "@/components/dashboard/AnalysisView";
import { RegionSelector } from "@/components/dashboard/RegionSelector";
import { Activity, Map, FileText } from "lucide-react";
import { NewsArticle, JournalArticle, EpiPoint, OutbreakScenario } from '@/lib/types';
import {
    getActiveOutbreak,
    getOutbreakTimeseries,
    getNewsSignals,
    getResearchSources,
    getInsightSummary,
    getActiveRegions,
    getPolicyStatus,
    CaseTimeSeriesRecord,
    NewsSignalRecord,
    ResearchSourceRecord
} from "@/lib/data";
import { getConversations, getConversation } from "@/app/actions/conversation";

interface AnalysisPageProps {
    searchParams: {
        region?: string;
        mode?: string; // 'dashboard' or undefined
        id?: string;
    };
}

export default async function AnalysisPage({ searchParams }: AnalysisPageProps) {
    const isDashboardMode = searchParams.mode === 'dashboard';

    // STATE 1: AI Entry (Default)
    if (!isDashboardMode) {
        const conversations = await getConversations('analysis');
        let initialMessages: any[] = [];
        let initialId: string | undefined = undefined;

        if (searchParams.id) {
            const activeConv = await getConversation(searchParams.id);
            if (activeConv) {
                initialMessages = activeConv.messages;
                initialId = activeConv.id;
            }
        }

        return (
            <AnalysisChat
                initialConversations={conversations}
                initialMessages={initialMessages}
                initialId={initialId}
            />
        );
    }

    // STATE 2: Dashboard Mode (Fetch Data)
    // 0. Fetch Active Regions
    const regions = await getActiveRegions();
    const defaultRegion = regions.find(r => r.name === 'Jakarta') || regions[0];
    const regionId = searchParams.region || (defaultRegion ? defaultRegion.id : undefined);

    // 1. Fetch Outbreak (MVP: Get active outbreak for the selected region)
    // If no regionId found, it will try to fetch ANY active outbreak, which is fine as fallback.
    const outbreak = await getActiveOutbreak(regionId);

    if (!outbreak) {
        return (
            <div className="p-8 text-white flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-full max-w-md flex justify-end">
                    <RegionSelector regions={regions} activeRegionId={regionId || ""} />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-xl font-semibold">No Active Outbreak Data</p>
                    <p className="text-slate-400">No outbreak has been registered for this region yet.</p>
                </div>
                {/* Fallback to chat, passing empty/default props since we are in error state */}
                <AnalysisChat
                    initialConversations={await getConversations('analysis')}
                    initialMessages={[]}
                    initialId={undefined}
                />
            </div>
        );
    }

    // 2. Fetch Related Data concurrently
    const [
        timeSeries,
        newsData,
        researchData,
        insightData,
        policyData
    ] = await Promise.all([
        getOutbreakTimeseries(outbreak.id),
        getNewsSignals(outbreak.id),
        getResearchSources(outbreak.id),
        getInsightSummary(outbreak.id),
        getPolicyStatus(outbreak.id)
    ]);

    // 3. Transform Data to UI Interfaces

    // Map Epidemiology
    const epidemiology: EpiPoint[] = (timeSeries || []).map((ts: CaseTimeSeriesRecord) => ({
        date: ts.date,
        cases: ts.active_cases,
        deaths: ts.critical > 5 ? Math.floor(ts.critical * 0.2) : 0, // Inferred for MVP visualization
        recovered: ts.recovered,
        hospitalized: ts.critical,
        positivity_rate: ts.positivity_rate || 0
    }));

    // Map News
    const news: NewsArticle[] = (newsData || []).map((n: NewsSignalRecord) => ({
        id: n.id,
        date: new Date(n.published_at).toISOString().split('T')[0],
        source: n.source,
        title: n.title,
        summary: n.summary || "",
        // Map Signal Level to UI Sentiment
        sentiment: n.signal_level === 'high' ? 'serious' : n.signal_level === 'medium' ? 'negative' : 'neutral',
        relevance_score: 0.9 // Default for Seed
    }));

    // Map Literature
    const literature: JournalArticle[] = (researchData || []).map((r: ResearchSourceRecord) => ({
        id: r.id,
        title: r.title,
        journal: r.journal || "Unknown Journal",
        authors: r.authors ? r.authors.split(', ') : [],
        date: r.year?.toString() || "2025",
        type: "Article",
        abstract: r.relevance_note || "No abstract available.",
        key_findings: [],
        url: r.url || ""
    }));

    // Map Scenario
    const scenario: OutbreakScenario = {
        scenarioId: outbreak.id.slice(0, 8).toUpperCase(),
        name: outbreak.title,
        startDate: outbreak.start_date,
        location: `${outbreak.location_city || outbreak.location_country}`, // Using city or country if city missing
        pathogen: {
            name: outbreak.pathogen,
            strain: "Variant H3N2", // Derived from string in real app
            type: "Viral",
            r0_initial: 1.4,
            r0_current: 1.8 // Mocked for MVP
        },
        status: outbreak.status,
        description: outbreak.summary_text || "",
        phases: [] // unused in current view
    };

    // Derived Metrics
    const latestEpi = epidemiology[epidemiology.length - 1];
    const prevEpi = epidemiology[epidemiology.length - 2];
    const caseTrend = latestEpi && prevEpi ? Math.round(((latestEpi.cases - prevEpi.cases) / prevEpi.cases) * 100) : 0;

    return (
        <div className="pb-20">
            {/* Clinical Header - Simplified */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6 mb-8 px-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold tracking-wider">
                            ACTIVE SURVEILLANCE
                        </span>
                        <span className="text-xs font-mono text-slate-500">ID: {scenario.scenarioId}</span>
                        {/* Region Selector Mobile/Inline if needed, but placing on right is cleaner */}
                    </div>
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-white">{scenario.name}</h1>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5"><Map size={14} /> {scenario.location}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span className="flex items-center gap-1.5"><Activity size={14} /> {scenario.pathogen.name}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span className="font-mono text-xs opacity-70">Started {scenario.startDate}</span>
                    </div>
                </div>

                <div className="flex gap-3 items-center">
                    <RegionSelector regions={regions} activeRegionId={regionId || regions[0]?.id} />

                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <FileText size={16} /> Export
                    </button>
                    <span className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-pulse flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        {scenario.status.toUpperCase()}
                    </span>
                </div>
            </header>

            <AnalysisView
                scenario={scenario}
                epidemiology={epidemiology}
                news={news}
                literature={literature}
                caseTrend={caseTrend}
                latestEpi={latestEpi}
                // Pass DB Insights if available, passing raw for now, component might need update if it expects specific format
                // AnalysisView currently mocks insights internally on line 29. 
                // We should pass them as prop to use real data.
                dbInsights={insightData ? insightData.summary_points as string[] : undefined}
                policyStatus={policyData}
            />
        </div>
    );
}
