import { createCollection } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  financeProjectSchema,
  financeProjectDeserializationSchema,
  financeProjectTagSchema,
  financeProjectTagDeserializationSchema,
} from "@/db/collections/finance/finance-project/finance-project-schema";

// Collection basierend auf der PowerSync-Tabelle 'finance_project'
export const financeProjectsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.finance_project,
    schema: financeProjectSchema,
    deserializationSchema: financeProjectDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

// Collection basierend auf der PowerSync-Tabelle 'finance_project_tag'
export const financeProjectTagsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.finance_project_tag,
    schema: financeProjectTagSchema,
    deserializationSchema: financeProjectTagDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

