"use client";

import { useRef, useEffect } from "react";
import { ChartSeries } from "@/lib/chart/contract";
import { useChartInstance } from "./useChartInstance";

interface ChartCanvasProps {
    data: ChartSeries[];
}

export function ChartCanvas({ data }: ChartCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter out mock series to check if we have "real" data or just mock fallbacks
    // Actually, we treat mock data as data for rendering purposes.
    // We just need to check if data is completely empty.

    const hasData = data && data.length > 0;

    // Hook manages the instance inside the div
    useChartInstance(containerRef, data);

    return (
        <div className="w-full h-full min-h-[400px] relative">
            {/* Empty State Overlay */}
            {!hasData && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 space-y-2">
                    <span className="text-4xl opacity-20">📊</span>
                    <span className="text-slate-500 text-sm">Select an indicator to begin</span>
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
