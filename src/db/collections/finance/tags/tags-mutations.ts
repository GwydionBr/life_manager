import { tagsCollection } from "@/db/collections/finance/tags/tags-collection";
import { InsertTag, UpdateTag, Tag } from "@/types/finance.types";

/**
 * Adds a new Tag.
 *
 * @param newTag - The data of the new tag
 * @param userId - The user ID
 * @returns The new Tag or undefined if an error occurs
 */
export const addTag = async (newTag: InsertTag, userId: string) => {
  const tagToInsert: Tag = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
    title: newTag.title || "",
    description: newTag.description || null,
  };

  try {
    const transaction = tagsCollection.insert(tagToInsert);
    await transaction.isPersisted.promise;
    return tagToInsert;
  } catch (error) {
    console.error(error);
    return;
  }
};

/**
 * Updates a Tag.
 *
 * @param id - The ID of the tag to update
 * @param item - The item to update
 * @returns Returns true if the tag was updated, false otherwise
 */
export const updateTag = async (id: string, item: UpdateTag) => {
  try {
    const transaction = tagsCollection.update(id, (draft) => {
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
 * Deletes a Tag.
 *
 * @param id - The ID or IDs of the tag to delete
 * @returns True if the tag was deleted, false otherwise
 */
export const deleteTag = async (id: string | string[]) => {
  try {
    const transaction = tagsCollection.delete(id);
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
