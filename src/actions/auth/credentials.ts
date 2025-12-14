import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { z } from "zod";

// Server Function for Signup
export const signUp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string(), password: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, user: authData.user };
  });

// Server Function for Signin
export const signIn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string(), password: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, user: authData.user };
  });
