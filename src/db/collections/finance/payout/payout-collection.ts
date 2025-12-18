import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  payoutSchema,
  payoutDeserializationSchema,
} from "@/db/collections/finance/payout/payout-schema";

// Collection basierend auf der PowerSync-Tabelle 'payout'
export const payoutsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.payout,
    schema: payoutSchema,
    deserializationSchema: payoutDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const usePayouts = () =>
  useLiveQuery((q) => q.from({ payouts: payoutsCollection }));
