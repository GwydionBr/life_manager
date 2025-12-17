import { Constants, Database } from "@/types/db.types";
import { z } from "zod";

export const contactSchema = z.object({
  address: z.string().nullable(),
  created_at: z.string(),
  currency: z.enum(Constants.public.Enums.currency).nullable(),
  description: z.string().nullable(),
  email: z.string().nullable(),
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  user_id: z.string(),
});

export const contactDeserializationSchema = z.object({
  address: z.string().nullable(),
  created_at: z.string(),
  currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"]),
  description: z.string().nullable(),
  email: z.string().nullable(),
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  user_id: z.string(),
});
