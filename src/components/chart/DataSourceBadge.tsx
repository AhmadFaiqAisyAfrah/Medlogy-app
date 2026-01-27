"use client";

import { cn } from "@/lib/utils";

export function DataSourceBadge({
    isMock,
    attribution
}: {
    isMock?: boolean;
    attribution?: string;
}) {
    if (isMock === undefined) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold select-none",
                isMock
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
            )}
            title={attribution}
        >
            {isMock ? "Simulated" : "OWID"}
        </div>
    );
}
