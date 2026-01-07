import { workFoldersCollection } from "@/db/collections/work/work-folder/work-folder-collection";
import {
  InsertWorkFolder,
  UpdateWorkFolder,
  WorkFolder,
} from "@/types/work.types";

/**
 * Adds a new Work Folder.
 *
 * @param newWorkFolder - The data of the new folder
 * @param userId - The user ID
 * @returns The new WorkFolder or undefined if an error occurs
 */
export const addWorkFolder = async (
  newWorkFolder: InsertWorkFolder,
  userId: string
) => {
  const folderToInsert: WorkFolder = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
    title: newWorkFolder.title || "",
    description: newWorkFolder.description || null,
    order_index: newWorkFolder.order_index || 0,
    parent_folder: newWorkFolder.parent_folder || null,
  };

  try {
    const transaction = workFoldersCollection.insert(folderToInsert);
    await transaction.isPersisted.promise;
    return folderToInsert;
  } catch (error) {
    console.error(error);
    return;
  }
};

/**
 * Updates a Work Folder.
 *
 * @param id - The ID of the folder to update
 * @param item - The item to update
 * @returns Returns true if the folder was updated, false otherwise
 */
export const updateWorkFolder = async (id: string, item: UpdateWorkFolder) => {
  try {
    const transaction = workFoldersCollection.update(id, (draft) => {
      Object.assign(draft, item);
    });
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Deletes a Work Folder.
 *
 * @param id - The ID or IDs of the folder to delete
 * @returns True if the folder was deleted, false otherwise
 */
export const deleteWorkFolder = async (id: string | string[]) => {
  try {
    const transaction = workFoldersCollection.delete(id);
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
