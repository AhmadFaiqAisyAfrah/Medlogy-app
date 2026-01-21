"use client";

import { AiPromptInput } from "@/components/ui/AiPromptInput";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NewsSearchProps {
    className?: string;
    placeholder?: string;
    initialQuery?: string;
    centered?: boolean;
}

export function NewsSearch({ className, placeholder = "Ask about global health...", initialQuery = "", centered = false }: NewsSearchProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (query: string) => {
        setIsLoading(true);
        // Encode and push
        const params = new URLSearchParams();
        params.set("q", query);
        router.push(`/global-health-news?${params.toString()}`);
    };

    return (
        <div className={className}>
            <AiPromptInput
                placeholder={placeholder}
                onSearch={handleSearch}
                isLoading={isLoading}
                defaultValue={initialQuery}
            />
        </div>
    );
}
