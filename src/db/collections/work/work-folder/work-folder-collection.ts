import { createCollection } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  workFolderSchema,
  workFolderDeserializationSchema,
} from "@/db/collections/work/work-folder/work-folder-schema";

// Collection basierend auf der PowerSync-Tabelle 'work_folder'
export const workFoldersCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.work_folder,
    schema: workFolderSchema,
    deserializationSchema: workFolderDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);
