"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { LogOut, User, Settings, Shield } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { signout } from "@/app/(auth)/login/actions";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
    email?: string;
    full_name?: string;
    display_name?: string;
}

export function UserNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch user profile
    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Try to get profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name, display_name')
                    .eq('id', user.id)
                    .single();

                setProfile({
                    email: user.email,
                    full_name: profileData?.full_name || user.user_metadata?.full_name,
                    display_name: profileData?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0]
                });
            }
        };

        fetchUser();
    }, []);

    if (!profile) return null;

    return (
        <div className="relative z-50 pointer-events-auto" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-slate-900 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
                {/* Avatar Placeholder */}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 origin-top-right"
                    >
                        <GlassPanel className="p-4 flex flex-col gap-2 shadow-2xl">
                            {/* User Info */}
                            <div className="flex flex-col border-b border-white/5 pb-3 mb-1">
                                <span className="text-sm font-bold text-white leading-none">
                                    {profile.display_name || "User"}
                                </span>
                                <span className="text-xs text-slate-400 mt-1 truncate">
                                    {profile.email}
                                </span>
                            </div>

                            {/* Masked Password (Visual Only) */}
                            <div className="flex items-center justify-between py-2 px-2 rounded-lg bg-white/5 border border-white/5 mb-2">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-slate-500" />
                                    <span className="text-xs text-slate-400 font-mono tracking-widest">••••••••</span>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="space-y-1">
                                <button className="w-full flex items-center gap-2 px-2 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                                    <User size={16} />
                                    Profile Settings
                                </button>
                            </div>

                            {/* Logout */}
                            <form action={signout} className="border-t border-white/5 pt-2 mt-1">
                                <button
                                    type="submit"
                                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </form>
                        </GlassPanel>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
