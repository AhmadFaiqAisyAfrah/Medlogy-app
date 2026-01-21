"use client";

import { motion } from "framer-motion";
import { Book, Stethoscope } from "lucide-react";
import Image from "next/image";

interface HeroAnimationProps {
    className?: string;
}

export function HeroAnimation({ className }: HeroAnimationProps) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Stethoscope Layer (Back) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute z-0 text-primary/30"
            >
                <Stethoscope size={400} strokeWidth={1} />
            </motion.div>


            {/* Book Layer (Front) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative z-10"
            >
                <div className="relative">
                    {/* Glow effect behind the book */}
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />

                    {/* Placeholder for actual complex SVG/Image or Lucid Icon construction */}
                    {/* In a real scenario, we might use a custom SVG here. 
                        Using Lucide Book for now, scaled up and styled. */}
                    <Book size={200} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" strokeWidth={1} />

                    {/* Animated "Knowledge" particles/elements could go here */}
                </div>
            </motion.div>

            {/* Floating Elements (Optional - to add depth) */}
            <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 w-4 h-4 bg-emerald-400 rounded-full blur-[2px] opacity-60"
            />
            <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-20 w-3 h-3 bg-blue-400 rounded-full blur-[2px] opacity-40"
            />

        </div>
    );
}
