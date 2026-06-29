"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PixelButton } from "@/components/ui/pixel-button";
import { PixelInput } from "@/components/ui/pixel-input";
import { toast } from "@/components/ui/pixel-toast";
import { getAuthErrorMessage } from "@/features/auth/auth-errors";
import { registerWithEmail } from "@/features/auth/auth-service";

const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Přezdívka musí mít alespoň 2 znaky.")
      .max(24, "Přezdívka může mít maximálně 24 znaků.")
      .regex(
        /^[\p{L}\p{N} _-]+$/u,
        "Použij písmena, čísla, mezery, pomlčky nebo podtržítka.",
      ),

    email: z.string().email("Zadej platný e-mail."),

    password: z
      .string()
      .min(8, "Heslo musí mít alespoň 8 znaků.")
      .max(128, "Heslo je příliš dlouhé."),

    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Hesla se neshodují.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);

    try {
      const result = await registerWithEmail({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });

      if (result.verificationEmailSent) {
        toast.success(
          "Žádost byla odeslána. Ověř svůj e-mail.",
        );
      } else {
        toast.success(
          "Žádost byla odeslána. Ověřovací e-mail můžeš poslat z čekárny znovu.",
        );
      }

      router.replace("/cekani-na-schvaleni");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
      <PixelInput
        autoComplete="nickname"
        error={errors.displayName?.message}
        id="display-name"
        label="Přezdívka"
        maxLength={24}
        placeholder="Například Ondra"
        required
        {...register("displayName")}
      />

      <PixelInput
        autoComplete="email"
        error={errors.email?.message}
        id="register-email"
        label="E-mail"
        placeholder="ondra@example.cz"
        required
        type="email"
        {...register("email")}
      />

      <PixelInput
        autoComplete="new-password"
        error={errors.password?.message}
        hint="Použij alespoň 8 znaků."
        id="register-password"
        label="Heslo"
        required
        type="password"
        {...register("password")}
      />

      <PixelInput
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        id="confirm-password"
        label="Potvrzení hesla"
        required
        type="password"
        {...register("confirmPassword")}
      />

      <PixelButton
        disabled={isSubmitting}
        fullWidth
        size="lg"
        type="submit"
        variant="moss"
      >
        <UserPlus aria-hidden="true" size={16} />
        {isSubmitting
          ? "Zakládám žádost…"
          : "Požádat o připojení"}
      </PixelButton>

      <p className="text-center text-sm leading-6 text-cream-muted">
        Už máš účet?{" "}
        <Link
          className="font-semibold text-amber-light underline decoration-amber/60 underline-offset-4 hover:text-amber"
          href="/login"
        >
          Přihlásit se
        </Link>
      </p>
    </form>
  );
}