import { GlassPanel } from "@/components/ui/GlassPanel";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface HeaderProps {
    isLanding?: boolean;
    toggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

export function Header({ isLanding = false, toggleSidebar, isSidebarOpen = true }: HeaderProps) {
    // APP MODE HEADER (Minimal - user profile moved to sidebar)
    if (!isLanding) {
        return (
            <header className="px-6 py-4 z-30 pointer-events-none">
                <div className="pointer-events-auto inline-block">
                    <GlassPanel className="p-2" noBorder>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                        </button>
                    </GlassPanel>
                </div>
            </header>
        );
    }

    // LANDING MODE HEADER (Keep minimal branding for now)
    return (
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-auto bg-[#0B0C10]/70 backdrop-blur-lg border-b border-white/5">
            <div className="flex items-center">
                <span className="font-bold text-white text-xl tracking-tighter">Medlogy</span>
            </div>
            <div className="pointer-events-auto flex items-center gap-4">
                <a href="/login" className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all">
                    Login
                </a>
            </div>
        </header>
    );
}
