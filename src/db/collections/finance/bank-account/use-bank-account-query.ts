import { useLiveQuery } from "@tanstack/react-db";
import { bankAccountsCollection } from "./bank-account-collection";

export const useBankAccounts = () =>
  useLiveQuery((q) => q.from({ bankAccounts: bankAccountsCollection }));
