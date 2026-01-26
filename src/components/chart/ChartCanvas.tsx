"use client";

import { useRef, useEffect } from "react";
import { ChartSeries } from "@/lib/chart/contract";
import { useChartInstance } from "./useChartInstance";

interface ChartCanvasProps {
    data: ChartSeries[];
}

export function ChartCanvas({ data }: ChartCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log("[VERIFY] ChartCanvas Rendered. Data length:", data?.length);
    });

    // Hook manages the instance inside the div
    useChartInstance(containerRef, data);

    return (
        <div className="w-full h-full min-h-[400px] relative bg-slate-950/20">
            {/* Overlay if No Data (optional ux, but keep simple for now) */}
            {(!data || data.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-slate-500">No chart data available</span>
                </div>
            )}

            <div
                ref={containerRef}
                className="w-full h-full min-h-[400px]"
            />
        </div>
    );
}
