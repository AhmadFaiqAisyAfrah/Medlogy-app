"use client";

import React, { useState, useRef, useEffect } from "react";
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
    Search,
    Plus,
    X,
    Lock,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { indicatorRegistry } from "@/lib/chart/indicatorRegistry";
import { uiAvailableRegions } from "@/lib/data/regions";
import { Series, TimeRange } from "./chart.types";
import type { ToolMode } from "./chart.types";
import { createPortal } from "react-dom";

// export type ToolMode = "view" | "select" | "trend" | "threshold" | "note"; // MOVED TO TYPES

export interface ChartToolbarProps {
    primarySeries: Series;
    setPrimarySeries: (series: Series | ((prev: Series) => Series)) => void;
    comparisonSeries: Series[];
    setComparisonSeries: (series: Series[]) => void;
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
    activeTool: ToolMode;
    setActiveTool: (mode: ToolMode) => void;
}

export function ChartToolbar({
    primarySeries,
    setPrimarySeries,
    comparisonSeries,
    setComparisonSeries,
    timeRange,
    setTimeRange,
    activeTool,
    setActiveTool
}: ChartToolbarProps) {
    const isCompareMode = comparisonSeries.length > 0;

    /* ---------- Helpers ---------- */

    const registryValues = Object.values(indicatorRegistry);
    const indicatorOptions = registryValues.map(m => m.label);
    const regionOptions = uiAvailableRegions;

    const getIndicatorId = (label: string) =>
        registryValues.find(m => m.label === label)?.id || label;

    const getIndicatorLabel = (id: string | null) =>
        id ? indicatorRegistry[id]?.label || id : null;

    const primaryMeta = primarySeries.indicator
        ? indicatorRegistry[primarySeries.indicator]
        : null;

    const [minYear, maxYear] = primaryMeta?.availableYears || [1990, 2024];

    const isRangeValid = (start: number | null, end: number | null) => {
        if (!start || !end) return false;
        if (start > end) return false;
        if (start < minYear || end > maxYear) return false;
        return true;
    };

    const isValid = isRangeValid(timeRange.startYear, timeRange.endYear);

    /* ---------- Comparison ---------- */

    const handleAddComparison = () => {
        setComparisonSeries([
            ...comparisonSeries,
            { id: `compare-${Date.now()}`, indicator: "", region: "" }
        ]);
    };

    const handleRemoveComparison = (id: string) => {
        setComparisonSeries(comparisonSeries.filter(s => s.id !== id));
    };

    const updateComparison = (
        id: string,
        field: keyof Series,
        value: string
    ) => {
        setComparisonSeries(
            comparisonSeries.map(s =>
                s.id === id ? { ...s, [field]: value } : s
            )
        );
    };

    const handleAnalyze = () => {
        console.log({
            primarySeries,
            comparisonSeries,
            timeRange,
            mode: activeTool
        });
    };

    /* ---------- Render ---------- */

    return (
        <div className="flex flex-col gap-2 mb-6">
            <GlassPanel className="p-2 flex items-center justify-between gap-4">

                {/* SECTION 1: DATA SELECTION */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-[65%]">

                    {/* Primary */}
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-1">
                            Primary
                        </span>
                        <div className="flex items-center gap-2">
                            <Selector
                                value={getIndicatorLabel(primarySeries.indicator)}
                                options={indicatorOptions}
                                onChange={(label: string) =>
                                    setPrimarySeries(prev => ({
                                        ...prev,
                                        indicator: getIndicatorId(label)
                                    }))
                                }
                                icon={Search}
                                placeholder="Select Indicator"
                            />

                            <Selector
                                value={primarySeries.region}
                                options={regionOptions}
                                onChange={(val: string) =>
                                    setPrimarySeries(prev => ({ ...prev, region: val }))
                                }
                                placeholder="Select Region"
                            />
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    {/* Comparison */}
                    <div className="flex items-center gap-2">
                        {comparisonSeries.map((series, idx) => (
                            <div key={series.id} className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase px-1 flex justify-between">
                                    Compare #{idx + 1}
                                    <button onClick={() => handleRemoveComparison(series.id)}>
                                        <X size={10} />
                                    </button>
                                </span>
                                <div className="flex items-center gap-2 p-1 rounded border border-dashed border-white/10 bg-white/5">
                                    <Selector
                                        value={getIndicatorLabel(series.indicator)}
                                        options={indicatorOptions}
                                        onChange={(label: string) =>
                                            updateComparison(series.id, "indicator", getIndicatorId(label))
                                        }
                                        compact
                                    />
                                    <span className="text-xs text-slate-500">in</span>
                                    <Selector
                                        value={series.region}
                                        options={regionOptions}
                                        onChange={(val: string) =>
                                            updateComparison(series.id, "region", val)
                                        }
                                        compact
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={handleAddComparison}
                            className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-white/20 rounded text-sm text-slate-400 hover:text-primary hover:border-primary/40"
                        >
                            <Plus size={14} /> Compare
                        </button>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    {/* Timeframe */}
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                            Timeframe {isCompareMode && <Lock size={8} />}
                        </span>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded p-1">
                            <input
                                type="number"
                                placeholder={minYear.toString()}
                                value={timeRange.startYear || ""}
                                onChange={e =>
                                    setTimeRange({
                                        ...timeRange,
                                        startYear: Number(e.target.value) || null
                                    })
                                }
                                className="w-16 bg-transparent text-xs text-center border-none focus:ring-0 outline-none"
                            />
                            <span className="text-slate-500">-</span>
                            <input
                                type="number"
                                placeholder={maxYear.toString()}
                                value={timeRange.endYear || ""}
                                onChange={e =>
                                    setTimeRange({
                                        ...timeRange,
                                        endYear: Number(e.target.value) || null
                                    })
                                }
                                className="w-16 bg-transparent text-xs text-center border-none focus:ring-0 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: TOOLS */}
                <div className="flex items-center gap-1">
                    <ToolButton icon={MousePointer2} active={activeTool === "view"} onClick={() => setActiveTool("view")} />
                    <ToolButton icon={ArrowLeftRight} active={activeTool === "select"} onClick={() => setActiveTool("select")} />
                    <ToolButton icon={TrendingUp} active={activeTool === "trend"} onClick={() => setActiveTool("trend")} />
                    <ToolButton icon={Minus} active={activeTool === "threshold"} onClick={() => setActiveTool("threshold")} />
                    <ToolButton icon={Edit3} active={activeTool === "note"} onClick={() => setActiveTool("note")} />
                </div>

                {/* SECTION 3: ACTION */}
                <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                    <SavedIndicator />

                    <div className="relative group">
                        <Button
                            size="sm"
                            disabled={!isValid}
                            onClick={handleAnalyze}
                            className={cn(
                                isValid ? "bg-primary" : "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Sparkles size={16} /> Analyze
                        </Button>

                        {!isValid && (
                            <div className="absolute top-full right-0 mt-2 px-2 py-1 text-xs bg-slate-900 border border-red-900/50 text-red-400 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                                Select valid indicator & timeframe
                            </div>
                        )}
                    </div>
                </div>

            </GlassPanel>
        </div>
    );
}

/* ---------- Sub Components ---------- */

function SavedIndicator() {
    return (
        <span className="text-[10px] text-emerald-500/80 flex items-center gap-1 select-none">
            <Check size={10} /> Saved
        </span>
    );
}

function ToolButton({
    icon: Icon,
    active,
    onClick
}: {
    icon: any;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-2 rounded-lg transition-colors",
                active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"
            )}
        >
            <Icon size={18} />
        </button>
    );
}

/* ---------- Selector ---------- */

interface SelectorProps {
    value: string | null;
    options: string[];
    onChange: (val: string) => void;
    icon?: any;
    placeholder?: string;
    compact?: boolean;
}

function Selector({
    value,
    options,
    onChange,
    icon: Icon,
    placeholder = "Select",
    compact = false
}: SelectorProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);
    const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

    // SAFETY: Update position only when open
    useEffect(() => {
        if (!open) {
            setPos(null);
            return;
        }

        const updatePos = () => {
            if (ref.current) {
                const r = ref.current.getBoundingClientRect();
                setPos({ top: r.bottom + 6, left: r.left, width: r.width });
            }
        };

        updatePos();
        // Recalculate on scroll/resize to keep attached
        window.addEventListener("scroll", updatePos, true);
        window.addEventListener("resize", updatePos);
        return () => {
            window.removeEventListener("scroll", updatePos, true);
            window.removeEventListener("resize", updatePos);
        };
    }, [open]);

    // Handle Click Outside
    useEffect(() => {
        if (!open) return;

        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                // If it's in the portal, we rely on the portal items to close it
                // But if they clicked elsewhere, close it.
                // NOTE: Clicking inside the portal div itself (scrolling bar) shouldn't close.
                // Since portal is at body level, we need a way to identify it.
                // Simplified: Close if not on trigger. The portal click propagation might be an issue
                // if we don't stop it.
                // We'll add e.stopPropagation on the portal container.
                setOpen(false);
            }
        };

        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <>
            <button
                ref={ref}
                onClick={(e) => {
                    // Prevent immediate close from document logic
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className={cn(
                    "flex items-center gap-2 border border-white/10 rounded bg-white/5 hover:bg-white/10 transition-colors",
                    compact ? "px-2 py-0.5 text-xs" : "px-3 py-1.5"
                )}
            >
                {Icon && <Icon size={12} />}
                <span className="truncate max-w-[120px]">{value || placeholder}</span>
                <ChevronDown size={12} />
            </button>

            {/* SAFETY: Render Portal ONLY if open AND pos exists */}
            {open && pos && createPortal(
                <div
                    className="fixed z-[100] bg-slate-950 border border-white/10 rounded shadow-xl overflow-y-auto max-h-60"
                    style={{ top: pos.top, left: pos.left, minWidth: Math.max(pos.width, 160) }}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent document click handler from closing
                >
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                            className="block w-full text-left px-3 py-2 hover:bg-white/10 text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            {opt}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
}
