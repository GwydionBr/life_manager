import { createCollection } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  recurringCashflowDeserializationSchema,
  recurringCashflowSchema,
  recurringCashflowTagSchema,
  recurringCashflowTagDeserializationSchema,
} from "@/db/collections/finance/recurring-cashflow/recurring-cashflow-schema";

// Collection basierend auf der PowerSync-Tabelle 'recurring_cash_flow'
export const recurringCashflowsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.recurring_cashflow,
    schema: recurringCashflowSchema,
    deserializationSchema: recurringCashflowDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

// Collection basierend auf der PowerSync-Tabelle 'recurring_cashflow_tag'
export const recurringCashflowTagsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.recurring_cashflow_tag,
    schema: recurringCashflowTagSchema,
    deserializationSchema: recurringCashflowTagDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);
