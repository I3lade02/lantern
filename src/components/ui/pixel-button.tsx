"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pixelButtonVariants = cva(
    [
        "inline-flex items-center justify-center gap-2",
        "border-2 border-outline rounded-none",
        "font-pixel text-[10px] leading-5 tracking-wide",
        "shadow-pixel-sm",
        "transition-[transform, box-shadow, filter] duration-100",
        "hover:brightness-110",
        "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        "focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
    ],
    {
        variants: {
            variant: {
                amber: "bg-amber text-void",
                moss: "bg-moss text-void",
                wine: "bg-wine text-cream",
                ghost: "bg-panel text-cream",
                danger: "bg-danger text-void",
            },
            size: {
                sm: "px-3 py-2",
                md: "px-4 py-3",
                lg: "px-5 py-4 text-xs",
            },
            fullWidth: {
                true: "w-full",
                false: "w-auto",
            },
        },
        defaultVariants: {
            variant: "amber",
            size: "md",
            fullWidth: false,
        },
    },
);

type PixelButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof pixelButtonVariants>;

export function PixelButton({
    className,
    variant,
    size,
    fullWidth,
    type = "button",
    ...props
}: PixelButtonProps) {
    return (
        <button
            className={cn(
                pixelButtonVariants({ variant, size, fullWidth }),
                className,
            )}
            type={type}
            {...props}
        />
    );
}