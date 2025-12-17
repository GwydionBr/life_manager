import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  financeCategorySchema,
  financeCategoryDeserializationSchema,
} from "@/db/collections/finance/finance-category/finance-category-schema";

// Collection basierend auf der PowerSync-Tabelle 'bank_account'
export const financeCategoriesCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.finance_category,
    schema: financeCategorySchema,
    deserializationSchema: financeCategoryDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const useFinanceCategories = () =>
  useLiveQuery((q) => q.from({ financeCategories: financeCategoriesCollection }));
