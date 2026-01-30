"use client";

import { useState } from "react";
import { ChartToolbar } from "@/components/chart/ChartToolbar";
import type { ToolMode } from "@/components/chart/chart.types";
import { PortalToHeader } from "@/components/layout/PortalToHeader";
import { ChartCanvas } from "@/components/chart/ChartCanvas";
import { useChartPersistence } from "@/hooks/useChartPersistence";
import { useOwidData } from "@/hooks/useOwidData";

export default function ChartPage() {
    const {
        chartState,
        setPrimarySeries,
        setComparisonSeries,
        setTimeRange,
        isHydrated
    } = useChartPersistence();

    const [activeTool, setActiveTool] = useState<ToolMode>("view");

    // Pass activeTool to data hook if needed for Trend Lines later
    const { data, loading, error } = useOwidData(chartState);
    const hasPrimary = !!chartState.primary.indicator;

    if (!isHydrated) return null;

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <PortalToHeader>
                <ChartToolbar
                    primarySeries={chartState.primary}
                    setPrimarySeries={setPrimarySeries}
                    comparisonSeries={chartState.comparisons}
                    setComparisonSeries={setComparisonSeries}
                    timeRange={chartState.timeRange}
                    setTimeRange={setTimeRange}
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                />
            </PortalToHeader>

            <div className="flex-1 border border-white/5 rounded-xl bg-white/5 overflow-hidden">
                <ChartCanvas
                    key={`${chartState.primary.indicator}-${chartState.primary.region}`}
                    data={data}
                    loading={loading}
                    error={error}
                    hasPrimary={hasPrimary}
                    activeTool={activeTool}
                    chartId={`${chartState.primary.indicator}-${chartState.primary.region}`}
                />
            </div>
        </div>
    );
}
