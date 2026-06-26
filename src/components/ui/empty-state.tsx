import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
    title: string;
    description: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
    className?: string;
};

export function EmptyState({
    title,
    description,
    icon: Icon = PackageOpen,
    action,
    className,
}: EmptyStateProps) {
    return (
        <section
            className={cn(
                "border-2 border-dashed border-outline-soft bg-panel-deep p-8 text-center shadow-pixel-sm sm:p-12",
                className,
            )}
        >
            <div className="mx-auto grid size-14 place-items-center border-2 border-outline bg-panel-muted text-amber shadow-pixel-sm">
                <Icon aria-hidden="true" size={26} />
            </div>

            <h2 className="mt-5 font-pixel text-xs leading-7 text-cream">{title}</h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-cream-muted">
                {description}
            </p>

            {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
        </section>
    );
}