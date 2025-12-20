import { z } from "zod";

export const projectAdjustmentSchema = z.object({
  amount: z.number(),
  created_at: z.string(),
  description: z.string().nullable(),
  finance_category_id: z.string().nullable(),
  finance_client_id: z.string().nullable(),
  finance_project_id: z.string(),
  id: z.string(),
  single_cash_flow_id: z.string().nullable(),
  user_id: z.string(),
});

export const projectAdjustmentDeserializationSchema = z.object({
  amount: z.number(),
  created_at: z.string(),
  description: z.string().nullable(),
  finance_category_id: z.string().nullable(),
  finance_client_id: z.string().nullable(),
  finance_project_id: z.string(),
  id: z.string(),
  single_cash_flow_id: z.string().nullable(),
  user_id: z.string(),
});
