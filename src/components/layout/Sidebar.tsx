"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Activity,
    Newspaper,
    BookOpen,
    Settings,
    MoreVertical,
    Workflow,
    LineChart,
    Coffee,
    Plus,
    MessageSquare
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Conversation } from "@/app/actions/conversation";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/" },
    { icon: Activity, label: "Analysis", href: "/analysis" },
    { icon: LineChart, label: "Chart", href: "/chart" },
    { icon: Newspaper, label: "News and Journal", href: "/global-health-news", disabled: true },
    { icon: BookOpen, label: "Syntheses", href: "/reports" },
    { icon: Workflow, label: "Scenario Explorer", href: "#" }, // Disabled for MVP
    { icon: Coffee, label: "Buy Me a Coffee", href: "/support" }
];

interface SidebarProps {
    conversations?: Conversation[];
}

export function Sidebar({ conversations = [] }: SidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentId = searchParams.get("id");

    return (
        <aside className="w-64 h-screen p-4 hidden md:flex flex-col z-20">
            <GlassPanel className="h-full flex flex-col border-white/5 bg-slate-950/50">
                {/* Brand */}
                <div className="flex items-center gap-3 px-4 py-4 mb-4 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                        <Activity className="text-primary" size={18} />
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-tight">Medlogy</h1>
                        <p className="text-[10px] text-slate-400 font-mono tracking-wide">INTELLIGENCE</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        // Check explicit disabled flag OR hash href
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
                                <item.icon size={18} className={cn("group-hover:scale-110 transition-transform", isActive && "animate-pulse")} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Analysis History (Structure Only - No Data) */}
                {pathname?.startsWith("/analysis") && (
                    <div className="flex-1 flex flex-col min-h-0 border-t border-white/5 mt-4 pt-4 px-4 overflow-hidden animate-in fade-in slide-in-from-left-5 duration-300">
                        <div className="text-xs font-semibold text-slate-500 mb-3 px-1 uppercase tracking-wider flex items-center justify-between">
                            <span>History</span>
                        </div>

                        <Link
                            href="/analysis"
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-sm font-medium mb-4 shrink-0"
                        >
                            <Plus size={16} />
                            <span>New Chat</span>
                        </Link>

                        <div className="flex-1 overflow-y-auto custom-scroll -mr-2 pr-2 space-y-1">
                            {conversations.length === 0 ? (
                                <div className="py-8 text-center bg-white/5 rounded-lg border border-white/5">
                                    <p className="text-xs text-slate-500 italic">No conversations yet</p>
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <Link
                                        key={conv.id}
                                        href={`/analysis?id=${conv.id}`}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                                            currentId === conv.id
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                        )}
                                    >
                                        <MessageSquare size={14} className={cn("shrink-0", currentId === conv.id ? "text-primary" : "opacity-70")} />
                                        <span className="truncate">{conv.title}</span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </GlassPanel>
        </aside>
    );
}
