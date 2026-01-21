import { PolicyStatus } from "@/lib/types";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PolicyPanelProps {
    status: PolicyStatus | null;
}

const LEVEL_CONFIG = {
    routine: { label: 'Routine Surveillance', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', icon: ShieldCheck },
    enhanced: { label: 'Enhanced Monitoring', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/10', icon: Shield },
    active_response: { label: 'Active Response', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/10', icon: ShieldAlert },
};

export function PolicyPanel({ status }: PolicyPanelProps) {
    if (!status) {
        return (
            <GlassPanel className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[200px]" noBorder>
                <div className="mb-2 p-3 rounded-full bg-slate-900/50">
                    <Shield className="w-6 h-6 opacity-20" />
                </div>
                <p className="text-xs font-mono">NO OPERATIONAL STATUS ASSIGNED</p>
            </GlassPanel>
        );
    }

    const config = LEVEL_CONFIG[status.monitoring_level] || LEVEL_CONFIG.routine;
    const Icon = config.icon;

    return (
        <GlassPanel className="h-full flex flex-col relative overflow-hidden bg-slate-950/30 border-white/10" noBorder>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <Shield size={18} className="text-indigo-400" />
                    Operational Status
                </h3>
                <div className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider border", config.color, config.border, config.bg)}>
                    {status.advisory_code.toUpperCase()} ADVISORY
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                {/* Status Block */}
                <div className={cn("p-4 rounded-lg border flex items-start gap-4", config.bg, config.border)}>
                    <div className={cn("p-2 rounded-md bg-black/20", config.color)}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h4 className={cn("text-lg font-bold tracking-tight mb-1", config.color)}>
                            {config.label}
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {status.reasoning}
                        </p>
                    </div>
                </div>

                {/* SOP Actions */}
                <div className="flex-1">
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Info size={12} />
                        Recommended Actions (SOP)
                    </h5>
                    <div className="space-y-2">
                        {status.recommended_actions.map((action, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-2 rounded hover:bg-white/5 transition-colors">
                                <CheckCircle2 size={14} className={cn("mt-0.5 shrink-0", config.color)} />
                                <span className="text-sm text-slate-300">{action}</span>
                            </div>
                        ))}
                        {status.recommended_actions.length === 0 && (
                            <div className="text-xs text-slate-600 italic pl-6">No specific actions listed.</div>
                        )}
                    </div>
                </div>

                {/* Timestamp */}
                <div className="mt-auto pt-2 border-t border-white/5 text-[10px] text-slate-500 font-mono text-right">
                    Last Assessment: {new Date(status.generated_at).toLocaleString()}
                </div>
            </div>
        </GlassPanel>
    );
}
