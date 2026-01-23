import { GlassPanel } from "@/components/ui/GlassPanel";
import { LineChart, Sparkles } from "lucide-react";

export default function ChartPage() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[80vh]">
            <div className="max-w-md w-full space-y-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                    <LineChart className="text-primary" size={40} />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        Chart Analytics
                    </h1>
                    <p className="text-xl text-slate-400">
                        Advanced data visualization coming soon.
                    </p>
                </div>

                <GlassPanel className="p-6 border-white/5 bg-white/5">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                        <Sparkles size={16} className="text-yellow-500" />
                        <span>This feature is currently in development.</span>
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
}
