import { useProjectAdjustmentsQuery } from "./use-project-adjustment-query";

export const useProjectAdjustmentMutations = () => {
  const { data: projectAdjustments } = useProjectAdjustmentsQuery();


  return {
    projectAdjustments,
  };
};