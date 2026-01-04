import { db } from "@/db/powersync/db";
import {
  financeProjectsCollection,
  financeProjectCategoriesCollection,
} from "./finance-project-collection";
import {
  InsertFinanceProject,
  UpdateFinanceProject,
} from "@/types/finance.types";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";
import { createTransaction } from "@tanstack/react-db";

/**
 * Adds a new Finance Project.
 * Returns the transaction for further processing.
 *
 * @param newFinanceProject - The data of the new project
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise
 */
export const addFinanceProject = async (
  newFinanceProject: InsertFinanceProject,
  userId: string
) => {
  const customTransaction = createTransaction({
    autoCommit: false,
    mutationFn: async ({ transaction }) => {
      // Use PowerSyncTransactor to apply the transaction to PowerSync
      await new PowerSyncTransactor({ database: db }).applyTransaction(
        transaction
      );
    },
  });
  const { categories, client, ...projectData } = newFinanceProject;
  const newFinanceProjectData = {
    ...projectData,
    id: newFinanceProject.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
    description: projectData.description || null,
    due_date: projectData.due_date || null,
    finance_client_id: projectData.finance_client_id || null,
    single_cash_flow_id: projectData.single_cash_flow_id || null,
    client_id: client?.id || null,
  };
  customTransaction.mutate(() => {
    financeProjectsCollection.insert(newFinanceProjectData);
    categories.forEach((category) => {
      financeProjectCategoriesCollection.insert({
        id: crypto.randomUUID(),
        finance_project_id: newFinanceProjectData.id,
        finance_category_id: category.id,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
    });
  });
  await customTransaction.commit();
  const promise = await customTransaction.isPersisted.promise;
  return {
    promise,
    data: { ...newFinanceProjectData, categories, client, adjustments: [] },
  };
};

/**
 * Updates a Finance Project.
 *
 * @param id - The ID or IDs of the project to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
 */
export const updateFinanceProject = async (
  id: string | string[],
  item: UpdateFinanceProject,
  userId: string
) => {
  const ids = Array.isArray(id) ? id : [id];
  const {
    categories,
    client: _client,
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

  // Wait for all updates to complete
  await customTransaction.commit();
  const promise = await customTransaction.isPersisted.promise;

  const categoryIds = categories.map((category) => category.id);
  await syncFinanceProjectCategories(ids, categoryIds, userId);

  return promise;
};

/**
 * Deletes a Finance Project.
 *
 * @param id - The ID or IDs of the project to delete
 * @returns Transaction object with isPersisted promise
 */
export const deleteFinanceProject = (id: string | string[]) => {
  return financeProjectsCollection.delete(id);
};

/**
 * Synchronizes the Many-to-Many relations between Finance Project and Finance Categories.
 * Deletes old relations and creates new ones based on categoryIds.
 * Can handle a single project ID or an array of project IDs.
 *
 * @param projectIds - The project ID or array of project IDs
 * @param categoryIds - Array of category IDs to associate
 * @param userId - The user ID
 */
export async function syncFinanceProjectCategories(
  projectIds: string[],
  categoryIds: string[],
  userId: string
): Promise<void> {
  // Normalize to array
  const newCategoryIds = categoryIds || [];

  // 1. Get all existing relations for all projects
  const placeholders = projectIds.map(() => "?").join(",");
  const existingRelations = await db.getAll<{
    id: string;
    finance_project_id: string;
    finance_category_id: string;
  }>(
    `SELECT id, finance_project_id, finance_category_id FROM finance_project_category WHERE finance_project_id IN (${placeholders})`,
    projectIds
  );

  // 2. Process each project separately
  const allDeletePromises: ReturnType<
    typeof financeProjectCategoriesCollection.delete
  >[] = [];
  const allInsertPromises: ReturnType<
    typeof financeProjectCategoriesCollection.insert
  >[] = [];

  for (const currentProjectId of projectIds) {
    // Get existing relations for this specific project
    const projectRelations = existingRelations.filter(
      (r) => r.finance_project_id === currentProjectId
    );
    const existingCategoryIds = projectRelations.map(
      (r) => r.finance_category_id
    );

    // Find relations to delete (in existing but not in new)
    const relationsToDelete = projectRelations.filter(
      (relation) => !newCategoryIds.includes(relation.finance_category_id)
    );

    // Find categories to add (in new but not in existing)
    const categoriesToAdd = newCategoryIds.filter(
      (categoryId) => !existingCategoryIds.includes(categoryId)
    );

    // Delete old relations
    relationsToDelete.forEach((relation) => {
      allDeletePromises.push(
        financeProjectCategoriesCollection.delete(relation.id)
      );
    });

    // Create new relations
    categoriesToAdd.forEach((categoryId) => {
      allInsertPromises.push(
        financeProjectCategoriesCollection.insert({
          id: crypto.randomUUID(),
          finance_project_id: currentProjectId,
          finance_category_id: categoryId,
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
