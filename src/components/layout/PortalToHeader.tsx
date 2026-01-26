"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function PortalToHeader({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [headerNode, setHeaderNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setMounted(true);
        // Target specific slot ID - Strict Requirement
        // This slot is already part of the Header's flex layout (flex-1)
        const slot = document.getElementById("header-slot");
        if (slot) {
            setHeaderNode(slot);
        }
    }, []);

    if (!mounted || !headerNode) return null;

    return createPortal(
        <div className="w-full h-full flex items-center animate-in fade-in duration-300">
            {/* Visual Separator */}
            <div className="h-6 w-px bg-white/10 shrink-0 mr-6" />

            {/* Portaled Content (Toolbar) */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>,
        headerNode
    );
}
