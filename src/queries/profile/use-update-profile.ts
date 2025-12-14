import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/actions/profile/update-profile";
import { profileQueryKey } from "./use-profile";

import { CustomMutationProps } from "@/types/query.types";
import { Profile, ProfileUpdate } from "@/types/profile.types";

export function useUpdateProfile({ ...props }: CustomMutationProps = {}) {
  return useMutation({
    mutationFn: (data: ProfileUpdate, context) => {
      const profile = context.client.getQueryData<Profile>(profileQueryKey);
      return updateProfile({
        data: {
          id: profile?.id,
          ...data,
        },
      });
    },
    onMutate: async (data, context) => {
      await context.client.cancelQueries({ queryKey: profileQueryKey });

      const previousProfile =
        context.client.getQueryData<Profile>(profileQueryKey);
      context.client.setQueryData<Profile>(profileQueryKey, (old) => {
        if (!old) return undefined;
        else
          return {
            ...old,
            ...data,
          };
      });
      return { previousProfile };
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      props.onSuccess?.();
    },
    onError: (err, data, onMutateResult, context) => {
      console.error(err);
      props.onError?.();
      context.client.setQueryData<Profile>(
        profileQueryKey,
        onMutateResult?.previousProfile
      );
    },
  });
}
