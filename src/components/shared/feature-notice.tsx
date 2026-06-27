import type { LucideIcon } from "lucide-react";

import { PixelPanel } from "@/components/ui/pixel-panel";

type FeatureNoticeProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  nextStep: string;
};

export function FeatureNotice({
  icon: Icon,
  eyebrow,
  title,
  description,
  nextStep,
}: FeatureNoticeProps) {
  return (
    <PixelPanel className="pixel-grid overflow-hidden" padding="none" tone="deep">
      <div className="border-b-2 border-outline bg-panel px-5 py-4 sm:px-6">
        <p className="font-pixel text-[9px] leading-5 text-amber-light">
          {eyebrow}
        </p>
      </div>

      <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-start">
        <div className="grid size-16 place-items-center border-2 border-outline bg-moss text-void shadow-pixel">
          <Icon aria-hidden="true" size={30} />
        </div>

        <div>
          <h2 className="font-pixel text-sm leading-8 text-cream">{title}</h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-cream-muted">
            {description}
          </p>

          <div className="mt-6 border-2 border-outline bg-panel-muted p-4 shadow-pixel-sm">
            <p className="font-pixel text-[9px] leading-5 text-amber-light">
              NEXT CHAPTER
            </p>

            <p className="mt-2 text-sm leading-6 text-cream">
              {nextStep}
            </p>
          </div>
        </div>
      </div>
    </PixelPanel>
  );
}