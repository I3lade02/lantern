import { z } from "zod";

import { SESSION_STATUSES } from "@/types/session";

export const sessionFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Název session musí mít alespoň 3 znaky.")
    .max(80, "Název session může mít maximálně 80 znaků."),

  description: z
    .string()
    .trim()
    .max(1000, "Popis může mít maximálně 1000 znaků."),

  startAt: z
    .string()
    .min(1, "Vyber datum a čas session.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Datum a čas nejsou platné.",
    ),

  location: z
    .string()
    .trim()
    .min(2, "Zadej místo konání.")
    .max(120, "Místo může mít maximálně 120 znaků."),

  hostId: z.string().min(1, "Vyber hostitele."),

  status: z.enum(SESSION_STATUSES),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;