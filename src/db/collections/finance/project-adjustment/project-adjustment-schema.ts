import { z } from "zod";

export const projectAdjustmentSchema = z.object({
  amount: z.number(),
  created_at: z.string(),
  description: z.string().nullable(),
  contact_id: z.string().nullable(),
  finance_project_id: z.string(),
  id: z.string(),
  single_cashflow_id: z.string().nullable(),
  user_id: z.string(),
});

export const projectAdjustmentDeserializationSchema = z.object({
  amount: z.number(),
  created_at: z.string(),
  description: z.string().nullable(),
  contact_id: z.string().nullable(),
  finance_project_id: z.string(),
  id: z.string(),
  single_cashflow_id: z.string().nullable(),
  user_id: z.string(),
});
