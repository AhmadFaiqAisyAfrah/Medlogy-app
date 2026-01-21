"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { AlertTriangle, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryPoint {
    text: string;
    type: 'positive' | 'negative' | 'neutral';
}

interface InsightSummaryProps {
    points: SummaryPoint[];
    riskLevel: 'Low' | 'Medium' | 'High';
}

export function InsightSummary({ points, riskLevel }: InsightSummaryProps) {
    const riskColor =
        riskLevel === 'High' ? 'text-rose-400' :
            riskLevel === 'Medium' ? 'text-yellow-400' :
                'text-emerald-400';

    const riskBg =
        riskLevel === 'High' ? 'bg-rose-500/10 border-rose-500/20' :
            riskLevel === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                'bg-emerald-500/10 border-emerald-500/20';

    return (
        <GlassPanel className="p-0 border-l-4 !border-l-primary overflow-hidden relative" noBorder>
            {/* Gradient Background for emphasis */}
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

            <div className="p-5 flex flex-col md:flex-row gap-6 md:items-start relative z-10">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                            <Info size={18} />
                        </div>
                        <h2 className="text-lg font-semibold text-white tracking-tight">Insight Summary</h2>
                        <span className={cn("px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border", riskColor, riskBg)}>
                            Risk: {riskLevel} Confidence
                        </span>
                    </div>

                    <div className="space-y-2">
                        {points.map((point, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                <span className={cn(
                                    "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                                    point.type === 'negative' ? 'bg-rose-500' :
                                        point.type === 'positive' ? 'bg-emerald-500' : 'bg-slate-500'
                                )} />
                                <span className="leading-relaxed">{point.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Micro Viz or Action */}
                <div className="md:w-64 shrink-0 p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-center">
                    <span className="text-xs text-slate-400 mb-1">Outbreak Velocity</span>
                    <div className="text-2xl font-bold text-white mb-1 flex items-baseline gap-2">
                        +11% <span className="text-sm font-normal text-rose-400">7-day trend</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-[65%]" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Projection: Continued rise expected</p>
                </div>
            </div>
        </GlassPanel>
    )
}
