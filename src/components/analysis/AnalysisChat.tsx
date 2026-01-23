"use client";

import { useState, useEffect } from "react";
import { AiPromptInput } from "@/components/ui/AiPromptInput";
import { Sparkles, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
    Conversation,
    deleteConversation,
    createConversation,
    saveMessages,
} from "@/app/actions/conversation";
import { Button } from "@/components/ui/button";

/* =========================
   Types
========================= */

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp: number;
}

interface AnalysisChatProps {
    initialConversations: Conversation[];
    initialMessages?: Message[];
    initialId?: string;
}

/* =========================
   API helper (CLIENT → API)
========================= */

async function askAnalysisAI(query: string) {
    const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messages: [{ role: "user", content: query }],
        }),
    });

    if (!res.ok) {
        throw new Error("Failed to fetch analysis response");
    }

    return res.json(); // { type, content }
}

/* =========================
   Component
========================= */

export function AnalysisChat({
    initialConversations,
    initialMessages = [],
    initialId,
}: AnalysisChatProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialId]);

    // NOTE: Sidebar logic removed (C2-B1). 
    // Navigation is now handled by the global app sidebar.

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: query,
            timestamp: Date.now(),
        };

        const optimisticMessages = [...messages, userMsg];
        setMessages(optimisticMessages);
        setIsLoading(true);

        try {
            const result = await askAnalysisAI(query);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: result?.content ?? "An error occurred.",
                timestamp: Date.now(),
            };

            const finalMessages = [...optimisticMessages, aiMsg];
            setMessages(finalMessages);

            // Persist conversation
            if (!initialId) {
                const newConv = await createConversation("analysis", query);
                await saveMessages(newConv.id, finalMessages);
                router.push(`/analysis?id=${newConv.id}`);
            } else {
                await saveMessages(initialId, finalMessages);
            }
        } catch (error) {
            console.error("Analysis Chat Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full relative overflow-hidden">
            {/* Main */}
            <div className="flex-1 flex flex-col h-full max-w-3xl mx-auto w-full relative">


                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-6 p-4 pb-36 custom-scroll">
                    <AnimatePresence>
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-6 mt-20"
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
                                    <Sparkles className="text-primary" size={32} />
                                </div>
                                <h1 className="text-4xl font-bold text-white tracking-tight">
                                    Analysis Engine
                                </h1>
                                <p className="text-xl text-slate-400 max-w-lg mx-auto">
                                    What would you like to analyze today?
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center text-sm">
                                    <button
                                        onClick={() =>
                                            handleSearch("What is the current trend for Dengue?")
                                        }
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-slate-400"
                                    >
                                        Dengue trends
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleSearch("Show me ILI monitoring data")
                                        }
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-slate-400"
                                    >
                                        ILI monitoring
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex gap-4 p-4 rounded-2xl max-w-[85%]",
                                    msg.role === "assistant"
                                        ? "bg-slate-900/50 border border-white/5 mr-auto"
                                        : "bg-primary/10 border border-primary/20 ml-auto"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                        msg.role === "assistant"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-blue-500/10 text-blue-400"
                                    )}
                                >
                                    {msg.role === "assistant" ? (
                                        <Bot size={18} />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs font-mono text-slate-500 uppercase mb-1">
                                        {msg.role === "assistant"
                                            ? "Medlogy Intelligence"
                                            : "You"}
                                    </p>
                                    <p className="text-sm text-slate-200 whitespace-pre-wrap">
                                        {msg.text}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-4 p-4 mr-auto"
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                    <Bot size={18} />
                                </div>
                                <div className="flex items-center gap-1 h-6 mt-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full animate-bounce delay-150" />
                                    <span className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full animate-bounce delay-300" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input */}
                <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-50">
                    <div className="max-w-3xl mx-auto">
                        <AiPromptInput
                            placeholder="Ask Medlogy (e.g., 'Is Dengue rising?')"
                            onSearch={handleSearch}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
