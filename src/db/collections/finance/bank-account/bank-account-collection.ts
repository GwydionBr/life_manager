import { createCollection } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  bankAccountSchema,
  bankAccountDeserializationSchema,
} from "@/db/collections/finance/bank-account/bank-account-schema";

// Collection basierend auf der PowerSync-Tabelle 'bank_account'
export const bankAccountsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.bank_account,
    schema: bankAccountSchema,
    deserializationSchema: bankAccountDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);
