import { LogIn } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { PixelPanel } from "@/components/ui/pixel-panel";

export const metadata = {
    title: "Přihlášení",
};

export default function LoginPage() {
    return (
        <main className="mx-auto grid min-h-screen w-full max-w-xl place-items-center px-5 py-10">
            <PixelPanel className="w-full" padding="lg">
                <div className="mb-8 text-center">
                    <div className="mx-auto grid size-16 place-items-center border-4 border-outline bg-amber text-3xl shadow-pixel">
                        🏮
                    </div>

                    <p className="mt-6 font-pixel text-[10px] leading-6 text-amber-light">
                        PRIVATE GAME NIGHT HUB
                    </p>

                    <h1 className="mt-3 font-pixel text-xl leading-10 text-cream">
                        Vstup do LANternu
                    </h1>

                    <p className="mt-4 text-sm leading-6 text-cream-muted">
                        Přihlas se a zjisti, co se chystá na příští game night
                    </p>
                </div>

                <LoginForm />

                <div className="mt-8 flex items-center justify-center gap-2 border-t-2 border-outline-soft pt-5 font-pixel text-[9px] text-cream-muted">
                    <LogIn aria-hidden="true" size={14} />
                </div>
            </PixelPanel>
        </main>
    );
}