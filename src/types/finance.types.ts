import { Tables, TablesInsert, TablesUpdate } from "./db.types";

// Payout Types
export interface Payout extends Tables<"payout"> {
  cashflow: Tables<"single_cashflow"> | null;
  work_project: Tables<"work_project"> | null;
  work_time_entries: Tables<"work_time_entry">[];
}

// Bank Account Types
export type BankAccount = Tables<"bank_account">;
export type InsertBankAccount = TablesInsert<"bank_account">;
export type UpdateBankAccount = TablesUpdate<"bank_account">;

// Tag Types
export type Tag = Tables<"tag">;
export type InsertTag = TablesInsert<"tag">;
export type UpdateTag = TablesUpdate<"tag">;

// Contact Types
export type Contact = Tables<"contact">;
export type InsertContact = TablesInsert<"contact">;
export type UpdateContact = TablesUpdate<"contact">;

// Single Cash Flow Types
export interface SingleCashFlow extends Tables<"single_cashflow"> {
  tags: Tables<"tag">[];
}
export interface InsertSingleCashFlow extends TablesInsert<"single_cashflow"> {
  tags: Tables<"tag">[];
}
export interface UpdateSingleCashFlow extends TablesUpdate<"single_cashflow"> {
  tags: Tables<"tag">[];
}

// Recurring Cash Flow Types
export interface RecurringCashFlow extends Tables<"recurring_cashflow"> {
  tags: Tables<"tag">[];
}
export interface InsertRecurringCashFlow extends TablesInsert<"recurring_cashflow"> {
  tags: Tables<"tag">[];
}
export interface UpdateRecurringCashFlow extends TablesUpdate<"recurring_cashflow"> {
  tags: Tables<"tag">[];
}

// Finance Project Types
export interface FinanceProject extends Tables<"finance_project"> {
  adjustments: Tables<"finance_project_adjustment">[];
  contact: Tables<"contact"> | null;
  tags: Tables<"tag">[];
}
export interface UpdateFinanceProject extends TablesUpdate<"finance_project"> {
  tags: Tables<"tag">[];
  contact: Tables<"contact"> | null;
  adjustments: Tables<"finance_project_adjustment">[];
}
export interface InsertFinanceProject extends TablesInsert<"finance_project"> {
  tags: Tables<"tag">[];
  contact: Tables<"contact"> | null;
}

export type ProjectAdjustment = Tables<"finance_project_adjustment">;
export type InsertProjectAdjustment =
  TablesInsert<"finance_project_adjustment">;
export type UpdateProjectAdjustment =
  TablesUpdate<"finance_project_adjustment">;

// Delete Recurring Cash Flow Mode
export enum DeleteRecurringCashFlowMode {
  delete_all = "delete_all",
  keep_unlinked = "keep_unlinked",
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
