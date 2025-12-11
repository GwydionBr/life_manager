import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettings } from "@/actions/settings/update-settings";
import { SettingsUpdate, Settings } from "@/types/settings.types";
import { settingsQueryKey } from "./use-settings";

/**
 * Hook for updating user settings.
 * Updates React Query cache, which triggers SettingsSync to update Zustand store.
 */
export function useUpdateSettings() {
  return useMutation({
    mutationFn: (data: SettingsUpdate, context) => {
      const settings = context.client.getQueryData<Settings>(settingsQueryKey);
      return updateSettings({
        data: {
          id: settings?.id,
          ...data,
        },
      });
    },
    onMutate: async (data, context) => {
      await context.client.cancelQueries({ queryKey: ["todos"] });

      const previousSettings =
        context.client.getQueryData<Settings>(settingsQueryKey);
      context.client.setQueryData<Settings>(settingsQueryKey, (old) => {
        if (!old) return undefined;
        else
          return {
            ...old,
            ...data,
          };
      });
      return { previousSettings };
    },
    onError: (err, data, onMutateResult, context) => {
      // Invalidate to refetch from server on error
      context.client.setQueryData<Settings>(
        settingsQueryKey,
        onMutateResult?.previousSettings
      );
    },
  });
}
