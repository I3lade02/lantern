"use client";

import { Toaster, toast } from "sonner";

export { toast };

export function PixelToast() {
    return (
        <Toaster
            closeButton
            position="top-center"
            toastOptions={{
                classNames: {
                    toast:
                        "!rounded-none !border-2 !border-outline !bg-panel !text-cream !shadow-pixel",
                    title:
                        "!font-pixel !text-[10px] !leading-5 !text-cream",
                    description: "!text-sm !text-cream-muted",
                    closeButton:
                        "!rounded-none !border-2 !border-outline !bg-panel-muted !text-cream",
                    actionButton:
                        "!rounded-none bg-amber !font-pixel !text-[9px] !text-void",
                    cancelButton:
                        "!rounded-none !bg-wine !font-pixel !text-[9px] !text-cream",      
                },
            }}
            visibleToasts={3}
        />
    );
}