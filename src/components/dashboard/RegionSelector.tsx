"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Region } from "@/lib/types";
import { Globe, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RegionSelectorProps {
    regions: Region[];
    activeRegionId: string;
}

export function RegionSelector({ regions, activeRegionId }: RegionSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    const activeRegion = regions.find(r => r.id === activeRegionId) || regions[0];

    const handleSelect = (regionId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("region", regionId);
        router.push(`/analysis?${params.toString()}`);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg hover:bg-slate-800/50 transition-colors group"
            >
                <Globe size={14} className="text-indigo-400 group-hover:text-indigo-300" />
                <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Region</span>
                    <span className="text-xs font-medium text-white flex items-center gap-1">
                        {activeRegion?.name}
                        <span className="text-slate-500">, {activeRegion?.country}</span>
                    </span>
                </div>
                <ChevronDown size={14} className={cn("text-slate-500 transition-transform ml-2", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-slate-950 border border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {regions.map((region) => (
                            <button
                                key={region.id}
                                onClick={() => handleSelect(region.id)}
                                className={cn(
                                    "w-full px-4 py-2 text-left flex items-start gap-3 hover:bg-white/5 transition-colors",
                                    activeRegionId === region.id && "bg-indigo-500/10 border-l-2 border-indigo-500"
                                )}
                            >
                                <MapPin size={14} className={cn("mt-1", activeRegionId === region.id ? "text-indigo-400" : "text-slate-600")} />
                                <div>
                                    <div className={cn("text-sm font-medium", activeRegionId === region.id ? "text-white" : "text-slate-300")}>
                                        {region.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        {region.country}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
