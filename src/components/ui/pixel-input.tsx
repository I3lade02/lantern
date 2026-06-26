"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type PixelInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    hint?: string;
    containerClassName?: string;
};

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
    function PixelInput(
        {
            id,
            label,
            error,
            hint,
            className,
            containerClassName,
            required,
            "aria-describedby": ariaDescribedBy,
            ...props
        },
        ref,
    ) {
        const descriptionId = id ? `${id}-description` : undefined;
        const errorId = id ? `${id}-error` : undefined;
        const describedBy = ariaDescribedBy ?? (error ? errorId : hint ? descriptionId : undefined);

        return (
            <div className={cn("grid gap-2", containerClassName)}>
                <label
                    className="font-pixel text-[10px] leading-5 text-cream"
                    htmlFor={id}
                >
                    {label}
                    {required ? <span className="ml-1 text-amber">*</span> : null}
                </label>

                <input
                    ref={ref}
                    id={id}
                    required={required}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                    className={cn(
                        [
                            "w-full border-2 border-outline rounded-none",
                            "bg-panel-deep px-3 py-3",
                            "text-sm text-cream placeholdertext-cream-muted",
                            "shadow-[inset_2px_2px_0_rgb(0_0_0/0.35)]",
                            "transition-color druation-150",
                            "focus:border-amber focus:outline-none",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            error && "border-danger focus:border-danger",
                        ],
                        className,
                    )}
                    {...props}
                />

                {error ? (
                    <p id={errorId} className="text-sm text-danger">
                        {error}
                    </p>
                ) : null}

                {!error && hint ? (
                    <p id={descriptionId} className="text-sm text-cream-muted">
                        {hint}
                    </p>
                ) : null}
            </div>
        );
    },
);