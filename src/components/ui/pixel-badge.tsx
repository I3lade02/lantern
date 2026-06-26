import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pixelBadgeVariants = cva(
    "inline-flex items-center gap-1.5 border-2 border-outline px-2.5 py-1 font-pixel text-[9px] leading-4 shadow-pixel-sm",
    {
        variants: {
            tone: {
                amber: "bg-amber text-void",
                moss: "bg-moss text-void",
                wine: "bg-wine text-cream",
                cream: "bg-cream text-void",
                muted: "bg-panel-muted text-cream-muted",
                danger: "bg-danger text-void",
            },
        },
        defaultVariants: {
            tone: "muted",
        },
    },
);

type PixelBadgeProps = React.HTMLAttributes<HTMLSpanElement> &
    VariantProps<typeof pixelBadgeVariants>;

export function PixelBadge({
    className,
    tone,
    ...props
}: PixelBadgeProps) {
    return (
        <span className={cn(pixelBadgeVariants({ tone }), className)} {...props} />
    );
}