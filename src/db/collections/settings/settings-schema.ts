import { z } from "zod";
import { Constants, Database } from "@/types/db.types";

export const settingsSchema = z.object({
  automaticly_stop_other_timer: z.boolean(),
  created_at: z.string(),
  default_currency: z.enum(Constants.public.Enums.currency),
  default_finance_currency: z.enum(Constants.public.Enums.currency),
  default_group_color: z.string().nullable(),
  default_project_hourly_payment: z.boolean(),
  default_salary_amount: z.number(),
  format_24h: z.boolean(),
  id: z.string(),
  locale: z.enum(Constants.public.Enums.locales),
  round_in_time_sections: z.boolean(),
  rounding_amount: z.enum(Constants.public.Enums.roundingAmount),
  rounding_custom_amount: z.number(),
  rounding_direction: z.enum(Constants.public.Enums.roundingDirection),
  rounding_interval: z.number(),
  show_calendar_time: z.boolean(),
  show_change_curreny_window: z.boolean().nullable(),
  time_section_interval: z.number(),
  updated_at: z.string(),
  user_id: z.string(),
});

export const settingsDeserializationSchema = z.object({
  automaticly_stop_other_timer: z.number().transform((val) => val > 0),
  created_at: z.string(),
  default_currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"]),
  default_finance_currency: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["currency"]),
  default_group_color: z.string().nullable(),
  default_project_hourly_payment: z.number().transform((val) => val > 0),
  default_salary_amount: z.number(),
  format_24h: z.number().transform((val) => val > 0),
  id: z.string(),
  locale: z
    .string()
    .transform((value) => value as Database["public"]["Enums"]["locales"]),
  round_in_time_sections: z.number().transform((val) => val > 0),
  rounding_amount: z
    .string()
    .transform(
      (value) => value as Database["public"]["Enums"]["roundingAmount"]
    ),
  rounding_custom_amount: z.number(),
  rounding_direction: z
    .string()
    .transform(
      (value) => value as Database["public"]["Enums"]["roundingDirection"]
    ),
  rounding_interval: z.number(),
  show_calendar_time: z.number().transform((val) => val > 0),
  show_change_curreny_window: z
    .number()
    .transform((val) => val > 0)
    .nullable(),
  time_section_interval: z.number(),
  updated_at: z.string(),
  user_id: z.string(),
});
