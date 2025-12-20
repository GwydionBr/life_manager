import { Constants, Database } from "@/types/db.types";
import { z } from "zod";

export const singleCashflowSchema = z.object({
  amount: z.number(),
  changed_date: z.string().nullable(),
  created_at: z.string(),
  currency: z.enum(Constants.public.Enums.currency),
  date: z.string(),
  finance_client_id: z.string().nullable(),
  finance_project_id: z.string().nullable(),
  id: z.string(),
  is_active: z.boolean(),
  payout_id: z.string().nullable(),
  recurring_cash_flow_id: z.string().nullable(),
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
  finance_client_id: z.string().nullable(),
  finance_project_id: z.string().nullable(),
  id: z.string(),
  is_active: z.number().transform((value) => value === 1),
  payout_id: z.string().nullable(),
  recurring_cash_flow_id: z.string().nullable(),
  title: z.string(),
  user_id: z.string(),
});
