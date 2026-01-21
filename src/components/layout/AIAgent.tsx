"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { Bot, X, Send, Sparkles, User, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "agent";
    text: string;
    timestamp: Date;
}

export function AIAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "agent",
            text: "Hello Dr. Aisy. I am monitoring the JKT-26 cluster. How can I assist you with the latest data?",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue("");

        // Simulate AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "agent",
                text: "I'm analyzing that request against the current H5N1 data stream. One moment...",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Toggle Button (Floating) */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-[0_0_20px_rgba(14,165,233,0.5)] border border-white/20 hover:scale-105 transition-transform group"
                    >
                        <Bot size={28} className="text-white" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[400px] p-4 flex flex-col pointer-events-none"
                    >
                        <GlassPanel className="flex flex-col h-full !bg-slate-950/90 !backdrop-blur-xl border-l border-white/10 shadow-2xl pointer-events-auto rounded-3xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 p-[1px]">
                                        <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center">
                                            <Sparkles size={18} className="text-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white leading-tight">Medlogy AI</h3>
                                        <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active Monitoring
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full gap-3",
                                            msg.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {msg.role === "agent" && (
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                                <Bot size={14} className="text-primary" />
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                                                msg.role === "user"
                                                    ? "bg-primary text-white rounded-tr-sm"
                                                    : "bg-white/5 border border-white/5 text-slate-200 rounded-tl-sm"
                                            )}
                                        >
                                            {msg.text}
                                            <div className="text-[9px] opacity-50 mt-1 text-right">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {msg.role === "user" && (
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                                                <User size={14} className="text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/5 bg-slate-900/50">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask about alerts, data, or predictions..."
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputValue.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-center text-slate-600 mt-2">
                                    AI reasoning may vary. Please verify critical medical data.
                                </p>
                            </div>

                        </GlassPanel>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
