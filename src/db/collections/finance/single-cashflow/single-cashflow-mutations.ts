import { db } from "@/db/powersync/db";
import {
  singleCashflowsCollection,
  singleCashflowCategoriesCollection,
} from "./single-cashflow-collection";
import {
  InsertSingleCashFlow,
  SingleCashFlow,
  UpdateSingleCashFlow,
} from "@/types/finance.types";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";
import { createTransaction } from "@tanstack/react-db";

/**
 * Adds a new Single Cashflow.
 * Returns the transaction for further processing.
 *
 * @param newSingleCashflow - The data of the new cashflow
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise and created cashflows
 */
export const addSingleCashflowMutation = async (
  newSingleCashflow: InsertSingleCashFlow | InsertSingleCashFlow[],
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
  // Create Array of cashflows to insert
  const cashflowsToInsert = Array.isArray(newSingleCashflow)
    ? newSingleCashflow
    : [newSingleCashflow];

  const allNewSingleCashflows: SingleCashFlow[] = [];

  customTransaction.mutate(() =>
    cashflowsToInsert.forEach((cashflow) => {
      // Extract categories and cashflow data
      const { tags: categories, ...cashflowData } = cashflow;
      // Generate cashflow ID
      const cashflowId = cashflowData.id || crypto.randomUUID();
      // Insert cashflow
      const newCashFlow = {
        ...cashflowData,
        id: cashflowId,
        created_at: new Date().toISOString(),
        title: cashflowData.title || "",
        currency: cashflowData.currency || "EUR",
        date: cashflowData.date || new Date().toISOString(),
        finance_client_id: cashflowData.finance_client_id || null,
        finance_project_id: cashflowData.finance_project_id || null,
        recurring_cash_flow_id: cashflowData.recurring_cash_flow_id || null,
        is_active: cashflowData.is_active || true,
        payout_id: cashflowData.payout_id || null,
        changed_date: cashflowData.changed_date || null,
        user_id: userId,
      };
      singleCashflowsCollection.insert(newCashFlow);
      // Insert categories
      categories.forEach((category) => {
        singleCashflowCategoriesCollection.insert({
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          single_cash_flow_id: cashflowId,
          finance_category_id: category.id,
          user_id: userId,
        });
      });
      allNewSingleCashflows.push({ ...newCashFlow, tags: categories });
    })
  );

  await customTransaction.commit();
  const promise = await customTransaction.isPersisted.promise;
  return { promise, data: allNewSingleCashflows };
};

/**
 * Updates a Single Cashflow.
 *
 * @param id - The ID or IDs of the cashflow to update
 * @param item - The item to update
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise
 */
export const updateSingleCashflowMutation = async (
  id: string | string[],
  item: UpdateSingleCashFlow,
  userId: string
) => {
  const ids = Array.isArray(id) ? id : [id];
  const { tags: categories, ...cashflowData } = item;

  const customTransaction = createTransaction({
    autoCommit: false,
    mutationFn: async ({ transaction }) => {
      // Use PowerSyncTransactor to apply the transaction to PowerSync
      await new PowerSyncTransactor({ database: db }).applyTransaction(
        transaction
      );
    },
  });

  // Update each cashflow individually to ensure mutations are created
  customTransaction.mutate(() =>
    ids.forEach((cashflowId) => {
      singleCashflowsCollection.update(cashflowId, (draft) => {
        Object.assign(draft, cashflowData);
      });
    })
  );

  // Wait for all updates to complete
  await customTransaction.commit();
  const promise = await customTransaction.isPersisted.promise;

  // Sync categories for all updated cashflows
  const categoryIds = categories.map((category) => category.id);
  await syncSingleCashflowCategories(ids, categoryIds, userId);

  // Return the first transaction (or create a combined one if needed)
  return promise;
};

/**
 * Deletes a Single Cashflow.
 *
 * @param id - The ID or IDs of the cashflow to delete
 * @returns Transaction object with isPersisted promise
 */
export const deleteSingleCashflowMutation = (id: string | string[]) => {
  return singleCashflowsCollection.delete(id);
};

/**
 * Synchronizes the Many-to-Many relations between Single Cashflow and Finance Categories.
 * Deletes old relations and creates new ones based on categoryIds.
 * Can handle a single cashflow ID or an array of cashflow IDs.
 *
 * @param cashflowId - The cashflow ID or array of cashflow IDs
 * @param categoryIds - Array of category IDs to associate
 * @param userId - The user ID
 */
export async function syncSingleCashflowCategories(
  cashflowIds: string[],
  categoryIds: string[],
  userId: string
): Promise<void> {
  // Normalize to array
  const newCategoryIds = categoryIds || [];

  // 1. Get all existing relations for all cashflows
  const placeholders = cashflowIds.map(() => "?").join(",");
  const existingRelations = await db.getAll<{
    id: string;
    single_cash_flow_id: string;
    finance_category_id: string;
  }>(
    `SELECT id, single_cash_flow_id, finance_category_id FROM single_cash_flow_category WHERE single_cash_flow_id IN (${placeholders})`,
    cashflowIds
  );

  // 2. Process each cashflow separately
  const allDeletePromises: ReturnType<
    typeof singleCashflowCategoriesCollection.delete
  >[] = [];
  const allInsertPromises: ReturnType<
    typeof singleCashflowCategoriesCollection.insert
  >[] = [];

  for (const currentCashflowId of cashflowIds) {
    // Get existing relations for this specific cashflow
    const cashflowRelations = existingRelations.filter(
      (r) => r.single_cash_flow_id === currentCashflowId
    );
    const existingCategoryIds = cashflowRelations.map(
      (r) => r.finance_category_id
    );

    // Find relations to delete (in existing but not in new)
    const relationsToDelete = cashflowRelations.filter(
      (relation) => !newCategoryIds.includes(relation.finance_category_id)
    );

    // Find categories to add (in new but not in existing)
    const categoriesToAdd = newCategoryIds.filter(
      (categoryId) => !existingCategoryIds.includes(categoryId)
    );

    // Delete old relations
    relationsToDelete.forEach((relation) => {
      allDeletePromises.push(
        singleCashflowCategoriesCollection.delete(relation.id)
      );
    });

    // Create new relations
    categoriesToAdd.forEach((categoryId) => {
      allInsertPromises.push(
        singleCashflowCategoriesCollection.insert({
          id: crypto.randomUUID(),
          single_cash_flow_id: currentCashflowId,
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
