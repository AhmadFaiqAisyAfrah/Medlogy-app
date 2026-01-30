import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { ChartSeries } from "@/lib/chart/contract";
import { buildChartOption } from "./buildChartOption";
import { normalizeSeries } from "./normalizeSeries";
import type { ToolMode } from "./chart.types";
import { calculateSMA } from "@/lib/chart/math";

export function useChartInstance(
    containerRef: React.RefObject<HTMLDivElement>,
    rawData: ChartSeries[],
    onChartClick?: (params: any) => void,
    activeTool: ToolMode = "view",
    thresholds: any[] = [],
    annotations: any[] = [],

) {
    const instance = useRef<echarts.ECharts | null>(null);
    const clickHandlerRef = useRef(onChartClick);

    // Update ref when handler changes
    useEffect(() => {
        clickHandlerRef.current = onChartClick;
    }, [onChartClick]);

    // Init ONCE
    useEffect(() => {
        if (!containerRef.current) return;
        if (instance.current) return;

        instance.current = echarts.init(containerRef.current);

        // Bind click event to current ref
        instance.current.on('click', (params) => {
            if (clickHandlerRef.current) {
                clickHandlerRef.current(params);
            }
        });

        const ro = new ResizeObserver(() => {
            instance.current?.resize();
        });
        ro.observe(containerRef.current);

        return () => {
            instance.current?.off('click');
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

        let finalData = rawData;

        // ================================
        // TRANSFORM: TREND LINE (SMA)
        // ================================
        if (activeTool === 'trend' && rawData.length > 0) {
            // Assume primary is the first one or find by convention
            const primary = rawData[0];
            const smaData = calculateSMA(primary.data, 5); // 5-year SMA

            const trendSeries: ChartSeries = {
                id: `${primary.id}-trend`,
                indicator: "Trend (5y SMA)",
                region: primary.region,
                source: "Computed",
                data: smaData,
                meta: {
                    isMock: false,
                    description: "5-Year Simple Moving Average"
                }
            };

            finalData = [...rawData, trendSeries];
        }

        const normalized = normalizeSeries(finalData);
        // Trend line styling override? 
        // We might need to flag this series so buildChartOption knows to style it differently (dashed line)
        // But for now, let's just show it.

        const options = buildChartOption(normalized);

        // ================================
        // OVERLAY: THRESHOLD LINE
        // ================================
        const seriesList = options.series as any[];

        if (thresholds.length > 0 && seriesList && seriesList.length > 0) {
            // Add MarkLine to the primary series
            seriesList[0].markLine = {
                silent: true,
                symbol: ['none', 'none'],
                data: thresholds
                    .map((item: any) => {
                        let val: any = null;
                        let labelText = 'Threshold';

                        // Case A: Primitive number
                        if (typeof item === 'number') {
                            val = item;
                        }
                        // Case B: Object with value property
                        else if (item && typeof item === 'object') {
                            labelText = item.label || 'Threshold';
                            const rawVal = item.value;

                            // Handle array values in object (e.g. from chart click [x, y])
                            if (Array.isArray(rawVal) && rawVal.length >= 2) {
                                val = rawVal[1];
                            } else if (typeof rawVal === 'number') {
                                val = rawVal;
                            }
                        }

                        // Validation: Must be a valid finite number
                        if (val === null || val === undefined || typeof val !== 'number' || !isFinite(val)) {
                            return null;
                        }

                        return {
                            yAxis: val,
                            lineStyle: {
                                color: '#ef4444',
                                type: 'dashed',
                                width: 2
                            },
                            label: {
                                formatter: `${labelText}`,
                                position: 'insideEndTop', // Puts it at the end, inside chart, top side of line
                                distance: 5,
                                color: '#ef4444',
                                fontSize: 10,
                                fontWeight: 'bold'
                            }
                        };
                    })
                    .filter((item: any) => item !== null) // Filter out failed mappings
            };
        }

        // ================================
        // OVERLAY: ANNOTATIONS (MarkPoint)
        // ================================
        if (annotations.length > 0 && options.series && options.series.length > 0) {
            (options.series[0] as any).markPoint = {
                symbol: 'pin',
                symbolSize: 50,
                silent: false,
                data: annotations
                    .filter((a: any) => a && Array.isArray(a.coord) && a.coord.length === 2 && a.coord[0] !== undefined)
                    .map((a) => ({
                        coord: a.coord, // Guarded against undefined
                        value: a.value || '',
                        itemStyle: {
                            color: '#f59e0b'
                        },
                        label: {
                            show: false // Hide text by default
                        },
                        emphasis: {
                            label: {
                                show: true,
                                position: 'top',
                                color: '#000',
                                backgroundColor: '#fff',
                                borderColor: '#f59e0b',
                                borderWidth: 1,
                                borderRadius: 4,
                                padding: [6, 10],
                                fontWeight: 'bold',
                                fontSize: 12,
                                formatter: (p: any) => p.value as string // Show full text on hover
                            },
                            itemStyle: {
                                color: '#d97706' // Darker amber on hover
                            }
                        },
                        tooltip: {
                            formatter: (p: any) => p.value
                        }
                    }))
            };
        }


        instance.current.setOption(options, {
            notMerge: true,
            lazyUpdate: false,
        });
    }, [rawData, activeTool, thresholds, annotations]);
}
