import { ChartSeries } from "@/lib/chart/contract";
import { EChartsOption, SeriesOption } from "echarts";

/* =========================================
   LOCAL FORMATTERS
========================================= */
function formatValue(value: number | null, unit?: string) {
    if (value === null || value === undefined) return "–";
    if (unit === "%") return `${value.toFixed(1)}%`;
    if (unit?.includes("per 100k")) return value.toFixed(1);
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(1);
}

function formatStatus(status?: string) {
    if (status === "observed") return "OBSERVED DATA";
    if (status === "modeled") return "MODELED ESTIMATES";
    if (status === "simulated") return "SIMULATED DATA";
    return "UNKNOWN";
}

/* =========================================
   BUILD OPTION
========================================= */
export function buildChartOption(seriesList: ChartSeries[]): EChartsOption {
    if (!seriesList || seriesList.length === 0) return {};

    /* -----------------------------
       1. Unified yearly axis
    ----------------------------- */
    const years = seriesList[0].data.map(d => d.date);

    /* -----------------------------
       2. Axis detection
    ----------------------------- */
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

    /* -----------------------------
       3. Series
    ----------------------------- */
    const series: SeriesOption[] = seriesList.map((s) => {
        const useSecondary = s.meta?.recommendedAxis === "secondary";
        const statusLabel = formatStatus(s.meta?.dataStatus);

        return {
            name: `${s.indicator}${s.region ? ` (${s.region})` : ""} · ${statusLabel}`,
            type: "line",
            smooth: true,
            showSymbol: false,
            yAxisIndex: useSecondary && hasSecondaryAxis ? 1 : 0,
            data: s.data.map(p => p.value),
            lineStyle: { width: 2 },
            emphasis: { focus: "series" }
        };
    });

    /* -----------------------------
       4. Chart option
    ----------------------------- */
    return {
        backgroundColor: "transparent",

        tooltip: {
            trigger: "axis",
            axisPointer: { type: "cross" },

            // 🔑 TYPE-SAFE FORMATTER (VERCEL SAFE)
            formatter: (params: any) => {
                const list = Array.isArray(params) ? params : [params];
                if (list.length === 0) return "";

                const year = list[0].axisValue;
                let html = `<div style="font-weight:600;margin-bottom:6px">${year}</div>`;

                list.forEach(p => {
                    const s = seriesList[p.seriesIndex];
                    const meta = s.meta;

                    html += `
                        <div style="margin-bottom:8px">
                            <div style="font-size:12px;color:#e5e7eb">
                                ${s.indicator}${s.region ? ` (${s.region})` : ""}
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
