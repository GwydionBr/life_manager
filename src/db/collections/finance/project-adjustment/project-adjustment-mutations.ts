import {
  InsertProjectAdjustment,
  UpdateProjectAdjustment,
} from "@/types/finance.types";
import { projectAdjustmentsCollection } from "./project-adjustment-collection";

/**
 * Adds a new Finance Project.
 * Returns the transaction for further processing.
 *
 * @param newFinanceProject - The data of the new project
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise
 */
export const addProjectAdjustment = async (
  newProjectAdjustment: InsertProjectAdjustment,
  userId: string
) => {
  const newProjectAdjustmentData = {
    ...newProjectAdjustment,
    id: newProjectAdjustment.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
    description: newProjectAdjustment.description || null,
    finance_category_id: null,
    contact_id: newProjectAdjustment.contact_id || null,
    single_cashflow_id: newProjectAdjustment.single_cashflow_id || null,
  };
  const result = projectAdjustmentsCollection.insert(newProjectAdjustmentData);
  const promise = await result.isPersisted.promise;
  return promise;
};

export const updateProjectAdjustment = async (
  id: string,
  item: UpdateProjectAdjustment
) => {
  const result = projectAdjustmentsCollection.update(id, (draft) => {
    Object.assign(draft, item);
  });
  const promise = await result.isPersisted.promise;
  return promise;
};

export const deleteProjectAdjustment = async (id: string) => {
  const result = projectAdjustmentsCollection.delete(id);
  const promise = await result.isPersisted.promise;
  return promise;
};
