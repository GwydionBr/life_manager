import { z } from "zod";
import { Constants, Database } from "@/types/db.types";

export const workTimeEntrySchema = z.object({
  active_seconds: z.number(),
  created_at: z.string(),
  currency: z.enum(Constants.public.Enums.currency),
  end_time: z.string(),
  hourly_payment: z.boolean(),
  id: z.string(),
  memo: z.string().nullable(),
  paid: z.boolean(),
  payout_id: z.string().nullable(),
  work_project_id: z.string(),
  real_start_time: z.string().nullable(),
  salary: z.number(),
  single_cashflow_id: z.string().nullable(),
  start_time: z.string(),
  time_fragments_interval: z.number().nullable(),
  true_end_time: z.string(),
  user_id: z.string(),
});

export const workTimeEntryDeserializationSchema = z.object({
  active_seconds: z.number(),
  created_at: z.string(),
  currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"]),
  end_time: z.string(),
  hourly_payment: z.number().transform((val) => val > 0),
  id: z.string(),
  memo: z.string().nullable(),
  paid: z.number().transform((val) => val > 0),
  payout_id: z.string().nullable(),
  work_project_id: z.string(),
  real_start_time: z.string().nullable(),
  salary: z.number(),
  single_cashflow_id: z.string().nullable(),
  start_time: z.string(),
  time_fragments_interval: z.number().nullable(),
  true_end_time: z.string(),
  user_id: z.string(),
});
