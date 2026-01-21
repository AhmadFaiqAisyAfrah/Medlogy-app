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
    Coffee
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/" },
    { icon: Activity, label: "Analysis", href: "/analysis" },
    { icon: Newspaper, label: "Global Health News", href: "/global-health-news" },
    { icon: BookOpen, label: "Syntheses", href: "/reports" },
    { icon: Workflow, label: "Scenario Explorer", href: "#" }, // Disabled for MVP
    { icon: Coffee, label: "Buy Me a Coffee", href: "/support" }
];

export function Sidebar() {
    const pathname = usePathname();

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
                <nav className="flex-1 space-y-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isDisabled = item.href === "#";
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : isDisabled
                                            ? "text-slate-600 cursor-not-allowed"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon size={18} className={cn("group-hover:scale-110 transition-transform", isActive && "animate-pulse")} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </GlassPanel>
        </aside>
    );
}
