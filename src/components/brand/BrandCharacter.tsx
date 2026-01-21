"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export function BrandCharacter({ className }: { className?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const ref = useRef<HTMLDivElement>(null);

    // --- Physics Configuration ---
    const headSpring = { damping: 30, stiffness: 120 };
    const eyeSpring = { damping: 20, stiffness: 180 };
    const bodySpring = { damping: 50, stiffness: 80 };

    const xHead = useSpring(mouseX, headSpring);
    const yHead = useSpring(mouseY, headSpring);
    const xEye = useSpring(mouseX, eyeSpring);
    const yEye = useSpring(mouseY, eyeSpring);
    const xBody = useSpring(mouseX, bodySpring);
    const yBody = useSpring(mouseY, bodySpring);

    // --- Parallax Mapping ---
    const bodyX = useTransform(xBody, [-1000, 1000], [-8, 8]);
    const bodyY = useTransform(yBody, [-1000, 1000], [-4, 4]);
    const headX = useTransform(xHead, [-1000, 1000], [-20, 20]);
    const headY = useTransform(yHead, [-1000, 1000], [-15, 15]);
    const pupilX = useTransform(xEye, [-1000, 1000], [-12, 12]);
    const pupilY = useTransform(yEye, [-1000, 1000], [-12, 12]);
    const toolX = useTransform(xBody, [-1000, 1000], [-10, 10]);
    const toolY = useTransform(yBody, [-1000, 1000], [-5, 5]);
    const legX = useTransform(xBody, [-1000, 1000], [-2, 2]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            mouseX.set(e.clientX - centerX);
            mouseY.set(e.clientY - centerY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className={className} ref={ref}>
            <div className="relative w-full h-full">
                <motion.svg
                    viewBox="0 0 400 450"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <defs>
                        {/* Body gradient - dark navy */}
                        <radialGradient id="bodyGrad" cx="0.5" cy="0.3" r="0.7">
                            <stop offset="0%" stopColor="#2d3a4f" />
                            <stop offset="60%" stopColor="#1a2332" />
                            <stop offset="100%" stopColor="#0d1117" />
                        </radialGradient>

                        {/* Face plate gradient - slate gray */}
                        <linearGradient id="faceGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                            <stop offset="0%" stopColor="#5a6a7a" />
                            <stop offset="100%" stopColor="#3d4a5a" />
                        </linearGradient>

                        {/* Eye socket - dark */}
                        <radialGradient id="eyeSocket" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#1a2332" />
                            <stop offset="100%" stopColor="#0d1117" />
                        </radialGradient>

                        {/* Eye glow */}
                        <radialGradient id="eyeGlow" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#5cc8f5" />
                            <stop offset="40%" stopColor="#38b6e8" />
                            <stop offset="100%" stopColor="#0d9bd0" />
                        </radialGradient>

                        {/* Eye outer glow */}
                        <radialGradient id="eyeOuterGlow" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#38b6e8" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#38b6e8" stopOpacity="0" />
                        </radialGradient>

                        {/* Beak gradient */}
                        <linearGradient id="beakGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                            <stop offset="0%" stopColor="#5a6a7a" />
                            <stop offset="100%" stopColor="#2d3a4f" />
                        </linearGradient>

                        {/* Stethoscope tube */}
                        <linearGradient id="tubeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4a5568" />
                            <stop offset="100%" stopColor="#2d3748" />
                        </linearGradient>

                        {/* Stethoscope metal */}
                        <radialGradient id="metalGrad" cx="0.3" cy="0.3" r="0.7">
                            <stop offset="0%" stopColor="#a0aec0" />
                            <stop offset="50%" stopColor="#718096" />
                            <stop offset="100%" stopColor="#4a5568" />
                        </radialGradient>

                        {/* Book cover */}
                        <linearGradient id="bookGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#2196f3" />
                            <stop offset="100%" stopColor="#1976d2" />
                        </linearGradient>

                        {/* Branch */}
                        <linearGradient id="branchGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#5d4037" />
                            <stop offset="50%" stopColor="#8d6e63" />
                            <stop offset="100%" stopColor="#5d4037" />
                        </linearGradient>

                        {/* Glow filter */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* === BRANCH === */}
                    <g>
                        <path
                            d="M-10 395 Q 100 390 200 393 Q 300 396 410 390"
                            stroke="url(#branchGrad)"
                            strokeWidth="14"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <path
                            d="M-10 391 Q 100 386 200 389 Q 300 392 410 386"
                            stroke="#a1887f"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            opacity="0.4"
                        />
                    </g>

                    {/* === FEET === */}
                    <motion.g style={{ x: legX }}>
                        {/* Left foot */}
                        <g transform="translate(135, 380)">
                            <path d="M0 8 Q -8 20 -12 30" stroke="#e65100" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <path d="M12 8 Q 12 22 10 32" stroke="#e65100" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <path d="M24 8 Q 32 20 38 28" stroke="#e65100" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <ellipse cx="12" cy="5" rx="18" ry="8" fill="#ef6c00" />
                        </g>
                        {/* Right foot */}
                        <g transform="translate(225, 380)">
                            <path d="M0 8 Q -8 20 -12 30" stroke="#bf360c" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <path d="M12 8 Q 12 22 10 32" stroke="#bf360c" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <path d="M24 8 Q 32 20 38 28" stroke="#bf360c" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <ellipse cx="12" cy="5" rx="18" ry="8" fill="#e65100" />
                        </g>
                    </motion.g>

                    {/* === BODY === */}
                    <motion.g style={{ x: bodyX, y: bodyY }}>
                        {/* Main body - large egg/oval */}
                        <ellipse cx="200" cy="250" rx="130" ry="150" fill="url(#bodyGrad)" />

                        {/* Subtle body highlight */}
                        <ellipse cx="160" cy="200" rx="50" ry="70" fill="white" opacity="0.02" />

                        {/* Left wing hint */}
                        <path d="M85 230 Q 60 280 75 350" stroke="#1a2332" strokeWidth="15" fill="none" opacity="0.6" strokeLinecap="round" />

                        {/* Right wing (holding book) */}
                        <g>
                            <path d="M315 250 Q 350 300 330 370" stroke="#1a2332" strokeWidth="18" fill="none" strokeLinecap="round" />
                            {/* Wing fingers */}
                            <path d="M300 340 Q 310 360 305 380" stroke="#0d1117" strokeWidth="12" fill="none" strokeLinecap="round" />
                            <path d="M315 345 Q 325 365 320 385" stroke="#0d1117" strokeWidth="10" fill="none" strokeLinecap="round" />
                            <path d="M328 348 Q 338 368 333 388" stroke="#0d1117" strokeWidth="8" fill="none" strokeLinecap="round" />
                        </g>

                        {/* === BOOK === */}
                        <g transform="translate(290, 215) rotate(8)">
                            {/* Book pages side */}
                            <rect x="0" y="5" width="6" height="120" fill="#eceff1" rx="1" />

                            {/* Book cover back */}
                            <rect x="3" y="2" width="80" height="126" rx="3" fill="#1565c0" />

                            {/* Book cover front */}
                            <rect x="5" y="0" width="78" height="124" rx="3" fill="url(#bookGrad)" />

                            {/* Medical cross - top right */}
                            <g transform="translate(58, 28)">
                                <rect x="-6" y="-15" width="12" height="30" fill="white" rx="1" />
                                <rect x="-15" y="-6" width="30" height="12" fill="white" rx="1" />
                            </g>

                            {/* Network diagram - center/bottom */}
                            <g transform="translate(44, 80)">
                                {/* Center node */}
                                <circle cx="0" cy="0" r="5" fill="white" />
                                {/* Surrounding nodes */}
                                <circle cx="-22" cy="-18" r="3.5" fill="white" />
                                <circle cx="22" cy="-18" r="3.5" fill="white" />
                                <circle cx="-25" cy="15" r="3.5" fill="white" />
                                <circle cx="25" cy="15" r="3.5" fill="white" />
                                <circle cx="0" cy="28" r="3" fill="white" />
                                {/* Connection lines */}
                                <line x1="0" y1="0" x2="-22" y2="-18" stroke="white" strokeWidth="1.5" />
                                <line x1="0" y1="0" x2="22" y2="-18" stroke="white" strokeWidth="1.5" />
                                <line x1="0" y1="0" x2="-25" y2="15" stroke="white" strokeWidth="1.5" />
                                <line x1="0" y1="0" x2="25" y2="15" stroke="white" strokeWidth="1.5" />
                                <line x1="-25" y1="15" x2="0" y2="28" stroke="white" strokeWidth="1.2" />
                                <line x1="25" y1="15" x2="0" y2="28" stroke="white" strokeWidth="1.2" />
                            </g>

                            {/* Small grid dots bottom-left */}
                            <g opacity="0.5">
                                <circle cx="15" cy="100" r="1.5" fill="white" />
                                <circle cx="22" cy="100" r="1.5" fill="white" />
                                <circle cx="15" cy="107" r="1.5" fill="white" />
                                <circle cx="22" cy="107" r="1.5" fill="white" />
                            </g>
                        </g>
                    </motion.g>

                    {/* === STETHOSCOPE === */}
                    <motion.g style={{ x: toolX, y: toolY }}>
                        {/* Earpiece band behind head */}
                        <path
                            d="M145 175 Q 200 140 255 175"
                            stroke="#718096"
                            strokeWidth="5"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* Left tube */}
                        <path
                            d="M145 175 Q 115 260 150 340"
                            stroke="url(#tubeGrad)"
                            strokeWidth="7"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* Right tube */}
                        <path
                            d="M255 175 Q 285 260 250 340"
                            stroke="url(#tubeGrad)"
                            strokeWidth="7"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* Y-connector */}
                        <path
                            d="M150 340 Q 175 355 200 355 Q 225 355 250 340"
                            stroke="#5a6a7a"
                            strokeWidth="5"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* Chest piece outer ring */}
                        <circle cx="200" cy="355" r="22" fill="url(#metalGrad)" stroke="#4a5568" strokeWidth="2" />
                        {/* Chest piece inner */}
                        <circle cx="200" cy="355" r="15" fill="#2d3748" />
                        <circle cx="200" cy="355" r="12" fill="#1a202c" stroke="#4a5568" strokeWidth="1" />
                        {/* Center bump */}
                        <circle cx="200" cy="355" r="4" fill="#4a5568" />
                    </motion.g>

                    {/* === HEAD (follows cursor) === */}
                    <motion.g style={{ x: headX, y: headY }}>

                        {/* Face plate - heart/butterfly shape connecting eyes */}
                        <path
                            d="M200 210
                               C 250 210, 295 165, 295 145
                               C 295 115, 260 95, 230 115
                               Q 200 135 170 115
                               C 140 95, 105 115, 105 145
                               C 105 165, 150 210, 200 210 Z"
                            fill="url(#faceGrad)"
                        />

                        {/* === EYE SOCKETS (binocular style) === */}
                        <g>
                            {/* Left eye outer ring */}
                            <circle cx="150" cy="155" r="42" fill="url(#eyeSocket)" stroke="#5a6a7a" strokeWidth="5" />
                            {/* Right eye outer ring */}
                            <circle cx="250" cy="155" r="42" fill="url(#eyeSocket)" stroke="#5a6a7a" strokeWidth="5" />

                            {/* Bridge connecting eyes at top */}
                            <path
                                d="M188 145 Q 200 138 212 145"
                                stroke="#5a6a7a"
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                            />

                            {/* Inner dark circles */}
                            <circle cx="150" cy="155" r="34" fill="#0d1117" />
                            <circle cx="250" cy="155" r="34" fill="#0d1117" />
                        </g>

                        {/* === PUPILS (track mouse) === */}
                        <g>
                            {/* Left eye */}
                            <g transform="translate(150, 155)">
                                {/* Outer glow */}
                                <motion.circle
                                    r="38"
                                    fill="url(#eyeOuterGlow)"
                                    style={{ x: pupilX, y: pupilY }}
                                />
                                {/* Main pupil */}
                                <motion.g style={{ x: pupilX, y: pupilY }}>
                                    <circle r="16" fill="url(#eyeGlow)" filter="url(#glow)" />
                                    <circle r="10" fill="#5cc8f5" />
                                    <circle r="5" fill="#8be3ff" />
                                    {/* Highlight */}
                                    <circle r="4" cx="-5" cy="-5" fill="white" opacity="0.9" />
                                    <circle r="1.5" cx="3" cy="4" fill="white" opacity="0.5" />
                                </motion.g>
                            </g>

                            {/* Right eye */}
                            <g transform="translate(250, 155)">
                                {/* Outer glow */}
                                <motion.circle
                                    r="38"
                                    fill="url(#eyeOuterGlow)"
                                    style={{ x: pupilX, y: pupilY }}
                                />
                                {/* Main pupil */}
                                <motion.g style={{ x: pupilX, y: pupilY }}>
                                    <circle r="16" fill="url(#eyeGlow)" filter="url(#glow)" />
                                    <circle r="10" fill="#5cc8f5" />
                                    <circle r="5" fill="#8be3ff" />
                                    {/* Highlight */}
                                    <circle r="4" cx="-5" cy="-5" fill="white" opacity="0.9" />
                                    <circle r="1.5" cx="3" cy="4" fill="white" opacity="0.5" />
                                </motion.g>
                            </g>
                        </g>

                        {/* === BEAK === */}
                        <path
                            d="M190 205 Q 200 195 210 205 L 200 230 Z"
                            fill="url(#beakGrad)"
                        />

                    </motion.g>

                </motion.svg>
            </div>
        </div>
    );
}
