"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { Search, Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserNav } from "@/components/layout/UserNav";

interface HeaderProps {
    isLanding?: boolean;
    toggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

export function Header({ isLanding = false, toggleSidebar, isSidebarOpen = true }: HeaderProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();
    }, []);

    // LANDING MODE HEADER
    if (isLanding) {
        return (
            <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-auto bg-[#0B0C10]/70 backdrop-blur-lg border-b border-white/5">
                <div className="flex items-center">
                    <span className="font-bold text-white text-xl tracking-tighter">Medlogy</span>
                </div>
                <div className="pointer-events-auto flex items-center gap-4">
                    {!loading && (
                        user ? (
                            <UserNav />
                        ) : (
                            <a href="/login" className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all">
                                Login
                            </a>
                        )
                    )}
                </div>
            </header>
        );
    }

    // APP MODE HEADER
    return (
        <header className="px-6 py-4 z-30">
            <GlassPanel className="flex items-center justify-between p-3" noBorder>
                <div className="flex items-center gap-4 flex-1">
                    {/* Sidebar Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>

                    {/* Search - Only show if logged in or public news? Let's keep it but maybe hide if pure landing... wait this is App Mode */}

                </div>

                <div className="flex items-center gap-4">
                    {/* Time / Context */}
                    <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-xs text-slate-400">Jan 17, 2026</span>
                        <div className="w-[1px] h-3 bg-white/10" />
                        <span className="text-[10px] font-bold text-emerald-500 animate-pulse">LIVE</span>
                    </div>

                    {!loading && (
                        user ? (
                            <>
                                {/* Notifications */}
                                <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                                    <Bell size={20} />
                                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-slate-900" />
                                </button>

                                {/* User Dropdown */}
                                <UserNav />
                            </>
                        ) : (
                            <a href="/login" className="px-5 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80 border border-primary/20 transition-all text-sm font-medium">
                                Login to Access Platform
                            </a>
                        )
                    )}
                </div>
            </GlassPanel>
        </header>
    );
}
