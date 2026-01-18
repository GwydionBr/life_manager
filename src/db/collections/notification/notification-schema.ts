import { z } from "zod";
import { Constants, Database } from "@/types/db.types";

export const notificationSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  user_id: z.string(),
  type: z.enum(Constants.public.Enums.notificationType),
  dismissed_at: z.string().nullable(),
  title: z.string().nullable(),
  body: z.string().nullable(),
  priority: z.enum(Constants.public.Enums.priority),
  resource_type: z
    .enum(Constants.public.Enums.notificationResourceType)
    .nullable(),
  resource_id: z.string().nullable(),
  read_at: z.string().nullable(),
  scheduled_for: z.string().nullable(),
});

export const notificationDeserializationSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  user_id: z.string(),
  type: z
    .string()
    .transform(
      (value) => value as Database["public"]["Enums"]["notificationType"]
    ),
  dismissed_at: z.string().nullable(),
  title: z.string().nullable(),
  body: z.string().nullable(),
  priority: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["priority"]),
  resource_type: z
    .string()
    .transform(
      (value) =>
        value as Database["public"]["Enums"]["notificationResourceType"] | null
    )
    .nullable(),
  resource_id: z.string().nullable(),
  read_at: z.string().nullable(),
  scheduled_for: z.string().nullable(),
});
