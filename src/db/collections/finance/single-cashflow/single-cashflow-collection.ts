import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  singleCashflowDeserializationSchema,
  singleCashflowSchema,
} from "@/db/collections/finance/single-cashflow/single-cashflow-schema";

// Collection basierend auf der PowerSync-Tabelle 'payout'
export const singleCashflowsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.single_cash_flow,
    schema: singleCashflowSchema,
    deserializationSchema: singleCashflowDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const useSingleCashflows = () =>
  useLiveQuery((q) => q.from({ singleCashflows: singleCashflowsCollection }));
