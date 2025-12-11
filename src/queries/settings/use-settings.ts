import { useQuery, queryOptions } from "@tanstack/react-query";
import { getSettings } from "@/actions/settings/get-settings";

export const settingsQueryKey = ["settings"];

export const settingsQueryOptions = queryOptions({
  queryKey: settingsQueryKey,
  queryFn: getSettings,
});

export const useSettings = () => {
  return useQuery(settingsQueryOptions);
};
