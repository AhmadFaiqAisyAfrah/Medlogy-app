"use client";

import { useRef } from "react";
import { ChartSeries } from "@/lib/chart/contract";
import { useChartInstance } from "./useChartInstance";

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
    hasPrimary,
}: ChartCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const hasData = data && data.length > 0;

    // ================================
    // DATA STATUS DETECTION (NEW)
    // ================================
    const statuses = Array.from(
        new Set(
            data
                .map((s) => s.meta?.dataStatus)
                .filter(Boolean)
        )
    );

    const hasObserved = statuses.includes("observed");
    const hasModeled = statuses.includes("modeled");
    const hasSimulated = statuses.includes("simulated");

    // Init & update chart
    useChartInstance(containerRef, data);

    return (
        <div className="w-full h-full min-h-[400px] relative">
            {/* ================================
                STATUS BADGES (TOP-RIGHT)
            ================================= */}
            {hasData && (
                <div className="absolute top-3 right-3 z-10 flex flex-wrap gap-2 pointer-events-none select-none">
                    {hasObserved && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full
                            bg-emerald-500/10 text-emerald-500
                            border border-emerald-500/20 backdrop-blur-md">
                            🟢 OBSERVED DATA
                        </span>
                    )}

                    {hasModeled && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full
                            bg-orange-500/10 text-orange-400
                            border border-orange-500/20 backdrop-blur-md">
                            🟠 MODELED ESTIMATES
                        </span>
                    )}

                    {hasSimulated && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full
                            bg-amber-500/10 text-amber-400
                            border border-amber-500/20 backdrop-blur-md">
                            🟡 SIMULATED DATA
                        </span>
                    )}
                </div>
            )}

            {/* ================================
                LOADING OVERLAY
            ================================= */}
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center
                    bg-slate-950/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full border-2
                            border-white/10 border-t-primary animate-spin" />
                        <span className="text-sm text-slate-300">
                            Loading data…
                        </span>
                    </div>
                </div>
            )}

            {/* ================================
                ERROR STATE
            ================================= */}
            {!loading && error && (
                <div className="absolute inset-0 z-20 flex flex-col
                    items-center justify-center bg-slate-950/40 backdrop-blur-sm">
                    <span className="text-3xl mb-2 opacity-50">⚠️</span>
                    <span className="text-red-400 text-sm text-center px-4">
                        {error}
                    </span>
                </div>
            )}

            {/* ================================
                EMPTY STATE
            ================================= */}
            {!loading && !error && !hasData && (
                <div className="absolute inset-0 flex flex-col
                    items-center justify-center pointer-events-none z-10 space-y-3">
                    <div className="p-4 bg-white/5 rounded-full
                        ring-1 ring-white/10">
                        <span className="text-3xl opacity-40">📊</span>
                    </div>
                    {!hasPrimary ? (
                        <span className="text-slate-400 text-sm">
                            Select an indicator to begin
                        </span>
                    ) : (
                        <span className="text-slate-400 text-sm">
                            No data available for selected timeframe
                        </span>
                    )}
                </div>
            )}

            {/* ================================
                CHART CONTAINER
            ================================= */}
            <div
                ref={containerRef}
                className="w-full h-full min-h-[400px]"
            />

            {/* ================================
                SOURCE ATTRIBUTION
            ================================= */}
            {hasData && (
                <div className="absolute bottom-1 right-2 z-10
                    text-[9px] text-slate-500/60 max-w-[80%]
                    text-right pointer-events-none select-none">
                    {Array.from(
                        new Set(
                            data
                                .map((s) => s.meta?.source)
                                .filter(Boolean)
                        )
                    ).map((attr, i) => (
                        <div key={i}>{attr}</div>
                    ))}
                </div>
            )}
        </div>
    );
}
