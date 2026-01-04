import { useLiveQuery } from "@tanstack/react-db";
import { projectAdjustmentsCollection } from "./project-adjustment-collection";

export const useProjectAdjustmentsQuery = () =>
  useLiveQuery((q) =>
    q.from({ projectAdjustments: projectAdjustmentsCollection })
  );
