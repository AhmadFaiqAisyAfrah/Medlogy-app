"use client";

import { useRef, useEffect } from "react";
import { ChartSeries } from "@/lib/chart/contract";
import { useChartInstance } from "./useChartInstance";

interface ChartCanvasProps {
    data: ChartSeries[];
    loading?: boolean;
    error?: string | null;
    hasPrimary?: boolean;
}

export function ChartCanvas({ data, loading, error, hasPrimary }: ChartCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter out mock series to check if we have "real" data or just mock fallbacks
    // Actually, we treat mock data as data for rendering purposes.
    // We just need to check if data is completely empty.

    const hasData = data && data.length > 0;

    // B1: Data Source Detection
    const isMock = data?.some(s => s.source === "MOCK");
    // Only Live if ALL are OWID and we actually have data
    const isLive = hasData && data.every(s => s.source === "OWID");

    // Hook manages the instance inside the div
    useChartInstance(containerRef, data);

    return (
        <div className="w-full h-full min-h-[400px] relative">
            {/* B1: Visual Badges (Top-Right) */}
            <div className="absolute top-3 right-3 z-10 flex gap-2 pointer-events-none select-none">
                {isMock && (
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 backdrop-blur-md">
                        🟡 MOCK FLIGHT
                    </span>
                )}
                {isLive && (
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 backdrop-blur-md">
                        🟢 LIVE DATA
                    </span>
                )}
            </div>

            {/* C1: Loading State Overlay */}
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm transition-all duration-300">
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
                        <span className="text-sm font-medium text-slate-300">Loading data...</span>
                    </div>
                </div>
            )}

            {/* C1: Error State Overlay */}
            {!loading && error && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm">
                    <span className="text-3xl mb-2 opacity-50">⚠️</span>
                    <span className="text-red-400 font-medium px-4 text-center">{error}</span>
                </div>
            )}

            {/* B3: Empty State Messaging (Only if no error and no loading) */}
            {!loading && !error && !hasData && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 space-y-3">
                    <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/10">
                        <span className="text-3xl opacity-40">📊</span>
                    </div>
                    {!hasPrimary ? (
                        <span className="text-slate-400 font-medium">Select an indicator to begin</span>
                    ) : (
                        <span className="text-slate-400 font-medium">No data available for selected timeframe</span>
                    )}
                </div>
            )}

            {/* Container ALWAYS renders for ECharts lifecycle */}
            <div
                ref={containerRef}
                className="w-full h-full min-h-[400px]"
            />
        </div>
    );
}
