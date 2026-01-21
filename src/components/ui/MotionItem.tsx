"use client";

import { motion } from "framer-motion";

export const MotionItem = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
            className="h-full"
        >
            {children}
        </motion.div>
    );
};
