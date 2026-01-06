import { db } from "@/db/powersync/db";
import {
  singleCashflowsCollection,
  singleCashflowTagsCollection,
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
      // Extract tags and cashflow data
      const { tags, ...cashflowData } = cashflow;
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
        contact_id: cashflowData.contact_id || null,
        finance_project_id: cashflowData.finance_project_id || null,
        recurring_cashflow_id: cashflowData.recurring_cashflow_id || null,
        is_active: cashflowData.is_active || true,
        payout_id: cashflowData.payout_id || null,
        changed_date: cashflowData.changed_date || null,
        user_id: userId,
      };
      singleCashflowsCollection.insert(newCashFlow);
      // Insert tags
      tags.forEach((tag) => {
        singleCashflowTagsCollection.insert({
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          single_cashflow_id: cashflowId,
          tag_id: tag.id,
          user_id: userId,
        });
      });
      allNewSingleCashflows.push({ ...newCashFlow, tags });
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
  const { tags, ...cashflowData } = item;

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

  // Sync tags for all updated cashflows
  const tagIds = tags.map((tag) => tag.id);
  await syncSingleCashflowTags(ids, tagIds, userId);

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
 * Synchronizes the Many-to-Many relations between Single Cashflow and Finance Tags.
 * Deletes old relations and creates new ones based on tagIds.
 * Can handle a single cashflow ID or an array of cashflow IDs.
 *
 * @param cashflowId - The cashflow ID or array of cashflow IDs
 * @param tagIds - Array of tag IDs to associate
 * @param userId - The user ID
 */
export async function syncSingleCashflowTags(
  cashflowIds: string[],
  tagIds: string[],
  userId: string
): Promise<void> {
  // Normalize to array
  const newTagIds = tagIds || [];

  // 1. Get all existing relations for all cashflows
  const placeholders = cashflowIds.map(() => "?").join(",");
  const existingRelations = await db.getAll<{
    id: string;
    single_cashflow_id: string;
    tag_id: string;
  }>(
    `SELECT id, single_cashflow_id, tag_id FROM single_cashflow_tag WHERE single_cashflow_id IN (${placeholders})`,
    cashflowIds
  );

  // 2. Process each cashflow separately
  const allDeletePromises: ReturnType<
    typeof singleCashflowTagsCollection.delete
  >[] = [];
  const allInsertPromises: ReturnType<
    typeof singleCashflowTagsCollection.insert
  >[] = [];

  for (const currentCashflowId of cashflowIds) {
    // Get existing relations for this specific cashflow
    const cashflowRelations = existingRelations.filter(
      (r) => r.single_cashflow_id === currentCashflowId
    );
    const existingTagIds = cashflowRelations.map(
      (r) => r.tag_id
    );

    // Find relations to delete (in existing but not in new)
    const relationsToDelete = cashflowRelations.filter(
      (relation) => !newTagIds.includes(relation.tag_id)
    );

    // Find tags to add (in new but not in existing)
    const tagsToAdd = newTagIds.filter(
      (tagId) => !existingTagIds.includes(tagId)
    );

    // Delete old relations
    relationsToDelete.forEach((relation) => {
      allDeletePromises.push(singleCashflowTagsCollection.delete(relation.id));
    });

    // Create new relations
    tagsToAdd.forEach((tagId) => {
      allInsertPromises.push(
        singleCashflowTagsCollection.insert({
          id: crypto.randomUUID(),
          single_cashflow_id: currentCashflowId,
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
