"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Trash2, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/app/actions/conversation";
import { Button } from "@/components/ui/button";

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    conversations: Conversation[];
    currentId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
    onDelete: (id: string) => void;
}

export function HistorySidebar({
    isOpen,
    onClose,
    conversations,
    currentId,
    onSelect,
    onNewChat,
    onDelete
}: HistorySidebarProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 bottom-0 left-0 w-80 bg-[#0f1729] border-r border-white/10 z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                History
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-white">
                                <X size={18} />
                            </Button>
                        </div>

                        {/* New Chat Button */}
                        <div className="p-4">
                            <Button
                                onClick={() => {
                                    onNewChat();
                                    onClose(); // Optional: keep open if preferring desktop style
                                }}
                                className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                            >
                                <Plus size={18} />
                                New Analysis
                            </Button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scroll">
                            {conversations.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 text-xs">
                                    No saved history yet.
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        className={cn(
                                            "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                                            currentId === conv.id
                                                ? "bg-white/10 text-white border border-white/10"
                                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                        )}
                                        onClick={() => {
                                            onSelect(conv.id);
                                            // On mobile we might want to close, but on desktop keep open.
                                            // For now let's keep user in control.
                                        }}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <MessageSquare size={16} className="shrink-0 opacity-70" />
                                            <div className="truncate text-sm font-medium">
                                                {conv.title}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(conv.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 text-xs text-slate-600 text-center font-mono">
                            Medlogy Persistent Memory
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
