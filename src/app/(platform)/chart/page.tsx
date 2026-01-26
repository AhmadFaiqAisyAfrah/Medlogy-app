"use client";

import { ChartToolbar } from "@/components/chart/ChartToolbar";
import { PortalToHeader } from "@/components/layout/PortalToHeader";
import { ChartCanvas } from "@/components/chart/ChartCanvas";
import { useChartPersistence } from "@/hooks/useChartPersistence";
import { useMockData } from "@/hooks/useMockData";

export default function ChartPage() {
    const {
        chartState,
        setPrimarySeries,
        setComparisonSeries,
        setTimeRange,
        isHydrated
    } = useChartPersistence();

    const { data } = useMockData(chartState);

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
                />
            </PortalToHeader>

            <div className="flex-1 border border-white/5 rounded-xl bg-white/5 overflow-hidden">
                <ChartCanvas data={data} />
            </div>
        </div>
    );
}
