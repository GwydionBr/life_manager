import { db } from "@/db/powersync/db";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";
import { createTransaction } from "@tanstack/react-db";
import {
  recurringCashflowsCollection,
  recurringCashflowCategoriesCollection,
} from "./recurring-cashflow-collection";
import {
  InsertRecurringCashFlow,
  RecurringCashFlow,
  UpdateRecurringCashFlow,
} from "@/types/finance.types";

/**
 * Adds a new Recurring Cashflow.
 * Returns the transaction for further processing.
 *
 * @param newRecurringCashflow - The data of the new cashflow
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise and created cashflow
 */
export const addRecurringCashflowMutation = async (
  newRecurringCashflow: InsertRecurringCashFlow,
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
  const { tags: categories, ...cashflowData } = newRecurringCashflow;
  const dataToInsert = {
    ...cashflowData,
    currency: newRecurringCashflow.currency || "EUR",
    start_date: newRecurringCashflow.start_date || new Date().toISOString(),
    end_date: newRecurringCashflow.end_date || null,
    finance_client_id: newRecurringCashflow.finance_client_id || null,
    interval: newRecurringCashflow.interval || "month",
    title: newRecurringCashflow.title || "",
    description: newRecurringCashflow.description || "",
    id: newRecurringCashflow.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
  };

  customTransaction.mutate(() => {
    recurringCashflowsCollection.insert(dataToInsert);
    categories.forEach((category) => {
      recurringCashflowCategoriesCollection.insert({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        recurring_cash_flow_id: dataToInsert.id,
        finance_category_id: category.id,
        user_id: userId,
      });
    });
  });

  await customTransaction.commit();
  const promise = await customTransaction.isPersisted.promise;

  return {
    promise,
    data: { ...dataToInsert, tags: categories } as RecurringCashFlow,
  };
};

/**
 * Updates a Recurring Cashflow.
 *
 * @param id - The ID of the cashflow to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
 */
export const updateRecurringCashflowMutation = async (
  id: string,
  item: UpdateRecurringCashFlow,
  userId: string
) => {
  const { tags: categories, ...cashflowData } = item;
  const customTransaction = recurringCashflowsCollection.update(id, (draft) => {
    Object.assign(draft, cashflowData);
  });

  const promise = await customTransaction.isPersisted.promise;
  const categoryIds = categories.map((category) => category.id);
  await syncRecurringCashflowCategories(id, categoryIds, userId);

  return promise;
};

/**
 * Deletes a Recurring Cashflow.
 *
 * @param id - The ID or IDs of the cashflow to delete
 * @returns Transaction object with isPersisted promise
 */
export const deleteRecurringCashflowMutation = (id: string | string[]) => {
  return recurringCashflowsCollection.delete(id);
};

/**
 * Synchronizes the Many-to-Many relations between Recurring Cashflow and Finance Categories.
 * Deletes old relations and creates new ones based on categoryIds.
 *
 * @param cashflowId - The cashflow ID
 * @param categoryIds - Array of category IDs to associate
 * @param userId - The user ID
 */
export async function syncRecurringCashflowCategories(
  cashflowId: string,
  categoryIds: string[],
  userId: string
): Promise<void> {
  // 1. Get all existing relations for this cashflow
  const existingRelations = await db.getAll<{
    id: string;
    finance_category_id: string;
  }>(
    "SELECT id, finance_category_id FROM recurring_cash_flow_category WHERE recurring_cash_flow_id = ?",
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
    recurringCashflowCategoriesCollection.delete(relation.id)
  );

  // 5. Create new relations
  const insertPromises = categoriesToAdd.map((categoryId) =>
    recurringCashflowCategoriesCollection.insert({
      id: crypto.randomUUID(),
      recurring_cash_flow_id: cashflowId,
      finance_category_id: categoryId,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
  );

  // 6. Wait for all transactions
  const allTransactions = [...deletePromises, ...insertPromises];
  await Promise.all(allTransactions.map((tx) => tx.isPersisted.promise));
}
