import { z } from "zod";
import { Constants, Database } from "@/types/db.types";

export const bankAccountSchema = z.object({
  created_at: z.string(),
  currency: z.enum(Constants.public.Enums.currency),
  description: z.string().nullable(),
  id: z.string(),
  is_default: z.boolean(),
  saldo: z.number(),
  saldo_set_at: z.string(),
  title: z.string(),
  user_id: z.string(),
});

export const bankAccountDeserializationSchema = z.object({
  created_at: z.string(),
  currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"]),
  description: z.string().nullable(),
  id: z.string(),
  is_default: z
    .number()
    .nullable()
    .transform((value) => (value === null ? false : value === 1)),
  saldo: z.number(),
  saldo_set_at: z.string(),
  title: z.string(),
  user_id: z.string(),
});
