import { useQuery, queryOptions } from "@tanstack/react-query";
import { getSettings } from "@/actions/get-settings";

export const settingsQueryOptions = queryOptions({
  queryKey: ["settings"],
  queryFn: getSettings,
});

export const useSettings = () => {
  return useQuery(settingsQueryOptions);
};
