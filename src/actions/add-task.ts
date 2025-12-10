import { createServerSupabaseClient } from "@/utils/supabase";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const addTaskSchema = z.object({
  name: z.string().min(1),
});

export const addTask = createServerFn({ method: "POST" })
  .inputValidator(addTaskSchema)
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient();
    const { data: insertedData, error } = await supabase
      .from("tasks")
      .insert(data);
    if (error) {
      throw new Error(error.message);
    }
    return insertedData;
  });
