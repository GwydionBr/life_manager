import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  recurringCashflowDeserializationSchema,
  recurringCashflowSchema,
} from "@/db/collections/finance/recurring-cashflow/recurring-cashflow-schema";

// Collection basierend auf der PowerSync-Tabelle 'payout'
export const recurringCashflowsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.recurring_cash_flow,
    schema: recurringCashflowSchema,
    deserializationSchema: recurringCashflowDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const useRecurringCashflows = () =>
  useLiveQuery((q) =>
    q.from({ recurringCashflows: recurringCashflowsCollection })
  );
