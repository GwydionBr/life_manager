import { z } from "zod";
import { Constants, Database } from "@/types/db.types";

export const workProjectSchema = z.object({
  cash_flow_category_id: z.string().nullable(),
  color: z.string().nullable(),
  created_at: z.string(),
  currency: z.enum(Constants.public.Enums.currency),
  description: z.string().nullable(),
  finance_project_id: z.string().nullable(),
  folder_id: z.string().nullable(),
  hourly_payment: z.boolean(),
  id: z.string(),
  is_favorite: z.boolean(),
  order_index: z.number(),
  round_in_time_fragments: z.boolean().nullable(),
  rounding_direction: z
    .enum(Constants.public.Enums.roundingDirection)
    .nullable(),
  rounding_interval: z.number().nullable(),
  salary: z.number(),
  time_fragment_interval: z.number().nullable(),
  title: z.string(),
  total_payout: z.number(),
  user_id: z.string(),
});

export const workProjectDeserializationSchema = z.object({
  cash_flow_category_id: z.string().nullable(),
  color: z.string().nullable(),
  created_at: z.string(),
  currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"]),
  description: z.string().nullable(),
  finance_project_id: z.string().nullable(),
  folder_id: z.string().nullable(),
  hourly_payment: z.number().transform((val) => val > 0),
  id: z.string(),
  is_favorite: z.number().transform((val) => val > 0),
  order_index: z.number(),
  round_in_time_fragments: z
    .number()
    .transform((val) => val > 0)
    .nullable(),
  rounding_direction: z
    .string()
    .transform(
      (value) => value as Database["public"]["Enums"]["roundingDirection"]
    )
    .nullable(),
  rounding_interval: z.number().nullable(),
  salary: z.number(),
  time_fragment_interval: z.number().nullable(),
  title: z.string(),
  total_payout: z.string().transform((val) => parseFloat(val)),
  user_id: z.string(),
});
