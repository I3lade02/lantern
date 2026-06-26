"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PixelButton } from "../ui/pixel-button";
import { PixelInput } from "../ui/pixel-input";
import { getAuthErrorMessage } from "@/features/auth/auth-errors";
import { signInWithEmail } from "@/features/auth/auth-service";
import { toast } from "@/components/ui/pixel-toast";

const loginSchema = z.object({
    email: z.string().email("Zadej platný email"),
    password: z.string().min(1, "Zadej heslo"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(values: LoginFormValues) {
        setIsSubmitting(true);

        try {
            await signInWithEmail(values);

            toast.success("Vítej zpátky v LANternu");
            router.replace("/dashboard");
        } catch (error) {
            toast.error(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <PixelInput
                autoComplete="email"
                error={errors.email?.message}
                id="email"
                label="E-mail"
                placeholder="tvuj@mail.cz"
                required
                type="email"
                {...register("email")}
            />

            <PixelInput
                autoComplete="current-password"
                error={errors.password?.message}
                id="password"
                label="Heslo"
                required
                type="password"
                {...register("password")}
            />

            <PixelButton
                disabled={isSubmitting}
                fullWidth
                size="lg"
                type="submit"
            >
                <LogIn aria-hidden="true" size={16} />
                {isSubmitting ? "Přihlašuji..." : "Vstoupit do LANternu"}
            </PixelButton>

            <p className="text-center text-sm leading-6 text-cream-muter">
                Ještě nemáš účet?{" "}
                <Link
                    className="font-semibold text-amber-light underline decoration-amber/60 underline-offset-4 hover:text-amber"
                    href="/register"
                >
                    Vytvořit účet
                </Link>
            </p>
        </form>
    );
}