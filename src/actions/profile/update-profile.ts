import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { ProfileUpdate } from "@/types/profile.types";

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((data: ProfileUpdate) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    if (!data.id) {
      throw new Error("Profile ID is required");
    }

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return updatedProfile;
  });
