import { useQuery, queryOptions } from "@tanstack/react-query";
import { getProfile } from "@/actions/get-profile";

export const profileQueryOptions = queryOptions({
  queryKey: ["profile"],
  queryFn: getProfile,
});

export const useProfile = () => {
  return useQuery(profileQueryOptions);
};
