import { Constants, Database } from "@/types/db.types";
import { z } from "zod";

export const financeProjectSchema = z.object({
  created_at: z.string(),
  currency: z.enum(Constants.public.Enums.currency),
  description: z.string().nullable(),
  due_date: z.string().nullable(),
  finance_client_id: z.string().nullable(),
  id: z.string(),
  single_cash_flow_id: z.string().nullable(),
  start_amount: z.number(),
  title: z.string(),
  user_id: z.string(),
});

export const financeProjectDeserializationSchema = z.object({
  created_at: z.string(),
  currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"]),
  description: z.string().nullable(),
  due_date: z.string().nullable(),
  finance_client_id: z.string().nullable(),
  id: z.string(),
  single_cash_flow_id: z.string().nullable(),
  start_amount: z.number(),
  title: z.string(),
  user_id: z.string(),
});
