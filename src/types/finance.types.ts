import { Tables, TablesInsert, TablesUpdate } from "./db.types";

// Payout Types
export type Payout = Tables<"payout"> & {
  cashflow: Tables<"single_cashflow"> | null;
  work_project: Tables<"work_project"> | null;
  work_time_entries: Tables<"work_time_entry">[];
};

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
export type SingleCashFlow = Tables<"single_cashflow"> & {
  tags: Tables<"tag">[];
};
export type InsertSingleCashFlow = TablesInsert<"single_cashflow"> & {
  tags?: Tables<"tag">[];
};
export type UpdateSingleCashFlow = TablesUpdate<"single_cashflow"> & {
  tags?: Tables<"tag">[];
};
// Recurring Cash Flow Types
export type RecurringCashFlow = Tables<"recurring_cashflow"> & {
  tags: Tables<"tag">[];
};
export type InsertRecurringCashFlow = TablesInsert<"recurring_cashflow"> & {
  tags?: Tables<"tag">[];
};
export type UpdateRecurringCashFlow = TablesUpdate<"recurring_cashflow"> & {
  tags?: Tables<"tag">[];
};
// Finance Project Types
export type FinanceProject = Tables<"finance_project"> & {
  adjustments: Tables<"finance_project_adjustment">[];
  contact: Tables<"contact"> | null;
  tags: Tables<"tag">[];
};
export type UpdateFinanceProject = TablesUpdate<"finance_project"> & {
  tags: Tables<"tag">[];
  contact: Tables<"contact"> | null;
  adjustments: Tables<"finance_project_adjustment">[];
};
export type InsertFinanceProject = TablesInsert<"finance_project"> & {
  tags: Tables<"tag">[];
  contact: Tables<"contact"> | null;
};

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
