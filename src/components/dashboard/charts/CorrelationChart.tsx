"use client";

import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceDot
} from "recharts";
import { EpiPoint, NewsArticle } from "@/lib/types";
import { useMemo } from "react";

interface CorrelationChartProps {
    data: EpiPoint[];
    newsEvents?: NewsArticle[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-slate-300 text-xs mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function CorrelationChart({ data, newsEvents = [] }: CorrelationChartProps) {
    // Merge data for correlation (simple implementation)
    const chartData = useMemo(() => {
        return data.map(point => {
            // Find news on this date
            const news = newsEvents.find(n => n.date === point.date);
            return {
                ...point,
                newsTitle: news?.title,
                newsSentiment: news?.sentiment
            };
        });
    }, [data, newsEvents]);

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                    <defs>
                        <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#fff', strokeWidth: 0.5, strokeDasharray: '5 5' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    <Area
                        type="monotone"
                        dataKey="cases"
                        name="Daily Cases"
                        stroke="#0ea5e9"
                        fillOpacity={1}
                        fill="url(#colorCases)"
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="positivity_rate"
                        name="Positivity Rate %"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        yAxisId={0} // Using same axis for simplicity in this MVP, ideally would be dual axis
                    />

                    {/* Render News Annotations */}
                    {newsEvents.map((news, index) => (
                        <ReferenceDot
                            key={news.id}
                            x={news.date}
                            y={0}
                            r={4}
                            fill={news.sentiment === 'negative' ? '#ef4444' : '#fbbf24'}
                            stroke="none"
                            ifOverflow="extendDomain"
                        />
                    ))}

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
