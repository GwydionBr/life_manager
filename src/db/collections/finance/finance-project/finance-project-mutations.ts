import { db } from "@/db/powersync/db";
import {
  financeProjectsCollection,
  financeProjectTagsCollection,
} from "./finance-project-collection";
import {
  InsertFinanceProject,
  UpdateFinanceProject,
  FinanceProject,
} from "@/types/finance.types";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";
import { createTransaction } from "@tanstack/react-db";

/**
 * Adds a new Finance Project.
 *
 * @param newFinanceProject - The data of the new project
 * @param userId - The user ID
 * @returns The new FinanceProject or undefined if an error occurs
 */
export const addFinanceProject = async (
  newFinanceProject: InsertFinanceProject,
  userId: string
): Promise<FinanceProject | undefined> => {
  const customTransaction = createTransaction({
    autoCommit: false,
    mutationFn: async ({ transaction }) => {
      // Use PowerSyncTransactor to apply the transaction to PowerSync
      await new PowerSyncTransactor({ database: db }).applyTransaction(
        transaction
      );
    },
  });
  const { tags, contact, ...projectData } = newFinanceProject;
  const newFinanceProjectData = {
    ...projectData,
    id: newFinanceProject.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
    description: projectData.description || null,
    due_date: projectData.due_date || null,
    contact_id: projectData.contact_id || null,
    single_cashflow_id: projectData.single_cashflow_id || null,
  };
  customTransaction.mutate(() => {
    financeProjectsCollection.insert(newFinanceProjectData);
    tags.forEach((tag) => {
      financeProjectTagsCollection.insert({
        id: crypto.randomUUID(),
        finance_project_id: newFinanceProjectData.id,
        tag_id: tag.id,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
    });
  });
  try {
    await customTransaction.commit();
    await customTransaction.isPersisted.promise;
    return { ...newFinanceProjectData, tags, contact, adjustments: [] };
  } catch (error) {
    console.error(error);
    return;
  }
};

/**
 * Updates a Finance Project.
 *
 * @param id - The ID or IDs of the project to update
 * @param item - The item to update
 * @param userId - The user ID
 * @returns Returns true if the project was updated, false otherwise
 */
export const updateFinanceProject = async (
  id: string | string[],
  item: UpdateFinanceProject,
  userId: string
): Promise<boolean> => {
  const ids = Array.isArray(id) ? id : [id];
  const {
    tags,
    contact: _contact,
    adjustments: _adjustments,
    ...projectData
  } = item;

  const customTransaction = createTransaction({
    autoCommit: false,
    mutationFn: async ({ transaction }) => {
      // Use PowerSyncTransactor to apply the transaction to PowerSync
      await new PowerSyncTransactor({ database: db }).applyTransaction(
        transaction
      );
    },
  });

  customTransaction.mutate(() =>
    ids.forEach((projectId) => {
      financeProjectsCollection.update(projectId, (draft) => {
        Object.assign(draft, projectData);
      });
    })
  );

  try {
    // Wait for all updates to complete
    await customTransaction.commit();
    await customTransaction.isPersisted.promise;

    const tagIds = tags.map((tag) => tag.id);
    await syncFinanceProjectTags(ids, tagIds, userId);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Deletes a Finance Project.
 *
 * @param id - The ID or IDs of the project to delete
 * @returns True if the project was deleted, false otherwise
 */
export const deleteFinanceProject = async (
  id: string | string[]
): Promise<boolean> => {
  try {
    const transaction = financeProjectsCollection.delete(id);
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Synchronizes the Many-to-Many relations between Finance Project and Finance Tags.
 * Deletes old relations and creates new ones based on tagIds.
 * Can handle a single project ID or an array of project IDs.
 *
 * @param projectIds - The project ID or array of project IDs
 * @param tagIds - Array of tag IDs to associate
 * @param userId - The user ID
 */
export async function syncFinanceProjectTags(
  projectIds: string[],
  tagIds: string[],
  userId: string
): Promise<void> {
  // Normalize to array
  const newTagIds = tagIds || [];

  // 1. Get all existing relations for all projects
  const placeholders = projectIds.map(() => "?").join(",");
  const existingRelations = await db.getAll<{
    id: string;
    finance_project_id: string;
    tag_id: string;
  }>(
    `SELECT id, finance_project_id, tag_id FROM finance_project_tag WHERE finance_project_id IN (${placeholders})`,
    projectIds
  );

  // 2. Process each project separately
  const allDeletePromises: ReturnType<
    typeof financeProjectTagsCollection.delete
  >[] = [];
  const allInsertPromises: ReturnType<
    typeof financeProjectTagsCollection.insert
  >[] = [];

  for (const currentProjectId of projectIds) {
    // Get existing relations for this specific project
    const projectRelations = existingRelations.filter(
      (r) => r.finance_project_id === currentProjectId
    );
    const existingTagIds = projectRelations.map((r) => r.tag_id);

    // Find relations to delete (in existing but not in new)
    const relationsToDelete = projectRelations.filter(
      (relation) => !newTagIds.includes(relation.tag_id)
    );

    // Find tags to add (in new but not in existing)
    const tagsToAdd = newTagIds.filter(
      (tagId) => !existingTagIds.includes(tagId)
    );

    // Delete old relations
    relationsToDelete.forEach((relation) => {
      allDeletePromises.push(financeProjectTagsCollection.delete(relation.id));
    });

    // Create new relations
    tagsToAdd.forEach((tagId) => {
      allInsertPromises.push(
        financeProjectTagsCollection.insert({
          id: crypto.randomUUID(),
          finance_project_id: currentProjectId,
          tag_id: tagId,
          user_id: userId,
          created_at: new Date().toISOString(),
        })
      );
    });
  }

  // 3. Wait for all transactions
  const allTransactions = [...allDeletePromises, ...allInsertPromises];
  await Promise.all(allTransactions.map((tx) => tx.isPersisted.promise));
}
