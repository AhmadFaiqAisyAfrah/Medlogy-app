"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChartSeries } from "@/lib/chart/contract";
import { useChartInstance } from "./useChartInstance";
import type { ToolMode } from "./chart.types";
import { RotateCcw, List, Trash2, X, Pencil, Check } from "lucide-react";

interface ChartCanvasProps {
    data: ChartSeries[];
    loading?: boolean;
    error?: string | null;
    hasPrimary?: boolean;
    activeTool?: ToolMode;
    chartId?: string; // Unique ID for persistence
}

export function ChartCanvas({
    data,
    loading,
    error,
    hasPrimary,
    activeTool = "view",
    chartId,
}: ChartCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [measurePoints, setMeasurePoints] = useState<any[]>([]);

    // Dragging Logic
    const [position, setPosition] = useState({ x: 16, y: 64 }); // Default: top-16 left-4
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    const resetMeasurement = () => {
        setMeasurePoints([]);
        setThresholds([]); // Updated to clear thresholds array
    };

    const hasData = data && data.length > 0;

    // Threshold Logic
    interface Threshold {
        id: string;
        value: number;
        label: string;
    }
    const [thresholds, setThresholds] = useState<Threshold[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Annotation Logic
    const [annotations, setAnnotations] = useState<any[]>([]);
    const [pendingAnnotation, setPendingAnnotation] = useState<{ x: number, y: number, dataX: string | number, dataY: number } | null>(null);
    const [annotationText, setAnnotationText] = useState("");
    const [showNotesList, setShowNotesList] = useState(false);
    const [showThresholdList, setShowThresholdList] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        // Use chartId if available, fallback to data ID (legacy/safety)
        const uniqueId = chartId || (data.length > 0 ? data[0].id : null);

        if (typeof window !== 'undefined' && uniqueId) {
            const key = `medlogy-notes-${uniqueId}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    setAnnotations(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse notes", e);
                }
            } else {
                setAnnotations([]); // Reset if no saved notes for this specific ID
            }

            // Load Thresholds
            const keyThresholds = `medlogy-thresholds-${uniqueId}`;
            const savedThresholds = localStorage.getItem(keyThresholds);
            if (savedThresholds) {
                try {
                    const parsed = JSON.parse(savedThresholds);
                    // Migrate legacy number[] to Threshold[]
                    const migrated = parsed.map((item: any) => {
                        if (typeof item === 'number') {
                            return {
                                id: Math.random().toString(36).substr(2, 9),
                                value: item,
                                label: 'Threshold'
                            };
                        }
                        return item;
                    });
                    setThresholds(migrated);
                } catch (e) {
                    console.error("Failed to parse thresholds", e);
                }
            } else {
                setThresholds([]);
            }

            setIsLoaded(true);
        }
    }, [chartId, data]);

    // Save to LocalStorage
    useEffect(() => {
        if (!isLoaded) return; // Guard: Wait for load before allowing save

        const uniqueId = chartId || (data.length > 0 ? data[0].id : null);

        if (typeof window !== 'undefined' && uniqueId) {
            const key = `medlogy-notes-${uniqueId}`;
            localStorage.setItem(key, JSON.stringify(annotations));

            const keyThresholds = `medlogy-thresholds-${uniqueId}`;
            localStorage.setItem(keyThresholds, JSON.stringify(thresholds));
        }
    }, [annotations, thresholds, chartId, data, isLoaded]);

    // Click Handler for Tools
    const handleChartClick = useCallback((params: any) => {
        if (activeTool === 'select') {
            const point = {
                year: params.name, // Axis value (Year)
                value: params.value,
                dataIndex: params.dataIndex,
                seriesName: params.seriesName
            };

            setMeasurePoints(prev => {
                const newState = prev.length >= 2 ? [point] : [...prev, point];
                return newState;
            });
        }

        if (activeTool === 'threshold') {
            // Allow setting threshold by clicking a point, or we could just take the Y-value
            if (params.value) {
                // Add new threshold as object
                const newItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    value: params.value,
                    label: 'Threshold'
                };
                setThresholds(prev => [...prev, newItem]);
            }
        }

        // Handle Note Editing (Click on MarkPoint)
        if (params.componentType === 'markPoint') {
            const idx = params.dataIndex;
            if (idx >= 0 && idx < annotations.length) {
                const note = annotations[idx];
                setPendingAnnotation({
                    x: params.event?.event?.offsetX || 0,
                    y: params.event?.event?.offsetY || 0,
                    dataX: note.coord[0],
                    dataY: note.coord[1]
                });
                setAnnotationText(note.value);
                setEditingIndex(idx);
                return;
            }
        }

        if (activeTool === 'note') {
            // Capture click for annotation
            if (params.event && params.event.event && params.componentType !== 'markPoint') {
                setPendingAnnotation({
                    x: params.event.event.offsetX, // Relative to canvas container
                    y: params.event.event.offsetY,
                    dataX: params.name, // Year
                    dataY: params.value
                });
                setAnnotationText(""); // Reset text
                setEditingIndex(null);
            }
        }
    }, [activeTool, annotations]);

    const saveAnnotation = () => {
        if (pendingAnnotation && annotationText.trim()) {
            if (editingIndex !== null) {
                // UPDATE existing
                setAnnotations(prev => {
                    const next = [...prev];
                    next[editingIndex] = {
                        ...next[editingIndex],
                        value: annotationText
                    };
                    return next;
                });
            } else {
                // CREATE new
                setAnnotations(prev => [
                    ...prev,
                    {
                        coord: [pendingAnnotation.dataX, pendingAnnotation.dataY],
                        value: annotationText
                    }
                ]);
            }
            setPendingAnnotation(null);
            setAnnotationText("");
            setEditingIndex(null);
        }
    };

    const cancelAnnotation = () => {
        setPendingAnnotation(null);
        setAnnotationText("");
        setEditingIndex(null);
    };



    // ================================
    // DATA STATUS DETECTION (NEW)
    // ================================
    const statuses = Array.from(
        new Set(
            data
                .map((s) => s.meta?.dataStatus)
                .filter(Boolean)
        )
    );

    const hasObserved = statuses.includes("observed");
    const hasModeled = statuses.includes("modeled");
    const hasSimulated = statuses.includes("simulated");

    // Init & update chart
    useChartInstance(containerRef, data, handleChartClick, activeTool, thresholds, annotations);

    return (
        <div className="w-full h-full min-h-[400px] relative">
            {/* ================================
                STATUS BADGES (TOP-RIGHT)
            ================================= */}
            {hasData && (
                <div className="absolute top-3 right-3 z-10 flex flex-wrap gap-2 pointer-events-none select-none justify-end max-w-[300px]">
                    {/* Render list of thresholds if active */}
                    {/* Render list of thresholds if active */}
                    {(activeTool === 'threshold' || thresholds.length > 0) && (
                        <div className="pointer-events-auto animate-in fade-in zoom-in duration-200 relative">
                            {/* Threshold List Toggle */}
                            <button
                                onClick={() => setShowThresholdList(!showThresholdList)}
                                className={`px-3 py-1 text-[10px] font-bold rounded-full
                                border backdrop-blur-md flex items-center gap-1.5 transition-all
                                ${showThresholdList ? 'bg-red-500 text-white border-red-500' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                            >
                                <List size={12} strokeWidth={3} />
                                <span>THRESHOLDS ({thresholds.length})</span>
                            </button>

                            {/* Threshold List Popover */}
                            {showThresholdList && (
                                <div className="absolute top-8 right-0 w-48 max-h-60 overflow-y-auto 
                                    bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-2 flex flex-col gap-2">
                                    {thresholds.length === 0 ? (
                                        <div className="text-center py-4 text-slate-500 text-xs italic">
                                            No thresholds yet. Click chart to add.
                                        </div>
                                    ) : (
                                        thresholds.map((th: any, idx) => (
                                            <div key={idx} className="flex justify-between items-center gap-2 p-2 bg-slate-800/50 rounded-lg group hover:bg-slate-800 transition-colors">
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    {editingId === (th.id || idx) ? (
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            value={th.label ?? 'Threshold'}
                                                            onChange={(e) => {
                                                                const newLabel = e.target.value;
                                                                setThresholds(prev => prev.map((item, i) => {
                                                                    if (i !== idx) return item;
                                                                    return { ...item, label: newLabel };
                                                                }));
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') setEditingId(null);
                                                            }}
                                                            className="bg-slate-700 text-xs text-white font-bold border border-slate-600 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500 w-full outline-none"
                                                            placeholder="Label..."
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-white font-bold truncate cursor-default" title={th.label}>
                                                            {th.label ?? 'Threshold'}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-red-400 font-mono">
                                                        {(th.value).toLocaleString()}
                                                    </span>
                                                </div>
                                                {editingId === (th.id || idx) ? (
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="text-green-400 hover:text-green-300 p-1"
                                                        title="Save Label"
                                                    >
                                                        <Check size={12} />
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingId(th.id || idx)}
                                                            className="text-slate-400 hover:text-blue-400 p-1"
                                                            title="Edit Label"
                                                        >
                                                            <Pencil size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => setThresholds(prev => prev.filter((_, i) => i !== idx))}
                                                            className="text-slate-400 hover:text-red-400 p-1"
                                                            title="Delete Threshold"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {(activeTool === 'note' || annotations.length > 0) && (
                        <div className="pointer-events-auto animate-in fade-in zoom-in duration-200">
                            {/* Floating Action Button (FAB) toggles list */}
                            <button
                                onClick={() => setShowNotesList(!showNotesList)}
                                className={`px-3 py-1 text-[10px] font-bold rounded-full
                                border backdrop-blur-md flex items-center gap-1.5 transition-all
                                ${showNotesList ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'}`}
                            >
                                <List size={12} strokeWidth={3} />
                                <span>NOTES ({annotations.length})</span>
                            </button>

                            {/* Notes List Popover */}
                            {showNotesList && (
                                <div className="absolute top-8 right-0 w-64 max-h-60 overflow-y-auto 
                                    bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-2 flex flex-col gap-2">
                                    {annotations.length === 0 ? (
                                        <div className="text-center py-4 text-slate-500 text-xs italic">
                                            No notes yet. Click the chart to add one.
                                        </div>
                                    ) : (
                                        annotations.map((note, idx) => (
                                            <div key={idx} className="flex justify-between items-start gap-2 p-2 bg-slate-800/50 rounded-lg group hover:bg-slate-800 transition-colors">
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <span className="text-[10px] font-mono text-slate-400">{note.coord[0]}</span>
                                                    <span className="text-xs text-slate-200 break-words font-medium leading-normal">{note.value}</span>
                                                </div>
                                                <button
                                                    onClick={() => setAnnotations(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete Note"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {hasObserved && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full
                            bg-emerald-500/10 text-emerald-500
                            border border-emerald-500/20 backdrop-blur-md">
                            🟢 OBSERVED DATA
                        </span>
                    )}

                    {hasModeled && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full
                            bg-orange-500/10 text-orange-400
                            border border-orange-500/20 backdrop-blur-md">
                            🟠 MODELED ESTIMATES
                        </span>
                    )}

                    {hasSimulated && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full
                            bg-amber-500/10 text-amber-400
                            border border-amber-500/20 backdrop-blur-md">
                            🟡 SIMULATED DATA
                        </span>
                    )}
                </div>
            )}

            {/* ================================
                LOADING OVERLAY
            ================================= */}
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center
                    bg-slate-950/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full border-2
                            border-white/10 border-t-primary animate-spin" />
                        <span className="text-sm text-slate-300">
                            Loading data…
                        </span>
                    </div>
                </div>
            )}

            {/* ================================
                ERROR STATE
            ================================= */}
            {!loading && error && (
                <div className="absolute inset-0 z-20 flex flex-col
                    items-center justify-center bg-slate-950/40 backdrop-blur-sm">
                    <span className="text-3xl mb-2 opacity-50">⚠️</span>
                    <span className="text-red-400 text-sm text-center px-4">
                        {error}
                    </span>
                </div>
            )}

            {/* ================================
                EMPTY STATE
            ================================= */}
            {!loading && !error && !hasData && (
                <div className="absolute inset-0 flex flex-col
                    items-center justify-center pointer-events-none z-10 space-y-3">
                    <div className="p-4 bg-white/5 rounded-full
                        ring-1 ring-white/10">
                        <span className="text-3xl opacity-40">📊</span>
                    </div>
                    {!hasPrimary ? (
                        <span className="text-slate-400 text-sm">
                            Select an indicator to begin
                        </span>
                    ) : (
                        <span className="text-slate-400 text-sm">
                            No data available for selected timeframe
                        </span>
                    )}
                </div>
            )}

            {/* ================================
                CHART CONTAINER
            ================================= */}
            <div
                ref={containerRef}
                className="w-full h-full min-h-[400px]"
            />

            {/* ================================
                SOURCE ATTRIBUTION
            ================================= */}
            {/* ================================
                ANNOTATION INPUT OVERLAY
            ================================= */}
            {pendingAnnotation && activeTool === 'note' && (
                <div
                    className="absolute z-30 flex flex-col gap-2 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl"
                    style={{
                        top: Math.min(pendingAnnotation.y, 300),
                        left: Math.min(pendingAnnotation.x, 500) // Simple boundary check
                    }}
                >
                    <input
                        className="bg-slate-800 text-white text-xs p-1.5 rounded border border-slate-600 focus:border-indigo-500 outline-none w-48"
                        placeholder="Enter note..."
                        value={annotationText}
                        onChange={(e) => setAnnotationText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveAnnotation()}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={cancelAnnotation}
                            className="text-[10px] text-slate-400 hover:text-white px-2 py-1"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveAnnotation}
                            className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

            {hasData && (
                <div className="absolute bottom-1 right-2 z-10
                    text-[9px] text-slate-500/60 max-w-[80%]
                    text-right pointer-events-none select-none">
                    {Array.from(
                        new Set(
                            data
                                .map((s) => s.meta?.source)
                                .filter(Boolean)
                        )
                    ).map((attr, i) => (
                        <div key={i}>{attr}</div>
                    ))}
                </div>
            )}


            {/* ================================
            MEASUREMENT OVERLAY
        ================================= */}
            {
                activeTool === 'select' && (
                    <div
                        className="absolute z-20 bg-slate-900/90 border border-indigo-500/50 rounded-xl shadow-2xl backdrop-blur-md max-w-xs transition-shadow duration-200"
                        style={{ top: position.y, left: position.x, cursor: isDragging ? 'grabbing' : 'default' }}
                    >
                        {/* ... existing measurement JSX ... */}
                        <div
                            className="flex items-center justify-between gap-2 p-3 border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-500/20 rounded text-indigo-400">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 3L3 21M21 3H12M21 3V12" /></svg>
                                </div>
                                <span className="font-bold text-sm text-indigo-100 uppercase tracking-wide">Measurement</span>
                            </div>

                            <button
                                onClick={resetMeasurement}
                                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                                title="Reset"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            {measurePoints.length === 0 && (
                                <div className="text-xs text-slate-400 italic text-center py-2">
                                    Click any two points on the chart<br />to measure the difference.
                                </div>
                            )}

                            {measurePoints.map((p, i) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-mono">Point {i + 1} ({p.year})</span>
                                    <span className="text-white font-medium">{Number(p.value).toLocaleString()}</span>
                                </div>
                            ))}

                            {measurePoints.length === 2 && (
                                <div className="pt-2 border-t border-white/10 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-xs">Delta Value</span>
                                        <span className="text-emerald-400 font-mono font-bold">
                                            {(measurePoints[1].value - measurePoints[0].value) > 0 ? "+" : ""}
                                            {(measurePoints[1].value - measurePoints[0].value).toLocaleString()}
                                            {" "}
                                            <span className="text-[10px] opacity-60">
                                                ({(((measurePoints[1].value - measurePoints[0].value) / measurePoints[0].value) * 100).toFixed(1)}%)
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-xs">Duration</span>
                                        <span className="text-white font-mono text-xs">
                                            {Math.abs(measurePoints[1].year - measurePoints[0].year)} Years
                                        </span>
                                    </div>
                                </div>
                            )}

                            {measurePoints.length === 1 && (
                                <div className="text-[10px] text-slate-500 italic pt-1 text-center">
                                    Select second point...
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* ================================
                THRESHOLD OVERLAY (Using ECharts MarkLine would be better, but doing CSS overlay for now as prototype)
                Actually, markLine is much better. Let's pass it to useChartInstance instead.
                But wait, useChartInstance doesn't support dynamic updates easily defined here without re-render.
                Let's stick to the pattern: useChartInstance updates data.
                We should add correct MarkLine series or updating chart options if logic is there.
                
                Simpler approach for now: CSS Line if activeTool == 'threshold' and we have a value.
                But mapping Y-value to pixels is hard without chart instance access.
                
                Let's pass thresholdValue to useChartInstance!
            ================================= */}
        </div >
    );
}
