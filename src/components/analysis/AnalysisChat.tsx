"use client";

import { useState } from "react";
import { AiPromptInput } from "@/components/ui/AiPromptInput";
import { processAnalysisQuery } from "@/app/(platform)/analysis/actions";
import { Sparkles, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { HistorySidebar } from "@/components/chat/HistorySidebar";
import { Conversation, deleteConversation, createConversation, saveMessages } from "@/app/actions/conversation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: number;
}

interface AnalysisChatProps {
    initialConversations: Conversation[];
    initialMessages?: Message[];
    initialId?: string;
}

export function AnalysisChat({ initialConversations, initialMessages = [], initialId }: AnalysisChatProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Update messages when switching conversations (prop change)
    // In Next.js, navigating to same page with diff searchParams triggers re-render with new props
    if (initialId && messages !== initialMessages && messages.length === 0 && initialMessages.length > 0) {
        // This is a naive check. Better to use useEffect or key the component.
        // Ideally the parent Page component should key this component by conversationId to force remount or we use useEffect.
    }

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query, timestamp: Date.now() };
        // Optimistic update
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const result = await processAnalysisQuery(query);
            let aiMsg: Message;

            if (result.type === 'ANSWER' || result.type === 'CLARIFICATION') {
                aiMsg = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: result.content,
                    timestamp: Date.now()
                };
            } else {
                aiMsg = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: result.content || "An error occurred.",
                    timestamp: Date.now()
                };
            }

            const finalMessages = [...newMessages, aiMsg];
            setMessages(finalMessages);

            // Persistence
            if (!initialId) {
                // Create new conversation
                const newConv = await createConversation('analysis', query);
                await saveMessages(newConv.id, finalMessages);
                // Update URL to reflect new conversation, this will trigger re-render with new props
                router.push(`/analysis?id=${newConv.id}`);
            } else {
                // Update existing
                await saveMessages(initialId, finalMessages);
            }

        } catch (e) {
            console.error("Chat Error", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full relative overflow-hidden">
            <HistorySidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                conversations={initialConversations}
                currentId={initialId || null}
                onSelect={(id) => router.push(`/analysis?id=${id}`)}
                onNewChat={() => router.push('/analysis')}
                onDelete={async (id) => {
                    await deleteConversation(id);
                    if (id === initialId) router.push('/analysis');
                }}
            />

            <div className="flex-1 flex flex-col h-full max-w-3xl mx-auto w-full relative">
                {/* Header / Sidebar Toggle */}
                <div className="absolute top-4 left-4 z-10 md:left-0">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white">
                        <Menu size={20} />
                    </Button>
                </div>

                {/* Messages Area - Scrollable */}
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
                                <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
                                    What would you like to analyze today?
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center text-sm">
                                    <button onClick={() => handleSearch("What is the current trend for Dengue?")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-slate-400">
                                        Trends for Dengue?
                                    </button>
                                    <button onClick={() => handleSearch("Show me ILI monitoring data")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-slate-400">
                                        Show ILI Data
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
                                    msg.role === 'assistant'
                                        ? "bg-slate-900/50 border border-white/5 mr-auto"
                                        : "bg-primary/10 border border-primary/20 ml-auto"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    msg.role === 'assistant' ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                                )}>
                                    {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-mono text-slate-500 uppercase">
                                        {msg.role === 'assistant' ? 'Medlogy Intelligence' : 'You'}
                                    </p>
                                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                                        {msg.text}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 p-4 mr-auto">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                    <Bot size={18} />
                                </div>
                                <div className="flex items-center gap-1 h-6 mt-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input Area (Pinned Bottom) */}
                <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-50">
                    <div className="max-w-3xl mx-auto">
                        <AiPromptInput
                            placeholder="Ask Medlogy (e.g., 'Analyze ILI trends', 'Is Dengue rising?')..."
                            onSearch={handleSearch}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
