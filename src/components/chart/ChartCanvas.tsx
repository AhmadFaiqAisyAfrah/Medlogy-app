"use client";

import { useRef } from "react";
import { ChartSeries } from "@/lib/chart/contract";
import { useChartInstance } from "./useChartInstance";
import { getDataStatus } from "./getDataStatus";

interface ChartCanvasProps {
    data: ChartSeries[];
    loading?: boolean;
    error?: string | null;
    hasPrimary?: boolean;
}

export function ChartCanvas({
    data,
    loading,
    error,
    hasPrimary
}: ChartCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const hasData = data && data.length > 0;

    // ✅ Single source of truth for data badge
    const status = getDataStatus(data);

    // Chart lifecycle
    useChartInstance(containerRef, data);

    return (
        <div className="w-full h-full min-h-[400px] relative">

            {/* ===============================
               B1: DATA STATUS BADGE (TOP-RIGHT)
               =============================== */}
            {hasData && (
                <div className="absolute top-3 right-3 z-10 flex gap-2 pointer-events-none select-none">
                    {status === "MOCK" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full
                            bg-amber-500/10 text-amber-500 border border-amber-500/20 backdrop-blur-md">
                            🟡 MOCK FLIGHT
                        </span>
                    )}

                    {status === "LIVE" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full
                            bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 backdrop-blur-md">
                            🟢 LIVE DATA
                        </span>
                    )}

                    {status === "MIXED" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full
                            bg-orange-500/10 text-orange-400 border border-orange-500/20 backdrop-blur-md">
                            🟠 MIXED DATA
                        </span>
                    )}
                </div>
            )}

            {/* ===============================
               C1: LOADING OVERLAY
               =============================== */}
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center
                    bg-slate-950/60 backdrop-blur-sm transition-all duration-300">
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
                        <span className="text-sm font-medium text-slate-300">
                            Loading data...
                        </span>
                    </div>
                </div>
            )}

            {/* ===============================
               C1: ERROR OVERLAY
               =============================== */}
            {!loading && error && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center
                    bg-slate-950/40 backdrop-blur-sm">
                    <span className="text-3xl mb-2 opacity-50">⚠️</span>
                    <span className="text-red-400 font-medium px-4 text-center">
                        {error}
                    </span>
                </div>
            )}

            {/* ===============================
               B3: EMPTY STATE
               =============================== */}
            {!loading && !error && !hasData && (
                <div className="absolute inset-0 flex flex-col items-center justify-center
                    pointer-events-none z-10 space-y-3">
                    <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/10">
                        <span className="text-3xl opacity-40">📊</span>
                    </div>
                    {!hasPrimary ? (
                        <span className="text-slate-400 font-medium">
                            Select an indicator to begin
                        </span>
                    ) : (
                        <span className="text-slate-400 font-medium">
                            No data available for selected timeframe
                        </span>
                    )}
                </div>
            )}

            {/* ===============================
               CHART CONTAINER (ALWAYS RENDERED)
               =============================== */}
            <div
                ref={containerRef}
                className="w-full h-full min-h-[400px]"
            />

            {/* ===============================
               C2.1: SOURCE ATTRIBUTION
               =============================== */}
            {hasData && (
                <div className="absolute bottom-1 right-2 z-10
                    text-[9px] text-slate-500/60 max-w-[80%] text-right
                    pointer-events-none select-none">
                    {Array.from(
                        new Set(
                            data
                                .map(s => s.meta?.sourceAttribution)
                                .filter(Boolean)
                        )
                    ).map((attr, i) => (
                        <div key={i}>{attr}</div>
                    ))}
                </div>
            )}

            {/* ===============================
               C2.2: DATA QUALITY WARNING
               =============================== */}
            {hasData &&
                data.some(
                    s =>
                        s.meta?.hasGaps &&
                        (s.meta.coverageRatio || 0) < 0.8
                ) && (
                    <div className="absolute bottom-8 left-2 z-10
                        bg-amber-900/20 border border-amber-900/30
                        px-2 py-1 rounded text-[10px]
                        text-amber-500/80 flex items-center gap-1.5
                        backdrop-blur-md pointer-events-none">
                        <span className="text-amber-500 text-xs">⚠️</span>
                        <span>Data incomplete for selected period</span>
                    </div>
                )}
        </div>
    );
}
