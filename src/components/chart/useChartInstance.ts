import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { ChartSeries } from "@/lib/chart/contract";
import { buildChartOption } from "./buildChartOption";
import { normalizeSeries } from "./normalizeSeries";

export function useChartInstance(
    containerRef: React.RefObject<HTMLDivElement>,
    rawData: ChartSeries[]
) {
    const instance = useRef<echarts.ECharts | null>(null);

    // Init ONCE
    useEffect(() => {
        if (!containerRef.current) return;
        if (instance.current) return;

        instance.current = echarts.init(containerRef.current);

        const ro = new ResizeObserver(() => {
            instance.current?.resize();
        });
        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            instance.current?.dispose();
            instance.current = null;
        };
    }, []);

    // Update data
    useEffect(() => {
        if (!instance.current) return;

        if (!rawData || rawData.length === 0) {
            instance.current.clear();
            return;
        }

        const normalized = normalizeSeries(rawData);
        const options = buildChartOption(normalized);

        instance.current.setOption(options, {
            notMerge: true,
            lazyUpdate: false,
        });
    }, [rawData]);
}
