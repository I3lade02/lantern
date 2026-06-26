import { UserPlus } from "lucide-react";

import { RegisterForm } from "@/components/auth/register-form";
import { PixelPanel } from "@/components/ui/pixel-panel";

export const metadata = {
  title: "Registrace",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-xl place-items-center px-5 py-10">
      <PixelPanel className="w-full" padding="lg">
        <div className="mb-8 text-center">
          <div className="mx-auto grid size-16 place-items-center border-4 border-outline bg-moss text-3xl shadow-pixel">
            🎲
          </div>

          <p className="mt-6 font-pixel text-[10px] leading-6 text-moss-light">
            NEW PARTY MEMBER
          </p>

          <h1 className="mt-3 font-pixel text-xl leading-10 text-cream">
            Vytvořit účet
          </h1>

          <p className="mt-4 text-sm leading-6 text-cream-muted">
            LANtern je soukromá aplikace pro jednu herní partu.
          </p>
        </div>

        <RegisterForm />

        <div className="mt-8 flex items-center justify-center gap-2 border-t-2 border-outline-soft pt-5 font-pixel text-[9px] text-cream-muted">
          <UserPlus aria-hidden="true" size={14} />
          PARTY MEMBER INITIALIZATION
        </div>
      </PixelPanel>
    </main>
  );
}