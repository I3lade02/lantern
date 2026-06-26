import { cn } from "@/lib/utils";

type SectionTitleProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: string;
    className?: string;
};

export function SectionTitle({
    eyebrow,
    title,
    description,
    action,
    className,
}: SectionTitleProps) {
    return (
        <div
            className={cn(
                "flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
                className,
            )}
        >
            <div>
                {eyebrow ? (
                    <p className="mb-2 font-pixel text-[9px] leading-5 text-amber-light">
                        {eyebrow}
                    </p>
                ) : null}

                <h1 className="font-pixel text-lg leading-9 text-cream sm:text-xl">
                    {title}
                </h1>

                {description ? (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
                        {description}
                    </p>
                ) : null}
            </div>

            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
} 