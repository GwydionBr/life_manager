import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export const getOtherProfiles = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = getSupabaseServerClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      throw new Error("User not found");
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.user.id)

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
);
