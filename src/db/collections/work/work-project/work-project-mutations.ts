import { db } from "@/db/powersync/db";
import {
  workProjectsCollection,
  workProjectCategoriesCollection,
} from "@/db/collections/work/work-project/work-project-collection";
import { WorkProject } from "@/types/work.types";
import { Tables, TablesUpdate } from "@/types/db.types";

/**
 * Adds a new Work Project.
 * Returns the transaction for further processing.
 *
 * @param newWorkProject - The data of the new project
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise
 */
export const addWorkProject = (
  newWorkProject: Omit<Tables<"timer_project">, "categories">,
  userId: string
) => {
  const transaction = workProjectsCollection.insert({
    ...newWorkProject,
    id: newWorkProject.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
  });

  return transaction;
};

/**
 * Updates a Work Project.
 *
 * @param id - The ID or IDs of the project to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
 */
export const updateWorkProject = (
  id: string | string[],
  item: TablesUpdate<"timer_project">
) => {
  return workProjectsCollection.update(id, (draft) => {
    Object.assign(draft, item);
  });
};

/**
 * Deletes a Work Project.
 *
 * @param id - The ID or IDs of the project to delete
 * @returns Transaction object with isPersisted promise
 */
export const deleteWorkProject = (id: string | string[]) => {
  return workProjectsCollection.delete(id);
};

/**
 * Synchronizes the Many-to-Many relations between Project and Finance Categories.
 * Deletes old relations and creates new ones based on categoryIds.
 *
 * @param projectId - The project ID
 * @param categoryIds - Array of category IDs to associate
 * @param userId - The user ID
 */
export async function syncProjectCategories(
  projectId: string,
  categoryIds: string[],
  userId: string
): Promise<void> {
  // 1. Get all existing relations for this project
  const existingRelations = await db.getAll<{
    id: string;
    finance_category_id: string;
  }>(
    "SELECT id, finance_category_id FROM timer_project_category WHERE timer_project_id = ?",
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
    workProjectCategoriesCollection.delete(relation.id)
  );

  // 5. Create new relations
  const insertPromises = categoriesToAdd.map((categoryId) =>
    workProjectCategoriesCollection.insert({
      id: crypto.randomUUID(),
      timer_project_id: projectId,
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
 * Loads a complete WorkProject with all Categories.
 *
 * @param projectId - The project ID
 * @returns Complete WorkProject or undefined if not found
 */
export async function getWorkProjectWithCategories(
  projectId: string
): Promise<WorkProject | undefined> {
  // Get the project
  const project = await db.getOptional<Omit<WorkProject, "categories">>(
    "SELECT * FROM timer_project WHERE id = ?",
    [projectId]
  );

  if (!project) return undefined;

  // Get the associated categories
  const categoryRelations = await db.getAll<{
    finance_category_id: string;
  }>(
    "SELECT finance_category_id FROM timer_project_category WHERE timer_project_id = ?",
    [projectId]
  );

  const categoryIds = categoryRelations.map((r) => r.finance_category_id);

  // Get the complete category data
  const categories =
    categoryIds.length > 0
      ? await db.getAll(
          `SELECT * FROM finance_category WHERE id IN (${categoryIds.map(() => "?").join(",")})`,
          categoryIds
        )
      : [];

  return {
    ...project,
    tags: categories || [],
  } as WorkProject;
}
