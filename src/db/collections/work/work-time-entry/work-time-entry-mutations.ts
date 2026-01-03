import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";
import { db } from "@/db/powersync/db";
import { UpdateWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";
import { createTransaction } from "@tanstack/react-db";

/**
 * Adds a new Work Time Entry.
 * Returns the transaction for further processing.
 *
 * @param newWorkTimeEntry - The data of the new time entry or an array of time entries
 * @returns Transaction object with isPersisted promise
 */
export const addWorkTimeEntry = (
  newWorkTimeEntry: WorkTimeEntry[] | WorkTimeEntry
) => {
  const transaction = workTimeEntriesCollection.insert(newWorkTimeEntry);

  return transaction;
};

/**
 * Updates a Work Time Entry.
 *
 * @param id - The ID or IDs of the time entry to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
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
  await transaction.commit();
  const promise = await transaction.isPersisted.promise;
  return promise;
};

/**
 * Deletes a Work Time Entry.
 *
 * @param id - The ID or IDs of the time entry to delete
 * @returns Transaction object with isPersisted promise
 */
export const deleteWorkTimeEntry = (id: string | string[]) => {
  return workTimeEntriesCollection.delete(id);
};
