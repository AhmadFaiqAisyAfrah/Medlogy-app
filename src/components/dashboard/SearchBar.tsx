"use client";

import { Search } from "lucide-react";

export function SearchBar() {
    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg -z-10" />
            <div className="relative flex items-center bg-slate-900/80 border border-white/10 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-xl transition-all focus-within:border-white/20 focus-within:bg-slate-900 overflow-hidden">
                <Search className="text-slate-400 mr-4 shrink-0" size={20} />
                <input
                    type="text"
                    placeholder="Search outbreak data..."
                    className="flex-1 bg-transparent text-white placeholder:text-slate-600 focus:outline-none text-lg min-w-0"
                />
            </div>
        </div>
    );
}
