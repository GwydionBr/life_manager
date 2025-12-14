import { useQuery, queryOptions } from "@tanstack/react-query";
import { getProfile } from "@/actions/profile/get-profile";
import { getOtherProfiles } from "@/actions/profile/get-other-profiles";

export const profileQueryKey = ["profile"];
export const otherProfilesQueryKey = ["otherProfiles"];

export const profileQueryOptions = queryOptions({
  queryKey: profileQueryKey,
  queryFn: getProfile,
});

export const useProfile = () => {
  return useQuery(profileQueryOptions);
};

export const useOtherProfiles = () => {
  return useQuery({
    queryKey: otherProfilesQueryKey,
    queryFn: getOtherProfiles,
  });
};