import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hoverEffect?: boolean;
    noBorder?: boolean;
}

export function GlassPanel({
    children,
    className,
    hoverEffect = false,
    noBorder = false,
    ...props
}: GlassPanelProps) {
    return (
        <div
            className={cn(
                "glass-panel rounded-xl p-4 transition-all duration-300",
                !noBorder && "border border-white/10",
                hoverEffect && "glass-panel-hover hover:scale-[1.01]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
