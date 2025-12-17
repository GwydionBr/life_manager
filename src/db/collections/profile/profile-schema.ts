import { z } from "zod";

export const profileSchema = z.object({
  avatar_url: z.string().nullable(),
  created_at: z.string(),
  email: z.string(),
  full_name: z.string().nullable(),
  id: z.string(),
  initialized: z.boolean(),
  updated_at: z.string().nullable(),
  username: z.string(),
  website: z.string().nullable(),
});

export const profileDeserializationSchema = z.object({
  avatar_url: z.string().nullable(),
  created_at: z.string(),
  email: z.string(),
  full_name: z.string().nullable(),
  id: z.string(),
  initialized: z.number().transform((val) => val > 0),
  updated_at: z.string().nullable(),
  username: z.string(),
  website: z.string().nullable(),
});
