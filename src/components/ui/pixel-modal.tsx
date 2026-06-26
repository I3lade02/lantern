"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

type PixelModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg";
};

const modalSizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
};

export function PixelModal({
    open,
    onClose,
    title,
    description,
    children,
    size = "md",
}: PixelModalProps) {
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        if (open) {
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 grid place-items-center bg-void/80 p-4 backdrop-blur-sm"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    onMouseDown={onClose}
                >
                    <motion.section
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        aria-describedby={description ? descriptionId : undefined}
                        aria-labelledby={titleId}
                        aria-modal="true"
                        className={cn(
                            "max-h-[calc(100vh-2rem)] w-full overflow-y-auto border-4 border-outline bg-panel shadow-pixel-lg",
                            modalSizes[size],
                        )}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        onMouseDown={(event) => event.stopPropagation()}
                        role="dialog"
                        transition={{ duration: 0.16 }}
                    >
                        <header className="flex items-start justify-between gap-4 border-b-2 border-outline bg-panel-deep p-5">
                            <div>
                                <h2
                                    id={titleId}
                                    className="font-pixel text-xs leading-7 text-cream"
                                >
                                    {title}
                                </h2>

                                {description ? (
                                    <p
                                        id={descriptionId}
                                        className="mt-2 text-sm leading-6 text-cream-muted"
                                    >
                                        {description}
                                    </p>
                                ) : null}
                            </div>

                            <button
                                aria-label="Zavřít modal"
                                className="grid size-9 shrink-0 place-items-center border-2 border-outline bg-wine text-cream shadow-pixel-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                onClick={onClose}
                                type="button"
                            >
                                <X aria-hidden="true" size={18} />
                            </button>
                        </header>

                        <div className="p-5 sm:p-6">{children}</div>
                    </motion.section>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}