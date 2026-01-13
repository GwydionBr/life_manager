import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";
import { db } from "@/db/powersync/db";
import { UpdateWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";
import { createTransaction } from "@tanstack/react-db";

/**
 * Adds a new Work Time Entry.
 *
 * @param newWorkTimeEntry - The data of the new time entry or an array of time entries
 * @returns The new time entry or an array of time entries or undefined if the operation failed
 */
export const addWorkTimeEntry = async (
  newWorkTimeEntry: WorkTimeEntry[]
) => {
  try {
    const transaction = workTimeEntriesCollection.insert(newWorkTimeEntry);
    await transaction.isPersisted.promise;
    return newWorkTimeEntry;
  } catch (error) {
    console.error(error);
    return;
  }
};

/**
 * Updates a Work Time Entry.
 *
 * @param id - The ID or IDs of the time entry to update
 * @param item - The item to update
 * @returns True if the time entry was updated, false otherwise
 */
export const updateWorkTimeEntry = async (
  id: string | string[],
  item: UpdateWorkTimeEntry
) => {
  const ids = Array.isArray(id) ? id : [id];
  const transaction = createTransaction({
    autoCommit: false,
    mutationFn: async ({ transaction }) => {
      // Use PowerSyncTransactor to apply the transaction to PowerSync
      await new PowerSyncTransactor({ database: db }).applyTransaction(
        transaction
      );
    },
  });
  transaction.mutate(() =>
    ids.forEach((id) => {
      workTimeEntriesCollection.update(id, (draft) => {
        Object.assign(draft, item);
      });
    })
  );
  try {
    await transaction.commit();
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Deletes a Work Time Entry.
 *
 * @param id - The ID or IDs of the time entry to delete
 * @returns True if the time entry was deleted, false otherwise
 */
export const deleteWorkTimeEntry = async (id: string | string[]) => {
  try {
    const transaction = workTimeEntriesCollection.delete(id);
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
