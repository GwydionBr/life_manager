import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Database } from "@/types/db.types";

type SettingsUpdate = Database["public"]["Tables"]["settings"]["Update"];

export const updateSettings = createServerFn({ method: "POST" })
  .inputValidator((data: SettingsUpdate) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    if (!data.id) {
      throw new Error("Settings ID is required");
    }

    const { data: updatedSettings, error } = await supabase
      .from("settings")
      .update(data)
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return updatedSettings;
  });
