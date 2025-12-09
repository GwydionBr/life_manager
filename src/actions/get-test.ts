import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "../utils/supabase";

export const getTest = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("test").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data;
});
