import { db } from "@/db/powersync/db";
import {
  singleCashflowsCollection,
  singleCashflowCategoriesCollection,
} from "./single-cashflow-collection";
import { SingleCashFlow } from "@/types/finance.types";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";

/**
 * Adds a new Single Cashflow.
 * Returns the transaction for further processing.
 *
 * @param newSingleCashflow - The data of the new cashflow
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise
 */
export const addSingleCashflow = (
  newSingleCashflow: Omit<TablesInsert<"single_cash_flow">, "categories">,
  userId: string
) => {
  const transaction = singleCashflowsCollection.insert({
    ...newSingleCashflow,
    id: newSingleCashflow.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    title: newSingleCashflow.title || "",
    currency: newSingleCashflow.currency || "EUR",
    date: newSingleCashflow.date || new Date().toISOString(),
    finance_client_id: newSingleCashflow.finance_client_id || null,
    finance_project_id: newSingleCashflow.finance_project_id || null,
    recurring_cash_flow_id: newSingleCashflow.recurring_cash_flow_id || null,
    is_active: newSingleCashflow.is_active || true,
    payout_id: newSingleCashflow.payout_id || null,
    changed_date: newSingleCashflow.changed_date || null,
    user_id: userId,
  });

  return transaction;
};

/**
 * Updates a Single Cashflow.
 *
 * @param id - The ID or IDs of the cashflow to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
 */
export const updateSingleCashflow = (
  id: string | string[],
  item: TablesUpdate<"single_cash_flow">
) => {
  return singleCashflowsCollection.update(id, (draft) => {
    Object.assign(draft, item);
  });
};

/**
 * Deletes a Single Cashflow.
 *
 * @param id - The ID or IDs of the cashflow to delete
 * @returns Transaction object with isPersisted promise
 */
export const deleteSingleCashflow = (id: string | string[]) => {
  return singleCashflowsCollection.delete(id);
};

/**
 * Synchronizes the Many-to-Many relations between Single Cashflow and Finance Categories.
 * Deletes old relations and creates new ones based on categoryIds.
 *
 * @param cashflowId - The cashflow ID
 * @param categoryIds - Array of category IDs to associate
 * @param userId - The user ID
 */
export async function syncSingleCashflowCategories(
  cashflowId: string,
  categoryIds: string[],
  userId: string
): Promise<void> {
  // 1. Get all existing relations for this cashflow
  const existingRelations = await db.getAll<{
    id: string;
    finance_category_id: string;
  }>(
    "SELECT id, finance_category_id FROM single_cash_flow_category WHERE single_cash_flow_id = ?",
    [cashflowId]
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
    singleCashflowCategoriesCollection.delete(relation.id)
  );

  // 5. Create new relations
  const insertPromises = categoriesToAdd.map((categoryId) =>
    singleCashflowCategoriesCollection.insert({
      id: crypto.randomUUID(),
      single_cash_flow_id: cashflowId,
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
 * Loads a complete SingleCashFlow with all Categories.
 *
 * @param cashflowId - The cashflow ID
 * @returns Complete SingleCashFlow or undefined if not found
 */
export async function getSingleCashflowWithCategories(
  cashflowId: string
): Promise<SingleCashFlow | undefined> {
  // Get the cashflow
  const cashflow = await db.getOptional<Omit<SingleCashFlow, "categories">>(
    "SELECT * FROM single_cash_flow WHERE id = ?",
    [cashflowId]
  );

  if (!cashflow) return undefined;

  // Get the associated categories
  const categoryRelations = await db.getAll<{
    finance_category_id: string;
  }>(
    "SELECT finance_category_id FROM single_cash_flow_category WHERE single_cash_flow_id = ?",
    [cashflowId]
  );

  const categoryIds = categoryRelations.map((r) => r.finance_category_id);

  // Get the complete category data
  const categories =
    categoryIds.length > 0
      ? await db
          .getAll<
            Tables<"finance_category">
          >(`SELECT * FROM finance_category WHERE id IN (${categoryIds.map(() => "?").join(",")})`, categoryIds)
          .then((cats) => cats.map((cat) => ({ finance_category: cat })))
      : [];

  return {
    ...cashflow,
    categories: categories || [],
  } as SingleCashFlow;
}
