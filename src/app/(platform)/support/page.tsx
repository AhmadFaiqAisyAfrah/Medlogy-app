
"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { Coffee, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function SupportPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Support Medlogy</h1>
                <p className="text-slate-400">Help keep the intelligence synthesis running.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassPanel className="p-8 flex flex-col items-center text-center space-y-6 h-full">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Coffee size={32} className="text-amber-500" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Buy Me a Coffee</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Caffeine fuels code. Support standard maintenance, server costs, and late-night debugging sessions.
                            </p>
                        </div>

                        <button className="w-full py-3 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 transition-colors">
                            Donate $5
                        </button>
                    </GlassPanel>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassPanel className="p-8 flex flex-col items-center text-center space-y-6 h-full border-primary/20 bg-primary/5">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Heart size={32} className="text-primary" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Become a Sponsor</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Direct contribution to the roadmap. Prioritize features, access early betas, and join the core community.
                            </p>
                        </div>

                        <button className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                            Sponsor Project
                        </button>
                    </GlassPanel>
                </motion.div>
            </div>

            <div className="pt-8 border-t border-white/5 text-center">
                <p className="text-slate-500 text-sm">
                    Medlogy is an open-source initiative. All contributions go directly towards infrastructure and development.
                </p>
            </div>
        </div>
    );
}
