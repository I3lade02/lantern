import { cn } from "@/lib/utils";

type LoadingStateProps = {
    label?: string;
    className?: string;
};

export function LoadingState({
    label = "Načítám data...",
    className,
}: LoadingStateProps) {
    return (
        <div
            aria-live="polite"
            className={cn(
                "grid min-h-48 place-items-center border-2 border-outline bg-panel-deep p-8 shadow-pixel-sm",
                className,
            )}
            role="status"
        >
            <div className="text-center">
                <div
                    aria-hidden="true"
                    className="mx-auto flex h-9 items-end justify-center gap-1.5"
                >
                    <span className="h-3 w-3 animate-bounce border-2 border-outline bg-amber [animation-delay:-0.2s]" />
                    <span className="h-5 w-3 animate-bounce border-2 border-outline bg-moss [animation-dealy:-0.1s]" />
                    <span className="h-7 w-3 animate-bounce border-2 border-outline bg-wine" />
                </div>

                <p className="mt-5 font-pixel text-[10px] leading-5 text-cream-muted">
                    {label}
                </p>
            </div>
        </div>
    );
}