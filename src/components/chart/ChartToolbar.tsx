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
import { Series, TimeRange } from "./chart.types";

type ToolMode = "view" | "select" | "trend" | "threshold" | "note";

export interface ChartToolbarProps {
    primarySeries: Series;
    setPrimarySeries: (series: Series | ((prev: Series) => Series)) => void;
    comparisonSeries: Series[];
    setComparisonSeries: (series: Series[]) => void;
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
}

export function ChartToolbar({
    primarySeries,
    setPrimarySeries,
    comparisonSeries,
    setComparisonSeries,
    timeRange,
    setTimeRange
}: ChartToolbarProps) {
    // Interaction State
    const [activeTool, setActiveTool] = useState<ToolMode>("view");

    const isCompareMode = comparisonSeries.length > 0;

    const handleAddComparison = () => {
        const newSeries: Series = {
            id: `compare-${Date.now()}`,
            indicator: null,
            region: null,
        };
        setComparisonSeries([...comparisonSeries, newSeries]);
    };

    const handleRemoveComparison = (id: string) => {
        setComparisonSeries(comparisonSeries.filter((s) => s.id !== id));
    };

    const updateComparison = (id: string, field: keyof Series, value: string) => {
        setComparisonSeries(
            comparisonSeries.map((s) => (s.id === id ? { ...s, [field]: value } : s))
        );
    };

    // Resolve constraints based on Primary Series
    // Primary series.indicator is now ID. We look up meta directly.
    const primaryMeta = primarySeries.indicator ? indicatorRegistry[primarySeries.indicator] : null;
    const [minYear, maxYear] = primaryMeta?.availableYears || [1990, 2024];

    // Helper to validate range
    const isRangeValid = (start: number | null, end: number | null) => {
        if (!start || !end) return false;
        if (start > end) return false;
        if (start < minYear || end > maxYear) return false;
        return true;
    };

    // Derived state for validation
    const isValid = isRangeValid(timeRange.startYear, timeRange.endYear);

    // Dynamic Options from Registry
    const registryValues = Object.values(indicatorRegistry);
    const indicatorOptions = registryValues.map(m => m.label);
    const regionOptions = ["Global", "Indonesia", "Jakarta"];

    // Helper: Map Label -> ID
    const getIndicatorId = (label: string) => {
        return registryValues.find(m => m.label === label)?.id || label;
    };
    // Helper: Map ID -> Label (for display)
    const getIndicatorLabel = (id: string | null) => {
        if (!id) return null;
        return indicatorRegistry[id]?.label || id;
    };

    const handleAnalyze = () => {
        console.log({
            primarySeries,
            comparisonSeries,
            timeRange,
            mode: activeTool,
        });
    };

    return (
        <div className="flex flex-col gap-2 mb-6">
            <GlassPanel className="p-2 flex items-center justify-between gap-4">
                {/* SECTION 1: Data Selection */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-[65%]">

                    {/* Primary Series */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-semibold px-1 uppercase tracking-wider">Primary</span>
                            <div className="flex items-center gap-2">
                                {/* Indicator Dropdown */}
                                <Selector
                                    value={getIndicatorLabel(primarySeries.indicator)}
                                    options={indicatorOptions}
                                    onChange={(label) => setPrimarySeries(prev => ({
                                        ...prev,
                                        indicator: getIndicatorId(label)
                                    }))}
                                    icon={Search}
                                    placeholder="Select Indicator"
                                />

                                {/* Region Dropdown */}
                                <Selector
                                    value={primarySeries.region}
                                    options={regionOptions}
                                    onChange={(val) => setPrimarySeries(prev => ({ ...prev, region: val }))}
                                    placeholder="Select Region"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="h-8 w-px bg-white/10 mx-1 shrink-0" />

                    {/* Comparison Series */}
                    <div className="flex items-center gap-2 shrink-0">
                        {comparisonSeries.map((series, index) => (
                            <div key={series.id} className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-200">
                                <span className="text-[10px] text-slate-500 font-semibold px-1 uppercase tracking-wider flex items-center justify-between">
                                    <span>Compare #{index + 1}</span>
                                    <button onClick={() => handleRemoveComparison(series.id)} className="hover:text-red-400 transition-colors">
                                        <X size={10} />
                                    </button>
                                </span>
                                <div className="flex items-center gap-2 p-1 rounded-lg border border-white/10 bg-white/5 border-dashed">
                                    {/* Comparison Indicator */}
                                    <Selector
                                        value={getIndicatorLabel(series.indicator)}
                                        options={indicatorOptions}
                                        onChange={(label) => updateComparison(series.id, "indicator", getIndicatorId(label))}
                                        placeholder="Select Indicator"
                                        compact
                                    />

                                    <span className="text-slate-600 text-xs">in</span>

                                    {/* Comparison Region */}
                                    <Selector
                                        value={series.region}
                                        options={regionOptions}
                                        onChange={(val) => updateComparison(series.id, "region", val)}
                                        placeholder="Select Region"
                                        compact
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Add Compare Button */}
                        <div className="flex flex-col justify-end h-full pt-4">
                            <button
                                onClick={handleAddComparison}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-white/20 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-sm group"
                            >
                                <Plus size={14} className="group-hover:scale-110 transition-transform" />
                                <span>Compare</span>
                            </button>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="h-8 w-px bg-white/10 mx-1 shrink-0" />

                    {/* Time Range Selector */}
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-semibold px-1 uppercase tracking-wider flex items-center gap-1">
                            Timeframe
                            {isCompareMode && <Lock size={8} className="text-amber-500" />}
                        </span>
                        <div className={cn(
                            "flex items-center gap-2 bg-white/5 rounded-lg p-1 border relative transition-colors",
                            isCompareMode && "ring-1 ring-amber-500/30 bg-amber-500/5",
                            !isValid && timeRange.startYear && timeRange.endYear ? "border-red-500/50" : "border-white/5"
                        )}>
                            <input
                                type="number"
                                placeholder={minYear.toString()}
                                className={cn(
                                    "w-16 bg-transparent text-xs text-white border-none focus:ring-0 text-center",
                                    timeRange.startYear && (timeRange.startYear < minYear || (timeRange.endYear && timeRange.startYear > timeRange.endYear)) && "text-red-400 font-bold"
                                )}
                                value={timeRange.startYear || ""}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTimeRange({ ...timeRange, startYear: isNaN(val) ? null : val });
                                }}
                            />
                            <span className="text-slate-500">-</span>
                            <input
                                type="number"
                                placeholder={maxYear.toString()}
                                className={cn(
                                    "w-16 bg-transparent text-xs text-white border-none focus:ring-0 text-center",
                                    timeRange.endYear && (timeRange.endYear > maxYear || (timeRange.startYear && timeRange.endYear < timeRange.startYear)) && "text-red-400 font-bold"
                                )}
                                value={timeRange.endYear || ""}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setTimeRange({ ...timeRange, endYear: isNaN(val) ? null : val });
                                }}
                            />
                        </div>
                        {/* Validation Hint */}
                        {(!isValid && timeRange.startYear && timeRange.endYear) && (
                            <span className="text-[9px] text-red-400 absolute -bottom-4 left-1 whitespace-nowrap">
                                Valid: {minYear} - {maxYear}
                            </span>
                        )}
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
                        disabled={!isValid}
                        className={cn(
                            "gap-2 transition-all",
                            isValid
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
        </div>
    );
}

// Reusable Selector Component
import { createPortal } from "react-dom";

function Selector({
    value,
    options,
    onChange,
    icon: Icon,
    placeholder = "Select",
    compact = false
}: {
    value: string | null,
    options: string[],
    onChange: (val: string) => void,
    icon?: any,
    placeholder?: string,
    compact?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number; minWidth: number } | null>(null);

    // Update position on open/scroll/resize
    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + 6,
                    left: rect.left,
                    minWidth: rect.width
                });
            }
        };

        if (isOpen) {
            updatePosition();
            // Use ResizeObserver for cleaner element monitoring
            const resizeObserver = new ResizeObserver(updatePosition);
            if (triggerRef.current) resizeObserver.observe(triggerRef.current);

            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true); // Capture scroll on all elements

            return () => {
                resizeObserver.disconnect();
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
            };
        }
    }, [isOpen]);

    // Handle click outside for Portal content
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                // Check if click is inside the dropdown (which is in a portal)
                const dropdown = document.getElementById(`dropdown-${placeholder}`);
                if (dropdown && !dropdown.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, placeholder]);

    return (
        <>
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 rounded-lg transition-colors text-sm border",
                    compact
                        ? "px-2 py-0.5 text-xs"
                        : "px-3 py-1.5",
                    value
                        ? "text-slate-200 border-white/10 hover:bg-white/5 bg-white/5"
                        : "text-slate-400 border-white/10 hover:bg-white/5 italic bg-white/5"
                )}
            >
                {Icon && <Icon size={compact ? 12 : 14} className={value ? "text-primary" : "text-slate-500"} />}
                <span className="max-w-[120px] truncate">{value || placeholder}</span>
                <ChevronDown size={compact ? 12 : 14} className="text-slate-500 ml-1" />
            </button>

            {isOpen && position && createPortal(
                <div
                    id={`dropdown-${placeholder}`}
                    className="fixed z-[9999] bg-slate-950 border border-white/10 rounded-lg shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 origin-top overflow-hidden"
                    style={{
                        top: position.top,
                        left: position.left,
                        minWidth: Math.max(position.minWidth, 160)
                    }}
                    onWheel={(e) => e.stopPropagation()}
                >
                    <div className="max-h-64 overflow-y-auto py-1 custom-scrollbar overscroll-contain">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full px-3 py-2 text-sm text-left hover:bg-white/10 transition-colors flex items-center justify-between gap-3",
                                    value === option ? "text-primary bg-primary/5 font-medium" : "text-slate-300"
                                )}
                            >
                                <span className="truncate">{option}</span>
                                {value === option && <Check size={14} className="shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
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
