import { ChartSeries } from "@/lib/chart/contract";
import { EChartsOption, SeriesOption } from "echarts";
import { getIndicatorMeta } from "@/lib/chart/indicatorRegistry";

/* ===============================
   SAFE LOCAL FORMATTER
================================ */
function formatValue(value: number | null, unit?: string) {
    if (value === null || value === undefined) return "–";
    if (unit === "%") return `${value.toFixed(1)}%`;
    if (unit?.includes("per 100k")) return value.toFixed(1);
    return value.toFixed(1);
}

export function buildChartOption(seriesList: ChartSeries[]): EChartsOption {
    if (!seriesList || seriesList.length === 0) return {};

    // Unified X axis
    const years = seriesList[0].data.map(d => d.date);

    // Axis detection
    const hasSecondaryAxis = seriesList.some(s => {
        const meta = getIndicatorMeta(s.meta?.id ?? "");
        return meta?.recommendedAxis === "secondary";
    });

    const primaryUnit = seriesList[0]?.unit ?? "";
    const secondarySeries = seriesList.find(s => {
        const meta = getIndicatorMeta(s.meta?.id ?? "");
        return meta?.recommendedAxis === "secondary";
    });
    const secondaryUnit = secondarySeries?.unit ?? "";

    const yAxis: any[] = [
        {
            type: "value",
            name: primaryUnit,
            axisLabel: { color: "#94a3b8" },
            splitLine: { lineStyle: { color: "#1e293b" } }
        }
    ];

    if (hasSecondaryAxis) {
        yAxis.push({
            type: "value",
            name: secondaryUnit,
            position: "right",
            axisLabel: { color: "#fbbf24" },
            splitLine: { show: false }
        });
    }

    const series: SeriesOption[] = seriesList.map((s) => {
        const meta = getIndicatorMeta(s.meta?.id ?? "");
        const useSecondary = meta?.recommendedAxis === "secondary";

        return {
            name: `${s.indicator}${s.region ? ` (${s.region})` : ""}`,
            type: "line",
            smooth: true,
            showSymbol: false,
            yAxisIndex: useSecondary && hasSecondaryAxis ? 1 : 0,
            data: s.data.map(p => p.value),
            lineStyle: { width: 2 },
            emphasis: { focus: "series" }
        };
    });

    return {
        backgroundColor: "transparent",

        tooltip: {
            trigger: "axis",
            axisPointer: { type: "cross" },
            formatter: (params: any) => {
                const list = Array.isArray(params) ? params : [params];
                const year = list[0]?.axisValueLabel ?? "";

                let html = `<div style="margin-bottom:6px;font-weight:600">${year}</div>`;

                list.forEach(p => {
                    const s = seriesList[p.seriesIndex];
                    html += `
                        <div style="display:flex;justify-content:space-between;font-size:11px">
                            <span>${p.seriesName}</span>
                            <span style="font-family:monospace">
                                ${formatValue(p.data, s.unit)}
                            </span>
                        </div>
                    `;
                });

                return html;
            }
        },

        legend: {
            bottom: 0,
            type: "scroll",
            textStyle: { color: "#94a3b8" }
        },

        grid: {
            left: "3%",
            right: hasSecondaryAxis ? "6%" : "4%",
            bottom: "12%",
            containLabel: true
        },

        xAxis: {
            type: "category",
            boundaryGap: false,
            data: years,
            axisLabel: { color: "#94a3b8" }
        },

        yAxis,
        series
    };
}
