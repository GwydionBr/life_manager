import { db } from "@/db/powersync/db";
import {
  workProjectsCollection,
  workProjectTagsCollection,
} from "@/db/collections/work/work-project/work-project-collection";
import {
  InsertWorkProject,
  UpdateWorkProject,
  WorkProject,
} from "@/types/work.types";
import { createTransaction } from "@tanstack/react-db";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";

/**
 * Adds a new Work Project.
 *
 * @param newWorkProject - The data of the new project
 * @param userId - The user ID
 * @returns The new WorkProject or undefined if an error occurs
 */
export const addWorkProject = async (
  newWorkProject: InsertWorkProject,
  userId: string
) => {
  const { tags, ...projectData } = newWorkProject;

  const customTransaction = createTransaction({
    autoCommit: false,
    mutationFn: async ({ transaction }) => {
      // Use PowerSyncTransactor to apply the transaction to PowerSync
      await new PowerSyncTransactor({ database: db }).applyTransaction(
        transaction
      );
    },
  });
  const projectToInsert: WorkProject = {
    ...projectData,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
    color: projectData.color || null,
    currency: projectData.currency || "USD",
    description: projectData.description || null,
    finance_project_id: projectData.finance_project_id || null,
    hourly_payment: projectData.hourly_payment || false,
    is_favorite: projectData.is_favorite || false,
    order_index: projectData.order_index || 0,
    round_in_time_fragments: projectData.round_in_time_fragments || false,
    rounding_direction: projectData.rounding_direction || null,
    rounding_interval: projectData.rounding_interval || null,
    salary: projectData.salary || 0,
    time_fragment_interval: projectData.time_fragment_interval || null,
    title: projectData.title || "",
    total_payout: projectData.total_payout || 0,
    work_folder_id: projectData.work_folder_id || null,
    tags: tags || [],
  };

  customTransaction.mutate(() => {
    workProjectsCollection.insert(projectToInsert);
    if (tags && tags.length > 0) {
      tags.forEach((tag) => {
        workProjectTagsCollection.insert({
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          user_id: userId,
          work_project_id: projectToInsert.id,
          tag_id: tag.id,
        });
      });
    }
  });

  try {
    await customTransaction.commit();
    await customTransaction.isPersisted.promise;
    return projectToInsert;
  } catch (error) {
    console.error(error);
    return;
  }
};

/**
 * Updates a Work Project.
 *
 * @param id - The ID of the project to update
 * @param item - The item to update
 * @returns Returns true if the project was updated, false otherwise
 */
export const updateWorkProject = async (
  id: string,
  item: UpdateWorkProject,
  userId: string
) => {
  const { tags: tags, ...projectData } = item;
  try {
    const transaction = workProjectsCollection.update(id, (draft) => {
      Object.assign(draft, projectData);
    });
    await transaction.isPersisted.promise;

    if (tags) {
      await syncProjectTags(
        id,
        tags.map((tag) => tag.id),
        userId
      );
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Deletes a Work Project.
 *
 * @param id - The ID or IDs of the project to delete
 * @returns True if the project was deleted, false otherwise
 */
export const deleteWorkProject = async (id: string | string[]) => {
  try {
    const transaction = workProjectsCollection.delete(id);
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Synchronizes the Many-to-Many relations between Project and Finance Tags.
 * Deletes old relations and creates new ones based on tagIds.
 *
 * @param projectId - The project ID
 * @param tagIds - Array of tag IDs to associate
 * @param userId - The user ID
 */
export async function syncProjectTags(
  projectId: string,
  tagIds: string[],
  userId: string
): Promise<void> {
  // 1. Get all existing relations for this project
  const existingRelations = await db.getAll<{
    id: string;
    tag_id: string;
  }>("SELECT id, tag_id FROM work_project_tag WHERE work_project_id = ?", [
    projectId,
  ]);

  const existingTagIds = existingRelations.map((r) => r.tag_id);
  const newTagIds = tagIds || [];

  // 2. Find relations to delete (in existing but not in new)
  const relationsToDelete = existingRelations.filter(
    (relation) => !newTagIds.includes(relation.tag_id)
  );

  // 3. Find tags to add (in new but not in existing)
  const tagsToAdd = newTagIds.filter(
    (tagId) => !existingTagIds.includes(tagId)
  );

  // 4. Delete old relations
  const deletePromises = relationsToDelete.map((relation) =>
    workProjectTagsCollection.delete(relation.id)
  );

  // 5. Create new relations
  const insertPromises = tagsToAdd.map((tagId) =>
    workProjectTagsCollection.insert({
      id: crypto.randomUUID(),
      work_project_id: projectId,
      tag_id: tagId,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
  );

  // 6. Wait for all transactions
  const allTransactions = [...deletePromises, ...insertPromises];
  await Promise.all(allTransactions.map((tx) => tx.isPersisted.promise));
}
