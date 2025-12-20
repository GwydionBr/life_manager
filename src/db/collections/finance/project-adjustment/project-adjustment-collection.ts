import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  projectAdjustmentSchema,
  projectAdjustmentDeserializationSchema,
} from "@/db/collections/finance/project-adjustment/project-adjustment-schema";

// Collection basierend auf der PowerSync-Tabelle 'payout'
export const projectAdjustmentsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.finance_project_adjustment,
    schema: projectAdjustmentSchema,
    deserializationSchema: projectAdjustmentDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const useProjectAdjustments = () =>
  useLiveQuery((q) => q.from({ projectAdjustments: projectAdjustmentsCollection }));
