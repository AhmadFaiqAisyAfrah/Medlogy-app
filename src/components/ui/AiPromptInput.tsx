
"use client";

import { Send, Sparkles, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

interface AiPromptInputProps {
    placeholder?: string;
    className?: string;
    onSearch?: (query: string) => void;
    isLoading?: boolean;
    defaultValue?: string;
}

export function AiPromptInput({
    placeholder = "Ask Medlogy Intelligence...",
    className,
    onSearch,
    isLoading,
    defaultValue = ""
}: AiPromptInputProps) {
    const [input, setInput] = useState(defaultValue);

    // Update input processing if defaultValue changes externally (optional, but good for navigation)
    // For now, simple initial state is enough for the search box

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSearch = () => {
        if (!input.trim() || isLoading) return;
        onSearch?.(input);
        setInput(""); // Clear input after search? Or keep it? Usually keep until success. Let's clear for now as it's a prompt.
        if (textareaRef.current) textareaRef.current.style.height = '44px';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className={cn("relative w-full max-w-3xl mx-auto", className)}>
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-emerald-500/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                <div className="relative flex items-end gap-2 bg-slate-950/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-xl">
                    <div className="pb-2 pl-2 text-slate-400">
                        <Bot size={24} className={cn("text-primary/80", isLoading && "animate-pulse")} />
                    </div>

                    <textarea
                        ref={textareaRef}
                        className="w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-2 text-sm leading-relaxed scrollbar-hide disabled:opacity-50"
                        placeholder={placeholder}
                        rows={1}
                        value={input}
                        disabled={isLoading}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ height: '44px' }} // Initial height
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                        }}
                    />

                    <button
                        onClick={handleSearch}
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors self-end mb-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>

            <div className="text-center mt-3">
                <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                    <Sparkles size={10} className="text-primary" />
                    <span>Medlogy AI (Gemini) can make mistakes. Verify epidemiological data.</span>
                </p>
            </div>
        </div>
    );
}
