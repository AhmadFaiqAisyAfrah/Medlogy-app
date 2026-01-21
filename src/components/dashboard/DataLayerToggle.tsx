"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Layers, Activity, BookOpen, FileText } from "lucide-react";

export type DataLayer = 'summary' | 'analytical' | 'research';

interface DataLayerToggleProps {
    activeLayer: DataLayer;
    onChange: (layer: DataLayer) => void;
}

export function DataLayerToggle({ activeLayer, onChange }: DataLayerToggleProps) {
    const layers: { id: DataLayer; label: string; icon: any }[] = [
        { id: 'summary', label: 'Summary', icon: FileText },
        { id: 'analytical', label: 'Analytical', icon: Activity },
        { id: 'research', label: 'Research', icon: BookOpen },
    ];

    return (
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/80 border border-white/10 w-fit">
            {layers.map((layer) => (
                <button
                    key={layer.id}
                    onClick={() => onChange(layer.id)}
                    className={cn(
                        "relative flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all z-10",
                        activeLayer === layer.id ? "text-white" : "text-slate-400 hover:text-slate-300"
                    )}
                >
                    {activeLayer === layer.id && (
                        <motion.div
                            layoutId="layerTab"
                            className="absolute inset-0 bg-white/10 border border-white/10 rounded-lg -z-10 shadow-sm"
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                    <layer.icon size={14} className={cn(activeLayer === layer.id ? "text-primary" : "opacity-70")} />
                    {layer.label}
                </button>
            ))}
        </div>
    );
}
