import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    text?: string;
}

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
};

export function Loader({ size = "md", className, text }: LoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={cn("relative flex items-center justify-center", className)}>
                {/* Outer Ring */}
                <div className={cn(
                    "animate-spin absolute border-4 border-primary/30 border-t-primary rounded-full",
                    sizeClasses[size]
                )} />

                {/* Inner Lucide Spinner (for extra flair) */}
                <Loader2 className={cn("animate-spin text-primary",
                    size === "sm" ? "w-2 h-2" :
                        size === "md" ? "w-4 h-4" :
                            size === "lg" ? "w-6 h-6" : "w-8 h-8"
                )} />
            </div>
            {text && (
                <p className="text-muted-foreground text-sm font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}

export function FullScreenLoader({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader size="lg" text={text} />
        </div>
    );
}
