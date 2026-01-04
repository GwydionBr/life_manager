import { db } from "@/db/powersync/db";
import {
  financeProjectsCollection,
  financeProjectCategoriesCollection,
} from "./finance-project-collection";
import { FinanceProject, InsertFinanceProject } from "@/types/finance.types";
import { Tables, TablesUpdate } from "@/types/db.types";
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
export const updateFinanceProject = (
  id: string | string[],
  item: TablesUpdate<"finance_project">
) => {
  return financeProjectsCollection.update(id, (draft) => {
    Object.assign(draft, item);
  });
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
 *
 * @param projectId - The project ID
 * @param categoryIds - Array of category IDs to associate
 * @param userId - The user ID
 */
export async function syncFinanceProjectCategories(
  projectId: string,
  categoryIds: string[],
  userId: string
): Promise<void> {
  // 1. Get all existing relations for this project
  const existingRelations = await db.getAll<{
    id: string;
    finance_category_id: string;
  }>(
    "SELECT id, finance_category_id FROM finance_project_category WHERE finance_project_id = ?",
    [projectId]
  );

  const existingCategoryIds = existingRelations.map(
    (r) => r.finance_category_id
  );
  const newCategoryIds = categoryIds || [];

  // 2. Find relations to delete (in existing but not in new)
  const relationsToDelete = existingRelations.filter(
    (relation) => !newCategoryIds.includes(relation.finance_category_id)
  );

  // 3. Find categories to add (in new but not in existing)
  const categoriesToAdd = newCategoryIds.filter(
    (categoryId) => !existingCategoryIds.includes(categoryId)
  );

  // 4. Delete old relations
  const deletePromises = relationsToDelete.map((relation) =>
    financeProjectCategoriesCollection.delete(relation.id)
  );

  // 5. Create new relations
  const insertPromises = categoriesToAdd.map((categoryId) =>
    financeProjectCategoriesCollection.insert({
      id: crypto.randomUUID(),
      finance_project_id: projectId,
      finance_category_id: categoryId,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
  );

  // 6. Wait for all transactions
  const allTransactions = [...deletePromises, ...insertPromises];
  await Promise.all(allTransactions.map((tx) => tx.isPersisted.promise));
}

/**
 * Loads a complete FinanceProject with all Categories.
 *
 * @param projectId - The project ID
 * @returns Complete FinanceProject or undefined if not found
 */
export async function getFinanceProjectWithCategories(
  projectId: string
): Promise<FinanceProject | undefined> {
  // Get the project
  const project = await db.getOptional<
    Omit<FinanceProject, "categories" | "adjustments" | "finance_client">
  >("SELECT * FROM finance_project WHERE id = ?", [projectId]);

  if (!project) return undefined;

  // Get the associated categories
  const categoryRelations = await db.getAll<{
    finance_category_id: string;
  }>(
    "SELECT finance_category_id FROM finance_project_category WHERE finance_project_id = ?",
    [projectId]
  );

  const categoryIds = categoryRelations.map((r) => r.finance_category_id);

  // Get the complete category data
  const categories =
    categoryIds.length > 0
      ? await db.getAll<Tables<"finance_category">>(
          `SELECT * FROM finance_category WHERE id IN (${categoryIds.map(() => "?").join(",")})`,
          categoryIds
        )
      : [];

  return {
    ...project,
    categories: categories || [],
    adjustments: [],
    finance_client: null,
  } as FinanceProject;
}
