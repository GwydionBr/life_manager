import { Tables, TablesInsert, TablesUpdate } from "./db.types";

// Payout Types
export interface Payout extends Tables<"payout"> {
  cashflow: Tables<"single_cash_flow"> | null;
  timer_project: Tables<"timer_project"> | null;
  timer_sessions: Tables<"timer_session">[];
}

// Bank Account Types
export type BankAccount = Tables<"bank_account">;
export type InsertBankAccount = TablesInsert<"bank_account">;
export type UpdateBankAccount = TablesUpdate<"bank_account">;

// Single Cash Flow Types
export interface SingleCashFlow extends Tables<"single_cash_flow"> {
  categories: Tables<"finance_category">[];
}
export interface InsertSingleCashFlow extends TablesInsert<"single_cash_flow"> {
  categories: Tables<"finance_category">[];
}
export interface UpdateSingleCashFlow extends TablesUpdate<"single_cash_flow"> {
  categories: Tables<"finance_category">[];
}

// Recurring Cash Flow Types
export interface RecurringCashFlow extends Tables<"recurring_cash_flow"> {
  categories: Tables<"finance_category">[];
}
export interface InsertRecurringCashFlow extends TablesInsert<"recurring_cash_flow"> {
  categories: Tables<"finance_category">[];
}
export interface UpdateRecurringCashFlow extends TablesUpdate<"recurring_cash_flow"> {
  categories: Tables<"finance_category">[];
}

// Finance Project Types
export interface FinanceProject extends Tables<"finance_project"> {
  adjustments: Tables<"finance_project_adjustment">[];
  client: Tables<"finance_client"> | null;
  categories: Tables<"finance_category">[];
}
export interface UpdateFinanceProject extends TablesUpdate<"finance_project"> {
  categories: Tables<"finance_category">[];
  client: Tables<"finance_client"> | null;
  adjustments: Tables<"finance_project_adjustment">[];
}
export interface InsertFinanceProject extends TablesInsert<"finance_project"> {
  categories: Tables<"finance_category">[];
  client: Tables<"finance_client"> | null;
}

// Delete Recurring Cash Flow Mode
export enum DeleteRecurringCashFlowMode {
  delete_all = "delete_all",
  keep_unlinked = "keep_unlinked",
}

export interface FinanceRule extends Tables<"finance_rule"> {
  financeCategoryIds: string[];
  timerProjectIds: string[];
}

export type FinanceNavbarItem = {
  totalAmount: number;
  projectCount: number;
};

export type FinanceNavbarItems = {
  [key in FinanceProjectNavbarTab]: FinanceNavbarItem;
};

export enum FinanceProjectNavbarTab {
  All = "all",
  Upcoming = "upcoming",
  Overdue = "overdue",
  Paid = "paid",
}

export enum FinanceTab {
  Analysis = "Analysis",
  Projects = "Projects",
  Single = "Single",
  Recurring = "Recurring",
  Payout = "Payout",
}
