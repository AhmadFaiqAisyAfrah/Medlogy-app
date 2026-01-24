"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { Conversation } from "@/app/actions/conversation";
import { createClient } from "@/lib/supabase/client";
import { signout } from "@/app/(auth)/login/actions";

import {
    LayoutDashboard,
    Activity,
    Newspaper,
    LineChart,
    Coffee,
    Plus,
    MessageSquare,
    User,
    Settings,
    LogOut,
    ChevronUp,
    LogIn, // Added
} from "lucide-react";

/* =========================
   Navigation Config
========================= */

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/" },
    { icon: Activity, label: "Analysis", href: "/analysis" },
    { icon: LineChart, label: "Chart", href: "/chart" },
    {
        icon: Newspaper,
        label: "News and Journal",
        href: "/global-health-news",
        disabled: true,
    },
    { icon: Coffee, label: "Buy Me a Coffee", href: "/support" },
];

/* =========================
   Types
========================= */

interface SidebarProps {
    conversations?: Conversation[];
}

/* =========================
   Component
========================= */

export function Sidebar({ conversations = [] }: SidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentId = searchParams.get("id");

    // Profile state
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    /* =========================
       Fetch User
    ========================= */

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };

        fetchUser();
    }, []);

    /* =========================
       Close Menu on Outside Click
    ========================= */

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <aside className="w-64 h-screen p-4 hidden md:flex flex-col z-20">
            <GlassPanel className="h-full flex flex-col border-white/5 bg-slate-950/50">

                {/* =========================
           Brand
        ========================= */}
                <div className="flex items-center gap-3 px-4 py-4 mb-4 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                        <Activity className="text-primary" size={18} />
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-tight">Medlogy</h1>
                        <p className="text-[10px] text-slate-400 font-mono tracking-wide">
                            INTELLIGENCE
                        </p>
                    </div>
                </div>

                {/* =========================
           Navigation
        ========================= */}
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isDisabled = (item as any).disabled || item.href === "#";

                        return (
                            <Link
                                key={item.label}
                                href={isDisabled ? "#" : item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : isDisabled
                                            ? "text-slate-600 cursor-not-allowed pointer-events-none"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon size={18} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* =========================
           Analysis History
        ========================= */}
                {pathname?.startsWith("/analysis") && (
                    <div className="flex-1 flex flex-col min-h-0 border-t border-white/5 mt-4 pt-4 px-4 overflow-hidden">
                        <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                            History
                        </div>

                        <Link
                            href="/analysis"
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-sm font-medium mb-4"
                        >
                            <Plus size={16} />
                            New Chat
                        </Link>

                        <div className="flex-1 overflow-y-auto custom-scroll space-y-1">
                            {conversations.length === 0 ? (
                                <div className="py-6 text-center text-xs text-slate-500 italic">
                                    No conversations yet
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <Link
                                        key={conv.id}
                                        href={`/analysis?id=${conv.id}`}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                                            currentId === conv.id
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <MessageSquare size={14} />
                                        <span className="truncate">{conv.title}</span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* =========================
           Profile Section (Footer)
        ========================= */}
                <div
                    ref={containerRef}
                    className="mt-auto border-t border-white/5 p-4 relative"
                >
                    {isMenuOpen && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-950/90 border border-white/10 rounded-xl p-2 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-2 fade-in duration-200">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left mb-1">
                                <Settings size={16} />
                                <span>Settings</span>
                            </button>

                            {user ? (
                                <form action={signout}>
                                    <button
                                        type="submit"
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                    >
                                        <LogOut size={16} />
                                        <span>Sign Out</span>
                                    </button>
                                </form>
                            ) : (
                                <Link
                                    href="/login"
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary/90 hover:bg-primary/10 rounded-lg transition-colors text-left"
                                >
                                    <LogIn size={16} />
                                    <span>Login</span>
                                </Link>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 border border-white/10">
                            <User size={16} className="text-white/80" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user ? "Medlogy User" : "Guest"}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                                {user?.email || "Not logged in"}
                            </p>
                        </div>
                        <ChevronUp
                            size={14}
                            className={cn(
                                "text-slate-500 transition-transform duration-200",
                                isMenuOpen && "rotate-180"
                            )}
                        />
                    </button>
                </div>
            </GlassPanel>
        </aside>
    );
}
