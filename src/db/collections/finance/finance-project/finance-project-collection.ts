import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  financeProjectSchema,
  financeProjectDeserializationSchema,
} from "@/db/collections/finance/finance-project/finance-project-schema";

// Collection basierend auf der PowerSync-Tabelle 'payout'
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

export const useFinanceProjects = () =>
  useLiveQuery((q) =>
    q.from({ financeProjects: financeProjectsCollection })
  );
