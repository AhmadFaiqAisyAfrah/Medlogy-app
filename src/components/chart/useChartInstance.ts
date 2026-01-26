import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { ChartSeries } from "@/lib/chart/contract";
import { buildChartOption } from "./buildChartOption";

export function useChartInstance(
    containerRef: React.RefObject<HTMLDivElement>,
    data: ChartSeries[]
) {
    const instance = useRef<echarts.ECharts | null>(null);

    // 1. Lifecycle: Initialize Chart EXACTLY ONCE
    useEffect(() => {
        if (!containerRef.current) return;

        console.log("🚀 [VERIFY] useChartInstance MOUNT", containerRef.current);

        // Prevent double init if React StrictMode runs effect twice
        if (instance.current) {
            console.log("⚠️ [VERIFY] Chart instance already exists, skipping init");
            return;
        }

        instance.current = echarts.init(containerRef.current);
        console.log("✅ [VERIFY] ECharts initialized");

        // Resize Observer
        const ro = new ResizeObserver(() => {
            instance.current?.resize();
        });
        ro.observe(containerRef.current);

        return () => {
            console.log("🛑 [VERIFY] useChartInstance UNMOUNT");
            ro.disconnect();
            instance.current?.dispose();
            instance.current = null;
        };
    }, []);

    // 2. Data Update: Set Option ONLY
    useEffect(() => {
        if (!instance.current) return;

        // Guard against initial empty vs active empty
        // But contract says we receive data. If empty, clearing is also valid options or handle in option builder
        // buildChartOption handles empty return {}

        console.log("🔄 [VERIFY] Data Updated, calling setOption", data);

        const options = buildChartOption(data);
        console.log("📊 [VERIFY] setOption Options:", options);

        instance.current.setOption(options, {
            notMerge: true, // Complete refresh of components
            lazyUpdate: false // Apply immediately
        });

    }, [data]);
}
