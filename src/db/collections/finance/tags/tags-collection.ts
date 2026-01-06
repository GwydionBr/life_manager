import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  tagsSchema,
  tagsDeserializationSchema,
} from "@/db/collections/finance/tags/tags-schema";

// Collection basierend auf der PowerSync-Tabelle 'bank_account'
export const tagsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.tag,
    schema: tagsSchema,
    deserializationSchema: tagsDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const useTags = () =>
  useLiveQuery((q) => q.from({ financeCategories: tagsCollection }));
