import { bankAccountsCollection } from "@/db/collections/finance/bank-account/bank-account-collection";
import {
  InsertBankAccount,
  UpdateBankAccount,
  BankAccount,
} from "@/types/finance.types";

/**
 * Adds a new Bank Account.
 *
 * @param newBankAccount - The data of the new bank account
 * @param userId - The user ID
 * @returns The new BankAccount or undefined if an error occurs
 */
export const addBankAccount = async (
  newBankAccount: InsertBankAccount,
  userId: string
) => {
  const bankAccountToInsert: BankAccount = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
    title: newBankAccount.title || "",
    description: newBankAccount.description || null,
    currency: newBankAccount.currency || "EUR",
    saldo: newBankAccount.saldo || 0,
    saldo_set_at: newBankAccount.saldo_set_at || new Date().toISOString(),
    is_default: newBankAccount.is_default || false,
  };

  try {
    const transaction = bankAccountsCollection.insert(bankAccountToInsert);
    await transaction.isPersisted.promise;
    return bankAccountToInsert;
  } catch (error) {
    console.error(error);
    return;
  }
};

/**
 * Updates a Bank Account.
 *
 * @param id - The ID of the bank account to update
 * @param item - The item to update
 * @returns Returns true if the bank account was updated, false otherwise
 */
export const updateBankAccount = async (
  id: string,
  item: UpdateBankAccount
) => {
  try {
    const transaction = bankAccountsCollection.update(id, (draft) => {
      Object.assign(draft, item);
    });
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Deletes a Bank Account.
 *
 * @param id - The ID or IDs of the bank account to delete
 * @returns True if the bank account was deleted, false otherwise
 */
export const deleteBankAccount = async (id: string | string[]) => {
  try {
    const transaction = bankAccountsCollection.delete(id);
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
