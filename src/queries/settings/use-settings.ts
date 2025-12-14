import { useQuery, queryOptions } from "@tanstack/react-query";
import { getSettings } from "@/actions/settings/get-settings";

export const settingsQueryKey = ["settings"];

export const settingsQueryOptions = queryOptions({
  queryKey: settingsQueryKey,
  queryFn: getSettings,
  gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
});

export const useSettings = () => {
  return useQuery(settingsQueryOptions);
};
