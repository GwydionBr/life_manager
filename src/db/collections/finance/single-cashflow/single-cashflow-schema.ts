import { Constants, Database } from "@/types/db.types";
import { z } from "zod";

export const singleCashflowSchema = z.object({
  amount: z.number(),
  changed_date: z.string().nullable(),
  created_at: z.string(),
  currency: z.enum(Constants.public.Enums.currency),
  date: z.string(),
  contact_id: z.string().nullable(),
  finance_project_id: z.string().nullable(),
  id: z.string(),
  is_active: z.boolean(),
  payout_id: z.string().nullable(),
  recurring_cashflow_id: z.string().nullable(),
  title: z.string(),
  user_id: z.string(),
});

export const singleCashflowDeserializationSchema = z.object({
  amount: z.number(),
  changed_date: z.string().nullable(),
  created_at: z.string(),
  currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"]),
  date: z.string(),
  contact_id: z.string().nullable(),
  finance_project_id: z.string().nullable(),
  id: z.string(),
  is_active: z.number().transform((value) => value === 1),
  payout_id: z.string().nullable(),
  recurring_cashflow_id: z.string().nullable(),
  title: z.string(),
  user_id: z.string(),
});

export const singleCashflowTagSchema = z.object({
  created_at: z.string(),
  tag_id: z.string(),
  id: z.string(),
  single_cashflow_id: z.string(),
  user_id: z.string(),
});

export const singleCashflowTagDeserializationSchema = z.object({
  created_at: z.string(),
  tag_id: z.string(),
  id: z.string(),
  single_cashflow_id: z.string(),
  user_id: z.string(),
});
