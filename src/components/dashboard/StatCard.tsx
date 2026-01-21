import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: any;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    minimal?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, className, minimal }: StatCardProps) {
    return (
        <GlassPanel className={cn("flex flex-col justify-between h-full p-5", className)} noBorder>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{label}</p>
                    <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</h3>
                </div>
                {!minimal && (
                    <div className="p-2 rounded-lg bg-white/5 text-slate-400">
                        <Icon size={18} />
                    </div>
                )}
            </div>

            {trend && !minimal && (
                <div className="flex items-center gap-2 mt-4">
                    <span className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded",
                        trend.isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}>
                        {trend.isPositive ? "+" : "-"}{trend.value}%
                    </span>
                    <span className="text-xs text-slate-500">vs last week</span>
                </div>
            )}
        </GlassPanel>
    );
}
