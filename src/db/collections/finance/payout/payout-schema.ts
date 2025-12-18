import { Constants, Database } from "@/types/db.types";
import { z } from "zod";

export const payoutSchema = z.object({
  created_at: z.string(),
  currency: z.enum(Constants.public.Enums.currency),
  id: z.string(),
  start_currency: z.enum(Constants.public.Enums.currency).nullable(),
  start_value: z.number().nullable(),
  timer_project_id: z.string().nullable(),
  title: z.string(),
  user_id: z.string(),
  value: z.number(),
});

export const payoutDeserializationSchema = z.object({
  created_at: z.string(),
  currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"]),
  id: z.string(),
  start_currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"])
    .nullable(),
  start_value: z
    .string()
    .transform((value) => parseFloat(value))
    .nullable(),
  timer_project_id: z.string().nullable(),
  title: z.string(),
  user_id: z.string(),
  value: z.string().transform((value) => parseFloat(value)),
});
