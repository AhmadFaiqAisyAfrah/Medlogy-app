"use client";

import React, { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/button";
import {
    ChevronDown,
    MousePointer2,
    ArrowLeftRight,
    TrendingUp,
    Minus,
    Edit3,
    Sparkles,
    LayoutTemplate,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

type TimeRange = "5Y" | "10Y" | "ALL" | null;
type ToolMode = "view" | "select" | "trend" | "threshold" | "note";

export function ChartToolbar() {
    // Data Selection State
    const [indicator] = useState("Dengue incidence");
    const [region] = useState("Global");
    const [timeRange, setTimeRange] = useState<TimeRange>(null);

    // Interaction State
    const [activeTool, setActiveTool] = useState<ToolMode>("view");

    const handleAnalyze = () => {
        console.log({
            indicator,
            region,
            timeRange,
            mode: activeTool,
        });
    };

    return (
        <GlassPanel className="p-2 flex items-center justify-between gap-4 mb-6">
            {/* SECTION 1: Data Selection */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                {/* Extensible Container for Dropdowns */}
                <div className="flex items-center gap-2">
                    {/* Indicator Dropdown (Mock) */}
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-200 border border-white/10">
                        <Search size={14} className="text-slate-400" />
                        <span>{indicator}</span>
                        <ChevronDown size={14} className="text-slate-500 ml-1" />
                    </button>

                    {/* Region Dropdown (Mock) */}
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-200 border border-white/10">
                        <span>{region}</span>
                        <ChevronDown size={14} className="text-slate-500 ml-1" />
                    </button>
                </div>

                {/* Separator */}
                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* Time Range Selector */}
                <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
                    {(["5Y", "10Y", "ALL"] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                timeRange === range
                                    ? "bg-primary/20 text-primary shadow-sm"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* SECTION 2: Interaction Tools */}
            <div className="flex items-center gap-1">
                <ToolButton
                    icon={MousePointer2}
                    isActive={activeTool === "view"}
                    onClick={() => setActiveTool("view")}
                    tooltip="View Mode"
                />
                <ToolButton
                    icon={ArrowLeftRight}
                    isActive={activeTool === "select"}
                    onClick={() => setActiveTool("select")}
                    tooltip="Select Range"
                />
                <ToolButton
                    icon={TrendingUp}
                    isActive={activeTool === "trend"}
                    onClick={() => setActiveTool("trend")}
                    tooltip="Trend Line"
                />
                <ToolButton
                    icon={Minus}
                    isActive={activeTool === "threshold"}
                    onClick={() => setActiveTool("threshold")}
                    tooltip="Threshold"
                />
                <ToolButton
                    icon={Edit3}
                    isActive={activeTool === "note"}
                    onClick={() => setActiveTool("note")}
                    tooltip="Annotate"
                />
            </div>

            {/* SECTION 3: Action */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <Button
                    onClick={handleAnalyze}
                    disabled={timeRange === null}
                    className={cn(
                        "gap-2 transition-all",
                        timeRange !== null
                            ? "bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                            : "opacity-50 cursor-not-allowed"
                    )}
                    size="sm"
                >
                    <Sparkles size={16} />
                    Analyze
                </Button>
            </div>
        </GlassPanel>
    );
}

function ToolButton({
    icon: Icon,
    isActive,
    onClick,
    tooltip,
}: {
    icon: any;
    isActive: boolean;
    onClick: () => void;
    tooltip: string;
}) {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={cn(
                "p-2 rounded-lg transition-all",
                isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
        >
            <Icon size={18} />
        </button>
    );
}
