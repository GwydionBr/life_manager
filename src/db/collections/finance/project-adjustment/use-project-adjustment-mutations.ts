import { useProjectAdjustmentsQuery } from "./use-project-adjustment-query";
import { useProfile } from "@/db/collections/profile/profile-collection";

export const useProjectAdjustmentMutations = () => {
  const { data: projectAdjustments } = useProjectAdjustmentsQuery();
  const { data: profile } = useProfile();


  return {
    projectAdjustments,
  };
};