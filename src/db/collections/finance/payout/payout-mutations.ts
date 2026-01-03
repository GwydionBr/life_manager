import { payoutsCollection } from "./payout-collection";
import { Tables, TablesUpdate } from "@/types/db.types";

/**
 * Adds a new Payout with side effects.
 * Returns the transaction for further processing.
 *
 * Side effects:
 * - Creates a single_cash_flow entry linked to the payout
 * - Updates timer_project.total_payout if timer_project_id is set
 * - Links timer_sessions to the payout if provided
 *
 * @param payout - The data of the new payout
 * @returns Transaction object with isPersisted promise
 */
export const addPayout = (payout: Tables<"payout">) => {
  const transaction = payoutsCollection.insert(payout);
  return transaction;
};

/**
 * Updates a Payout with side effects.
 *
 * Side effects:
 * - Updates the linked single_cash_flow if it exists
 * - Updates timer_project.total_payout if timer_project_id changed
 *
 * @param id - The ID or IDs of the payout to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
 */
export const updatePayout = (
  id: string | string[],
  item: TablesUpdate<"payout">
) => {
  const transaction = payoutsCollection.update(id, (draft) => {
    Object.assign(draft, item);
  });
  return transaction;
};

/**
 * Deletes a Payout.
 *
 * @param id - The ID or IDs of the payout to delete
 * @returns Transaction object with isPersisted promise
 */
export const deletePayout = (id: string | string[]) => {
  const transaction = payoutsCollection.delete(id);
  return transaction;
};
