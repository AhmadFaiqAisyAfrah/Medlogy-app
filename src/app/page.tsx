"use client";

import { BentoGrid, BentoItem } from "@/components/dashboard/BentoGrid";
import { Activity, ShieldCheck, Globe, ArrowRight, BrainCircuit, Dna, MousePointer2 } from "lucide-react";
import Link from "next/link";
import { BrandCharacter } from "@/components/brand/BrandCharacter";
import { HeroAnimation } from "@/components/brand/HeroAnimation";
import { TypewriterEffect } from "@/components/ui/TypewriterEffect";
import { motion, useScroll, useTransform } from "framer-motion";

import { Header } from "@/components/layout/Header";

export default function Home() {
    const { scrollY } = useScroll();
    const owlOpacity = useTransform(scrollY, [200, 600], [0, 1]);
    const owlScale = useTransform(scrollY, [200, 600], [0.8, 1]);

    return (
        <div className="space-y-20 pb-20 overflow-x-hidden font-sans">
            {/* Landing Header */}
            <Header isLanding={true} />

            {/* Scroll Progress / Affordance */}
            <motion.div
                className="fixed right-6 top-1/2 -translate-y-1/2 w-1 h-24 bg-white/10 rounded-full z-50 hidden md:block"
                style={{ scaleY: useTransform(scrollY, [0, 1000], [0, 1]) }}
            >
                <motion.div
                    className="w-full bg-primary rounded-full"
                    style={{ height: useTransform(scrollY, [0, 2000], ["0%", "100%"]) }}
                />
            </motion.div>


            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden -mt-8">
                {/* Background Gradients & Edge Textures */}
                <div className="absolute top-0 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none mix-blend-screen translate-x-1/2 -translate-y-1/2 right-0" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[100px] -z-10 opacity-20 pointer-events-none mix-blend-screen -translate-x-1/2 translate-y-1/2" />

                {/* Vignette Edge - Bottom only */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B0C10] to-transparent pointer-events-none z-20" />

                <div className="max-w-7xl mx-auto px-6 w-full z-10 grid lg:grid-cols-2 gap-12 items-center -mt-12">

                    {/* Left Column: Text & Actions */}
                    <div className="space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                            Health, <br />
                            <TypewriterEffect
                                words={["Synthesized.", "Interpreted.", "Verified.", "Decentralized.", "Intelligence."]}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-primary to-purple-500"
                                cursorClassName="text-primary"
                            />
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl">
                            The decentralized intelligence layer for global public health.
                            Real-time surveillance, predictive modeling, and verified signal synthesis.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-4 w-full justify-center lg:justify-start">
                            <Link href="/analysis">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-primary text-white font-semibold px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(14,165,233,0.3)] hover:shadow-[0_0_60px_rgba(14,165,233,0.5)] transition-all flex items-center gap-2 group"
                                >
                                    📊 Analysis
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>

                            <Link href="/global-health-news">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-white transition-all font-semibold flex items-center gap-2"
                                >
                                    <Globe size={20} className="text-emerald-400" />
                                    Global News
                                </motion.button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Brand Character (Owl) */}
                    <div className="order-1 lg:order-2 flex justify-center items-center relative h-[500px] w-full">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-20 rounded-full blur-3xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative w-full h-full max-w-[500px] max-h-[500px]"
                        >
                            <BrandCharacter className="w-full h-full" />
                        </motion.div>
                    </div>

                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-10 right-10 hidden lg:flex flex-col items-center gap-2 text-slate-500"
                >
                    <span className="text-[10px] uppercase tracking-widest writing-mode-vertical rotate-180">Scroll</span>
                    <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-slate-500 to-transparent" />
                </motion.div>

            </section>

            {/* Note: Owl is now the main hero character, so we remove the duplicate scroll guide for cleaner UX */}

            {/* Narrative Section 1: Data-Driven */}
            <motion.section
                className="min-h-[50vh] flex items-center py-20 relative z-10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <div className="max-w-4xl mx-auto px-6 text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mb-6 rounded-full mx-auto lg:mx-0" />
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            Powered by <span className="text-blue-400">Verified Evidence</span>
                        </h2>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            Every insight in Medlogy is powered by data — from outbreak reports and time-series surveillance to peer-reviewed scientific research.
                        </p>
                    </div>
                    <div className="order-1 lg:order-2 flex justify-center">
                        {/* Visual Representation */}
                        <div className="relative w-64 h-64 bg-blue-500/5 rounded-full border border-blue-500/20 flex items-center justify-center animate-pulse-slow">
                            <Activity size={64} className="text-blue-500 opacity-80" />
                            <div className="absolute inset-0 border border-blue-500/10 rounded-full scale-110" />
                            <div className="absolute inset-0 border border-blue-500/10 rounded-full scale-125 dashed-border" />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Narrative Section 2: Decentralized */}
            <motion.section
                className="min-h-[50vh] flex items-center py-20 bg-white/5 mx-[-24px] px-[24px] relative z-10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <div className="max-w-4xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="flex justify-center">
                        <div className="relative w-64 h-64">
                            <div className="absolute top-0 left-10 w-20 h-20 bg-purple-500/10 rounded-2xl border border-purple-500/20 flex items-center justify-center backdrop-blur-sm z-10">
                                <ShieldCheck className="text-purple-400" size={32} />
                            </div>
                            <div className="absolute bottom-10 right-10 w-20 h-20 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center backdrop-blur-sm z-10">
                                <Globe className="text-emerald-400" size={32} />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-slate-800/50 rounded-full border border-white/10 flex items-center justify-center z-0">
                                <BrainCircuit className="text-slate-500" size={48} />
                            </div>
                        </div>
                    </div>
                    <div className="text-center lg:text-left">
                        <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-400 mb-6 rounded-full mx-auto lg:mx-0" />
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            Decentralized <span className="text-purple-400">Consensus</span>
                        </h2>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            Health intelligence should not depend on a single authority. Medlogy distributes data validation across multiple sources, reducing bias, delays, and blind spots.
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* Narrative Section 3: Synthesized Intelligence */}
            <motion.section
                className="min-h-[50vh] flex items-center py-20 relative z-10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <div className="max-w-4xl mx-auto px-6 text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 mb-6 rounded-full mx-auto lg:mx-0" />
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            From Noise to <span className="text-emerald-400">Signal</span>
                        </h2>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            Raw data is noisy. Medlogy synthesizes signals into patterns, trends, and verified insights you can trust.
                        </p>
                    </div>
                    <div className="order-1 lg:order-2 flex justify-center">
                        <div className="flex gap-4 items-end h-40">
                            <motion.div className="w-8 bg-slate-800 rounded-t-lg" animate={{ height: [40, 60, 40] }} transition={{ duration: 2, repeat: Infinity }} />
                            <motion.div className="w-8 bg-slate-700 rounded-t-lg" animate={{ height: [60, 100, 60] }} transition={{ duration: 2.5, repeat: Infinity }} />
                            <motion.div className="w-8 bg-emerald-500/50 rounded-t-lg" animate={{ height: [80, 120, 80] }} transition={{ duration: 3, repeat: Infinity }} />
                            <motion.div className="w-8 bg-emerald-500 rounded-t-lg shadow-[0_0_20px_rgba(16,185,129,0.5)]" animate={{ height: [100, 160, 100] }} transition={{ duration: 3.5, repeat: Infinity }} />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Final CTA */}
            <motion.section
                className="py-24 text-center relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <div className="max-w-2xl mx-auto space-y-8 p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-colors" />

                    <h2 className="text-4xl font-bold text-white relative z-10">Access the Medlogy Platform</h2>
                    <p className="text-lg text-slate-400 relative z-10">
                        Log in to explore real-time health intelligence, outbreak analysis, and verified epidemiological insights.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center relative z-10">
                        <Link href="/analysis">
                            <button className="bg-white text-slate-950 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
                                📊 Analysis →
                            </button>
                        </Link>
                        <Link href="/global-health-news">
                            <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-all font-semibold flex items-center gap-2">
                                <Globe size={20} className="text-emerald-400" />
                                Global News
                            </button>
                        </Link>
                    </div>
                </div>
            </motion.section>

            {/* Donation Section */}
            <motion.section
                className="py-12 relative z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className="max-w-xl mx-auto text-center px-6">
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                        <span className="text-3xl mb-4 block">☕</span>
                        <h3 className="text-2xl font-bold text-white mb-3">Support the Developer</h3>
                        <p className="text-slate-400 mb-6">
                            Medlogy is an independent open-source initiative. Your support helps keep the servers running and the intelligence flowing.
                        </p>
                        <Link href="/support">
                            <button className="px-6 py-3 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 transition-colors">
                                Buy Me a Coffee
                            </button>
                        </Link>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
