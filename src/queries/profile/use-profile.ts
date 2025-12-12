import { useQuery, queryOptions } from "@tanstack/react-query";
import { getProfile } from "@/actions/get-profile";

export const profileQueryKey = ["profile"];

export const profileQueryOptions = queryOptions({
  queryKey: profileQueryKey,
  queryFn: getProfile,
});

export const useProfile = () => {
  return useQuery(profileQueryOptions);
};
