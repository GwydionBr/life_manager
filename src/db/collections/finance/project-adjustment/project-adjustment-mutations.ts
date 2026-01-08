import {
  InsertProjectAdjustment,
  ProjectAdjustment,
  UpdateProjectAdjustment,
} from "@/types/finance.types";
import { projectAdjustmentsCollection } from "./project-adjustment-collection";

/**
 * Adds a new Finance Project Adjustment.
 *
 * @param newProjectAdjustment - The data of the new project adjustment
 * @param userId - The user ID
 * @returns The new project adjustment or undefined if an error occurs
 */
export const addProjectAdjustment = async (
  newProjectAdjustment: InsertProjectAdjustment,
  userId: string
): Promise<ProjectAdjustment | undefined> => {
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
  try {
    const result = projectAdjustmentsCollection.insert(
      newProjectAdjustmentData
    );
    await result.isPersisted.promise;
    return newProjectAdjustmentData;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

/**
 * Updates a Finance Project Adjustment.
 *
 * @param id - The ID of the project adjustment to update
 * @param item - The data of the project adjustment to update
 * @returns True if the project adjustment was updated, false if an error occurs
 */
export const updateProjectAdjustment = async (
  id: string,
  item: UpdateProjectAdjustment
): Promise<boolean> => {
  try {
    const result = projectAdjustmentsCollection.update(id, (draft) => {
      Object.assign(draft, item);
    });
    await result.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Deletes a Finance Project Adjustment.
 *
 * @param id - The ID or IDs of the project adjustment to delete
 * @returns True if the project adjustment was deleted, false if an error occurs
 */
export const deleteProjectAdjustment = async (
  id: string | string[]
): Promise<boolean> => {
  try {
    const result = projectAdjustmentsCollection.delete(id);
    await result.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
