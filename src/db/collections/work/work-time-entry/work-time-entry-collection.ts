import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  workTimeEntrySchema,
  workTimeEntryDeserializationSchema,
} from "@/db/collections/work/work-time-entry/work-time-entry-schema";

// Collection basierend auf der PowerSync-Tabelle 'timer_project'
export const workTimeEntriesCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.timer_session,
    schema: workTimeEntrySchema,
    deserializationSchema: workTimeEntryDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const useWorkTimeEntries = () =>
  useLiveQuery((q) => q.from({ workTimeEntries: workTimeEntriesCollection }));
