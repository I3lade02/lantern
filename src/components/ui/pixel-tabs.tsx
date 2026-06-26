"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type PixelTab<T extends string> = {
    value: T,
    label: string;
    icon?: LucideIcon,
    disabled?: boolean;
};

type PixelTabsProps<T extends string> = {
    tabs: readonly PixelTab<T>[];
    value: T;
    onValueChange: (value: T) => void;
    ariaLabel: string;
    className?: string;
};

export function PixelTabs<T extends string>({
    tabs,
    value,
    onValueChange,
    ariaLabel,
    className,
}: PixelTabsProps<T>) {
    return (
        <div
            aria-label={ariaLabel}
            className={cn(
                "flex w-full gap-2 overflow-x-auto border-2 border-outline bg-panel-deep p-2 shadow-pixel-sm",
                className,
            )}
            role="tablist"
        >
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.value === value;

                return (
                    <button
                        key={tab.value}
                        aria-selected={isActive}
                        className={cn(
                            [
                                "inline-flex shrink-0 items-center justify-center gap-2",
                                "border-2 border-outline px-3 py-2",
                                "font-pixel text-[9px] leading-4",
                                "transition-colors duration-150",
                                "focus-visible:outline-none",
                            ],
                            isActive
                                ? "bg-amber text-void shadow-pixel-sm"
                                : "bg-panel text-cream-muted hover:bg-panel-muted hover:text-cream",
                            tab.disabled && "cursor-not-allowed opacity-50",
                        )}
                        disabled={tab.disabled}
                        onClick={() => onValueChange(tab.value)}
                        role="tab"
                        type="button"
                    >
                        {Icon ? <Icon aria-hidden="true" size={14} /> : null}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}