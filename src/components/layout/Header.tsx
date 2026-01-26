import { GlassPanel } from "@/components/ui/GlassPanel";
import { PanelLeftClose, PanelLeftOpen, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { signout } from "@/app/(auth)/login/actions";
import { cn } from "@/lib/utils";

interface HeaderProps {
    isLanding?: boolean;
    toggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

export function Header({ isLanding = false, toggleSidebar, isSidebarOpen = true }: HeaderProps) {
    // Auth State (Shared for Landing Mode logic)
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        // Only run check if we are in Landing mode (App mode profile is in Sidebar)
        if (isLanding) {
            checkUser();
        }
    }, [isLanding]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    // APP MODE HEADER (Minimal - user profile moved to sidebar)
    if (!isLanding) {
        return (
            <header className="px-6 py-4 z-30 flex items-center gap-4 sticky top-0">
                <div className="pointer-events-auto shrink-0">
                    <GlassPanel className="p-2" noBorder>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                        </button>
                    </GlassPanel>
                </div>

                {/* Dynamic Slot for Page-Specific Toolbar Injection */}
                <div id="header-slot" className="flex-1 min-w-0 pointer-events-auto flex items-center" />
            </header>
        );
    }

    // LANDING MODE HEADER (Keep minimal branding for now)
    return (
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-auto bg-[#0B0C10]/70 backdrop-blur-lg border-b border-white/5">
            <div className="flex items-center">
                <span className="font-bold text-white text-xl tracking-tighter">Medlogy</span>
            </div>
            <div className="pointer-events-auto flex items-center gap-4 relative" ref={menuRef}>
                {!loading && (
                    user ? (
                        <>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/20 transition-transform hover:scale-105 active:scale-95"
                            >
                                <User size={16} className="text-white/90" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-950/90 border border-white/10 rounded-xl p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left mb-1">
                                        <Settings size={16} />
                                        <span>Settings</span>
                                    </button>
                                    <form action={signout}>
                                        <button
                                            type="submit"
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                        >
                                            <LogOut size={16} />
                                            <span>Sign Out</span>
                                        </button>
                                    </form>
                                </div>
                            )}
                        </>
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
