import { createCollection } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  singleCashflowDeserializationSchema,
  singleCashflowSchema,
  singleCashflowTagSchema,
  singleCashflowTagDeserializationSchema,
} from "@/db/collections/finance/single-cashflow/single-cashflow-schema";

// Collection based on the PowerSync table 'single_cashflow'
export const singleCashflowsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.single_cashflow,
    schema: singleCashflowSchema,
    deserializationSchema: singleCashflowDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

// Collection based on the PowerSync table 'single_cashflow_tag'
export const singleCashflowTagsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.single_cashflow_tag,
    schema: singleCashflowTagSchema,
    deserializationSchema: singleCashflowTagDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);
