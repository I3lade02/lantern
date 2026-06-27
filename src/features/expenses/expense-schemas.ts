import { z } from "zod";

import {
  EXPENSE_CATEGORIES,
  EXPENSE_SPLIT_TYPES,
} from "@/types/expense";

export const expenseFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Název položky musí mít alespoň 2 znaky.")
    .max(80, "Název položky může mít maximálně 80 znaků."),

  category: z.enum(EXPENSE_CATEGORIES),

  amount: z
    .string()
    .trim()
    .min(1, "Zadej cenu.")
    .regex(
      /^\d+(?:[,.]\d{1,2})?$/,
      "Použij částku například 49, 49,50 nebo 49.50.",
    ),

  sessionId: z.string().min(1, "Vyber session."),

  payerId: z.string().min(1, "Vyber, kdo platil."),

  splitType: z.enum(EXPENSE_SPLIT_TYPES),

  note: z
    .string()
    .trim()
    .max(500, "Poznámka může mít maximálně 500 znaků."),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;