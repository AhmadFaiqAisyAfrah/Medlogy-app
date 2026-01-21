import { cn } from "@/lib/utils";
import { MotionItem } from "@/components/ui/MotionItem";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoItem = ({
    className,
    title,
    description,
    header,
    icon,
    colSpan = 1,
    rowSpan = 1,
    children,
    delay = 0,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    colSpan?: number;
    rowSpan?: number;
    children: React.ReactNode;
    delay?: number;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-xl group/bento transition duration-200",
                colSpan === 2 ? "md:col-span-2" : "md:col-span-1",
                colSpan === 3 ? "md:col-span-3" : "",
                rowSpan === 2 ? "md:row-span-2" : "",
                className
            )}
        >
            <MotionItem delay={delay}>
                {children}
            </MotionItem>
        </div>
    );
};
