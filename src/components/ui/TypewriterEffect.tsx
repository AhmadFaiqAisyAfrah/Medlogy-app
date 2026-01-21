"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface TypewriterEffectProps {
    words: string[];
    className?: string; // Class for the wrapper
    textClassName?: string; // Class for the text itself
    cursorClassName?: string; // Class for the cursor
}

export function TypewriterEffect({
    words,
    className,
    textClassName,
    cursorClassName,
}: TypewriterEffectProps) {
    const [index, setIndex] = useState(0);
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayText = useTransform(rounded, (latest) =>
        words[index].slice(0, latest)
    );
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const word = words[index];
        const controls = animate(count, isDeleting ? 0 : word.length, {
            type: "tween",
            duration: isDeleting ? 0.8 : 1.5, // Typing speed
            ease: isDeleting ? "easeIn" : "easeOut",
            onComplete: () => {
                if (isDeleting) {
                    setIsDeleting(false);
                    setIndex((prev) => (prev + 1) % words.length);
                } else {
                    // Wait before deleting using a timeout
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            },
        });

        return controls.stop;
    }, [index, isDeleting, words, count]);

    return (
        <span className={className}>
            <motion.span className={textClassName}>{displayText}</motion.span>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
                className={cursorClassName}
            >
                |
            </motion.span>
        </span>
    );
}
