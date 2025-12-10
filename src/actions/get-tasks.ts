import { createServerFn } from "@tanstack/react-start";
import { createServerSupabaseClient } from "@/utils/supabase";

export const getTasks = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data;
});
