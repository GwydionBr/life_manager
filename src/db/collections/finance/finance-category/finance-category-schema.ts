import { z } from "zod";

export const financeCategorySchema = z.object({
  created_at: z.string(),
  description: z.string().nullable(),
  id: z.string(),
  title: z.string(),
  user_id: z.string(),
});

export const financeCategoryDeserializationSchema = z.object({
  created_at: z.string(),
  description: z.string().nullable(),
  id: z.string(),
  title: z.string(),
  user_id: z.string(),
});
