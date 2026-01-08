import { db } from "@/db/powersync/db";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";
import { createTransaction } from "@tanstack/react-db";
import {
  recurringCashflowsCollection,
  recurringCashflowTagsCollection,
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
 * @returns Created cashflow or undefined if an error occurs
 */
export const addRecurringCashflowMutation = async (
  newRecurringCashflow: InsertRecurringCashFlow,
  userId: string
): Promise<RecurringCashFlow | undefined> => {
  const customTransaction = createTransaction({
    autoCommit: false,
    mutationFn: async ({ transaction }) => {
      // Use PowerSyncTransactor to apply the transaction to PowerSync
      await new PowerSyncTransactor({ database: db }).applyTransaction(
        transaction
      );
    },
  });
  const { tags, ...cashflowData } = newRecurringCashflow;
  const dataToInsert = {
    ...cashflowData,
    currency: newRecurringCashflow.currency || "EUR",
    start_date: newRecurringCashflow.start_date || new Date().toISOString(),
    end_date: newRecurringCashflow.end_date || null,
    contact_id: newRecurringCashflow.contact_id || null,
    interval: newRecurringCashflow.interval || "month",
    title: newRecurringCashflow.title || "",
    description: newRecurringCashflow.description || "",
    id: newRecurringCashflow.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
  };

  customTransaction.mutate(() => {
    recurringCashflowsCollection.insert(dataToInsert);
    if (tags) {
      tags.forEach((tag) => {
        recurringCashflowTagsCollection.insert({
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          recurring_cashflow_id: dataToInsert.id,
          tag_id: tag.id,
          user_id: userId,
        });
      });
    }
  });

  try {
    await customTransaction.commit();
    await customTransaction.isPersisted.promise;
    return { ...dataToInsert, tags: tags ?? [] };
  } catch (error) {
    console.error(error);
    return;
  }
};

/**
 * Updates a Recurring Cashflow.
 *
 * @param id - The ID of the cashflow to update
 * @param item - The item to update
 * @returns True if the cashflow was updated, false if an error occurs
 */
export const updateRecurringCashflowMutation = async (
  id: string,
  item: UpdateRecurringCashFlow,
  userId: string
): Promise<boolean> => {
  const { tags, ...cashflowData } = item;
  try {
    const customTransaction = recurringCashflowsCollection.update(
      id,
      (draft) => {
        Object.assign(draft, cashflowData);
      }
    );

    await customTransaction.isPersisted.promise;
    if (tags) {
      const tagIds = tags.map((tag) => tag.id);
      await syncRecurringCashflowTags(id, tagIds, userId);
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Deletes a Recurring Cashflow.
 *
 * @param id - The ID or IDs of the cashflow to delete
 * @returns True if the cashflow was deleted, false if an error occurs
 */
export const deleteRecurringCashflowMutation = async (
  id: string | string[]
): Promise<boolean> => {
  try {
    const transaction = recurringCashflowsCollection.delete(id);
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Synchronizes the Many-to-Many relations between Recurring Cashflow and Finance Tags.
 * Deletes old relations and creates new ones based on tagIds.
 *
 * @param cashflowId - The cashflow ID
 * @param tagIds - Array of tag IDs to associate
 * @param userId - The user ID
 */
export async function syncRecurringCashflowTags(
  cashflowId: string,
  tagIds: string[],
  userId: string
): Promise<void> {
  // 1. Get all existing relations for this cashflow
  const existingRelations = await db.getAll<{
    id: string;
    tag_id: string;
  }>(
    "SELECT id, tag_id FROM recurring_cashflow_tag WHERE recurring_cashflow_id = ?",
    [cashflowId]
  );

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
    recurringCashflowTagsCollection.delete(relation.id)
  );

  // 5. Create new relations
  const insertPromises = tagsToAdd.map((tagId) =>
    recurringCashflowTagsCollection.insert({
      id: crypto.randomUUID(),
      recurring_cashflow_id: cashflowId,
      tag_id: tagId,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
  );

  // 6. Wait for all transactions
  const allTransactions = [...deletePromises, ...insertPromises];
  await Promise.all(allTransactions.map((tx) => tx.isPersisted.promise));
}
