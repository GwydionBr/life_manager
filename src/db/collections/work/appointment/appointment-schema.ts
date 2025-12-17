import { z } from "zod";

export const appointmentSchema = z.object({
  created_at: z.string(),
  description: z.string().nullable(),
  end_date: z.string(),
  id: z.string(),
  reminder: z.string().nullable(),
  start_date: z.string(),
  timer_project_id: z.string().nullable(),
  title: z.string(),
  user_id: z.string(),
});

export const appointmentDeserializationSchema = z.object({
  created_at: z.string(),
  description: z.string().nullable(),
  end_date: z.string(),
  id: z.string(),
  reminder: z.string().nullable(),
  start_date: z.string(),
  timer_project_id: z.string().nullable(),
  title: z.string(),
  user_id: z.string(),
});
