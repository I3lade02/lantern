import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pixelPanelVariants = cva(
    "border-2 border-outline rounded-none shadow-pixel",
    {
        variants: {
            tone: {
                default: "bg-panel text-cream",
                deep: "bg-panel-deep text-cream",
                muted: "bg-panel-muted text-cream",
            },
            padding: {
                none: "p-0",
                sm: "p-4",
                md: "p-5 sm:p-6",
                lg: "p-6 sm:p-8",
            },
        },
        defaultVariants: {
            tone: "default",
            padding: "md",
        },
    },
);

type PixelPanelProps = React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof pixelPanelVariants>;

export function PixelPanel({
    className,
    tone,
    padding,
    ...props
}: PixelPanelProps) {
    return (
        <div
            className={cn(pixelPanelVariants({ tone, padding}), className)}
            {...props}
        />
    );
}