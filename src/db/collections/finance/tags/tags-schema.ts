import { z } from "zod";

export const tagsSchema = z.object({
  created_at: z.string(),
  description: z.string().nullable(),
  id: z.string(),
  title: z.string(),
  user_id: z.string(),
});

export const tagsDeserializationSchema = z.object({
  created_at: z.string(),
  description: z.string().nullable(),
  id: z.string(),
  title: z.string(),
  user_id: z.string(),
});
