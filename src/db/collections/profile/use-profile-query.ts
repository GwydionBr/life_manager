import { useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";
import { useRouteContext } from "@tanstack/react-router";
import { profileCollection } from "./profile-collection";

// Returns the profile of the current user
export const useProfile = () => {
  const { user } = useRouteContext({ from: "__root__" });
  const currentUserId = user?.id;

  const {
    data: profiles,
    isReady,
    isLoading,
  } = useLiveQuery((q) => q.from({ profiles: profileCollection }));

  const profile = useMemo(
    () => profiles?.find((profile) => profile.id === currentUserId) ?? null,
    [profiles, currentUserId]
  );

  return { data: profile, isReady, isLoading };
};

// Returns profiles of all other users (excluding the current user)
export const useOtherProfiles = () => {
  const { user } = useRouteContext({ from: "__root__" });
  const currentUserId = user?.id;

  const { data: profiles } = useLiveQuery((q) =>
    q.from({ profiles: profileCollection })
  );

  return useMemo(
    () => ({
      data: profiles?.filter((profile) => profile.id !== currentUserId) ?? [],
    }),
    [profiles, currentUserId]
  );
};
