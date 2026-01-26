import { ChartSeries } from "@/lib/chart/contract";
import { EChartsOption, SeriesOption } from "echarts";
import { getIndicatorMeta } from "@/lib/chart/indicatorRegistry";
import { formatValue } from "./normalizeSeries";

export function buildChartOption(seriesList: ChartSeries[]): EChartsOption {
    if (!seriesList || seriesList.length === 0) return {};

    // 1. Unified Category Axis (Years)
    // Extract all unique years from all series to ensure alignment
    const allYears = Array.from(
        new Set(
            seriesList.flatMap((s) => s.data.map((p) => p.date))
        )
    ).sort((a, b) => Number(a) - Number(b));

    // 2. Axis Configuration
    // Detect secondary axis requirement
    const hasSecondaryAxis = seriesList.some(s => {
        const meta = getIndicatorMeta(s.indicator);
        return meta?.recommendedAxis === "secondary";
    });

    const yAxis: any[] = [
        {
            type: "value",
            splitLine: { show: true, lineStyle: { color: "#1e293b" } },
            axisLabel: { color: "#94a3b8" }
        }
    ];

    if (hasSecondaryAxis) {
        yAxis.push({
            type: "value",
            position: "right",
            splitLine: { show: false },
            axisLabel: { color: "#fbbf24" }
        });
    }

    // 3. Series Generation
    const series: SeriesOption[] = seriesList.map((s) => {
        const meta = getIndicatorMeta(s.indicator);
        const useSecondary = meta?.recommendedAxis === "secondary";

        // Map data points to [year, value] to be safe with category axis
        // ECharts category axis can map [string, number] automatically if the first value matches axis data
        const data = s.data.map((p) => [p.date, p.value]);

        return {
            name: `${s.indicator}${s.region ? ` (${s.region})` : ""}`,
            type: "line",
            smooth: true,
            showSymbol: false,
            // Align to correct Y axis
            yAxisIndex: (useSecondary && hasSecondaryAxis) ? 1 : 0,
            lineStyle: { width: 2 },
            emphasis: { focus: "series" },
            data: data
        };
    });

    return {
        // Transparent BG to fit app theme
        backgroundColor: "transparent",

        // Tooltip
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "cross" },
            backgroundColor: "rgba(15,23,42,0.95)", // Slate 900
            borderColor: "rgba(255,255,255,0.1)",
            textStyle: { color: "#fff" },
            formatter: (params: any) => {
                if (!Array.isArray(params)) return "";

                const category = params[0].name; // The year
                let html = `<div class="font-medium mb-2 border-b border-white/10 pb-1">${category}</div>`;

                params.forEach((p: any) => {
                    // p.value is [year, value]
                    const val = p.value[1];
                    // Find series to get meta for formatting
                    // p.seriesName matches what we set above
                    // But simpler: look up by index in current seriesList if strict
                    // Or look up passed series by name. 
                    // Let's rely on finding meta from the original list using p.seriesIndex
                    const originalSeries = seriesList[p.seriesIndex];
                    const meta = getIndicatorMeta(originalSeries.indicator);

                    const formatted = meta ? formatValue(val, meta) : val.toLocaleString();
                    const unit = meta?.unit || "";

                    html += `
                        <div class="flex justify-between gap-4 text-xs py-0.5">
                            <span class="text-slate-300 truncate max-w-[150px]">${p.seriesName}</span>
                            <span class="font-mono text-white">
                                ${formatted} <span class="text-slate-500 opacity-70">${unit}</span>
                            </span>
                        </div>
                    `;
                });
                return html;
            }
        },

        legend: {
            bottom: 0,
            type: "scroll", // Allow scrolling for many series
            icon: "circle",
            itemGap: 24,
            textStyle: {
                color: "#94a3b8",
                fontSize: 12
            },
            formatter: (name: string) => {
                // Truncate long names, but keeping reasonable length
                return name.length > 30 ? name.slice(0, 30) + '...' : name;
            },
            data: series.map((s: any) => s.name)
        },

        grid: {
            left: "3%",
            right: hasSecondaryAxis ? "6%" : "4%",
            bottom: "12%",
            containLabel: true
        },

        // STRICT CATEGORY AXIS
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: allYears, // Explicit categories
            axisLine: { lineStyle: { color: "#334155" } },
            axisLabel: { color: "#94a3b8" }
        },

        yAxis,
        series
    };
}
