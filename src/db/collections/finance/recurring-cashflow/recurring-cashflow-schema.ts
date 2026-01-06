import { Constants, Database } from "@/types/db.types";
import { z } from "zod";

export const recurringCashflowSchema = z.object({
  amount: z.number(),
  created_at: z.string(),
  currency: z.enum(Constants.public.Enums.currency),
  description: z.string(),
  end_date: z.string().nullable(),
  contact_id: z.string().nullable(),
  id: z.string(),
  interval: z.enum(Constants.public.Enums.finance_interval),
  start_date: z.string(),
  title: z.string(),
  user_id: z.string(),
});

export const recurringCashflowDeserializationSchema = z.object({
  amount: z.number(),
  created_at: z.string(),
  currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"]),
  description: z.string(),
  end_date: z.string().nullable(),
  contact_id: z.string().nullable(),
  id: z.string(),
  interval: z
    .string()
    .transform(
      (value) => value as Database["public"]["Enums"]["finance_interval"]
    ),
  start_date: z.string(),
  title: z.string(),
  user_id: z.string(),
});

export const recurringCashflowTagSchema = z.object({
  created_at: z.string(),
  tag_id: z.string(),
  id: z.string(),
  recurring_cashflow_id: z.string(),
  user_id: z.string(),
});

export const recurringCashflowTagDeserializationSchema = z.object({
  created_at: z.string(),
  tag_id: z.string(),
  id: z.string(),
  recurring_cashflow_id: z.string(),
  user_id: z.string(),
});
