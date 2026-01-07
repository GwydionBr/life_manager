import { z } from "zod";

export const workFolderSchema = z.object({
  created_at: z.string(),
  description: z.string().nullable(),
  id: z.string(),
  order_index: z.number(),
  parent_folder: z.string().nullable(),
  title: z.string(),
  user_id: z.string().nullable(),
});

export const workFolderDeserializationSchema = z.object({
  created_at: z.string(),
  description: z.string().nullable(),
  id: z.string(),
  order_index: z.number(),
  parent_folder: z.string().nullable(),
  title: z.string(),
  user_id: z.string().nullable(),
});
