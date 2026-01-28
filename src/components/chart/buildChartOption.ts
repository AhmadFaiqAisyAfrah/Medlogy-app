import { ChartSeries } from "@/lib/chart/contract";
import { EChartsOption, SeriesOption } from "echarts";

/* =========================================
   LOCAL FORMATTER
========================================= */
function formatValue(value: number | null, unit?: string) {
    if (value === null || value === undefined) return "–";
    if (unit === "%") return `${value.toFixed(1)}%`;
    if (unit?.includes("per 100k")) return value.toFixed(1);
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(1);
}

function formatStatus(status?: string) {
    if (status === "observed") return "Observed";
    if (status === "modeled") return "Modeled";
    if (status === "simulated") return "Simulated";
    return "Unknown";
}

/* =========================================
   BUILD OPTION
========================================= */
export function buildChartOption(seriesList: ChartSeries[]): EChartsOption {
    if (!seriesList || seriesList.length === 0) return {};

    // Unified yearly axis (already normalized)
    const years = seriesList[0].data.map(d => d.date);

    // Axis detection
    const hasSecondaryAxis = seriesList.some(
        s => s.meta?.recommendedAxis === "secondary"
    );

    const primaryUnit = seriesList[0]?.unit ?? "";
    const secondarySeries = seriesList.find(
        s => s.meta?.recommendedAxis === "secondary"
    );
    const secondaryUnit = secondarySeries?.unit ?? "";

    const yAxis: any[] = [
        {
            type: "value",
            name: primaryUnit,
            axisLabel: { color: "#94a3b8" },
            splitLine: { show: true, lineStyle: { color: "#1e293b" } }
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

    // Series
    const series: SeriesOption[] = seriesList.map((s) => {
        const useSecondary = s.meta?.recommendedAxis === "secondary";
        const status = formatStatus(s.meta?.dataStatus);

        return {
            name: `${s.indicator}${s.region ? ` (${s.region})` : ""} · ${status}`,
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
            formatter: (params: any[]) => {
                if (!params || params.length === 0) return "";

                const year = params[0].axisValue;
                let html = `<div class="font-medium mb-2">${year}</div>`;

                params.forEach(p => {
                    const s = seriesList[p.seriesIndex];
                    const meta = s.meta;

                    html += `
                        <div style="margin-bottom:6px">
                            <div style="font-size:12px;color:#e5e7eb">
                                ${s.indicator} (${s.region})
                            </div>
                            <div style="font-size:12px">
                                <strong>${formatValue(p.data, s.unit)}</strong>
                                <span style="color:#94a3b8"> ${s.unit}</span>
                            </div>
                            <div style="font-size:10px;color:#94a3b8">
                                ${formatStatus(meta?.dataStatus)} — ${meta?.source ?? "Unknown source"}
                            </div>
                        </div>
                    `;
                });

                return html;
            }
        },

        legend: {
            bottom: 0,
            type: "scroll",
            textStyle: { color: "#94a3b8", fontSize: 11 }
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
