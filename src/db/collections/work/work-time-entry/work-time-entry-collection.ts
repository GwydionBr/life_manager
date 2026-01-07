import { createCollection } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Import the PowerSync DB and the App Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  workTimeEntrySchema,
  workTimeEntryDeserializationSchema,
} from "@/db/collections/work/work-time-entry/work-time-entry-schema";

// Collection based on the PowerSync table 'work_time_entry'
export const workTimeEntriesCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.work_time_entry,
    schema: workTimeEntrySchema,
    deserializationSchema: workTimeEntryDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);