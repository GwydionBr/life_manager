import { Constants, Database } from "@/types/db.types";
import { z } from "zod";

export const appointmentSchema = z.object({
  created_at: z.string(),
  description: z.string().nullable(),
  end_date: z.string(),
  id: z.string(),
  reminder: z.string().nullable(),
  start_date: z.string(),
  work_project_id: z.string().nullable(),
  title: z.string(),
  user_id: z.string(),
  is_all_day: z.boolean(),
  type: z.enum(Constants.public.Enums["appointment-type"]),
});

export const appointmentDeserializationSchema = z.object({
  created_at: z.string(),
  description: z.string().nullable(),
  end_date: z.string(),
  id: z.string(),
  reminder: z.string().nullable(),
  start_date: z.string(),
  work_project_id: z.string().nullable(),
  title: z.string(),
  user_id: z.string(),
  is_all_day: z.number().transform((val) => val > 0),
  type: z
    .string()
    .transform(
      (value) => value as Database["public"]["Enums"]["appointment-type"]
    ),
});
