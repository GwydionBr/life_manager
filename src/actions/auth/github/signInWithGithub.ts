import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";

const rootUrl = process.env.NEXT_PUBLIC_ROOT_URL || "http://localhost:3000/";

export const signInWithGithub = createServerFn({ method: "POST" }).handler(
  async () => {
    const supabase = getSupabaseServerClient();
    const provider = "github";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${rootUrl}auth/callback`,
      },
    });

    if (data.url) {
      redirect({ to: data.url });
    } else if (error) {
      throw new Error(error.message);
    } else {
      redirect({ to: "/dashboard" });
    }
  }
);
